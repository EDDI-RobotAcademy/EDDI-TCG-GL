import * as THREE from "three";

// Scythe (죽음의 낫) — dark-power cut effect.
// Phases:
//   1) Reaper silhouette (canvas + shader aura) fades in beside the target card
//   2) Violet shader slash sweeps diagonally across the card + dark shockwave ring
//   3) killing:true  → original card hides, two shader-cut halves split apart and fade
//      killing:false → strong dark flash/shake on target (mythic survived the blow)
//   4) Reaper fades out
//
// All effect meshes are scene-local and disposed on completion.
export class ScytheCutEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        targetGroup: THREE.Group,
        cardId: number,
        killing: boolean,
    ): Promise<void> {
        const targetPos = targetGroup.position.clone();
        const ud = targetGroup.userData as { baseCardWidth?: number; baseCardHeight?: number };
        const cw = (ud.baseCardWidth ?? 100) * (targetGroup.scale.x || 1);
        const ch = (ud.baseCardHeight ?? 160) * (targetGroup.scale.y || 1);

        const cardTexturePromise = killing ? this.loadCardTexture(cardId) : null;

        // ============================================================================
        // SCYTHE GEOMETRY — hoisted so the summon pulse can bloom at the scythe's actual
        // spawn point (blade at REST pose), NOT at the target card.
        // ============================================================================
        const scythePlaneH = ch * 3.6;
        const scythePlaneW = cw * 4.5;
        // Canvas staff at x=160 / grip at y=340 → plane local (-0.233*W, -0.385*H).
        // Shifting the mesh by (+0.233*W, +0.385*H) puts the grip at the group origin.
        const GRIP_OFFSET_X_FRAC = 0.233;
        const GRIP_OFFSET_Y_FRAC = 0.385;
        // Pivot position — below the card. Blade tip distance from pivot ≈ 2.2*ch.
        const PIVOT_X = targetPos.x;
        const PIVOT_Y = targetPos.y - ch * 2.2;
        // Rotation sweep — wide arc. Rotation +0.88 rad (~+50°) makes blade point straight up.
        const ROT_REST = +0.22;      // blade wound up to the right
        const ROT_WINDUP = +0.10;    // extra wound back
        const ROT_STRIKE = +1.66;    // follow-through to the left (midpoint = +0.88)

        // Summon pulse blooms ALONG THE STAFF, slightly above center. The staff spans from
        // the grip (group_y = 0) up to the staff-top at canvas (152, 180) → group_y ≈ 0.416*H.
        // Staff midpoint is ~0.21*H; "slightly above middle" sits at ~0.25*H along the axis.
        const pulseLocalX = 0;
        const pulseLocalY = 0.25 * scythePlaneH;
        const cosRest = Math.cos(ROT_REST);
        const sinRest = Math.sin(ROT_REST);
        const spawnX = PIVOT_X + pulseLocalX * cosRest - pulseLocalY * sinRest;
        const spawnY = PIVOT_Y + pulseLocalX * sinRest + pulseLocalY * cosRest;

        // Screen darken + summoning pulse along the staff (slightly above its midpoint) —
        // the void bleeds out of the weapon shaft as the scythe materializes.
        const darkenPlane = this.createScreenDarken();
        this.scene.add(darkenPlane);
        const darkenMat = darkenPlane.material as THREE.ShaderMaterial;

        // Pulse is sized to the scythe, not the card — the scythe is ~4.5*cw wide, so inflate
        // the pulse footprint to match the presence of the weapon being summoned.
        const PULSE_SCALE = 1.5;
        await this.playSummonPulse(
            new THREE.Vector3(spawnX, spawnY, 2),
            cw * PULSE_SCALE, ch * PULSE_SCALE,
            darkenMat,
        );

        // ============================================================================
        // SCYTHE SWING — proper rotation around the GRIP (handle), NOT the middle of the
        // staff. The scythe is shifted UP inside its group so the grip coincides with the
        // pivot. When the group rotates, the BLADE traces a WIDE ARC across the card area.
        // ============================================================================
        const scythe = this.createScythe(scythePlaneW, scythePlaneH);
        (scythe.material as THREE.ShaderMaterial).uniforms.u_alpha.value = 0;
        scythe.position.x = GRIP_OFFSET_X_FRAC * scythePlaneW;
        scythe.position.y = GRIP_OFFSET_Y_FRAC * scythePlaneH;

        const scytheGroup = new THREE.Group();
        scytheGroup.add(scythe);
        scytheGroup.renderOrder = 520;
        this.scene.add(scytheGroup);
        scytheGroup.position.set(PIVOT_X, PIVOT_Y, 4);

        // Scale variation — subtle
        const SCALE_REST = 0.95;
        const SCALE_PEAK = 1.15;

        const zRotAtT = (t: number) => ROT_WINDUP + (ROT_STRIKE - ROT_WINDUP) * t;
        const scaleAtT = (t: number) =>
            SCALE_REST + (SCALE_PEAK - SCALE_REST) * Math.sin(t * Math.PI);

        // Initial pose — wound up at rest
        scytheGroup.rotation.set(0, 0, ROT_REST);
        scytheGroup.scale.set(SCALE_REST, SCALE_REST, 1);

        // Shader clock for scythe shader pulses
        const clockStart = performance.now();
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            const t = (performance.now() - clockStart) / 1000;
            (scythe.material as THREE.ShaderMaterial).uniforms.u_time.value = t;
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // Phase 1 — Scythe materializes (alpha fade-in at windup pose)
        await this.tweenUniform(
            (scythe.material as THREE.ShaderMaterial).uniforms.u_alpha,
            1, 220, 'easeOutQuad',
        );

        // Brief windup: pull scythe slightly further back
        await this.tweenLoop(150, 'easeOutQuad', (v) => {
            scytheGroup.rotation.z = ROT_REST + (ROT_WINDUP - ROT_REST) * v;
        });

        // Phase 2 — THE SWING: pivot-based arc from right to left.
        // The BLADE (at the top of the scythe) traces a wide arc through the card area
        // because the pivot is far below the card.
        const slash = this.createSlashBlade(cw, ch);
        slash.position.set(targetPos.x, targetPos.y, 5);
        slash.rotation.z = 0;
        (slash.material as THREE.ShaderMaterial).uniforms.u_alpha.value = 0;
        this.scene.add(slash);

        const ring = this.createShockwaveRing(cw);
        ring.position.set(targetPos.x, targetPos.y, 2);
        this.scene.add(ring);

        let slashStarted = false;
        await this.tweenLoop(520, 'easeInOutCubic', (v) => {
            const t = v;
            scytheGroup.rotation.z = zRotAtT(t);
            const s = scaleAtT(t);
            scytheGroup.scale.set(s, s, 1);

            // Fire slash slightly BEFORE the blade reaches card center so the arc trail's
            // HEAD is passing through the card at the moment the blade is there.
            if (!slashStarted && t >= 0.32) {
                slashStarted = true;
                (slash.material as THREE.ShaderMaterial).uniforms.u_alpha.value = 1;
                this.tweenUniform((slash.material as THREE.ShaderMaterial).uniforms.u_progress, 1, 380, 'easeOutQuart');
                this.tweenUniform((ring.material as THREE.ShaderMaterial).uniforms.u_progress, 0.9, 440, 'easeOutCubic');
                this.shake(targetGroup, cw * 0.22, 440);
            }
        });

        await this.delay(90);

        // Phase 3 — Card split (kill) or dark flash (mythic survived)
        if (killing) {
            targetGroup.visible = false;
            const cardTexture = await cardTexturePromise!;
            const halves = this.createCutHalves(cardTexture, cw, ch);
            for (const h of halves) {
                h.position.set(targetPos.x, targetPos.y, 3);
                this.scene.add(h);
            }

            await Promise.all([
                this.animateHalfApart(halves[0], cw, ch, 640),
                this.animateHalfApart(halves[1], cw, ch, 640),
                this.tweenUniform((ring.material as THREE.ShaderMaterial).uniforms.u_progress, 1, 520, 'easeOutCubic'),
                this.tweenUniform((slash.material as THREE.ShaderMaterial).uniforms.u_alpha, 0, 340, 'linear'),
            ]);

            for (const h of halves) {
                this.scene.remove(h);
                this.disposeMesh(h);
            }
        } else {
            this.applyDarkFlash(targetGroup);
            await Promise.all([
                this.tweenUniform((ring.material as THREE.ShaderMaterial).uniforms.u_progress, 1, 420, 'easeOutCubic'),
                this.tweenUniform((slash.material as THREE.ShaderMaterial).uniforms.u_alpha, 0, 340, 'linear'),
                this.shake(targetGroup, cw * 0.18, 420),
            ]);
        }

        // Phase 4 — Scythe fades out, screen lightens
        await Promise.all([
            this.tweenUniform((scythe.material as THREE.ShaderMaterial).uniforms.u_alpha, 0, 280, 'easeInQuad'),
            this.tweenUniform(darkenMat.uniforms.u_alpha, 0, 280, 'easeOutQuad'),
        ]);

        // Cleanup
        clockRunning = false;
        this.scene.remove(slash);
        this.scene.remove(ring);
        this.scene.remove(scytheGroup);
        this.scene.remove(darkenPlane);
        this.disposeMesh(slash);
        this.disposeMesh(ring);
        this.disposeMesh(scythe);
        this.disposeMesh(darkenPlane);
    }

    // === Reaper: canvas MASK (3-color channel encoding) + heavy shader atmosphere ===
    // Canvas color channels:
    //   black  (r=0, g=0, b=0)         — robe / hood / arms silhouette mask
    //   purple (r=18, g=0, b=42)       — skull face flesh (inside hood)
    //   red    (r=60, g=0, b=0)        — eye sockets, nose cavity, jaw gaps (brightest glow)
    // The shader turns the interior into turbulent FBM smoke, dissolves edges via noise, and
    // places bright violet bloom on the eye-socket/jaw markers.
    private createReaper(cw: number, ch: number): THREE.Mesh {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // === Smoke body: radial gradients replace the old humanoid silhouette. The shader
        // fills this partial-alpha purple area with turbulent FBM noise → reads as a dark
        // cloud trailing below the skull.

        // Upper wisp — small aura extending above the skull too
        const wispGrad = ctx.createRadialGradient(128, 100, 10, 128, 140, 90);
        wispGrad.addColorStop(0, 'rgba(18, 0, 42, 0.55)');
        wispGrad.addColorStop(1, 'rgba(18, 0, 42, 0)');
        ctx.fillStyle = wispGrad;
        ctx.fillRect(0, 0, 256, 240);

        // Main smoke cloud below skull — elongated downward, fading to edges
        const smokeGrad = ctx.createRadialGradient(128, 230, 20, 128, 380, 200);
        smokeGrad.addColorStop(0.0, 'rgba(18, 0, 42, 0.85)');
        smokeGrad.addColorStop(0.35, 'rgba(18, 0, 42, 0.55)');
        smokeGrad.addColorStop(0.75, 'rgba(18, 0, 42, 0.22)');
        smokeGrad.addColorStop(1.0, 'rgba(18, 0, 42, 0)');
        ctx.fillStyle = smokeGrad;
        ctx.fillRect(0, 180, 256, 332);

        // Secondary off-axis wisps for asymmetric cloud shape (more organic)
        const wispL = ctx.createRadialGradient(90, 320, 15, 90, 340, 85);
        wispL.addColorStop(0, 'rgba(18, 0, 42, 0.4)');
        wispL.addColorStop(1, 'rgba(18, 0, 42, 0)');
        ctx.fillStyle = wispL;
        ctx.fillRect(0, 240, 170, 180);

        const wispR = ctx.createRadialGradient(166, 300, 15, 166, 320, 80);
        wispR.addColorStop(0, 'rgba(18, 0, 42, 0.4)');
        wispR.addColorStop(1, 'rgba(18, 0, 42, 0)');
        ctx.fillStyle = wispR;
        ctx.fillRect(90, 220, 166, 180);

        // === Skull — the only rigid, recognizable feature ===
        // Base flesh (full-alpha purple) — cranium + jaw
        ctx.fillStyle = 'rgb(18, 0, 42)';
        ctx.beginPath();
        ctx.ellipse(128, 130, 32, 34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(108, 158);
        ctx.lineTo(148, 158);
        ctx.lineTo(142, 188);
        ctx.lineTo(114, 188);
        ctx.closePath();
        ctx.fill();

        // === Eyes — sharp angular slits angled inward/downward (classic angry look) ===
        ctx.fillStyle = 'rgb(60, 0, 0)';

        // LEFT eye — pointed slit, outer-upper corner sharp, angling DOWN toward the nose
        ctx.beginPath();
        ctx.moveTo(100, 118);                      // outer-upper SHARP point
        ctx.quadraticCurveTo(108, 116, 120, 128);  // top edge curving down-right
        ctx.lineTo(126, 135);                      // inner-lower SHARP point (toward nose)
        ctx.quadraticCurveTo(114, 134, 106, 128);  // bottom edge back up-left
        ctx.closePath();
        ctx.fill();

        // RIGHT eye — mirrored, angling DOWN toward the nose
        ctx.beginPath();
        ctx.moveTo(156, 118);                      // outer-upper SHARP point
        ctx.quadraticCurveTo(148, 116, 136, 128);  // top edge
        ctx.lineTo(130, 135);                      // inner-lower SHARP point
        ctx.quadraticCurveTo(142, 134, 150, 128);  // bottom edge
        ctx.closePath();
        ctx.fill();

        // Angry brow hooks — thin red slashes above each eye angling inward, reinforcing
        // the furrowed-brow menace. These bloom brightly in the shader alongside the eye slits.
        ctx.strokeStyle = 'rgb(60, 0, 0)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(98, 114);
        ctx.quadraticCurveTo(108, 108, 124, 114);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(158, 114);
        ctx.quadraticCurveTo(148, 108, 132, 114);
        ctx.stroke();

        // Nose cavity — narrow inverted triangle with slight curve
        ctx.fillStyle = 'rgb(60, 0, 0)';
        ctx.beginPath();
        ctx.moveTo(128, 140);
        ctx.lineTo(134, 156);
        ctx.lineTo(128, 160);
        ctx.lineTo(122, 156);
        ctx.closePath();
        ctx.fill();

        // Teeth gaps — vertical slits on jaw
        ctx.fillRect(117, 166, 2, 14);
        ctx.fillRect(124, 166, 2, 14);
        ctx.fillRect(131, 166, 2, 14);
        ctx.fillRect(138, 166, 2, 14);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            uniforms: {
                u_texture: { value: texture },
                u_time: { value: 0 },
                u_alpha: { value: 1 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D u_texture;
                uniform float u_time;
                uniform float u_alpha;

                // Hash-based value noise + FBM for turbulent smoke
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                }
                float vnoise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
                        f.y
                    );
                }
                float fbm(vec2 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 5; i++) {
                        v += a * vnoise(p);
                        p *= 2.0;
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    // Turbulent cloth distortion — sample the silhouette through time-varying
                    // noise so the whole figure breathes and shifts like it's made of smoke.
                    float turbulence = fbm(vUv * 4.0 + vec2(u_time * 0.3, -u_time * 0.4));
                    vec2 distortedUv = vUv + vec2(
                        (turbulence - 0.5) * 0.012,
                        (fbm(vUv * 6.0 + vec2(-u_time * 0.2, u_time * 0.3)) - 0.5) * 0.015
                    );

                    vec4 tex = texture2D(u_texture, distortedUv);

                    // Channel decoding (post-distortion):
                    //   blue  > 0.03  → skull flesh (purple)
                    //   red   > 0.03 && blue < 0.03 → eye sockets / nose / teeth
                    //   neither       → pure-black robe
                    float skullFlesh = step(0.03, tex.b) * tex.a;
                    float eyeMark = step(0.03, tex.r) * step(tex.b, 0.03) * tex.a;

                    // 12-tap inner halo (tight)
                    float innerAura = 0.0;
                    for (int i = 0; i < 12; i++) {
                        float a = float(i) * 0.5236;
                        innerAura += texture2D(u_texture, distortedUv + vec2(cos(a), sin(a)) * 0.013).a;
                    }
                    innerAura = max(0.0, innerAura * 0.0833 - tex.a);

                    // 8-tap mid glow
                    float midAura = 0.0;
                    for (int j = 0; j < 8; j++) {
                        float a2 = float(j) * 0.7854;
                        midAura += texture2D(u_texture, distortedUv + vec2(cos(a2), sin(a2)) * 0.04).a;
                    }
                    midAura = max(0.0, midAura * 0.125 - tex.a - innerAura);

                    // 8-tap outer haze — wider, forms the "mist" around the figure
                    float outerAura = 0.0;
                    for (int k = 0; k < 8; k++) {
                        float a3 = float(k) * 0.7854;
                        outerAura += texture2D(u_texture, distortedUv + vec2(cos(a3), sin(a3)) * 0.09).a;
                    }
                    outerAura = max(0.0, outerAura * 0.125 - tex.a - midAura - innerAura);

                    // Eye-socket bloom: 8-tap around eye markers
                    float eyeBloom = 0.0;
                    for (int m = 0; m < 8; m++) {
                        float a4 = float(m) * 0.7854;
                        vec4 nb = texture2D(u_texture, distortedUv + vec2(cos(a4), sin(a4)) * 0.022);
                        eyeBloom += step(0.03, nb.r) * step(nb.b, 0.03) * nb.a;
                    }
                    eyeBloom *= 0.125;

                    float pulse = 0.75 + 0.25 * sin(u_time * 4.5);
                    float fastPulse = 0.85 + 0.15 * sin(u_time * 16.0);
                    float breath = 0.92 + 0.08 * sin(u_time * 2.0);

                    // === FBM smoke INTERIOR ===
                    // The robe is not flat black — it's filled with flowing FBM noise that
                    // looks like turbulent darkness with violet highlights streaming through.
                    vec2 smokeUv1 = vUv * 3.5 + vec2(u_time * 0.4, -u_time * 0.6);
                    vec2 smokeUv2 = vUv * 7.0 + vec2(-u_time * 0.25, u_time * 0.35);
                    float smokeLow  = fbm(smokeUv1);
                    float smokeHigh = fbm(smokeUv2);
                    float smoke = smokeLow * 0.6 + smokeHigh * 0.4;

                    // === Edge DISSOLVE: silhouette boundary melts into smoke ===
                    // Detect edge region via the gap between tex.a and inner samples, then
                    // attenuate alpha there based on noise — cloth becomes mist.
                    float edgeBand = innerAura + tex.a * (1.0 - tex.a);  // peaks near boundary
                    float dissolveNoise = fbm(vUv * 12.0 + vec2(u_time * 0.8, -u_time * 1.1));
                    float dissolveMask = 1.0 - smoothstep(0.35, 0.65, dissolveNoise) * 0.7;

                    // === Exterior smoke cloud ===
                    // Above/around the figure, paint a dark violet mist with FBM — sells the
                    // idea that the reaper is emerging from a cloud of death.
                    vec2 mistUv = vUv * 2.2 + vec2(u_time * 0.15, -u_time * 0.25);
                    float mist = fbm(mistUv) * smoothstep(0.0, 0.4, outerAura + midAura * 0.4);
                    mist *= smoothstep(1.0, 0.2, vUv.y);  // stronger at bottom

                    // Rising ember motes outside the silhouette
                    float embers = 0.0;
                    if (tex.a < 0.05) {
                        vec2 emberUv = vUv * vec2(18.0, 34.0);
                        emberUv.y -= u_time * 2.8;
                        float n = vnoise(emberUv);
                        embers = smoothstep(0.89, 0.98, n) * smoothstep(0.0, 0.3, outerAura + midAura * 0.5);
                    }

                    // --- Colors ---
                    vec3 robeDeep    = vec3(0.005, 0.0, 0.02);            // near-black base
                    vec3 robeHighlight = vec3(0.25, 0.05, 0.55);          // violet highlight in smoke
                    vec3 skullBone   = vec3(0.12, 0.02, 0.28);            // dim skull flesh tone
                    vec3 skullLit    = vec3(0.45, 0.08, 0.75);            // pulsing skull highlight
                    vec3 eyeCore     = vec3(1.0,  0.15, 0.35);            // blood-violet eye center
                    vec3 eyeAura     = vec3(0.9,  0.1,  0.95);            // violet bloom around eyes
                    vec3 innerColor  = vec3(0.75, 0.12, 1.0)  * pulse;
                    vec3 midColor    = vec3(0.42, 0.05, 0.78) * pulse;
                    vec3 outerColor  = vec3(0.18, 0.0,  0.36) * pulse;
                    vec3 mistColor   = vec3(0.22, 0.02, 0.42);
                    vec3 emberColor  = vec3(0.85, 0.25, 1.0);

                    // Robe interior: smoky base
                    vec3 robeColor = mix(robeDeep, robeHighlight, smoke * 0.7);

                    // Skull flesh with pulsing lit highlight (strongest at nose/jaw areas)
                    vec3 skullColor = mix(skullBone, skullLit, smoke * fastPulse);

                    // Body color: robe, but skull region gets skullColor
                    vec3 bodyColor = mix(robeColor, skullColor, skullFlesh);
                    // Eye markers: very bright, overrides everything
                    bodyColor = mix(bodyColor, eyeCore * (1.2 + 0.4 * fastPulse), eyeMark);

                    // Edge dissolve: attenuate body alpha at the boundary
                    float bodyAlpha = tex.a * mix(dissolveMask, 1.0, 1.0 - smoothstep(0.02, 0.08, edgeBand));

                    vec3 color = bodyColor * bodyAlpha
                               + innerColor * innerAura
                               + midColor * midAura
                               + outerColor * outerAura
                               + eyeAura * eyeBloom * (0.9 + 0.3 * fastPulse)
                               + mistColor * mist
                               + emberColor * embers;

                    float alpha = bodyAlpha
                                + innerAura * 0.95
                                + midAura * 0.65
                                + outerAura * 0.40
                                + eyeBloom * 0.9
                                + mist * 0.35
                                + embers * 0.75;
                    alpha *= u_alpha * breath;

                    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
                }
            `,
        });

        const geometry = new THREE.PlaneGeometry(cw * 2.0, ch * 2.5);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 500;
        return mesh;
    }

    // === Scythe: imposing weapon silhouette with heavy dark-aura shader ===
    // Canvas channel encoding:
    //   black          (r=0, b=0)     — main blade + staff body
    //   dark purple    (r=0, b=42)    — secondary aura mask (widens the blade's glow region)
    //   dark red       (r=60, b=0)    — cutting edge + rune marks (brightest glow)
    // Layout: pivot at canvas center. Staff is RELATIVELY SHORT compared to the BIG curved
    // crescent blade at top — this is what makes it read as a scythe (previously the blade
    // was too small → looked like a hockey stick).
    private createScythe(planeWidth: number, planeHeight: number): THREE.Mesh {
        const canvas = document.createElement('canvas');
        canvas.width = 600;              // WIDER canvas for double-sided blade (right long, left short)
        canvas.height = 384;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Staff — at canvas x=160 (shifted left of center) so the right blade has much more
        // horizontal room than the left blade (right ~410px, left ~130px).
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(160, 376);                              // bottom tip
        ctx.bezierCurveTo(160, 310, 158, 250, 158, 220);   // straight lower
        ctx.bezierCurveTo(158, 200, 154, 188, 152, 180);   // slight bend into blade
        ctx.stroke();

        // Grip wrap — modest bulge
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(159, 222);
        ctx.lineTo(158, 178);
        ctx.stroke();

        // Counterweight / pommel at staff bottom — small spike
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(160, 376);
        ctx.lineTo(168, 368);
        ctx.lineTo(162, 352);
        ctx.lineTo(158, 352);
        ctx.lineTo(152, 368);
        ctx.closePath();
        ctx.fill();

        // === UNIFIED BLADE — ONE continuous crescent spanning both sides of the staff.
        //   Both outer AND inner are CLEARLY ROUNDED arcs (both bulging UP). Inner peaks
        //   high enough to curve visibly — not a near-straight line. Arcs converge tightly
        //   at the tips, giving sharp pointy ends.
        ctx.fillStyle = 'black';
        ctx.beginPath();

        // Start at LEFT tip
        ctx.moveTo(28, 193);

        // OUTER (top/back) — small arc, HIGH peak. Asymmetric (peak shifted right).
        ctx.bezierCurveTo(
            70, 140,        // cp1: near left tip, pulled well up
            420, 118,       // cp2: right side higher peak
            572, 193,       // end: right tip
        );

        // INNER (bottom/cutting) — LARGER arc that STILL clearly bulges up. Control points
        // pulled well above baseline so the inner edge is a proper ROUND arc, not straight.
        // Matching outer's asymmetry: cp1 near the right is higher than cp2 near the left.
        ctx.bezierCurveTo(
            420, 148,       // cp1: clearly rounded (right side, higher to mirror outer asymmetry)
            70, 158,        // cp2: clearly rounded (left side, slightly lower)
            28, 193,        // close at left tip
        );
        ctx.closePath();
        ctx.fill();

        // === Aura pad — unified silhouette slightly larger, mirrors the two arc peaks ===
        ctx.fillStyle = 'rgb(0, 0, 42)';
        ctx.beginPath();
        ctx.moveTo(22, 193);
        ctx.bezierCurveTo(
            66, 128,
            422, 104,
            578, 193,
        );
        ctx.bezierCurveTo(
            422, 142,
            66, 152,
            22, 193,
        );
        ctx.closePath();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // === Cutting edge stroke — follows the rounded inner arc ===
        ctx.strokeStyle = 'rgb(60, 0, 0)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(32, 191);
        ctx.bezierCurveTo(
            70, 160,
            420, 150,
            568, 191,
        );
        ctx.stroke();

        // === Outer edge marker — MIRRORS the inner cutting-edge stroke structure, just
        //     along the outer arc. Control points are 2-6 pixels below the outer arc's
        //     control points so the stroke hugs the outer curve tightly INSIDE the body.
        //
        //     Inner stroke ref: (32, 191) → (70, 160) → (420, 150) → (568, 191)
        //     Inner arc       : (28, 193) → (70, 158) → (420, 148) → (572, 193)
        //     → Stroke stays 1-2px inside inner arc.
        //
        //     Outer arc       : (28, 193) → (70, 140) → (420, 118) → (572, 193)
        //     → Outer stroke follows the SAME offset pattern:
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(32, 192);
        ctx.bezierCurveTo(
            72, 144,        // 4px below outer cp1 (70, 140)
            420, 124,       // 6px below outer cp2 (420, 118)
            568, 192,
        );
        ctx.stroke();

        // Runes along the staff — 3 glowing sigils with small crosses
        ctx.fillStyle = 'rgb(60, 0, 0)';
        ctx.beginPath();
        ctx.arc(158, 148, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(159, 260, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(160, 328, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(155, 147, 6, 1);
        ctx.fillRect(156, 259, 6, 1);
        ctx.fillRect(157, 327, 6, 1);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
            uniforms: {
                u_texture: { value: texture },
                u_time: { value: 0 },
                u_alpha: { value: 1 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D u_texture;
                uniform float u_time;
                uniform float u_alpha;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    f = f*f*(3.0-2.0*f);
                    return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x),
                               mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0; float a = 0.5;
                    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.0; a *= 0.5; }
                    return v;
                }

                void main() {
                    // Turbulent UV distortion for edge shimmer
                    float edgeNoise = fbm(vUv * 8.0 + vec2(u_time * 0.8, -u_time * 1.1)) - 0.5;
                    vec2 distUv = vUv + vec2(edgeNoise * 0.008, edgeNoise * 0.006);

                    vec4 tex = texture2D(u_texture, distUv);

                    // Channel decoding: solid body (alpha + rgb=0), aura pad (b>0), runes/edge (r>0)
                    float body      = step(0.05, tex.a) * step(tex.r + tex.b, 0.03);
                    float auraPad   = step(0.03, tex.b) * step(tex.r, 0.03);
                    float edgeMark  = step(0.03, tex.r);

                    // ═══ TIGHT RIM — hugs the blade contour exactly ═══
                    float rim = 0.0;
                    for (int i = 0; i < 12; i++) {
                        float a = float(i) * 0.5236;
                        rim += texture2D(u_texture, distUv + vec2(cos(a), sin(a)) * 0.006).a;
                    }
                    rim = max(0.0, rim * 0.0833 - tex.a);

                    // ═══ NEAR HALO — inner dark-purple band hugging just beyond rim ═══
                    float nearHalo = 0.0;
                    for (int j = 0; j < 12; j++) {
                        float a2 = float(j) * 0.5236;
                        nearHalo += texture2D(u_texture, distUv + vec2(cos(a2), sin(a2)) * 0.018).a;
                    }
                    nearHalo = max(0.0, nearHalo * 0.0833 - tex.a - rim);

                    // ═══ DARK MIST — wider shadow layer, moody purple-black ═══
                    float darkMist = 0.0;
                    for (int k = 0; k < 10; k++) {
                        float a3 = float(k) * 0.628;
                        darkMist += texture2D(u_texture, distUv + vec2(cos(a3), sin(a3)) * 0.045).a;
                    }
                    darkMist = max(0.0, darkMist * 0.1 - tex.a - nearHalo - rim);

                    // ═══ DEEP SHADOW — far outer dark fade ═══
                    float deepShadow = 0.0;
                    for (int m = 0; m < 8; m++) {
                        float a4 = float(m) * 0.7854;
                        deepShadow += texture2D(u_texture, distUv + vec2(cos(a4), sin(a4)) * 0.095).a;
                    }
                    deepShadow = max(0.0, deepShadow * 0.125 - tex.a - darkMist - nearHalo - rim);

                    // Cutting-edge bloom (tight around red marker)
                    float edgeBloom = 0.0;
                    for (int n = 0; n < 10; n++) {
                        float a5 = float(n) * 0.628;
                        vec4 nb = texture2D(u_texture, distUv + vec2(cos(a5), sin(a5)) * 0.014);
                        edgeBloom += step(0.03, nb.r);
                    }
                    edgeBloom *= 0.1;

                    // Pulses
                    float pulse = 0.8 + 0.2 * sin(u_time * 6.0);
                    float fastPulse = 0.75 + 0.25 * sin(u_time * 18.0);
                    float surge = 0.7 + 0.3 * sin(u_time * 3.0);
                    float slowPulse = 0.85 + 0.15 * sin(u_time * 2.2);

                    // ═══ FBM smoke INSIDE the blade — flowing darkness ═══
                    vec2 smokeUv = vUv * vec2(5.0, 3.5) + vec2(u_time * 0.3, -u_time * 0.9);
                    float smoke = fbm(smokeUv);
                    vec2 smokeUv2 = vUv * 10.0 + vec2(-u_time * 0.4, u_time * 0.5);
                    float smokeFine = fbm(smokeUv2);

                    // ═══ DARK ENERGY TENDRILS — FBM noise STREAMING ALONG the blade length ═══
                    // Directional flow (mostly horizontal for the blade) creates the feeling of
                    // dark energy rivers flowing around the weapon.
                    vec2 flowUv1 = vUv * vec2(12.0, 5.0) + vec2(u_time * 1.8, u_time * 0.2);
                    float tendril1 = fbm(flowUv1);
                    vec2 flowUv2 = vUv * vec2(22.0, 8.0) + vec2(-u_time * 2.4, -u_time * 0.4);
                    float tendril2 = fbm(flowUv2);
                    float tendrils = tendril1 * 0.6 + tendril2 * 0.4;
                    // Mask: tendrils only appear in the aura region (not in body, not far outside)
                    float tendrilMask = (rim * 0.8 + nearHalo * 1.2 + darkMist * 0.9);
                    float darkFlow = tendrils * tendrilMask;

                    // ═══ VOID WISPS — deep black streaks emanating radially outward ═══
                    vec2 voidUv = vUv * vec2(6.0, 6.0) + vec2(u_time * 0.5, -u_time * 0.7);
                    float voidNoise = fbm(voidUv);
                    float voidWisps = smoothstep(0.55, 0.8, voidNoise) * (nearHalo + darkMist * 0.7);

                    // ═══ Energy wisps streaming along the blade body ═══
                    float wispPhase = vUv.x * 8.0 - u_time * 5.0;
                    float wisp = (sin(wispPhase) * 0.5 + 0.5);
                    wisp = pow(wisp, 6.0) * body;

                    // Rising dark embers around the whole weapon
                    float embers = 0.0;
                    if (tex.a < 0.08) {
                        vec2 eUv = vUv * vec2(16.0, 28.0);
                        eUv.y -= u_time * 3.0;
                        float n2 = vnoise(eUv);
                        embers = smoothstep(0.87, 0.97, n2) * smoothstep(0.0, 0.4, darkMist + nearHalo * 0.4);
                    }

                    // === OMINOUS DARK ENERGY — no more bright-white neon, just shadowed violet ===
                    // Everything is dimmer and the color is MODULATED BY FBM NOISE so violet
                    // and near-black are constantly swapping places in the aura. This reads
                    // as "dark energy tinged with purple" rather than "glowing neon light".
                    //
                    // Noise used for color mix — alternates violet vs pure shadow
                    vec2 mixUv = vUv * vec2(4.0, 3.0) + vec2(u_time * 0.4, -u_time * 0.25);
                    float colorMix = fbm(mixUv);  // 0..1

                    // Secondary slower noise for deeper shadow patches
                    vec2 shadowUv = vUv * vec2(7.0, 4.0) + vec2(-u_time * 0.6, u_time * 0.4);
                    float shadowNoise = fbm(shadowUv);
                    float deepPatch = smoothstep(0.55, 0.8, shadowNoise);

                    // --- Colors — DIMMED, muted, weighted toward shadow ---
                    vec3 coreColor       = vec3(0.008, 0.0,  0.025);         // near-black core
                    vec3 smokeColor      = vec3(0.18,  0.02, 0.38) * slowPulse; // dim violet smoke
                    // Rim is NO LONGER bright neon; it's a dim violet that gets MIXED with black
                    vec3 rimViolet       = vec3(0.55,  0.08, 0.85);
                    vec3 rimShadow       = vec3(0.10,  0.0,  0.22);
                    vec3 rimColor        = mix(rimShadow, rimViolet, colorMix * pulse);
                    // Near halo also mixed between violet and darker shadow
                    vec3 nearHaloV       = vec3(0.30,  0.02, 0.60);
                    vec3 nearHaloS       = vec3(0.05,  0.0,  0.12);
                    vec3 nearHaloColor   = mix(nearHaloS, nearHaloV, colorMix);
                    vec3 darkMistColor   = vec3(0.10,  0.0,  0.22) * slowPulse; // even darker mist
                    vec3 deepShadowColor = vec3(0.015, 0.0,  0.04);          // near pitch black
                    vec3 tendrilColor    = mix(vec3(0.04, 0.0, 0.10), vec3(0.22, 0.02, 0.45), colorMix);
                    vec3 voidWispColor   = vec3(0.015, 0.0,  0.05);          // PITCH BLACK void
                    vec3 auraPadColor    = vec3(0.22,  0.03, 0.45) * slowPulse;
                    // Edge is DIM violet-crimson (was white-hot). Not a "light beam" anymore.
                    vec3 edgeHot         = vec3(0.55,  0.10, 0.65);          // muted violet edge
                    vec3 edgeGlow        = vec3(0.45,  0.05, 0.7);           // deep violet bloom
                    vec3 wispColor       = vec3(0.35,  0.05, 0.65);          // dim streaming energy
                    vec3 emberColor      = vec3(0.38,  0.08, 0.55);          // dimmer embers

                    // Body: dark base + smoke highlights + wisps streaming
                    vec3 bodyCol = coreColor;
                    bodyCol = mix(bodyCol, smokeColor, smoke * 0.6);
                    bodyCol = mix(bodyCol, wispColor * 0.7, wisp * 0.4);
                    // Patches of DEEPER shadow inside body — "veins of darkness"
                    bodyCol = mix(bodyCol, vec3(0.0), deepPatch * 0.5 * body);

                    // Compose — DARK layers emphasized, rim reduced to muted violet.
                    // Deep shadow still stacks BEHIND the rim for depth.
                    vec3 color = bodyCol * body * tex.a
                               + auraPadColor * auraPad * tex.a * (0.55 + 0.45 * smokeFine)
                               + deepShadowColor * deepShadow * (1.0 + tendrils * 0.8)
                               + darkMistColor * darkMist * (0.75 + tendrils * 0.8)
                               + nearHaloColor * nearHalo * (0.75 + tendrils * 0.5)
                               + tendrilColor * darkFlow * 1.1
                               + voidWispColor * voidWisps * 1.8          // stronger pitch-black wisps
                               + rimColor * rim * (0.75 + tendrils * 0.4) // rim DIMMED + shadow-modulated
                               + edgeHot * edgeMark * (0.5 + 0.3 * fastPulse)
                               + edgeGlow * edgeBloom * (0.6 + 0.3 * fastPulse)
                               + emberColor * embers;

                    // Mix the entire aura region with shadow noise so patches FLICKER DARKER
                    // — the "ominous" feel: purple and black weaving together.
                    float auraAlpha = rim + nearHalo + darkMist * 0.8 + deepShadow * 0.5;
                    color = mix(color, color * vec3(0.15, 0.1, 0.25), deepPatch * auraAlpha * 0.6);

                    float alpha = tex.a
                                + rim * 1.0
                                + nearHalo * 0.85
                                + darkMist * 0.65
                                + deepShadow * 0.42
                                + darkFlow * 0.55
                                + voidWisps * 1.0
                                + edgeBloom * 0.65
                                + embers * 0.8;
                    alpha *= u_alpha;

                    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
                }
            `,
        });

        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 520;
        return mesh;
    }

    // === Dark summoning pulse — heralds the reaper's arrival (MORE INTENSE) ===
    // Screen darken fades in, dark vortex materializes, THREE shockwaves pulse outward at
    // staggered intervals, lightning cracks radiate, and the WHOLE SCENE SHAKES with
    // escalating intensity (like Sea of Specter) to convey destructive power. Total ~700ms.
    private async playSummonPulse(
        pulseCenter: THREE.Vector3,
        cw: number,
        ch: number,
        darkenMat: THREE.ShaderMaterial,
    ): Promise<void> {
        // Dark vortex at spawn point — swirling core that materializes first
        const vortex = this.createDarkVortex(cw);
        vortex.position.copy(pulseCenter);
        this.scene.add(vortex);

        // Lightning cracks radiating outward — animated stroke lines
        const cracks = this.createSummonCracks(cw);
        cracks.position.copy(pulseCenter);
        this.scene.add(cracks);

        // Three concentric shockwaves with staggered timing
        const wave1 = this.createShockwaveRing(cw);
        wave1.position.copy(pulseCenter);
        this.scene.add(wave1);
        const wave2 = this.createShockwaveRing(cw);
        wave2.position.copy(pulseCenter);
        this.scene.add(wave2);
        const wave3 = this.createShockwaveRing(cw);
        wave3.position.copy(pulseCenter);
        this.scene.add(wave3);

        const vortexMat = vortex.material as THREE.ShaderMaterial;
        const cracksMat = cracks.material as THREE.ShaderMaterial;
        const wave1Mat = wave1.material as THREE.ShaderMaterial;
        const wave2Mat = wave2.material as THREE.ShaderMaterial;
        const wave3Mat = wave3.material as THREE.ShaderMaterial;

        // Shared clock for vortex + cracks
        const clockStart = performance.now();
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            const t = (performance.now() - clockStart) / 1000;
            vortexMat.uniforms.u_time.value = t;
            cracksMat.uniforms.u_time.value = t;
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // ═══ CATACLYSMIC SHAKE — fires in parallel with the rest of the summon, amplitude
        //     escalates through 4 phases within the existing 700ms window.
        void this.shakeSceneEscalating([
            { amplitude: cw * 0.05, duration: 260 },   // small tremor (vortex forming)
            { amplitude: cw * 0.11, duration: 280 },   // stronger (2nd + 3rd wave)
            { amplitude: cw * 0.22, duration: 110 },   // PEAK — destructive spike
            { amplitude: cw * 0.06, duration: 60  },   // settle
        ]);

        // Darken screen, spawn vortex, first wave
        await Promise.all([
            this.tweenUniform(darkenMat.uniforms.u_alpha, 0.4, 280, 'easeOutQuad'),
            this.tweenUniform(vortexMat.uniforms.u_alpha, 1.0, 200, 'easeOutQuad'),
            this.tweenUniform(wave1Mat.uniforms.u_progress, 1.0, 420, 'easeOutCubic'),
        ]);

        // Second + third waves + cracks erupt + IMPACT DARKEN FLASH at the peak.
        await Promise.all([
            this.tweenUniform(cracksMat.uniforms.u_alpha, 1.0, 180, 'easeOutQuad'),
            (async () => {
                this.tweenUniform(wave2Mat.uniforms.u_progress, 1.0, 420, 'easeOutCubic');
                await this.delay(130);
                this.tweenUniform(wave3Mat.uniforms.u_progress, 1.0, 420, 'easeOutCubic');
                // IMPACT — briefly spike darken for a "world crashing inward" beat
                void this.tweenUniform(darkenMat.uniforms.u_alpha, 0.72, 90, 'easeOutQuad').then(() =>
                    this.tweenUniform(darkenMat.uniforms.u_alpha, 0.4, 260, 'easeInQuad'),
                );
            })(),
            this.delay(280),
        ]);

        // Brief hold, then cracks fade
        await this.delay(60);
        void this.tweenUniform(cracksMat.uniforms.u_alpha, 0, 280, 'easeInQuad');

        // Vortex stays for the reaper's entrance — fades during the reaper fade-in.
        void this.tweenUniform(vortexMat.uniforms.u_alpha, 0, 420, 'easeInQuad').then(() => {
            clockRunning = false;
            this.scene.remove(vortex);
            this.scene.remove(cracks);
            this.scene.remove(wave1);
            this.scene.remove(wave2);
            this.scene.remove(wave3);
            this.disposeMesh(vortex);
            this.disposeMesh(cracks);
            this.disposeMesh(wave1);
            this.disposeMesh(wave2);
            this.disposeMesh(wave3);
        });
    }

    // === Scene-wide shake with escalating amplitude phases ===
    // Shakes the scene root (the whole game view). Amplitude transitions through the given
    // phase list, each phase ran for its duration. Position is always reset to origin at end.
    private shakeSceneEscalating(
        phases: readonly { readonly amplitude: number; readonly duration: number }[],
    ): Promise<void> {
        const origX = this.scene.position.x;
        const origY = this.scene.position.y;
        return new Promise<void>((resolve) => {
            let idx = 0;
            let phaseStart = performance.now();
            const step = () => {
                if (idx >= phases.length) {
                    this.scene.position.x = origX;
                    this.scene.position.y = origY;
                    resolve();
                    return;
                }
                const phase = phases[idx];
                const elapsed = performance.now() - phaseStart;
                if (elapsed >= phase.duration) {
                    idx += 1;
                    phaseStart = performance.now();
                    requestAnimationFrame(step);
                    return;
                }
                this.scene.position.x = origX + (Math.random() - 0.5) * phase.amplitude;
                this.scene.position.y = origY + (Math.random() - 0.5) * phase.amplitude;
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }

    // === Full-screen darken overlay (lightly tints the whole viewport) ===
    private createScreenDarken(): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            uniforms: { u_alpha: { value: 0 } },
            vertexShader: `
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float u_alpha;
                void main() {
                    // Slight violet tint in the darkness rather than pure black.
                    gl_FragColor = vec4(0.02, 0.0, 0.06, u_alpha);
                }
            `,
        });
        // Make the plane very large — covers any reasonable viewport in ortho scene coords.
        const geometry = new THREE.PlaneGeometry(window.innerWidth * 2.5, window.innerHeight * 2.5);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 1.5);  // behind the effects (z=2+) but above the game (z=0)
        mesh.renderOrder = 400;
        return mesh;
    }

    // === Lightning cracks radiating outward from the summoning point ===
    private createSummonCracks(cw: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            uniforms: {
                u_time: { value: 0 },
                u_alpha: { value: 0 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;
                uniform float u_alpha;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

                void main() {
                    vec2 p = vUv - 0.5;
                    float r = length(p) * 2.0;
                    float theta = atan(p.y, p.x);

                    // 8 radiating cracks at fixed angles, each with per-angle jitter
                    float angleStep = 6.2832 / 8.0;
                    float nearest = floor(theta / angleStep + 0.5) * angleStep;
                    float angleDiff = theta - nearest;
                    // Jitter: make each crack slightly wavy
                    float wave = sin(r * 14.0 + hash(vec2(nearest, 0.0)) * 10.0 + u_time * 3.0) * 0.015;
                    float crack = smoothstep(0.02 + wave, 0.0, abs(angleDiff));
                    // Radial falloff — brightest midway
                    crack *= smoothstep(0.15, 0.4, r) * smoothstep(1.2, 0.5, r);

                    // Flicker
                    float flicker = 0.6 + 0.4 * sin(u_time * 22.0 + nearest * 4.0);
                    crack *= flicker;

                    vec3 crackCore = vec3(1.0, 0.4, 1.0);
                    vec3 crackGlow = vec3(0.7, 0.1, 1.0);
                    vec3 color = mix(crackGlow, crackCore, crack);

                    gl_FragColor = vec4(color, crack * u_alpha);
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(cw * 6.0, cw * 6.0);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 530;
        return mesh;
    }

    // === Dark vortex — swirling void at the summoning point ===
    private createDarkVortex(cw: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            uniforms: {
                u_time: { value: 0 },
                u_alpha: { value: 0 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;
                uniform float u_alpha;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    f = f*f*(3.0-2.0*f);
                    return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x),
                               mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0; float a = 0.5;
                    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.0; a *= 0.5; }
                    return v;
                }

                void main() {
                    vec2 p = vUv - 0.5;
                    float r = length(p) * 2.0;
                    float theta = atan(p.y, p.x);

                    // Radial falloff — dark disk with soft outer edge
                    float disk = smoothstep(1.0, 0.0, r);

                    // Spiral distortion — sample FBM in polar with rotating angle
                    float spiralOffset = u_time * 2.5 + r * 4.0;
                    vec2 swirlUv = vec2(cos(theta + spiralOffset), sin(theta + spiralOffset)) * r * 2.0;
                    float swirl = fbm(swirlUv + u_time * 0.8);

                    // Cracks / lightning-like streaks radiating from center
                    float cracks = pow(max(0.0, sin(theta * 6.0 + swirl * 4.0 - u_time * 2.0)), 16.0);
                    cracks *= smoothstep(0.1, 0.8, r) * smoothstep(1.0, 0.3, r);

                    // Flicker
                    float flicker = 0.85 + 0.15 * sin(u_time * 15.0 + swirl * 8.0);

                    vec3 coreDark   = vec3(0.0,  0.0, 0.03);
                    vec3 midPurple  = vec3(0.20, 0.02, 0.45);
                    vec3 edgeViolet = vec3(0.65, 0.15, 1.0);
                    vec3 crackColor = vec3(1.0, 0.3, 1.0);

                    vec3 color = mix(coreDark, midPurple, swirl * disk);
                    color = mix(color, edgeViolet, (1.0 - r) * disk * swirl * 0.6);
                    color += crackColor * cracks * flicker;

                    float alpha = disk * (0.55 + swirl * 0.45) + cracks * 0.8;
                    alpha *= u_alpha;

                    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        const size = cw * 5.0;
        const geometry = new THREE.PlaneGeometry(size, size);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 540;
        return mesh;
    }

    // === Slash blade: CURVED arc slash (scythe crescent sweep) ===
    // The sweep path follows a sine curve instead of a straight line — reads as a scythe-
    // cut crescent rather than a sword slice. A lingering TRAIL arc stays visible behind
    // the moving head, showing the full path the blade carved.
    private createSlashBlade(cw: number, ch: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            uniforms: {
                u_progress: { value: 0 },
                u_alpha: { value: 1 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_progress;
                uniform float u_alpha;

                #define PI 3.14159265

                void main() {
                    // NOTE: the scythe swing travels RIGHT → LEFT. To the VIEWER, that means
                    // u_progress animates from vUv.x=1 (right) to vUv.x=0 (left).
                    //
                    // Arc curve — CONVEX UP (∩ shape), matching the blade tip's arc when
                    // the scythe's pivot is FAR BELOW the card. Peak is centered at UV.y=0.5
                    // (= world y targetY = CARD CENTER), endpoints dip below.
                    float curveY = 0.28 + 0.22 * sin(vUv.x * PI);

                    float d = abs(vUv.y - curveY);

                    float core = smoothstep(0.018, 0.0, d);
                    float mid  = smoothstep(0.07, 0.0, d);
                    float glow = smoothstep(0.28, 0.0, d);

                    // Progress masks — sweep goes RIGHT → LEFT:
                    //   body  — full LINGERING trail from vUv.x=1 down to (1 - u_progress)
                    //   head  — bright leading edge at vUv.x = 1 - u_progress
                    float leadX = 1.0 - u_progress;
                    float head = smoothstep(leadX, leadX + 0.08, vUv.x)
                               * (1.0 - smoothstep(leadX + 0.08, leadX + 0.14, vUv.x));
                    float body = step(leadX, vUv.x);
                    // Taper near the right edge so the start isn't abrupt
                    float tailTaper = smoothstep(1.0, 0.85, vUv.x);
                    body *= tailTaper;

                    vec3 hotWhite = vec3(1.0, 0.95, 1.0);
                    vec3 violet   = vec3(0.85, 0.18, 1.0);
                    vec3 deep     = vec3(0.25, 0.02, 0.5);

                    vec3 color = mix(deep, violet, mid);
                    color = mix(color, hotWhite, core);

                    float alpha = core * (head * 1.8 + body * 1.0)
                                + mid  * (head * 1.0 + body * 0.65)
                                + glow * (head * 0.5 + body * 0.35);
                    alpha *= u_alpha;

                    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.5));
                }
            `,
        });
        // Span the arc across the scythe's full swing range (4.8cw horizontal, matching
        // the orbit diameter 2 * ORBIT_RADIUS_X = 4.8cw).
        const geometry = new THREE.PlaneGeometry(cw * 5.0, ch * 3.0);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 600;
        return mesh;
    }

    // === Dark shockwave ring ===
    private createShockwaveRing(cw: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            uniforms: { u_progress: { value: 0 } },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_progress;

                void main() {
                    vec2 p = vUv - 0.5;
                    float r = length(p) * 2.0;
                    float ring = smoothstep(u_progress - 0.05, u_progress, r)
                               * (1.0 - smoothstep(u_progress, u_progress + 0.08, r));
                    float alpha = ring * (1.0 - smoothstep(0.6, 1.0, u_progress)) * 0.9;
                    vec3 innerColor = vec3(0.7, 0.2, 1.0);
                    vec3 outerColor = vec3(0.15, 0.0, 0.3);
                    vec3 color = mix(innerColor, outerColor, u_progress);
                    gl_FragColor = vec4(color, alpha);
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(cw * 4.0, cw * 4.0);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 550;
        return mesh;
    }

    // === Two halves of the target card, split along a near-HORIZONTAL line ===
    // Matches the scythe's horizontal mow. Large slope (~100) makes the cut effectively
    // horizontal — upper half and lower half separate apart vertically.
    private createCutHalves(cardTexture: THREE.Texture, cw: number, ch: number): [THREE.Mesh, THREE.Mesh] {
        const makeHalf = (side: number): THREE.Mesh => {
            const material = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                uniforms: {
                    u_texture: { value: cardTexture },
                    u_side: { value: side },
                    u_progress: { value: 0 },
                    u_slope: { value: 100.0 },
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec2 vUv;
                    uniform sampler2D u_texture;
                    uniform float u_side;
                    uniform float u_progress;
                    uniform float u_slope;

                    void main() {
                        float cut = (vUv.x - 0.5) - (vUv.y - 0.5) * u_slope;
                        if (u_side > 0.0 && cut < 0.0) discard;
                        if (u_side < 0.0 && cut > 0.0) discard;

                        vec4 color = texture2D(u_texture, vUv);

                        float edgeDist = abs(cut);
                        float edgePulse = max(0.0, 1.0 - u_progress * 1.6);
                        float edgeGlow = smoothstep(0.09, 0.0, edgeDist) * edgePulse;
                        color.rgb = mix(color.rgb, vec3(0.7, 0.1, 1.0), edgeGlow);
                        // Hotter inner cut line
                        float hot = smoothstep(0.025, 0.0, edgeDist) * edgePulse;
                        color.rgb = mix(color.rgb, vec3(1.0, 0.9, 1.0), hot * 0.9);

                        // Darken as it falls away
                        color.rgb *= (1.0 - u_progress * 0.55);
                        color.a *= (1.0 - smoothstep(0.05, 1.0, u_progress));

                        gl_FragColor = color;
                    }
                `,
            });
            const geometry = new THREE.PlaneGeometry(cw, ch);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.renderOrder = 450;
            mesh.userData.side = side;
            return mesh;
        };
        return [makeHalf(+1), makeHalf(-1)];
    }

    private animateHalfApart(
        half: THREE.Mesh,
        cardWidth: number,
        cardHeight: number,
        durationMs: number,
    ): Promise<void> {
        const side = half.userData.side as number;
        // Horizontal cut → halves fly VERTICALLY apart. Side +1 (lower half) drifts DOWN,
        // side -1 (upper half) drifts UP, with slight horizontal drift in the slash direction.
        const dirX = 0.25 * side;
        const dirY = -1.0 * side;
        const startX = half.position.x;
        const startY = half.position.y;
        const startRot = half.rotation.z;
        const mat = half.material as THREE.ShaderMaterial;

        return new Promise<void>((resolve) => {
            const start = performance.now();
            const step = () => {
                const elapsed = performance.now() - start;
                const t = Math.min(1, elapsed / durationMs);
                const ease = 1 - Math.pow(1 - t, 3);
                const maxDist = Math.max(cardWidth, cardHeight) * 0.7;
                half.position.x = startX + dirX * maxDist * ease;
                half.position.y = startY + dirY * maxDist * ease;
                half.rotation.z = startRot + side * ease * 0.28;
                mat.uniforms.u_progress.value = ease;
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });
    }

    // Mythic-survived path — brief dark tint on all meshes of the target, auto-restore.
    private applyDarkFlash(group: THREE.Group): void {
        const affected: { mat: THREE.MeshBasicMaterial; orig: THREE.Color }[] = [];
        group.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material && !child.userData.__neonBorderLine) {
                const mat = child.material as THREE.MeshBasicMaterial;
                affected.push({ mat, orig: mat.color.clone() });
                mat.color.setRGB(0.35, 0.0, 0.6);
            }
        });
        setTimeout(() => {
            for (const { mat, orig } of affected) mat.color.copy(orig);
        }, 280);
    }

    // === Helpers ===
    private shake(group: THREE.Group, amplitude: number, durationMs: number): Promise<void> {
        const origX = group.position.x;
        const origY = group.position.y;
        return new Promise<void>((resolve) => {
            const start = performance.now();
            const step = () => {
                const elapsed = performance.now() - start;
                const t = elapsed / durationMs;
                if (t >= 1) {
                    group.position.x = origX;
                    group.position.y = origY;
                    resolve();
                    return;
                }
                const falloff = 1 - t;
                group.position.x = origX + (Math.random() - 0.5) * amplitude * falloff;
                group.position.y = origY + (Math.random() - 0.5) * amplitude * falloff;
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }

    private loadCardTexture(cardId: number): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(
                `resource/battle_field_unit/card/${cardId}.png`,
                (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.magFilter = THREE.LinearFilter;
                    tex.minFilter = THREE.LinearFilter;
                    tex.generateMipmaps = false;
                    resolve(tex);
                },
                undefined,
                reject,
            );
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((r) => setTimeout(r, ms));
    }

    private tweenUniform(
        uniform: { value: number },
        to: number,
        durationMs: number,
        easing: 'linear' | 'easeOutQuad' | 'easeOutCubic' | 'easeOutQuart' | 'easeInQuad' | 'easeInCubic' | 'easeInOutCubic',
    ): Promise<void> {
        const from = uniform.value;
        return this.tweenLoop(durationMs, easing, (v) => { uniform.value = from + (to - from) * v; });
    }

    private tweenLoop(
        durationMs: number,
        easing: 'linear' | 'easeOutQuad' | 'easeOutCubic' | 'easeOutQuart' | 'easeInQuad' | 'easeInCubic' | 'easeInOutCubic',
        apply: (easedT: number) => void,
    ): Promise<void> {
        const ease = (t: number): number => {
            switch (easing) {
                case 'easeOutQuad': return 1 - (1 - t) * (1 - t);
                case 'easeOutCubic': return 1 - Math.pow(1 - t, 3);
                case 'easeOutQuart': return 1 - Math.pow(1 - t, 4);
                case 'easeInQuad': return t * t;
                case 'easeInCubic': return t * t * t;
                case 'easeInOutCubic':
                    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                default: return t;
            }
        };
        return new Promise((resolve) => {
            const start = performance.now();
            const step = () => {
                const elapsed = performance.now() - start;
                const t = Math.min(1, elapsed / durationMs);
                apply(ease(t));
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });
    }

    private disposeMesh(mesh: THREE.Mesh): void {
        mesh.geometry.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else (mat as THREE.Material).dispose();
    }
}
