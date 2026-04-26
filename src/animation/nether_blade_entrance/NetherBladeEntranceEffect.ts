import * as THREE from "three";

// 마검의 지배자 네더 블레이드 — DEPLOY entrance scene. Plays ONCE on initial deployment,
// before the passive chain (AoE → single-target picker) starts. Per the user's spec
// (clip reference, 0:02–0:06):
//   1) Whole screen tints "ashen red" (잿빛 빨강).
//   2) Multiple swords stab into the ground at random positions across the screen.
//   3) During the stabbing, a tall red column rises at centre.
//   4) Camera "zooms" into the column and the demon's face — together with the
//      demon-sword — is revealed for a single beat.
//   5) The tint fades back to normal.
//
// After play() resolves, the caller (deploy chain) proceeds with the existing move-to-
// skill-panel motion + AoE damage. This effect is NOT replayed on turn-start re-fires.
export class NetherBladeEntranceEffect {
    // Set by play() before any spawn helper runs; null otherwise. Per-impact shake
    // spikes read this without threading the ref through every helper signature.
    private _shakeAmp: { value: number } | null = null;
    // World Y of the ground top edge — passed into the sword shader's u_groundY so
    // the buried portion of each blade is masked out. Set during play().
    private _groundTopY: number = -1e6;
    // Parent for entrance-scene effects. play() creates a Group at origin, adds it
    // to the scene, and sets this so spawn helpers attach their meshes to the GROUP
    // (which can then be scaled as a unit during the "rush into pillar" phase).
    // Demon face is added to this.scene directly (not the group) so it stays at its
    // fixed final scale when the rush group expands.
    private _fxParent: THREE.Object3D | null = null;
    private getFxParent(): THREE.Object3D { return this._fxParent ?? this.scene; }
    // Held-sword texture, baked once via Canvas 2D in createSwordCanvas(). Held on
    // the instance so the tear-down step can dispose it explicitly (disposeMesh
    // walks geometry+material but not textures-by-uniform).
    private _swordTex: THREE.CanvasTexture | null = null;
    // CPU-driven particle field — drawn each frame to its own canvas, then uploaded
    // as a texture. Mirrors the reference design exactly: per-particle position,
    // velocity, life, wobble, pulse, two-layer rendering (radial halo + bright
    // core), occasional drop streaks. Held on the instance so the tear-down step
    // can dispose the texture and clear the per-frame tick hook.
    private _particleTex: THREE.CanvasTexture | null = null;
    // Shared burn uniform — every entrance shader (sky/ground/pillar/face) reads
    // it to apply an FBM-driven fire fade-out IN PLACE. Phase 4 tweens this from
    // 0 → 1; the meshes burn away themselves rather than being hidden by an
    // overlay wash. Reset to a fresh object at the top of each play() so old
    // material references don't carry stale tween state into new runs.
    private _burnRef: { value: number } = { value: 0 };
    constructor(private readonly scene: THREE.Scene) {}

    public async play(canvasElement: HTMLElement): Promise<void> {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const origTransform = canvasElement.style.transform;

        // Canvas shake amplitude — phase-driven, light during the build, peaks at the
        // demon-face reveal, decays during settle. Shared via an object so per-sword
        // impacts can briefly spike the value from inside spawnFallingSword.
        const shakeAmp = { value: 0 };
        const stopShake = this.startElementShake(canvasElement, shakeAmp);
        // Reset burn ref so a fresh play() doesn't inherit a tweened-to-1 value.
        this._burnRef = { value: 0 };
        // Stash on instance so spawn helpers can poke it without long parameter chains.
        this._shakeAmp = shakeAmp;

        // Shared shader-time clock + per-frame hooks. tickClocks updates u_time on
        // shader materials; tickHooks lets non-shader work (like the canvas-based
        // particle system) piggyback on the same RAF loop.
        const tickClocks = new Set<THREE.ShaderMaterial>();
        const tickHooks = new Set<(t: number, dtMs: number) => void>();
        const clockStart = performance.now();
        let prevT = clockStart;
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            const now = performance.now();
            const t = (now - clockStart) / 1000;
            const dtMs = now - prevT;
            prevT = now;
            tickClocks.forEach((mat) => { mat.uniforms.u_time.value = t; });
            tickHooks.forEach((fn) => fn(t, dtMs));
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // Rush group — sky/ground/pillar/swords/debris all live under here so they
        // can be scaled together during phase 3 (camera rushing into the pillar).
        // Demon face is added to this.scene directly so it stays at fixed scale.
        const fxGroup = new THREE.Group();
        this.scene.add(fxGroup);
        this._fxParent = fxGroup;

        // ─── PHASE 1: bloody SKY (top 5/6) + tessellated GROUND (bottom 1/6) ─────
        const GROUND_FRAC = 0.18;
        const groundH = vh * GROUND_FRAC;
        const groundCY = -vh * 0.5 + groundH * 0.5;
        const skyH     = vh * 0.95;
        const skyCY    = -vh * 0.5 + groundH + skyH * 0.5 - vh * 0.04;

        const sky = this.createSkyMesh(vw * 1.10, skyH);
        sky.position.set(0, skyCY, 4.5);
        sky.renderOrder = 598;
        fxGroup.add(sky);
        const skyMat = sky.material as THREE.ShaderMaterial;
        tickClocks.add(skyMat);

        const ground = this.createGroundMesh(vw, groundH);
        ground.position.set(0, groundCY, 5);
        ground.renderOrder = 600;
        fxGroup.add(ground);
        const groundMat = ground.material as THREE.ShaderMaterial;
        tickClocks.add(groundMat);

        // Sword shader masks fragments below this Y so blades plunge INTO the ground.
        this._groundTopY = groundCY + groundH * 0.5;

        shakeAmp.value = 2.0;
        await Promise.all([
            this.tween(skyMat.uniforms.u_alpha,    1.0, 380, 'easeOutQuad'),
            this.tween(groundMat.uniforms.u_alpha, 1.0, 380, 'easeOutQuad'),
        ]);

        // ─── PHASE 2: red pillar at centre + falling swords ──────────────────────
        // Pillar dominates the frame — claims roughly the central 60% of the viewport
        // width. The shader's bright-core threshold is widened in the fragment program
        // (0.18 → 0.32) so the bright stripe scales with the plane instead of staying
        // skinny; outer glow continues to bleed across the full plane width.
        const pillarW = vw * 0.60;
        const pillarH = vh * 1.50;
        const pillar = this.createPillarMesh(pillarW, pillarH);
        pillar.position.set(0, 0, 6);
        pillar.renderOrder = 605;
        fxGroup.add(pillar);
        const pillarMat = pillar.material as THREE.ShaderMaterial;
        tickClocks.add(pillarMat);
        void this.tween(pillarMat.uniforms.u_alpha, 1.0, 460, 'easeOutQuad');

        // Inside-pillar PARTICLES — CPU-driven canvas system with 220 particles
        // (dark soot + blood-red drops) that drift upward, wobble, pulse, and
        // respawn at the bottom. Parented to this.scene (NOT fxGroup) so the
        // rush-phase 4.6× scale doesn't magnify the canvas texture and break the
        // soft particle look. Plane sized 1.2× viewport so edges stay off-screen
        // even with the canvas shake. The tick callback advances the simulation
        // and re-uploads the texture each frame.
        const { mesh: particles, tick: particlesTick } =
            this.createPillarParticleMesh(vw * 1.20, vh * 1.20);
        particles.position.set(0, 0, 6.5);   // between pillar (z=6) and face (z=7)
        particles.renderOrder = 610;
        this.scene.add(particles);
        const particlesMat = particles.material as THREE.ShaderMaterial;
        tickHooks.add((_t, dtMs) => particlesTick(dtMs));
        void this.tween(particlesMat.uniforms.u_alpha, 1.0, 600, 'easeOutQuad');

        // 10 swords stab the ground at scattered positions — but EXCLUDE the central
        // band so the pillar stays unobstructed and reads as the focal axis. Exclusion
        // half-width is wider than just the pillar (vw * 0.09) because the swords land
        // tilted ±31° and their hilts can swing back toward centre by ~SW_H * sin(tilt)
        // ≈ 135 px. With exclusionHalf = vw * 0.16 the worst-case hilt at full tilt
        // still stays clear of the pillar's outer rim. Each is fire-and-forget — they
        // animate in parallel via their own RAF loops + dispose after a fade window.
        // GRID-BASED placement constrained to the GROUND STRIP. Sword TIPS land in the
        // bottom 1/6, hilts rise UP into the bloody sky above. Layout: 4 vertical rows
        // × 4 horizontal columns per side × 2 sides = 32 swords. Each cell jitters its
        // landing within ±55% of cell size so the grid doesn't look mechanical.
        const VERT_ROWS = 4;
        const HORIZ_PER_SIDE = 4;
        const exclusionHalf = vw * 0.20;
        const sideMaxOffset = vw * 0.46;
        // Tip Y range — wide variation so individual swords plunge to noticeably
        // different depths. Tips can land BELOW the ground bottom (the shader masks
        // anything below u_groundY anyway, so off-bottom is fine — it just looks like
        // a deeply buried blade with only the hilt sticking up).
        //   Shallowest tip: -vh × 0.395  → ~80 px buried  → ~260 px visible (most of blade)
        //   Deepest tip:    -vh × 0.545  → ~243 px buried → ~100 px visible (only hilt)
        // The 80 px figure matches the previous minimum (per user direction); the
        // 243 px figure is well above the previous max for genuine "embedded to the
        // crossguard" stabs.
        const groundTop    = -vh * 0.5 + groundH;
        const groundBottom = -vh * 0.5;
        const verticalOrigin = groundBottom - vh * 0.045;   // ~50 px below ground bottom (deep)
        const verticalRange  = vh * 0.150;                  // spans up to a bit below ground top
        const cellH = verticalRange / VERT_ROWS;
        const sideRange = sideMaxOffset - exclusionHalf;
        const cellW = sideRange / HORIZ_PER_SIDE;

        const swordPositions: Array<{ x: number; y: number }> = [];
        for (let row = 0; row < VERT_ROWS; row++) {
            const yC = verticalOrigin + (row + 0.5) * cellH;
            for (let col = 0; col < HORIZ_PER_SIDE; col++) {
                for (const side of [-1, 1]) {
                    const xC = side * (exclusionHalf + (col + 0.5) * cellW);
                    swordPositions.push({
                        x: xC + (Math.random() - 0.5) * cellW * 0.55,
                        y: yC + (Math.random() - 0.5) * cellH * 0.55,
                    });
                }
            }
        }
        // Shuffle so landings don't follow the grid order — looks like a chaotic
        // storm from every direction rather than a methodical sweep.
        for (let i = swordPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [swordPositions[i], swordPositions[j]] = [swordPositions[j], swordPositions[i]];
        }

        // 32 swords × 18 ms stagger = ~576 ms relentless storm. Per-impact spike of
        // 16 amplitude with 150 ms decay means new spikes overlap continuously,
        // sustaining a 콰콰콰콰쾅 ground-shaking rumble through the whole rain.
        for (const p of swordPositions) {
            this.spawnFallingSword(p.x, p.y, tickClocks);
            await this.delay(18);
        }

        shakeAmp.value = 6.0;
        await this.delay(160);

        // ─── PHASE 3: WE rush ALL THE WAY INTO the pillar — full immersion ───────
        // The fxGroup uniformly scales 4.6× — at base pillar width vw × 0.60 the
        // bright core (32% of plane half-width) ends up well past the viewport edges
        // on every side. We're INSIDE the pillar by the end of the rush. Sky drifts
        // up off-screen, ground slides down out of view, leftover debris arcs past.
        const faceSize = Math.min(vw, vh) * 0.90;   // whole sword fits inside the viewport
        // Turbulent dark aura — sized 2.4× the sword so the violent black smoke
        // extends far past the silhouette and there is still plenty of room to
        // fade out smoothly to nothing without hitting the canvas edge. Parented
        // to scene (NOT fxGroup) so the rush-scale doesn't magnify it.
        const aura = this.createDarkAuraMesh(faceSize * 2.4);
        aura.position.set(0, 0, 6.8);   // behind face (z=7)
        aura.renderOrder = 614;          // draw before face (615) but after pillar (605)
        this.scene.add(aura);
        const auraMat = aura.material as THREE.ShaderMaterial;
        tickClocks.add(auraMat);
        auraMat.uniforms.u_alpha.value = 0.0;

        const face = this.createDemonFaceMesh(faceSize);
        face.position.set(0, 0, 7);
        face.renderOrder = 615;
        face.scale.set(1.0, 1.0, 1);
        this.scene.add(face);
        const faceMat = face.material as THREE.ShaderMaterial;
        tickClocks.add(faceMat);
        faceMat.uniforms.u_alpha.value = 0.0;

        shakeAmp.value = 8.0;
        // Longer + deeper rush — 720 ms easeInQuad to 4.6× scale so we genuinely
        // arrive INSIDE the pillar rather than just nearby.
        await this.tweenScaleXY(fxGroup, 4.6, 4.6, 720, 'easeInQuad');
        shakeAmp.value = 14.0;

        // ARRIVAL — we're inside now. The demon + held sword crystallise across
        // most of the frame, having "always been there" at the pillar's heart.
        // Dark aura fades in slightly faster so the sword arrives already wreathed
        // in churning black smoke. Tween to FULL u_alpha so the aura stays at peak
        // intensity through the hold.
        void this.tween(auraMat.uniforms.u_alpha, 1.0, 280, 'easeOutQuad');
        await this.tween(faceMat.uniforms.u_alpha, 1.0, 320, 'easeOutQuad');
        await this.delay(360);

        // ─── PHASE 4: burn the existing meshes IN PLACE ────────────────────────
        // No overlay wash, no scene swap — the sky/ground/pillar/sword each have a
        // shared u_burn uniform plumbed through. As _burnRef.value rises 0 → 1, an
        // FBM-driven fire front sweeps from the bottom up across each shader,
        // dropping alpha to 0 behind the front and painting bright orange embers
        // along it. Result: every entrance element visibly burns away on its own.
        // Decay the shake to ZERO over 220 ms BEFORE the burn starts so the fade-out
        // happens against a steady frame — no jitter while everything's catching fire.
        await this.tween(shakeAmp, 0, 220, 'easeOutQuad');
        await this.tween(this._burnRef, 1.0, 1600, 'easeInOutQuad');

        stopShake();
        canvasElement.style.transform = origTransform;
        clockRunning = false;

        // Tear down: remove sky/ground/pillar (still inside fxGroup) + any leftover
        // sword/debris/dust meshes that haven't disposed themselves yet, then drop
        // fxGroup itself. Demon face and particle field were parented to scene
        // directly, so they need explicit removal.
        for (const child of fxGroup.children.slice()) {
            fxGroup.remove(child);
            if (child instanceof THREE.Mesh) this.disposeMesh(child);
        }
        this.scene.remove(fxGroup);
        this.scene.remove(face);
        this.disposeMesh(face);
        this.scene.remove(aura);
        this.disposeMesh(aura);
        this.scene.remove(particles);
        this.disposeMesh(particles);
        this._swordTex?.dispose();
        this._swordTex = null;
        this._particleTex?.dispose();
        this._particleTex = null;
        this._fxParent = null;
        this.disposeMesh(sky); this.disposeMesh(ground); this.disposeMesh(pillar);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Falling sword — TIP DOWN + random tilt. Each sword approaches tip-first along
    // its own rotated axis so the strike angle reads naturally; the tip lands exactly
    // at (landX, landY) and the hilt sticks UP out of the ground at the rotation angle.
    // Animated in parallel via its own RAF loop. Disposes after a short hold + fade.
    // ═══════════════════════════════════════════════════════════════════════════════
    private spawnFallingSword(landX: number, landY: number, tickClocks: Set<THREE.ShaderMaterial>): void {
        // Larger swords for visual heft — was 38×260, now 56×340.
        const SW_W = 56;
        const SW_H = 340;
        const halfH = SW_H / 2;

        // Rotation angle. θ = π means the mesh's local +y (which is the BLADE TIP in
        // sword-shader space) points to world (0, -1) — straight down. We jitter by up
        // to ±0.55 rad (~31°) so different swords come in at noticeably different angles.
        const theta = Math.PI + (Math.random() - 0.5) * 1.10;
        const tipDirX = -Math.sin(theta);
        const tipDirY =  Math.cos(theta);
        // Mesh CENTRE such that the rotated tip lands at (landX, landY):
        //   tipWorld = meshCenter + tipDir × halfH  ⇒  meshCenter = tipWorld − tipDir × halfH
        const finalCx = landX - tipDirX * halfH;
        const finalCy = landY - tipDirY * halfH;
        // Start position — offset along the HANDLE direction (= -tipDir) so the sword
        // approaches tip-first from above-along-its-axis.
        const fallDist = window.innerHeight * 0.75;
        const startCx = finalCx - tipDirX * fallDist;
        const startCy = finalCy - tipDirY * fallDist;

        const sword = this.createSwordMesh(SW_W, SW_H);
        sword.rotation.z = theta;
        sword.position.set(startCx, startCy, 6.5);
        sword.renderOrder = 610;
        this.getFxParent().add(sword);
        const mat = sword.material as THREE.ShaderMaterial;
        // Tell the sword shader where the ground top is so the buried half of the
        // blade is masked out (sword visibly plunges INTO the dirt, not onto it).
        mat.uniforms.u_groundY.value = this._groundTopY;
        tickClocks.add(mat);

        // Faster, more decisive fall — was 280 ms, now 220 ms with cubic accel.
        const FALL_MS = 220;
        const startMs = performance.now();
        const fallStep = () => {
            const t = Math.min(1, (performance.now() - startMs) / FALL_MS);
            const e = t * t * t;  // cubic — heavier-feeling slam at the end
            sword.position.x = startCx + (finalCx - startCx) * e;
            sword.position.y = startCy + (finalCy - startCy) * e;
            if (t < 1) requestAnimationFrame(fallStep);
            else {
                // Impact at the actual landing point — flash + dust + cracks + brief
                // canvas-shake spike. The shake spike captures the existing amp + adds
                // a temporary pop so it doesn't permanently override phase amplitudes.
                // No bright flash on impact — sword stabbing dirt isn't an explosion.
                // Just dust + ground cracks + excavated debris + shake.
                this.spawnImpactDust(landX, landY, tickClocks);
                this.spawnImpactCracks(landX, landY, tickClocks);
                this.spawnDebris(landX, landY, tickClocks);
                this.pokeShakeSpike(16.0, 150);
                // Hold the sword embedded in the ground for a beat, then fade out.
                setTimeout(() => {
                    const fadeStart = performance.now();
                    const FADE_MS = 380;
                    const fadeStep = () => {
                        const t2 = Math.min(1, (performance.now() - fadeStart) / FADE_MS);
                        mat.uniforms.u_alpha.value = 1.0 - t2;
                        if (t2 < 1) requestAnimationFrame(fadeStep);
                        else {
                            tickClocks.delete(mat);
                            sword.parent?.remove(sword);
                            this.disposeMesh(sword);
                        }
                    };
                    requestAnimationFrame(fadeStep);
                }, 720);
            }
        };
        requestAnimationFrame(fallStep);
    }

    // Briefly spike the canvas-shake amplitude for a punchy impact accent, then
    // restore whatever amp the current phase wants. No-op if play() hasn't seeded
    // _shakeAmp yet.
    private pokeShakeSpike(amp: number, holdMs: number): void {
        const ref = this._shakeAmp;
        if (!ref) return;
        const prev = ref.value;
        ref.value = Math.max(prev, amp);
        setTimeout(() => {
            // Only walk back if no later spike pushed it higher.
            if (ref.value <= amp) ref.value = prev;
        }, holdMs);
    }

    // Excavated debris — dirt/rock chunks that launch UPWARD from the impact in a
    // random fan, fall under gravity, tumble as they fly, and fade out. 13 per impact
    // (varied between small pebbles and bigger rocks) so the eye can clearly see
    // material being thrown out of the crater.
    private spawnDebris(x: number, y: number, tickClocks: Set<THREE.ShaderMaterial>): void {
        const COUNT = 13;
        const GRAVITY = 1100;  // px/s² — slower than v1 so chunks travel higher + linger
        for (let i = 0; i < COUNT; i++) {
            // Squared random skews most chunks small with occasional larger rocks —
            // matches what real ground excavation looks like (lots of pebbles, a few
            // chunky stones).
            const sizeRoll = Math.random();
            const size = 8 + sizeRoll * sizeRoll * 38;   // 8..46 px, skewed small
            const rock = this.createDebrisMesh(size);
            rock.position.set(x, y, 6.65);
            rock.renderOrder = 614;
            this.getFxParent().add(rock);
            const mat = rock.material as THREE.ShaderMaterial;
            tickClocks.add(mat);

            // Launch — 100° fan biased UPWARD (-π/2 ± 50°), generous initial speed.
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
            const speed = 340 + Math.random() * 440;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const spin = (Math.random() - 0.5) * 22.0;
            const lifeMs = 800 + Math.random() * 320;

            const startMs = performance.now();
            const step = () => {
                const now = performance.now();
                const elapsedMs = now - startMs;
                const t = elapsedMs / lifeMs;
                if (t >= 1) {
                    tickClocks.delete(mat);
                    rock.parent?.remove(rock);
                    this.disposeMesh(rock);
                    return;
                }
                // Projectile motion — initial velocity + gravity acceleration.
                const sec = elapsedMs / 1000;
                rock.position.x = x + vx * sec;
                rock.position.y = y + vy * sec - 0.5 * GRAVITY * sec * sec;
                rock.rotation.z = spin * sec;
                // Hold opacity for the first half of life, then fade.
                mat.uniforms.u_alpha.value = t < 0.50 ? 1.0 : (1 - (t - 0.50) / 0.50);
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }
    }

    private spawnImpactFlash(x: number, y: number, tickClocks: Set<THREE.ShaderMaterial>): void {
        const flash = this.createImpactFlashMesh(240);
        flash.position.set(x, y, 6.7);
        flash.renderOrder = 613;
        this.getFxParent().add(flash);
        const mat = flash.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        const DURATION = 220;
        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / DURATION);
            mat.uniforms.u_alpha.value = t < 0.10 ? t / 0.10 : Math.pow(1 - (t - 0.10) / 0.90, 1.8);
            if (t < 1) requestAnimationFrame(step);
            else {
                tickClocks.delete(mat);
                flash.parent?.remove(flash);
                this.disposeMesh(flash);
            }
        };
        requestAnimationFrame(step);
    }

    private spawnImpactCracks(x: number, y: number, tickClocks: Set<THREE.ShaderMaterial>): void {
        const cracks = this.createImpactCracksMesh(300);
        cracks.position.set(x, y, 6.55);
        cracks.renderOrder = 611;
        // Random rotation so each impact's crack pattern looks unique.
        cracks.rotation.z = Math.random() * Math.PI * 2;
        this.getFxParent().add(cracks);
        const mat = cracks.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        const DURATION = 900;  // longer than dust — cracks linger on the ground
        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / DURATION);
            mat.uniforms.u_progress.value = t;
            // Quick reveal, slow fade so cracks read as "newly carved".
            mat.uniforms.u_alpha.value = t < 0.10 ? t / 0.10 : Math.pow(1 - (t - 0.10) / 0.90, 1.4);
            if (t < 1) requestAnimationFrame(step);
            else {
                tickClocks.delete(mat);
                cracks.parent?.remove(cracks);
                this.disposeMesh(cracks);
            }
        };
        requestAnimationFrame(step);
    }

    private spawnImpactDust(x: number, y: number, tickClocks: Set<THREE.ShaderMaterial>): void {
        // Larger dust cloud — was 260 px, now 340 px for substantially more presence.
        const dust = this.createImpactDustMesh(340);
        dust.position.set(x, y - 40, 6.6);
        dust.renderOrder = 612;
        this.getFxParent().add(dust);
        const mat = dust.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        const DURATION = 520;
        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / DURATION);
            mat.uniforms.u_alpha.value = (1 - t) * 0.95;
            mat.uniforms.u_grow.value = t;
            if (t < 1) requestAnimationFrame(step);
            else {
                tickClocks.delete(mat);
                dust.parent?.remove(dust);
                this.disposeMesh(dust);
            }
        };
        requestAnimationFrame(step);
    }

    // Debris chunk — irregular dirt-coloured blob with FBM-shaped silhouette + a
    // bright top rim where light catches the upper edge. Tumbling rotation handled
    // by the spawn loop's mesh.rotation.z, so the mesh itself just renders a fixed
    // organic blob.
    private createDebrisMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 1 },
                u_seed:  { value: Math.random() * 100.0 },
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_seed;
                varying vec2 v_uv;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0; float a = 0.5;
                    for (int i = 0; i < 3; i++) { v += a * vnoise(p); p *= 2.05; a *= 0.5; }
                    return v;
                }

                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    // Irregular outline — radial threshold modulated by FBM so each
                    // chunk has a unique blobby silhouette.
                    float n = fbm(v_uv * 4.5 + vec2(u_seed, 0.0));
                    float radius = 0.42 + n * 0.18;
                    float shape = 1.0 - smoothstep(radius - 0.05, radius, r);

                    // Top-edge highlight — light from above catches the upper hump.
                    float topRim = smoothstep(0.20, 0.0, abs(c.y - 0.10)) *
                                   smoothstep(radius * 0.85, radius, r);

                    vec3 dirtDeep = vec3(0.10, 0.04, 0.04);
                    vec3 dirtMid  = vec3(0.30, 0.13, 0.10);
                    vec3 dirtRim  = vec3(0.55, 0.25, 0.20);
                    vec3 col = mix(dirtDeep, dirtMid, n);
                    col = mix(col, dirtRim, topRim * 0.7);

                    gl_FragColor = vec4(col, shape * u_alpha);
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    // Bright crimson-white impact burst — additive blending so it pops against the
    // dust + ground without dimming what's underneath.
    private createImpactFlashMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 0 },
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float u_time;
                uniform float u_alpha;
                varying vec2 v_uv;

                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float ang = atan(c.y, c.x);

                    // Bright core fading out radially, plus 8 short ray streaks.
                    float core = smoothstep(0.85, 0.0, r);
                    core = pow(core, 1.6);
                    float rays = 0.5 + 0.5 * cos(ang * 8.0);
                    rays = pow(rays, 7.0) * smoothstep(1.0, 0.10, r);

                    float intensity = core * 1.30 + rays * 0.55;
                    vec3 white   = vec3(1.00, 0.92, 0.88);
                    vec3 crimson = vec3(0.95, 0.30, 0.32);
                    vec3 col = mix(crimson, white, core * 0.70);
                    gl_FragColor = vec4(col * (0.7 + intensity * 0.6), clamp(intensity * u_alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    // Element shake — same dynamic-amplitude pattern used by other effects.
    private startElementShake(element: HTMLElement, ampRef: { value: number }): () => void {
        let running = true;
        const step = () => {
            if (!running) return;
            const amp = ampRef.value;
            if (amp <= 0) {
                element.style.transform = '';
            } else {
                const dx = (Math.random() - 0.5) * amp * 2;
                const dy = (Math.random() - 0.5) * amp * 2;
                element.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
            }
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        return () => { running = false; };
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Mesh factories
    // ═══════════════════════════════════════════════════════════════════════════════

    // Bloody sky — covers the top 5/6 of the viewport during the entrance. Layered
    // FBM clouds drift across a vertical gradient (darker at top, brighter near the
    // horizon). Cloud edges pick up a slight rim highlight; deep-sky vignette pulls
    // the corners into near-black blood. Lightly tessellated (32 × 18) so vertex-
    // displacement mods could be slotted in later, but the surface itself is flat —
    // the cloud illusion is purely fragment-shader work.
    private createSkyMesh(width: number, height: number): THREE.Mesh {
        const NOISE_GLSL = `
            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            float vnoise(vec2 p) {
                vec2 i = floor(p); vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
            }
            float fbm(vec2 p) {
                float v = 0.0; float a = 0.5;
                for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.05; a *= 0.5; }
                return v;
            }
        `;
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 0 },
                u_burn:  this._burnRef,
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                ${NOISE_GLSL}
                uniform float u_time;
                uniform float u_burn;
                uniform float u_alpha;
                varying vec2 v_uv;

                void main() {
                    // PlaneGeometry UV: y=0 at bottom (= horizon, brighter), y=1 at top
                    // (= deep sky, darker / bloodier).
                    float vGrad = v_uv.y;

                    vec3 darkTop  = vec3(0.18, 0.03, 0.06);  // deep blood-black above
                    vec3 horizon  = vec3(0.55, 0.18, 0.18);  // brighter near ground
                    vec3 col = mix(horizon, darkTop, smoothstep(0.0, 1.0, vGrad));

                    // Two layered cloud bands — horizontally stretched FBM (wider than
                    // tall) drifting at different speeds for parallax-style depth.
                    vec2 cloudUvA = v_uv * vec2(2.8, 7.5) + vec2(u_time * 0.05,  0.0);
                    vec2 cloudUvB = v_uv * vec2(5.5, 12.0) + vec2(-u_time * 0.09, 0.0);
                    float cloudA = fbm(cloudUvA);
                    float cloudB = fbm(cloudUvB);
                    float density = cloudA * 0.65 + cloudB * 0.35;

                    // Soft cloud body.
                    float cloudMask = smoothstep(0.40, 0.65, density);

                    vec3 cloudDark   = vec3(0.20, 0.04, 0.06);
                    vec3 cloudMid    = vec3(0.42, 0.13, 0.13);
                    vec3 cloudBright = vec3(0.72, 0.30, 0.26);
                    vec3 cloudCol = mix(cloudDark, cloudMid, density);
                    cloudCol = mix(cloudCol, cloudBright, smoothstep(0.65, 0.85, density));

                    col = mix(col, cloudCol, cloudMask * 0.85);

                    // Cloud edge rim — thin bright outline where density transitions.
                    float rim = smoothstep(0.38, 0.45, density) * (1.0 - smoothstep(0.45, 0.55, density));
                    col = mix(col, vec3(0.85, 0.40, 0.32), rim * 0.55);

                    // Vignette — dries out the corners toward near-black blood.
                    vec2 c = v_uv - 0.5;
                    float r = length(c);
                    float vign = smoothstep(0.30, 0.85, r);
                    col = mix(col, vec3(0.08, 0.01, 0.03), vign * 0.45);

                    // Subtle drifting grit so the sky itself isn't a static plate.
                    float grit = vnoise(v_uv * 12.0 + vec2(u_time * 0.10, 0.0)) * 0.06;
                    col *= (0.95 + grit);

                    float alpha = u_alpha;

                    // ─── BURN-AWAY MASK ─────────────────────────────────────
                    float bn1 = vnoise(v_uv * 4.5 + vec2(11.3, 4.1));
                    float bn2 = vnoise(v_uv * 11.0 + vec2(11.3, 4.1));
                    float bn  = bn1 * 0.65 + bn2 * 0.35;
                    float bThresh = bn * 0.55 + (1.0 - v_uv.y) * 0.45;
                    float bAmt = u_burn * 1.50 - bThresh;
                    float bMask = 1.0 - smoothstep(0.0, 0.18, bAmt);
                    float bEmber = smoothstep(0.0, 0.05, bAmt) *
                                   (1.0 - smoothstep(0.05, 0.18, bAmt));
                    alpha *= bMask;
                    col += vec3(1.00, 0.50, 0.18) * bEmber * 1.8;

                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(width, height, 32, 18), material);
    }

    // Hellish ashen-red GROUND — properly tessellated terrain. The plane is heavily
    // subdivided (128 × 72 = 9,409 vertices) and the VERTEX shader displaces each
    // vertex by an FBM heightfield so the surface itself has lumpy, irregular bumps
    // visible at the silhouette edges and along each landed sword's contact line.
    // The fragment shader receives the same height varying + computes per-pixel
    // normal-light shading on top, so the rockiness is visible even though the
    // orthographic camera can't show "real" Z depth.
    //
    // Plane is 1.15× the viewport so the wavy displaced edges always stay off-screen.
    private createGroundMesh(vw: number, vh: number): THREE.Mesh {
        // Shared noise functions injected into both shaders so vertex displacement
        // and fragment shading sample the SAME heightfield (no mismatch between the
        // bumps the vertices form and the lighting the fragments compute).
        const NOISE_GLSL = `
            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            float vnoise(vec2 p) {
                vec2 i = floor(p); vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
            }
            float fbm(vec2 p) {
                float v = 0.0; float a = 0.5;
                for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.05; a *= 0.5; }
                return v;
            }
        `;
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:    { value: 0 },
                u_alpha:   { value: 0 },
                u_dispAmp: { value: 32.0 },  // px of vertex displacement amplitude
                u_burn:    this._burnRef,
            },
            vertexShader: `
                ${NOISE_GLSL}
                uniform float u_dispAmp;
                varying vec2 v_uv;
                varying float v_height;
                void main() {
                    v_uv = uv;

                    // Combined coarse + fine heightfield. Coarse drives the big
                    // landform shapes; fine adds rocky chatter.
                    float hCoarse = fbm(uv * 4.5);
                    float hFine   = fbm(uv * 14.0 + vec2(7.3, -2.1));
                    float h = hCoarse * 0.78 + hFine * 0.22;
                    v_height = h;

                    vec3 pos = position;
                    // Displace in BOTH x and y in screen space — irregular silhouette
                    // edges + warped surface. Y-component is stronger so cracks/peaks
                    // read more vertically (matches gravity-fall expectation for ground).
                    float disp = (h - 0.5) * u_dispAmp;
                    pos.x += disp * 0.55;
                    pos.y += disp * 1.00;
                    // High-frequency micro-jitter on top so individual rocks feel
                    // chunky rather than a smooth wave.
                    float micro = (vnoise(uv * 38.0) - 0.5) * u_dispAmp * 0.18;
                    pos.x += micro;
                    pos.y += micro;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                ${NOISE_GLSL}
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_burn;
                varying vec2 v_uv;
                varying float v_height;

                void main() {
                    // Recompute heightfield gradients for per-pixel normal light. Use
                    // the SAME formulation as the vertex shader so the lighting agrees
                    // with the displaced geometry.
                    float scale = 4.5;
                    float eps = 0.0035;
                    float hCoarse  = fbm(v_uv * scale);
                    float hCoarseX = fbm((v_uv + vec2(eps, 0.0)) * scale);
                    float hCoarseY = fbm((v_uv + vec2(0.0, eps)) * scale);
                    float hFine    = fbm(v_uv * 14.0 + vec2(7.3, -2.1));
                    float hFineX   = fbm((v_uv + vec2(eps, 0.0)) * 14.0 + vec2(7.3, -2.1));
                    float hFineY   = fbm((v_uv + vec2(0.0, eps)) * 14.0 + vec2(7.3, -2.1));
                    float h  = hCoarse  * 0.78 + hFine  * 0.22;
                    float hX = hCoarseX * 0.78 + hFineX * 0.22;
                    float hY = hCoarseY * 0.78 + hFineY * 0.22;

                    // Stronger gradient stretch — chunky rocks, not a soft shimmer.
                    float gx = (hX - h) * 130.0;
                    float gy = (hY - h) * 130.0;
                    vec3 normal = normalize(vec3(-gx, -gy, 1.0));

                    vec3 lightDir = normalize(vec3(0.50, 0.60, 0.62));
                    float diffuse = max(0.0, dot(normal, lightDir));
                    float ambient = 0.30;

                    // Coarse fissures.
                    float crackBand = fbm(v_uv * 7.5 + vec2(13.7, -4.3));
                    float crackMask = smoothstep(0.05, 0.0, abs(crackBand - 0.5));
                    // Fine fractures.
                    float fineBand = fbm(v_uv * 22.0 + vec2(2.0, 5.0));
                    float fineMask = smoothstep(0.035, 0.0, abs(fineBand - 0.5)) * 0.55;

                    // Radial vignette.
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float vignette = smoothstep(0.30, 1.25, r);

                    vec3 dirtBright = vec3(0.65, 0.27, 0.23);
                    vec3 dirtMid    = vec3(0.40, 0.15, 0.13);
                    vec3 dirtDark   = vec3(0.20, 0.06, 0.06);
                    vec3 crackBlood = vec3(0.08, 0.01, 0.03);
                    vec3 vignBlood  = vec3(0.15, 0.03, 0.05);

                    vec3 col = mix(dirtDark, dirtMid, h);
                    col = mix(col, dirtBright, h * h);
                    col *= ambient + diffuse * 0.95;

                    // Cracks + dark bottoms emphasised in low-height pockets.
                    float lowMask = (1.0 - smoothstep(0.30, 0.55, h));
                    col = mix(col, crackBlood, crackMask * (0.65 + lowMask * 0.35));
                    col = mix(col, mix(crackBlood, dirtDark, 0.4), fineMask);

                    col = mix(col, vignBlood, vignette);

                    // Subtle heat-shimmer drift.
                    float drift = vnoise(v_uv * 14.0 + vec2(u_time * 0.25, 0.0)) * 0.06;
                    col *= (0.92 + drift);

                    float alpha = u_alpha;

                    // ─── BURN-AWAY MASK ─────────────────────────────────────
                    float bn1 = vnoise(v_uv * 4.5 + vec2(19.7, 8.3));
                    float bn2 = vnoise(v_uv * 11.0 + vec2(19.7, 8.3));
                    float bn  = bn1 * 0.65 + bn2 * 0.35;
                    float bThresh = bn * 0.55 + (1.0 - v_uv.y) * 0.45;
                    float bAmt = u_burn * 1.50 - bThresh;
                    float bMask = 1.0 - smoothstep(0.0, 0.18, bAmt);
                    float bEmber = smoothstep(0.0, 0.05, bAmt) *
                                   (1.0 - smoothstep(0.05, 0.18, bAmt));
                    alpha *= bMask;
                    col += vec3(1.00, 0.50, 0.18) * bEmber * 1.8;

                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        // 128 × 72 = 9,409 vertices — dense enough that the FBM displacement reads as
        // continuous rocky terrain rather than blocky steps. Plane oversized 1.15× so
        // the displaced silhouette edges stay off-screen.
        const geometry = new THREE.PlaneGeometry(vw * 1.15, vh * 1.15, 128, 72);
        return new THREE.Mesh(geometry, material);
    }

    // Radial impact cracks at a sword's landing point — 5 jagged fissures shooting
    // outward, expanding over u_progress 0 → 1, alpha quickly rising then slowly fading.
    private createImpactCracksMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:     { value: 0 },
                u_alpha:    { value: 0 },
                u_progress: { value: 0 },
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_progress;
                varying vec2 v_uv;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }

                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float ang = atan(c.y, c.x);

                    // 5 angular spokes at fixed offsets. For each, distance from this
                    // pixel's angle to the spoke angle, with FBM-based jitter so the
                    // crack lines wobble.
                    float minSpoke = 1.0;
                    for (int i = 0; i < 5; i++) {
                        float spokeA = float(i) * 1.2566 + 0.4;  // 2π/5 spacing
                        // Wobble the spoke angle along its length.
                        float wobble = (vnoise(vec2(r * 18.0, float(i))) - 0.5) * 0.30;
                        float diff = abs(mod(ang - spokeA + 3.14159, 6.28318) - 3.14159);
                        diff = abs(diff + wobble);
                        // Crack sharpness narrows further from centre.
                        float sharpness = 0.05 + 0.10 * (1.0 - r);
                        minSpoke = min(minSpoke, smoothstep(sharpness, 0.0, diff));
                    }
                    // Length gate — cracks only extend up to current u_progress reach.
                    float reach = u_progress * 1.05;
                    float lengthMask = smoothstep(reach, reach - 0.10, r) *
                                       smoothstep(0.04, 0.10, r);

                    // Centre impact darkening — small dark disc at the strike point.
                    float impact = smoothstep(0.20, 0.0, r) * 0.85;

                    float crack = minSpoke * lengthMask;
                    float darkness = max(crack, impact);

                    vec3 dark = vec3(0.04, 0.01, 0.02);
                    vec3 ember = vec3(0.65, 0.10, 0.10);

                    vec3 col = mix(dark, ember, crack * 0.25);

                    float alpha = darkness * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    // Inside-pillar particle field — CPU-DRIVEN canvas system following the user's
    // reference layout. Each particle has full per-instance state (position,
    // velocity, life, decay, wobble phase + frequency + amplitude, pulse phase +
    // frequency, two-layer colour). Drawn to an off-screen 1024×1024 canvas every
    // frame with radial-gradient halos + bright glowing cores + occasional drop
    // streaks for blood; the canvas is uploaded each frame as a CanvasTexture and
    // sampled by a thin shader that adds u_alpha + u_burn.
    // Returns the mesh AND a tick-hook callback the caller registers in the RAF
    // loop so the simulation advances every frame.
    private createPillarParticleMesh(
        width: number, height: number,
    ): { mesh: THREE.Mesh; tick: (dtMs: number) => void } {
        type RGB = { r: number; g: number; b: number };
        type Ember = {
            type: 'ember';
            x: number; y: number; size: number;
            vx: number; vy: number;
            life: number; decay: number;
            wobble: number; wobbleSpeed: number; wobbleAmp: number;
            color: RGB;
            flicker: number; flickerSpeed: number;
            trail: { x: number; y: number }[];
            maxTrail: number;
            glow: boolean;
        };
        type Ash = {
            type: 'ash';
            x: number; y: number; size: number;
            vx: number; vy: number;
            life: number; decay: number;
            wobble: number; wobbleSpeed: number; wobbleAmp: number;
            color: RGB;
            rotation: number; rotSpeed: number;
            isRect: boolean;
            rectStretch: number;   // pre-rolled width multiplier (avoids per-frame Math.random)
        };
        type Particle = Ember | Ash;

        // Virtual coordinate space is 1024×1024; the actual backing buffer is 2×
        // (ctx.scale(RES, RES)) so the texture stays sharp at viewport size.
        const CW = 1024, CH = 1024;
        const RES = 2;
        const canvas = document.createElement('canvas');
        canvas.width = CW * RES;
        canvas.height = CH * RES;
        const ctx = canvas.getContext('2d')!;
        ctx.scale(RES, RES);

        const rand = (a: number, b: number) => a + Math.random() * (b - a);

        // Diagonal wind base — sells the "battlefield, embers and ash blowing in
        // formation across the field" feel. Modulated each frame by sin/cos.
        const WIND_BASE_X = 0.28;
        const WIND_BASE_Y = -0.12;

        // ── EMBERS — bright fire sparks. Spawn from the bottom or side edges,
        //    rise upward, flicker, and the larger ones get a radial glow + trail.
        const createEmber = (): Ember => {
            const zone = Math.random();
            let x: number, y: number;
            if (zone < 0.5) {
                x = Math.random() * CW;
                y = CH + 10;
            } else if (zone < 0.75) {
                x = -5;
                y = CH * 0.3 + Math.random() * CH * 0.7;
            } else {
                x = CW + 5;
                y = CH * 0.3 + Math.random() * CH * 0.7;
            }
            const size = rand(0.8, 4.0);
            const speed = rand(0.6, 2.4);
            const roll = Math.random();
            let color: RGB;
            if      (roll < 0.15) color = { r: 255, g: 255, b: 220 };  // white-hot
            else if (roll < 0.45) color = { r: 255, g: 200, b: 60  };  // yellow
            else if (roll < 0.75) color = { r: 255, g: 110, b: 20  };  // orange
            else                  color = { r: 220, g: 30,  b: 10  };  // red-hot
            return {
                type: 'ember',
                x, y, size,
                vx: WIND_BASE_X * speed + (Math.random() - 0.5) * 0.8,
                vy: -speed * (0.5 + Math.random() * 0.8),
                life: 1.0,
                decay: rand(0.003, 0.010),
                wobble: rand(0, Math.PI * 2),
                wobbleSpeed: rand(0.04, 0.10),
                wobbleAmp: rand(0.3, 1.2),
                color,
                flicker: rand(0, Math.PI * 2),
                flickerSpeed: rand(0.15, 0.40),
                trail: [],
                maxTrail: Math.floor(rand(3, 9)),
                glow: size > 2.0,
            };
        };

        // ── ASH — grey/brown floating flakes. Spawn from any edge, drift with the
        //    wind, slowly rotate. Drawn as either a thin rectangular flake or a
        //    small ellipse for variety.
        const createAsh = (): Ash => {
            const zone = Math.random();
            let x: number, y: number;
            if      (zone < 0.40) { x = Math.random() * CW; y = -8; }
            else if (zone < 0.60) { x = Math.random() * CW; y = CH + 8; }
            else if (zone < 0.80) { x = -8;  y = Math.random() * CH; }
            else                  { x = CW + 8; y = Math.random() * CH; }
            const size = rand(1.2, 5.7);
            const speed = rand(0.2, 1.1);
            const brightness = 60 + Math.floor(Math.random() * 120);
            const brownTint = Math.random() < 0.3;
            const color: RGB = brownTint
                ? { r: brightness + 30, g: brightness + 15, b: brightness - 20 }
                : { r: brightness, g: brightness, b: brightness };
            return {
                type: 'ash',
                x, y, size,
                vx: WIND_BASE_X * speed * (0.5 + Math.random()) + (Math.random() - 0.5) * 0.5,
                vy: WIND_BASE_Y * speed + (Math.random() - 0.5) * 0.3,
                life: rand(0.6, 1.0),
                decay: rand(0.0015, 0.0055),
                wobble: rand(0, Math.PI * 2),
                wobbleSpeed: rand(0.02, 0.06),
                wobbleAmp: rand(0.4, 1.6),
                color,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.06,
                isRect: Math.random() < 0.55,
                rectStretch: rand(1.5, 2.0),
            };
        };

        // Battlefield density: way more particles for the "엄청 치열한 전쟁터" feel.
        // 250 embers + 480 ash = 730 particles. Ash is cheap (single fillRect or
        // ellipse per particle) so we can run it especially heavy without busting
        // the per-frame budget; embers are pricier (trail + optional glow + core).
        const EMBER_COUNT = 250;
        const ASH_COUNT = 480;
        const particles: Particle[] = [];
        for (let i = 0; i < EMBER_COUNT; i++) {
            const p = createEmber();
            p.x = Math.random() * CW;
            p.y = Math.random() * CH;
            p.life = Math.random() * 0.9 + 0.1;
            particles.push(p);
        }
        for (let i = 0; i < ASH_COUNT; i++) {
            const p = createAsh();
            p.x = Math.random() * CW;
            p.y = Math.random() * CH;
            p.life = Math.random() * 0.8 + 0.1;
            particles.push(p);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        this._particleTex = tex;

        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_tex:   { value: tex },
                u_alpha: { value: 0 },
                u_burn:  this._burnRef,
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform sampler2D u_tex;
                uniform float u_alpha;
                uniform float u_burn;
                varying vec2 v_uv;

                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }

                void main() {
                    vec4 src = texture2D(u_tex, v_uv);
                    float alpha = src.a * u_alpha;

                    // Burn-away — particles disappear with the same fire pattern.
                    float bn1 = vnoise(v_uv * 4.5 + vec2(31.4, 17.9));
                    float bn2 = vnoise(v_uv * 11.0 + vec2(31.4, 17.9));
                    float bn  = bn1 * 0.65 + bn2 * 0.35;
                    float bThresh = bn * 0.55 + (1.0 - v_uv.y) * 0.45;
                    float bAmt = u_burn * 1.50 - bThresh;
                    float bMask = 1.0 - smoothstep(0.0, 0.18, bAmt);
                    alpha *= bMask;

                    gl_FragColor = vec4(src.rgb, alpha);
                }
            `,
        });

        let windT = 0;

        const drawEmber = (p: Ember): void => {
            const baseAlpha = p.life;
            const flicker = 0.75 + 0.25 * Math.sin(p.flicker);
            const a = baseAlpha * flicker;

            // Trail — fading line segments behind the ember.
            if (p.trail.length > 1) {
                for (let i = 0; i < p.trail.length - 1; i++) {
                    const t0 = p.trail[i];
                    const t1 = p.trail[i + 1];
                    const trailA = a * (i / p.trail.length) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(t0.x, t0.y);
                    ctx.lineTo(t1.x, t1.y);
                    ctx.strokeStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${trailA})`;
                    ctx.lineWidth = p.size * (i / p.trail.length) * 0.8;
                    ctx.stroke();
                }
            }

            // Glow halo (only for the larger embers).
            if (p.glow) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
                grd.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.7})`);
                grd.addColorStop(1, `rgba(${p.color.r},${Math.floor(p.color.g * 0.4)},0,0)`);
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Bright core.
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
            ctx.fill();
            ctx.restore();
        };

        const drawAsh = (p: Ash): void => {
            const a = p.life * 0.85;
            ctx.save();
            ctx.globalAlpha = a;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = `rgb(${p.color.r},${p.color.g},${p.color.b})`;
            if (p.isRect) {
                const w = p.size * p.rectStretch;
                const h = p.size * 0.35;
                ctx.fillRect(-w / 2, -h / 2, w, h);
            } else {
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 0.9, p.size * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };

        const tick = (dtMs: number): void => {
            const step = Math.min(3.0, dtMs / 16.67);   // clamp so a stutter doesn't fast-forward

            windT += 0.008 * step;
            const windX = WIND_BASE_X + Math.sin(windT * 0.7) * 0.12;
            const windY = WIND_BASE_Y + Math.cos(windT * 0.5) * 0.06;

            // Update.
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.life -= p.decay * step;

                if (p.type === 'ember') {
                    p.trail.push({ x: p.x, y: p.y });
                    if (p.trail.length > p.maxTrail) p.trail.shift();
                    p.wobble  += p.wobbleSpeed  * step;
                    p.flicker += p.flickerSpeed * step;
                    p.x += (p.vx + windX * 0.5 + Math.sin(p.wobble) * p.wobbleAmp * 0.3) * step;
                    p.y += (p.vy + windY * 0.3 + Math.cos(p.wobble * 0.7) * p.wobbleAmp * 0.2) * step;
                    p.vy += 0.008 * step;   // gentle gravity once they crest
                } else {
                    p.wobble   += p.wobbleSpeed * step;
                    p.rotation += p.rotSpeed   * step;
                    p.x += (p.vx + windX * 0.7 + Math.sin(p.wobble) * p.wobbleAmp * 0.25) * step;
                    p.y += (p.vy + windY * 0.6 + Math.cos(p.wobble * 0.6) * p.wobbleAmp * 0.2) * step;
                    p.vy += 0.003 * step;   // very slight downward drift
                }

                const margin = 30;
                const oob = p.x < -margin || p.x > CW + margin || p.y < -margin || p.y > CH + margin;
                if (p.life <= 0 || oob) {
                    particles[i] = p.type === 'ember' ? createEmber() : createAsh();
                }
            }

            // Redraw — ash first (behind), then embers (front).
            ctx.clearRect(0, 0, CW, CH);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.type === 'ash') drawAsh(p);
            }
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.type === 'ember') drawEmber(p);
            }
            tex.needsUpdate = true;
        };

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
        return { mesh, tick };
    }

    // Vertical red pillar at centre. Bright crimson core with FBM-glow falloff to the
    // sides + slow pulsation. AdditiveBlending so it reads as light pouring upward.
    private createPillarMesh(width: number, height: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 0 },
                u_burn:  this._burnRef,
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_burn;
                varying vec2 v_uv;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }

                void main() {
                    float dx = abs(v_uv.x - 0.5) * 2.0;          // 0 at centre, 1 at edges

                    // CYLINDRICAL SHADING — lambertian sphere-section approximation.
                    // sqrt(1 - dx²) gives the cosine of the angle between the surface
                    // normal and the camera direction at each x-slice of a cylinder
                    // facing the camera. = 1 down the centre (surface faces us), → 0
                    // at the silhouette edges (surface curves away). Squaring it sharpens
                    // the falloff so the bright front face reads more strongly.
                    float lambert = sqrt(max(0.0, 1.0 - dx * dx));
                    float core = lambert * lambert;

                    // Soft side glow extending past the silhouette for atmospheric
                    // bloom — covers the whole plane.
                    float glow = smoothstep(1.0, 0.0, dx) * 0.95;

                    // Slight rim darkening at the silhouette where surface curves away.
                    float rimDark = smoothstep(0.90, 1.00, dx);

                    // FBM body texture so it doesn't read flat.
                    float n = vnoise(vec2(dx * 4.0, v_uv.y * 8.0 + u_time * 1.4));

                    // Slow pulse.
                    float pulse = 0.88 + 0.12 * sin(u_time * 3.0);

                    // BLOOD palette — fully saturated, thick 핏빛 column. Even the
                    // shaded side is clearly red so the pillar pops against the dark
                    // sky and ground. Mix factor is CLAMPED so colours can't
                    // extrapolate past hotBlood and bleach during the rush phase.
                    vec3 deepBlood = vec3(0.45, 0.04, 0.06);   // shaded side already strong red
                    vec3 hotBlood  = vec3(1.00, 0.16, 0.10);   // bright front, hot saturated
                    float mixT = clamp(core + n * 0.30, 0.0, 1.0);
                    vec3 col = mix(deepBlood, hotBlood, mixT);
                    col *= mix(1.0, 0.65, rimDark);            // less aggressive rim dim

                    // Higher core multiplier and glow weight push more pixels above
                    // the visibility threshold so the pillar reads as a dense column
                    // instead of a faint smear.
                    float intensity = (core * 2.10 + glow * 1.55) * pulse;
                    float alpha = clamp(intensity * u_alpha, 0.0, 1.0);

                    // ─── BURN-AWAY MASK ─────────────────────────────────────
                    // Phase 4 burns the pillar in place: FBM threshold + upward
                    // bias means low pixels burn first; bright orange embers along
                    // the moving front, alpha drops to 0 behind it.
                    float bn1 = vnoise(v_uv * 4.5);
                    float bn2 = vnoise(v_uv * 11.0);
                    float bn  = bn1 * 0.65 + bn2 * 0.35;
                    float bThresh = bn * 0.55 + (1.0 - v_uv.y) * 0.45;
                    float bAmt = u_burn * 1.50 - bThresh;
                    float bMask = 1.0 - smoothstep(0.0, 0.18, bAmt);
                    float bEmber = smoothstep(0.0, 0.05, bAmt) *
                                   (1.0 - smoothstep(0.05, 0.18, bAmt));
                    alpha *= bMask;
                    col += vec3(1.00, 0.50, 0.18) * bEmber * 1.8;

                    gl_FragColor = vec4(col, alpha);
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    }

    // Falling sword — fully redesigned for a realistic single-hand longsword look.
    // v_uv.x across width (0..1), v_uv.y along length (0 = pommel-bottom, 1 = tip).
    // Component layout along v_uv.y:
    //   POMMEL    0.00 – 0.06   round disc with red gem inlay + bright brass rim
    //   GRIP      0.06 – 0.22   leather wrap with clear diagonal binding stripes
    //   CROSSGUARD 0.22 – 0.27  full-width bar with tapered tips, top/bottom bevels,
    //                           and a brass central boss
    //   BLADE     0.27 – 1.00   tapered double-edged steel:
    //                             • lenticular cross-section read via three highlights:
    //                               bright SPINE down centre, bright EDGE rims on
    //                               BOTH cutting edges, darker FULLER groove between
    //                             • quadratic taper to a sharp point at the tip
    //                             • metallic shine band off-centre along the length
    //                             • faint red-hot tint near the spine (demonic essence)
    // Plus a subtle ambient red halo outside the silhouette so the sword stands out
    // from the ashen-red ground tint.
    private createSwordMesh(width: number, height: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:    { value: 0 },
                u_alpha:   { value: 1 },
                // World Y of the ground top edge — fragments below this fade to alpha 0
                // so the buried portion of the sword vanishes into the dirt instead of
                // floating ON TOP of the ground. Default very-low so swords are fully
                // visible if the caller doesn't set it.
                u_groundY: { value: -1e6 },
            },
            vertexShader: `
                varying vec2 v_uv;
                varying float v_worldY;
                void main() {
                    v_uv = uv;
                    // World position via the mesh's modelMatrix — accounts for rotation
                    // (sword tilt) + translation (mesh centre). v_worldY then represents
                    // each fragment's actual screen-space Y, which we compare against
                    // u_groundY to decide what's above-ground vs buried.
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    v_worldY = worldPos.y;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_groundY;
                varying vec2 v_uv;
                varying float v_worldY;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }

                void main() {
                    float across = v_uv.x - 0.5;       // -0.5 .. 0.5
                    float along  = v_uv.y;             // 0 (pommel) .. 1 (tip)
                    float ax = abs(across);

                    // ── Region boundaries (along) — clean longsword layout ────
                    const float POMMEL_TOP = 0.055;
                    const float GRIP_TOP   = 0.205;
                    const float CROSS_TOP  = 0.245;
                    const float BLADE_TOP  = 1.00;

                    // ── POMMEL — round disc with brass rim + small red gem ────
                    vec2 pommelC = vec2(0.0, 0.028);
                    float pommelD = length(vec2(across * 1.4, along - pommelC.y)) / 0.052;
                    float pommelMask = 1.0 - smoothstep(0.92, 1.02, pommelD);
                    float pommelRim  = smoothstep(0.55, 0.92, pommelD) * pommelMask;
                    float gemD = length(vec2(across * 1.5, along - pommelC.y)) / 0.020;
                    float gemMask    = (1.0 - smoothstep(0.88, 1.02, gemD)) * pommelMask;
                    float gemHotspot = (1.0 - smoothstep(0.30, 0.85, gemD)) * gemMask;
                    float gemPulse = 0.85 + 0.15 * sin(u_time * 6.0);

                    // ── GRIP — leather wrap with diagonal binding + cylindrical shading ─
                    float gripCore = step(POMMEL_TOP + 0.005, along) * step(along, GRIP_TOP - 0.005);
                    float gripMask = gripCore * step(ax, 0.060);
                    float wrapPhase = (along - POMMEL_TOP) * 105.0 + across * 32.0;
                    float wrapBand = smoothstep(0.40, 0.65, abs(sin(wrapPhase)));
                    float gripCyl  = sqrt(max(0.0, 1.0 - pow(ax / 0.060, 2.0))) * gripCore;
                    float gripGrain = vnoise(vec2(along * 95.0, across * 14.0));

                    // ── CROSSGUARD — clean straight bar with subtle outer taper ─
                    float crossCore = step(GRIP_TOP, along) * step(along, CROSS_TOP);
                    float crossWidth = 0.36 - smoothstep(0.30, 0.40, ax) * 0.04;
                    float crossMask = crossCore * smoothstep(crossWidth + 0.005, crossWidth, ax);
                    float crossTopBevel = smoothstep(0.008, 0.0, abs(along - CROSS_TOP)) *
                                          step(ax, crossWidth - 0.005) * crossCore;
                    float crossBotShadow = smoothstep(0.008, 0.0, abs(along - GRIP_TOP)) *
                                           step(ax, crossWidth - 0.005) * crossCore;
                    float bossD = length(vec2(across * 1.0, along - 0.225)) / 0.020;
                    float bossMask = (1.0 - smoothstep(0.85, 1.05, bossD)) * crossCore;

                    // ── BLADE — clean dread-blade with continuous glowing fuller ─
                    float bladeAlong = clamp((along - CROSS_TOP) / (BLADE_TOP - CROSS_TOP), 0.0, 1.0);
                    float bladeWidth = 0.135 * (1.0 - bladeAlong * bladeAlong * 0.94);
                    float bladeBody = step(CROSS_TOP, along) * smoothstep(bladeWidth + 0.003, bladeWidth, ax);

                    // Cutting-edge rim — bright thin band right at the silhouette.
                    float edgeDist = bladeWidth - ax;
                    float edgeRim  = smoothstep(0.012, 0.0, edgeDist) * bladeBody;

                    // Spine highlight — narrow bright streak down the centreline.
                    float spineHi = smoothstep(0.012, 0.0, ax) * bladeBody;

                    // Fuller — continuous bright-red glow channel down the centre.
                    float fullerWidth = max(0.022, bladeWidth * 0.40);
                    float fullerInner = step(0.014, ax);
                    float fullerOuter = step(ax, fullerWidth);
                    float fullerLength = step(CROSS_TOP + 0.025, along) * step(along, 0.92);
                    float fullerMask  = fullerInner * fullerOuter * fullerLength * bladeBody;
                    float fullerPulse = 0.85 + 0.15 * sin(u_time * 3.5 + along * 4.0);

                    // Anisotropic shine — narrow Gaussian highlight off-centre.
                    float shineCore = abs(across - bladeWidth * 0.45);
                    float shine = exp(-pow(shineCore * 38.0, 2.0)) * bladeBody *
                                  smoothstep(0.03, 0.30, bladeAlong) *
                                  smoothstep(1.0, 0.92, bladeAlong);

                    float steelGrain = vnoise(vec2(along * 60.0, across * 8.0)) * bladeBody;

                    // ── Body silhouette aggregation ──────────────────────────
                    float silhouette = max(max(pommelMask, gripMask), max(crossMask, bladeBody));

                    // ── Ambient red halo just outside the silhouette ─────────
                    float haloBlade = smoothstep(bladeWidth + 0.07, bladeWidth, ax) *
                                      step(CROSS_TOP, along) * (1.0 - bladeBody);
                    float haloHilt  = smoothstep(0.16, 0.085, ax) *
                                      step(POMMEL_TOP, along) * step(along, GRIP_TOP) *
                                      (1.0 - gripMask);
                    float halo = max(haloBlade, haloHilt);

                    // ── Compose colour ─ black-and-red dread-blade palette ────
                    vec3 leatherDark = vec3(0.04, 0.02, 0.03);
                    vec3 leatherMid  = vec3(0.14, 0.06, 0.07);
                    vec3 brassDark   = vec3(0.10, 0.04, 0.05);
                    vec3 brassMid    = vec3(0.26, 0.10, 0.10);
                    vec3 brassRim    = vec3(0.62, 0.26, 0.22);
                    vec3 steelBlack  = vec3(0.06, 0.04, 0.06);    // blackened blade body
                    vec3 steelMid    = vec3(0.22, 0.16, 0.18);    // shaded body
                    vec3 steelHi     = vec3(0.85, 0.78, 0.78);    // edge / spine highlight
                    vec3 fullerCore  = vec3(1.00, 0.18, 0.18);    // searing red glow
                    vec3 fullerHot   = vec3(1.00, 0.55, 0.40);    // hot centre of fuller
                    vec3 gem         = vec3(1.00, 0.30, 0.28);

                    vec3 col = vec3(0.0);

                    // POMMEL — round disc with brass rim + red gem.
                    col = mix(col, brassDark, pommelMask);
                    col = mix(col, brassMid,  pommelMask * 0.55);
                    col = mix(col, brassRim,  pommelRim * 0.85);
                    col = mix(col, gem * gemPulse, gemMask * 0.85);
                    col = mix(col, vec3(1.0, 0.55, 0.50) * gemPulse, gemHotspot * 0.95);

                    // GRIP — dark leather with diagonal binding stripes + cylindrical shading.
                    col = mix(col, leatherDark, gripMask);
                    col = mix(col, leatherMid,  gripMask * wrapBand * 0.95);
                    col *= mix(1.0, 0.85 + 0.20 * gripCyl, gripCore);
                    col *= mix(1.0, 0.92, gripMask * gripGrain * 0.40);

                    // CROSSGUARD — dark brass with bright top bevel + bottom shadow + boss.
                    col = mix(col, brassDark, crossMask);
                    col = mix(col, brassMid,  crossMask * 0.55);
                    col = mix(col, brassRim,  crossTopBevel * 0.95);
                    col = mix(col, brassDark, crossBotShadow * 0.85);
                    col = mix(col, brassDark, bossMask * 0.85);

                    // BLADE — blackened steel body with searing red fuller running its length.
                    col = mix(col, steelBlack, bladeBody);
                    col = mix(col, steelMid,   bladeBody * 0.45);
                    col *= mix(1.0, 0.94, bladeBody * (1.0 - steelGrain) * 0.30);
                    col = mix(col, steelHi,    spineHi * 0.55);
                    col = mix(col, steelHi,    edgeRim * 0.95);
                    col = mix(col, steelHi,    shine   * 0.65);
                    col = mix(col, fullerCore * fullerPulse, fullerMask * 0.95);
                    float fullerCenter = smoothstep(0.010, 0.0, ax) * fullerMask;
                    col = mix(col, fullerHot * fullerPulse, fullerCenter * 0.85);

                    // ── Final alpha + halo additive overlay ──────────────────
                    float alpha = silhouette * u_alpha;
                    col += vec3(0.62, 0.18, 0.20) * halo * 0.55;
                    alpha = max(alpha, halo * 0.45 * u_alpha);

                    // ── GROUND MASK — bury the portion of the sword that's below the
                    // ground top edge. Smooth transition over a 22 px band so the line
                    // doesn't read as a hard clip. Below that band the fragment is
                    // fully invisible — it's buried in the dirt, where the dust +
                    // debris cloud will visually cover the cut line.
                    float buriedFactor = smoothstep(u_groundY - 4.0, u_groundY + 18.0, v_worldY);
                    alpha *= buriedFactor;

                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    }

    private createImpactDustMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 0.85 },
                u_grow:  { value: 0 },
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_grow;
                varying vec2 v_uv;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }

                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float effR = r / (1.0 + u_grow * 0.7);
                    float noise = vnoise(v_uv * 4.0 + vec2(u_time * 0.6, 0.0));
                    float shape = (1.0 - smoothstep(0.2, 1.0, effR)) * (0.40 + noise * 0.65);

                    vec3 ash = vec3(0.18, 0.08, 0.10);
                    vec3 dim = vec3(0.32, 0.14, 0.16);
                    vec3 col = mix(ash, dim, noise * 0.7);

                    gl_FragColor = vec4(col, clamp(shape * u_alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }


    // Turbulent dark aura mesh — sits BEHIND the sword and renders churning
    // black smoke via domain-warped FBM. Lives on its own larger plane so the
    // smoke has room to fade out smoothly to nothing without hitting the canvas
    // edge (which previously caused a visible boundary line). Pure black palette
    // with a faint blood undertone — no purple/blue tint anywhere. Time-driven
    // multi-octave noise + domain warp produces violent, swirling motion rather
    // than a static halo.
    private createDarkAuraMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 0 },
                u_burn:  this._burnRef,
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_burn;
                varying vec2 v_uv;

                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0; float a = 0.5;
                    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.05; a *= 0.5; }
                    return v;
                }

                void main() {
                    vec2 c = v_uv - 0.5;

                    // Radial fall-off: dense black NEAR the sword, fading smoothly
                    // outward. Tightened inner falloff (0.10 → 0.05) so the area
                    // immediately around the sword is near-solid black.
                    float r = length(c) * 2.0;
                    float radial = 1.0 - smoothstep(0.05, 0.92, r);

                    // CORE BOOST — a much-denser inner zone that pushes alpha
                    // toward 1.0 in the immediate vicinity of the sword, giving
                    // the impression that pure void is bleeding out of the blade.
                    float coreBoost = 1.0 - smoothstep(0.00, 0.42, r);

                    // ── DOMAIN WARP — distort the noise sample by another noise field
                    //    so the turbulence reads as actual swirling/churning rather
                    //    than just drifting blobs. Faster time + bigger warp amplitude
                    //    for a more violent 요동치는 motion.
                    vec2 p = c * 4.5;
                    vec2 warp = vec2(
                        fbm(p * 1.6 + vec2(u_time * 0.85, -u_time * 0.65)) - 0.5,
                        fbm(p * 1.6 + vec2(-u_time * 0.75, u_time * 0.95) + vec2(7.7, 2.3)) - 0.5
                    ) * 1.70;

                    // THREE churning layers at different scales/speeds — more chaos.
                    float f1 = fbm(p + warp + vec2(u_time * 0.80, -u_time * 0.95));
                    float f2 = fbm(p * 2.3 + warp * 0.6 + vec2(-u_time * 0.55, u_time * 0.75));
                    float f3 = fbm(p * 4.5 + warp * 0.3 + vec2(u_time * 0.45, u_time * 0.40));
                    float churn = f1 * 0.50 + f2 * 0.32 + f3 * 0.18;

                    // Sharper threshold so dense black bands dominate rather than a
                    // smooth grey wash — the aura reads as solid void with churning
                    // rifts of slightly-less-black smoke.
                    float intensity = smoothstep(0.20, 0.78, churn);

                    // The core zone is forced to near-max intensity regardless of
                    // the per-frame churn value, guaranteeing a heavy black mass
                    // wrapping the sword at all times.
                    intensity = max(intensity, coreBoost * 0.92);

                    // Multiplier > 1 lets the (intensity * radial) product stay
                    // saturated through more of the aura body before fading.
                    float alpha = intensity * radial * u_alpha * 1.35;

                    // ── BURN-AWAY ───────────────────────────────────────────
                    float bn1 = vnoise(v_uv * 4.5 + vec2(43.7, 22.1));
                    float bn2 = vnoise(v_uv * 11.0 + vec2(43.7, 22.1));
                    float bn  = bn1 * 0.65 + bn2 * 0.35;
                    float bThresh = bn * 0.55 + (1.0 - v_uv.y) * 0.45;
                    float bAmt = u_burn * 1.50 - bThresh;
                    float bMask = 1.0 - smoothstep(0.0, 0.18, bAmt);
                    alpha *= bMask;

                    // Pure black with the faintest blood undertone in the densest
                    // patches — no blue or purple anywhere, just void.
                    vec3 col = mix(vec3(0.0), vec3(0.06, 0.01, 0.02), churn * 0.35);

                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Held sword (Frostmourne-style with ibex/산양 crossguard) — drawn via Canvas 2D
    // primitives following the user's reference layout, then sampled in a thin
    // shader that overlays a hellfire pulse and tween-controlled alpha.
    // Why Canvas 2D instead of SDF: GLSL primitive composition (ellipses + vesicas
    // + bezier sweeps) produced "blob" silhouettes that read nothing like a goat.
    // Polygons + bezier strokes in 2D context match the reference shape exactly:
    // 5-sided skull face, scythe-wing crossguard, jagged blade with inward spikes,
    // double-bezier horns with ridge texture, diamond slit eyes, pointed crown
    // pommel. Palette is demonic (blood/ember) — the cyan from the reference is
    // replaced with hellfire reds since this is a 마검 not a 성검.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createDemonFaceMesh(size: number): THREE.Mesh {
        const canvas = this.createSwordCanvas();
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        this._swordTex = tex;

        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_tex:   { value: tex },
                u_time:  { value: 0 },
                u_alpha: { value: 0 },
                u_burn:  this._burnRef,
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform sampler2D u_tex;
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_burn;
                varying vec2 v_uv;

                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }

                void main() {
                    vec4 sword = texture2D(u_tex, v_uv);

                    // Hellfire pulse — overall brightness modulation. Lower baseline
                    // (0.85) than before (0.92) so the sword reads darker by default.
                    float pulse = 0.85 + 0.07 * sin(u_time * 4.0);
                    vec3 col = sword.rgb * pulse;
                    // Slight red boost so the painted ember glow throbs.
                    col.r = min(1.0, col.r * (1.0 + 0.10 * sin(u_time * 3.5)));

                    // ─── DARKNESS AURA — drifting black smoke modulation ─────
                    // Two-octave FBM drifts UPWARD across the canvas; high noise
                    // values darken the sword surface in moving patches, selling
                    // the "dark energy emanating from the blade" feel.
                    float n1 = vnoise(v_uv * 3.5 + vec2(0.0, -u_time * 0.20));
                    float n2 = vnoise(v_uv * 8.0 + vec2(u_time * 0.12, -u_time * 0.26));
                    float fbm = n1 * 0.65 + n2 * 0.35;
                    float wisp = smoothstep(0.40, 0.82, fbm);
                    col *= mix(1.0, 0.50, wisp * 0.55);

                    float alpha = sword.a * u_alpha;

                    // ─── BURN-AWAY MASK ─────────────────────────────────────
                    // Phase 4 burns the held sword in place. FBM-noise threshold +
                    // upward bias so low pixels burn first; bright orange embers
                    // along the moving front, alpha drops to 0 behind it.
                    float bn1 = vnoise(v_uv * 4.5 + vec2(2.7, 5.1));
                    float bn2 = vnoise(v_uv * 11.0 + vec2(2.7, 5.1));
                    float bn  = bn1 * 0.65 + bn2 * 0.35;
                    float bThresh = bn * 0.55 + (1.0 - v_uv.y) * 0.45;
                    float bAmt = u_burn * 1.50 - bThresh;
                    float bMask = 1.0 - smoothstep(0.0, 0.18, bAmt);
                    float bEmber = smoothstep(0.0, 0.05, bAmt) *
                                   (1.0 - smoothstep(0.05, 0.18, bAmt));
                    alpha *= bMask;
                    col += vec3(1.00, 0.50, 0.18) * bEmber * 1.8;

                    gl_FragColor = vec4(col, alpha);
                }
            `,
        });
        // Plane proportioned to the canvas aspect (800:1000 = 4:5 portrait) so the
        // sword anatomy isn't squashed by a square plane.
        const planeW = size * 0.8;
        const planeH = size;
        return new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeH), material);
    }

    // Builds the held-sword image off-screen via Canvas 2D. Coordinates and shape
    // structure follow the user-provided reference (Frostmourne with ibex
    // crossguard); colours adapted to a demonic ember/blood palette so the result
    // reads as a 마검 rather than a 성검 (the reference's cyan is replaced).
    private createSwordCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d')!;

        type Pt = [number, number];
        const drawShape = (
            points: Pt[],
            fill: string | CanvasGradient | null,
            stroke: string | null,
            lineWidth = 2,
            shadowColor = 'transparent',
            shadowBlur = 0,
        ): void => {
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
            ctx.closePath();
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            if (fill) { ctx.fillStyle = fill; ctx.fill(); }
            if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
            ctx.shadowBlur = 0;
        };

        // ─── BLADE — jagged inward-spiked silhouette ────────────────────────────
        // Single zig-zagged outline so each "spike" reads as a notch in the edge,
        // not a smooth taper.
        const bladePoints: Pt[] = [
            [350, 220], [450, 220],
            [430, 300], [460, 320], [420, 370],
            [450, 450], [410, 500],
            [440, 600], [405, 650],
            [420, 750], [400, 880],
            [380, 750], [395, 650], [360, 600],
            [390, 500], [350, 450],
            [380, 370], [340, 320], [370, 300],
        ];
        const bladeGrad = ctx.createLinearGradient(350, 0, 450, 0);
        bladeGrad.addColorStop(0.0, '#1a0405');
        bladeGrad.addColorStop(0.5, '#a83830');
        bladeGrad.addColorStop(1.0, '#100408');
        drawShape(bladePoints, bladeGrad, '#fff5e0', 2, '#ff3018', 25);

        // FULLER channel down the blade centre.
        drawShape([[390, 250], [410, 250], [405, 800], [395, 800]], '#180202', '#000', 1);

        // RUNES along the fuller — Cyrillic "БЕРНХИЛЬДЕ" (the sword's name), small
        // 13 px serif spaced 22 px, starting just below the crossguard at y=330.
        // Orange-ember palette since this is a 마검 (cyan in reference).
        ctx.fillStyle = '#ffaa55';
        ctx.shadowColor = '#ff4020';
        ctx.shadowBlur = 20;
        ctx.font = 'bold 13px serif';
        ctx.textAlign = 'center';
        const runes = ['Б','Е','Р','Н','Х','И','Л','Ь','Д','Е'];
        for (let i = 0; i < runes.length; i++) ctx.fillText(runes[i], 400, 330 + i * 22);
        ctx.shadowBlur = 0;

        // ─── GRIP — vertical wrapped handle with diagonal binding ───────────────
        drawShape([[385, 60], [415, 60], [415, 180], [385, 180]], '#1a0405', '#000', 2);
        ctx.strokeStyle = '#332020';
        ctx.lineWidth = 3;
        for (let y = 70; y < 180; y += 15) {
            ctx.beginPath();
            ctx.moveTo(385, y);
            ctx.lineTo(415, y + 10);
            ctx.stroke();
        }

        // ─── POMMEL — rounded ellipse pommel with central blood gem (reference) ─
        // Layered: dark outer rim → cool→warm metallic body → bright metal ring →
        // central red gem with bright core → small grip-cap rectangle linking down
        // to the grip. All cyan/icy stops in the reference are mapped to demonic
        // ember/blood tones.
        const pommelCx = 400;
        const pommelCy = 42;
        const pommelRx = 28;
        const pommelRy = 22;

        // Outer dark ring (slight oversize so the pommel has a beveled silhouette).
        ctx.beginPath();
        ctx.ellipse(pommelCx, pommelCy, pommelRx + 3, pommelRy + 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#050304';
        ctx.fill();

        // Body — radial gradient from a hot warm highlight at upper-left toward
        // dark blood at the bottom-right. (Reference used cool blue-white → blue-
        // grey → near-black; we mirror the LIGHT→DARK structure but in warm tones.)
        const pommelGrad = ctx.createRadialGradient(
            pommelCx - 8, pommelCy - 8, 2,
            pommelCx, pommelCy, pommelRx,
        );
        pommelGrad.addColorStop(0.00, '#e8c4a8');
        pommelGrad.addColorStop(0.25, '#a87858');
        pommelGrad.addColorStop(0.55, '#5a2a20');
        pommelGrad.addColorStop(0.85, '#1a0a0a');
        pommelGrad.addColorStop(1.00, '#050202');

        ctx.beginPath();
        ctx.ellipse(pommelCx, pommelCy, pommelRx, pommelRy, 0, 0, Math.PI * 2);
        ctx.fillStyle = pommelGrad;
        ctx.shadowColor = '#ff3018';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bright metal rim ring around the body.
        ctx.beginPath();
        ctx.ellipse(pommelCx, pommelCy, pommelRx, pommelRy, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#cc8060';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Central blood gem — bright hot core fading to deep blood.
        const gemGrad = ctx.createRadialGradient(
            pommelCx - 3, pommelCy - 3, 1,
            pommelCx, pommelCy, 9,
        );
        gemGrad.addColorStop(0.0, '#fff5e0');
        gemGrad.addColorStop(0.3, '#ffaa55');
        gemGrad.addColorStop(0.7, '#c83820');
        gemGrad.addColorStop(1.0, '#500808');

        ctx.beginPath();
        ctx.ellipse(pommelCx, pommelCy, 9, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = gemGrad;
        ctx.shadowColor = '#ff3010';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Small grip-cap strip connecting pommel down to the grip column.
        const gripCapGrad = ctx.createLinearGradient(388, 55, 412, 55);
        gripCapGrad.addColorStop(0.0, '#1a0a0a');
        gripCapGrad.addColorStop(0.5, '#6a4030');
        gripCapGrad.addColorStop(1.0, '#1a0a0a');
        drawShape(
            [[388, 58], [412, 58], [414, 68], [386, 68]],
            gripCapGrad, '#4a2820', 1,
        );

        // ─── CROSSGUARD — scythe-wing sweep extending far to either side ───────
        // 15-vertex polygon: each wing has an upper sweep (rising outward and
        // tapering to a sharp tip) and a lower curve back to the skull base.
        drawShape([
            [400, 180], [450, 170], [550, 120], [620, 90],
            [590, 140], [530, 200], [480, 230], [430, 230],
            [400, 250],
            [370, 230], [320, 200], [270, 140], [210, 90],
            [280, 120], [350, 170],
        ], '#2a1a1a', '#886040', 2, '#000000', 12);

        // ─── HORNS — gradient-filled tapered sweeps with ribbed segmentation ────
        // Sample a CUBIC bezier (4 control points) at 80 steps; at each step compute
        // a normal and a per-step thickness that tapers from the root (38 px) to the
        // tip (~2.5 px) with a square-rootish falloff. Build an asymmetric tube
        // outline (0.65 outward, 0.35 inward) so the horn's outer curve reads heavier
        // — like a ram's horn — then fill with a deep-brown→tan gradient and stroke a
        // subtle highlight along the upper edge plus 7 cross-rings for segmentation.
        const drawHorn = (cp: Pt[]): void => {
            const steps = 80;
            const rootThick = 38;
            const tipThick = 2.5;
            const bez = (t: number, a: number, b: number, c: number, d: number): number => {
                const u = 1 - t;
                return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d;
            };

            const pts: Pt[] = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                pts.push([
                    bez(t, cp[0][0], cp[1][0], cp[2][0], cp[3][0]),
                    bez(t, cp[0][1], cp[1][1], cp[2][1], cp[3][1]),
                ]);
            }
            const normals: Pt[] = pts.map((_, i) => {
                const prev = pts[Math.max(0, i - 1)];
                const next = pts[Math.min(pts.length - 1, i + 1)];
                const tx = next[0] - prev[0];
                const ty = next[1] - prev[1];
                const len = Math.hypot(tx, ty) || 1;
                return [-ty / len, tx / len];
            });
            const thick = pts.map((_, i) => {
                const t = i / steps;
                return rootThick * Math.pow(1 - t, 0.55) + tipThick;
            });
            const upper: Pt[] = pts.map((p, i) => [
                p[0] + normals[i][0] * thick[i] * 0.65,
                p[1] + normals[i][1] * thick[i] * 0.65,
            ]);
            const lower: Pt[] = pts.map((p, i) => [
                p[0] - normals[i][0] * thick[i] * 0.35,
                p[1] - normals[i][1] * thick[i] * 0.35,
            ]);

            // Body fill — warm root-to-tip gradient (kept brown; reference is brown).
            const hornGrad = ctx.createLinearGradient(cp[0][0], cp[0][1], cp[3][0], cp[3][1]);
            hornGrad.addColorStop(0.00, '#1a0e05');
            hornGrad.addColorStop(0.15, '#3b2210');
            hornGrad.addColorStop(0.35, '#6b4020');
            hornGrad.addColorStop(0.60, '#9a6835');
            hornGrad.addColorStop(0.82, '#c4934e');
            hornGrad.addColorStop(1.00, '#d4aa70');

            const tracePath = (): void => {
                ctx.beginPath();
                ctx.moveTo(upper[0][0], upper[0][1]);
                for (let i = 1; i < upper.length; i++) ctx.lineTo(upper[i][0], upper[i][1]);
                for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(lower[i][0], lower[i][1]);
                ctx.closePath();
            };

            tracePath();
            ctx.strokeStyle = '#0d0703';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            tracePath();
            ctx.fillStyle = hornGrad;
            ctx.fill();

            // Inner highlight line along the outer curve.
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) {
                const ox = normals[i][0] * thick[i] * 0.18;
                const oy = normals[i][1] * thick[i] * 0.18;
                ctx.lineTo(pts[i][0] + ox, pts[i][1] + oy);
            }
            ctx.strokeStyle = 'rgba(220, 180, 120, 0.55)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Cross-ring segmentation marks — 7 short lines spanning the horn width.
            const ringCount = 7;
            for (let r = 0; r < ringCount; r++) {
                const t = r / (ringCount + 2);
                const idx = Math.floor(t * steps);
                const p = pts[idx]; const n = normals[idx]; const w = thick[idx];
                ctx.beginPath();
                ctx.moveTo(p[0] + n[0] * w * 0.65, p[1] + n[1] * w * 0.65);
                ctx.lineTo(p[0] - n[0] * w * 0.35, p[1] - n[1] * w * 0.35);
                ctx.strokeStyle = 'rgba(20, 10, 4, 0.6)';
                ctx.lineWidth = 1.8;
                ctx.stroke();
            }
        };

        // Right horn (cubic bezier control points sweep outward then curl down).
        drawHorn([[435, 192], [555, 138], [608, 282], [522, 328]]);
        // Left horn (mirrored).
        drawHorn([[365, 192], [245, 138], [192, 282], [278, 328]]);

        // ─── GOAT SKULL FACE — 5-sided shape (NOT an ellipse) ───────────────────
        // Wider at the brow, tapering to a pointed chin.
        drawShape([
            [370, 170], [430, 170], [455, 210], [425, 280],
            [400, 310], [375, 280], [345, 210],
        ], '#2a1a1a', '#886050', 2);

        // EYEBROW ridges — sharp triangular brows over each eye.
        drawShape([[355, 200], [395, 215], [365, 225]], '#0a0303', '#000', 1);
        drawShape([[445, 200], [405, 215], [435, 225]], '#0a0303', '#000', 1);

        // ─── SLIT EYES — diamond shape, hellfire glowing ────────────────────────
        ctx.shadowColor = '#ff3010';
        ctx.shadowBlur = 30;
        drawShape([[360, 225], [385, 240], [375, 255], [350, 235]], '#fff8e8', '#ff6020', 2);
        drawShape([[440, 225], [415, 240], [425, 255], [450, 235]], '#fff8e8', '#ff6020', 2);
        ctx.shadowBlur = 0;

        // The dark aura around the sword is rendered separately as a LARGER mesh
        // (createDarkAuraMesh) — baking it onto this 800×1000 canvas would clip the
        // gradient at the canvas edges and create a visible square boundary.
        return canvas;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Tween utilities
    // ═══════════════════════════════════════════════════════════════════════════════
    private tween(
        uniform: { value: number },
        target: number,
        duration: number,
        easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad',
    ): Promise<void> {
        return new Promise((resolve) => {
            const start = performance.now();
            const from = uniform.value;
            const step = () => {
                const t = Math.min(1, (performance.now() - start) / duration);
                let v: number;
                switch (easing) {
                    case 'easeInQuad':    v = t * t; break;
                    case 'easeOutQuad':   v = 1 - (1 - t) * (1 - t); break;
                    case 'easeInOutQuad': v = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; break;
                    default:              v = t;
                }
                uniform.value = from + (target - from) * v;
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });
    }

    private tweenScale(
        mesh: THREE.Object3D,
        target: number,
        duration: number,
        easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad',
    ): Promise<void> {
        return new Promise((resolve) => {
            const start = performance.now();
            const from = mesh.scale.x;
            const step = () => {
                const t = Math.min(1, (performance.now() - start) / duration);
                let v: number;
                switch (easing) {
                    case 'easeInQuad':    v = t * t; break;
                    case 'easeOutQuad':   v = 1 - (1 - t) * (1 - t); break;
                    case 'easeInOutQuad': v = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; break;
                    default:              v = t;
                }
                const s = from + (target - from) * v;
                mesh.scale.set(s, s, 1);
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });
    }

    private tweenScaleXY(
        mesh: THREE.Object3D,
        targetX: number,
        targetY: number,
        duration: number,
        easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad',
    ): Promise<void> {
        return new Promise((resolve) => {
            const start = performance.now();
            const fromX = mesh.scale.x;
            const fromY = mesh.scale.y;
            const step = () => {
                const t = Math.min(1, (performance.now() - start) / duration);
                let v: number;
                switch (easing) {
                    case 'easeInQuad':    v = t * t; break;
                    case 'easeOutQuad':   v = 1 - (1 - t) * (1 - t); break;
                    case 'easeInOutQuad': v = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; break;
                    default:              v = t;
                }
                mesh.scale.set(fromX + (targetX - fromX) * v, fromY + (targetY - fromY) * v, 1);
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private disposeMesh(mesh: THREE.Mesh): void {
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
    }
}
