import * as THREE from "three";

// 레오닉의 부름 (Leonik's Summon) — "the Gate of Truth opens, the world quakes,
// cards pass through the forbidden door from the deck into the player's hand."
//
// Six phases. The first three sell the *forbidden* nature (heavy quake + ornate
// gate materialising + opening with blinding light + black tendrils); the next two
// deliver the actual cards through the gate; the last fades it all away.
//
//   1) QUAKE (~720 ms) — pitch-black ambient vignette fades in, ground-shaking
//      canvas shake, jagged dark cracks branch across the entire screen.
//   2) GATE APPEAR (~520 ms) — two-halved ornate stone gate materialises at centre,
//      with a deep-purple seal pattern carved into its face. It glows ominously.
//   3) GATE OPEN (~840 ms) — the two halves slide outward (door-swing fake), and
//      a PITCH-BLACK ABYSS is exposed behind (this is an undead/death deck — the
//      gate exhales darkness, not light). Shadow tendrils reach out from the void
//      and curl outward. Canvas shake peaks.
//   4) SUMMON (~per-card 720 ms) — for each card to summon: a DARK card-shaped
//      placeholder (pitch-black body, bright violet pulsing rim halo) bursts out
//      of the gate centre, flies in an arc to the hand destination, and on
//      arrival fires onArrive(idx) so the pilot can do the actual appendCard.
//   5) GATE CLOSE (~640 ms) — tendrils retract; gate halves slide back together;
//      void dims; the seal closes.
//   6) SETTLE (~360 ms) — vignette fades, canvas shake decays to zero, everything
//      disposes.
export class LeonikSummonEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        gateCenter: THREE.Vector3,
        handDestinations: readonly THREE.Vector3[],
        canvasElement: HTMLElement,
        onArrive: (idx: number) => void,
    ): Promise<void> {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Save canvas inline transform so SETTLE can restore it.
        const origTransform = canvasElement.style.transform;

        // Canvas shake amplitude — mutated between phases, read every RAF.
        const shakeAmp = { value: 0 };
        const stopShake = this.startElementShake(canvasElement, shakeAmp);

        // ─── VIGNETTE (full-viewport dark overlay) ───────────────────────────────
        const vignette = this.createVignetteMesh(vw, vh);
        vignette.position.set(0, 0, 4);
        vignette.renderOrder = 580;
        this.scene.add(vignette);
        const vignetteMat = vignette.material as THREE.ShaderMaterial;

        // Shared clock loop driving every shader's u_time uniform — cheaper than
        // one RAF per shader, and keeps every phase in lockstep.
        const clockStart = performance.now();
        let clockRunning = true;
        const tickClocks = new Set<THREE.ShaderMaterial>([vignetteMat]);
        const runClock = () => {
            if (!clockRunning) return;
            const t = (performance.now() - clockStart) / 1000;
            tickClocks.forEach((mat) => { mat.uniforms.u_time.value = t; });
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // ── PHASE 1: QUAKE ──────────────────────────────────────────────────────
        shakeAmp.value = 6.0;
        void this.tween(vignetteMat.uniforms.u_alpha, 1.0, 380, 'easeOutQuad');
        // Spawn screen-wide dark cracks branching outward — 6 jagged lightning lines
        // at random angles, lasting through QUAKE + GATE APPEAR.
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            this.spawnScreenCrack(gateCenter, angle, Math.max(vw, vh) * 0.9, 1100);
        }
        await this.delay(380);
        shakeAmp.value = 9.0;
        await this.delay(340);

        // ── PHASE 2: GATE APPEAR ────────────────────────────────────────────────
        const gateW = Math.min(vw, vh) * 0.42;     // gate width ≈ 42% of smaller axis
        const gateH = gateW * 1.6;                  // tall doors
        const halfW = gateW / 2;

        // Two doors. Each is a plane the WIDTH OF A FULL DOOR HALF, anchored visually
        // along the centreline. Their UV is split — left door's right edge is the
        // gate's centreline, right door's left edge is the gate's centreline.
        const leftDoor  = this.createGateHalfMesh(halfW, gateH, 'left');
        const rightDoor = this.createGateHalfMesh(halfW, gateH, 'right');
        // Centre of each half is at ±halfW/2 from gateCenter (half occupies [centre-halfW, centre]).
        leftDoor.position.set(gateCenter.x - halfW / 2, gateCenter.y, gateCenter.z + 0.5);
        rightDoor.position.set(gateCenter.x + halfW / 2, gateCenter.y, gateCenter.z + 0.5);
        leftDoor.renderOrder = 590;
        rightDoor.renderOrder = 590;
        this.scene.add(leftDoor);
        this.scene.add(rightDoor);
        const leftDoorMat  = leftDoor.material  as THREE.ShaderMaterial;
        const rightDoorMat = rightDoor.material as THREE.ShaderMaterial;
        tickClocks.add(leftDoorMat);
        tickClocks.add(rightDoorMat);

        // Dark void mesh BEHIND the gate — pitch-black abyss revealed as doors part.
        // Initially covered by closed doors; as they slide outward, this becomes visible.
        const voidMesh = this.createDarkVoidMesh(gateW * 1.05, gateH * 1.05);
        voidMesh.position.set(gateCenter.x, gateCenter.y, gateCenter.z + 0.4);
        voidMesh.renderOrder = 585;
        this.scene.add(voidMesh);
        const voidMat = voidMesh.material as THREE.ShaderMaterial;
        tickClocks.add(voidMat);

        // Doors materialise from invisible to opaque.
        await Promise.all([
            this.tween(leftDoorMat.uniforms.u_alpha, 1.0, 460, 'easeOutQuad'),
            this.tween(rightDoorMat.uniforms.u_alpha, 1.0, 460, 'easeOutQuad'),
        ]);

        shakeAmp.value = 12.0;

        // ── PHASE 3: GATE OPEN ──────────────────────────────────────────────────
        // White void brightens behind doors.
        void this.tween(voidMat.uniforms.u_alpha, 1.0, 360, 'easeOutQuad');
        // Doors slide outward — left to (centre - halfW), right to (centre + halfW).
        // (Inner edge of each door reaches the outer extent of the gate.)
        const slideOut = halfW * 0.95;
        await Promise.all([
            this.tweenPosX(leftDoor,  gateCenter.x - halfW / 2 - slideOut, 760, 'easeOutQuad'),
            this.tweenPosX(rightDoor, gateCenter.x + halfW / 2 + slideOut, 760, 'easeOutQuad'),
        ]);

        // Shadow tendrils emerge from the open void — 8 curling dark wisps reaching
        // outward at various angles. They linger through SUMMON.
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            this.spawnTendril(gateCenter, angle, gateW * 0.65, 1400, tickClocks);
        }

        await this.delay(80);

        // ── PHASE 4: SUMMON ─────────────────────────────────────────────────────
        // For each card destination, spawn a placeholder card mesh at the gate, fly
        // it in an arc to the destination, and fire onArrive on landing.
        const summonPromises: Promise<void>[] = [];
        for (let i = 0; i < handDestinations.length; i++) {
            // Stagger so the cards don't all arrive at the same instant.
            if (i > 0) await this.delay(220);
            summonPromises.push(this.flySummonedCard(
                gateCenter, handDestinations[i], 720, () => onArrive(i), tickClocks,
            ));
        }
        await Promise.all(summonPromises);

        shakeAmp.value = 8.0;

        // ── PHASE 5: GATE CLOSE ─────────────────────────────────────────────────
        // Doors slide back to centre. Void fades. Final flash via the void brightening
        // briefly before dimming to 0.
        await this.delay(120);
        await Promise.all([
            this.tweenPosX(leftDoor,  gateCenter.x - halfW / 2, 540, 'easeInOutQuad'),
            this.tweenPosX(rightDoor, gateCenter.x + halfW / 2, 540, 'easeInOutQuad'),
            this.tween(voidMat.uniforms.u_alpha, 0.0, 540, 'easeInQuad'),
        ]);

        // ── PHASE 6: SETTLE ─────────────────────────────────────────────────────
        // Decay shake, fade vignette + doors.
        const settleStart = performance.now();
        const SETTLE_MS = 360;
        const settleStep = () => {
            const t = Math.min(1, (performance.now() - settleStart) / SETTLE_MS);
            shakeAmp.value = 8.0 * (1 - t);
            if (t < 1) requestAnimationFrame(settleStep);
        };
        requestAnimationFrame(settleStep);

        await Promise.all([
            this.tween(vignetteMat.uniforms.u_alpha,  0.0, 360, 'easeInQuad'),
            this.tween(leftDoorMat.uniforms.u_alpha,  0.0, 360, 'easeInQuad'),
            this.tween(rightDoorMat.uniforms.u_alpha, 0.0, 360, 'easeInQuad'),
        ]);

        stopShake();
        canvasElement.style.transform = origTransform;

        clockRunning = false;
        this.scene.remove(vignette);   this.disposeMesh(vignette);
        this.scene.remove(leftDoor);   this.disposeMesh(leftDoor);
        this.scene.remove(rightDoor);  this.disposeMesh(rightDoor);
        this.scene.remove(voidMesh);   this.disposeMesh(voidMesh);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Per-card summon flight
    // ═══════════════════════════════════════════════════════════════════════════════
    private async flySummonedCard(
        gatePos: THREE.Vector3,
        destPos: THREE.Vector3,
        durationMs: number,
        onArrive: () => void,
        tickClocks: Set<THREE.ShaderMaterial>,
    ): Promise<void> {
        // Bezier with control point pushed perpendicular for an arc — same recipe used
        // in MoraleConvert / OverflowMorale.
        const midX = (gatePos.x + destPos.x) / 2;
        const midY = (gatePos.y + destPos.y) / 2;
        const dx = destPos.x - gatePos.x;
        const dy = destPos.y - gatePos.y;
        const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const perpX = -dy / dist;
        const perpY =  dx / dist;
        const lift = dist * 0.18 * (perpY >= 0 ? 1 : -1);
        const curve = new THREE.QuadraticBezierCurve3(
            gatePos,
            new THREE.Vector3(midX + perpX * lift, midY + perpY * lift, gatePos.z),
            destPos,
        );

        // Card-shaped placeholder mesh — bright white-violet glow shader. Real card
        // gets appended by onArrive; the placeholder fades out a moment later.
        const card = this.createSummonedCardMesh(110, 176);
        card.position.copy(gatePos);
        card.renderOrder = 595;
        card.scale.set(0.001, 0.001, 1);
        this.scene.add(card);
        const mat = card.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        // Burst out of the gate (rapid scale-up).
        await this.tweenScale(card, 1.0, 180, 'easeOutQuad');

        // Fly along bezier.
        const startMs = performance.now();
        await new Promise<void>((resolve) => {
            const step = () => {
                const t = Math.min(1, (performance.now() - startMs) / durationMs);
                // easeInOutQuad — slow accelerate, decelerate into hand.
                const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                const p = curve.getPoint(e);
                card.position.set(p.x, p.y, p.z);
                mat.uniforms.u_progress.value = e;
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        // Real card append happens HERE — on arrival, in sync with the placeholder
        // landing. Placeholder fades shortly after so the real card replaces it
        // visually without an obvious swap.
        onArrive();

        await this.tween(mat.uniforms.u_alpha, 0.0, 220, 'easeInQuad');
        tickClocks.delete(mat);
        this.scene.remove(card);
        this.disposeMesh(card);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // One-shot spawners
    // ═══════════════════════════════════════════════════════════════════════════════
    private spawnScreenCrack(
        origin: THREE.Vector3,
        angle: number,
        length: number,
        durationMs: number,
    ): void {
        const THICKNESS = length * 0.05;
        const crack = this.createCrackMesh(length, THICKNESS);
        crack.position.set(
            origin.x + Math.cos(angle) * length * 0.5,
            origin.y + Math.sin(angle) * length * 0.5,
            origin.z + 0.1,
        );
        crack.rotation.z = angle;
        crack.renderOrder = 583;
        this.scene.add(crack);
        const mat = crack.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            mat.uniforms.u_alpha.value = t < 0.10 ? t / 0.10 : Math.pow(1 - (t - 0.10) / 0.90, 1.6);
            mat.uniforms.u_time.value = (performance.now() - startMs) / 1000;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                this.scene.remove(crack);
                this.disposeMesh(crack);
            }
        };
        requestAnimationFrame(step);
    }

    private spawnTendril(
        origin: THREE.Vector3,
        angle: number,
        length: number,
        durationMs: number,
        tickClocks: Set<THREE.ShaderMaterial>,
    ): void {
        const THICKNESS = length * 0.20;
        const tendril = this.createTendrilMesh(length, THICKNESS);
        tendril.position.set(
            origin.x + Math.cos(angle) * length * 0.5,
            origin.y + Math.sin(angle) * length * 0.5,
            origin.z + 0.45,
        );
        tendril.rotation.z = angle;
        tendril.renderOrder = 588;
        this.scene.add(tendril);
        const mat = tendril.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            mat.uniforms.u_alpha.value = t < 0.18 ? t / 0.18 : Math.pow(1 - (t - 0.18) / 0.82, 1.4);
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                tickClocks.delete(mat);
                this.scene.remove(tendril);
                this.disposeMesh(tendril);
            }
        };
        requestAnimationFrame(step);
    }

    // Element shake with dynamic amplitude; ampRef.value mutated by phase transitions.
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

    // Vignette — pitch-black with violet-tinted edges, drifting noise.
    private createVignetteMesh(vw: number, vh: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
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
                    float edge = smoothstep(0.30, 1.30, r);
                    float noise = vnoise(v_uv * 2.5 + vec2(u_time * 0.5, -u_time * 0.4));
                    float darkness = (0.55 + edge * 0.40) * (0.85 + noise * 0.20);

                    vec3 base = vec3(0.02, 0.00, 0.05);
                    gl_FragColor = vec4(base, clamp(darkness * u_alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(vw, vh), material);
    }

    // Gate half — ornate stone door with carved seal pattern. UV.x runs across the
    // half-door (0 at outer edge, 1 at the gate centreline for left half; reversed
    // for right). Pattern features: vertical stone slats, a central recessed
    // sephirot-like seal pattern, deep purple highlights on raised carvings.
    private createGateHalfMesh(width: number, height: number, side: 'left' | 'right'): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:    { value: 0 },
                u_alpha:   { value: 0 },
                u_isRight: { value: side === 'right' ? 1.0 : 0.0 },
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
                uniform float u_isRight;
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
                    for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
                    return v;
                }

                void main() {
                    // Flip UV for the right door so the carved seal mirrors correctly.
                    vec2 uv = v_uv;
                    if (u_isRight > 0.5) uv.x = 1.0 - uv.x;

                    // Stone base — dark, textured.
                    float stone = fbm(uv * 6.0);
                    vec3 stoneCol = mix(vec3(0.10, 0.08, 0.12), vec3(0.18, 0.14, 0.22), stone);

                    // Vertical slats — repeating dark grooves giving the "stone door" feel.
                    float slat = abs(sin(uv.x * 24.0));
                    slat = smoothstep(0.85, 1.0, slat);
                    stoneCol *= mix(1.0, 0.55, slat);

                    // Outer frame — darker rim around the door's edges.
                    float rimX = smoothstep(0.04, 0.0, uv.x) + smoothstep(0.04, 0.0, 1.0 - uv.x);
                    float rimY = smoothstep(0.04, 0.0, uv.y) + smoothstep(0.04, 0.0, 1.0 - uv.y);
                    float rim = clamp(rimX + rimY, 0.0, 1.0);
                    stoneCol *= mix(1.0, 0.40, rim);

                    // Central sephirot seal — concentric circles + radial spokes near the
                    // INNER edge of each half (uv.x near 1.0 in the flipped frame).
                    vec2 sealC = vec2(0.85, 0.5);  // seal centre near inner edge
                    vec2 sd = uv - sealC;
                    sd.x *= 1.4;  // squish horizontally so the seal feels embedded into the door's centreline
                    float sealR = length(sd);

                    // Multiple concentric rings.
                    float ring1 = smoothstep(0.012, 0.0, abs(sealR - 0.16));
                    float ring2 = smoothstep(0.010, 0.0, abs(sealR - 0.11));
                    float ring3 = smoothstep(0.008, 0.0, abs(sealR - 0.06));
                    float rings = max(ring1, max(ring2, ring3));

                    // 12 radial spokes inside the outer ring, gated to the disc.
                    float ang = atan(sd.y, sd.x);
                    float spokes = abs(sin(ang * 6.0));
                    spokes = smoothstep(0.92, 1.0, spokes);
                    float spokeMask = step(sealR, 0.16) * step(0.045, sealR);
                    float spokeGlow = spokes * spokeMask;

                    float sealMask = max(rings, spokeGlow);

                    // Slow-pulsing violet glow on seal.
                    float sealPulse = 0.7 + 0.3 * sin(u_time * 1.6);
                    vec3 sealCol = vec3(0.55, 0.20, 0.75) * sealPulse;
                    vec3 col = mix(stoneCol, sealCol, sealMask * 0.95);

                    // Outer hot rim near the gate centreline (where doors meet) — the
                    // closed seal radiates a hairline of forbidden purple light.
                    float hotEdge = smoothstep(0.99, 1.0, uv.x);
                    col = mix(col, vec3(0.85, 0.55, 1.00), hotEdge * sealPulse);

                    gl_FragColor = vec4(col, clamp(u_alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    }

    // Dark void — PITCH-BLACK abyss pouring out from behind the gate. The deck is
    // an undead/death deck, so the gate of life-and-death exhales darkness, not
    // light. NormalBlending so the dark colour actually overpowers what's behind
    // (additive would mean black contributes nothing). Visual reads:
    //   - Pitch-black core, near-opaque
    //   - 14 slow-rotating dark "streamers" — slightly less-black than the core,
    //     creating a swirling-abyss read inside the void rather than a flat plate
    //   - Dark-crimson menace at the deepest centre — a hint of forbidden blood
    //   - Violet rim where the void meets the gate stone, sealing the threshold
    private createDarkVoidMesh(width: number, height: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
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

                    // Solid disc envelope — nearly opaque inside, soft falloff at the rim.
                    float disc = smoothstep(1.05, 0.55, r);

                    // 14 slow-rotating streamers — modulate brightness so SOMETHING moves
                    // inside the abyss without breaking the pitch-black read.
                    float streamers = 0.5 + 0.5 * cos(ang * 14.0 + u_time * 0.9);
                    streamers = pow(streamers, 4.0);
                    float streamerFalloff = smoothstep(1.05, 0.05, r);
                    float streamerLighten = streamers * streamerFalloff * 0.10;

                    // Dark-crimson menace at the deepest centre.
                    float crimsonCore = smoothstep(0.30, 0.0, r) * 0.55;

                    // Violet seal-rim where void meets gate stone.
                    float rim = smoothstep(0.55, 0.95, r) * (1.0 - smoothstep(1.00, 1.10, r));

                    vec3 abyss   = vec3(0.005, 0.000, 0.018);  // ink-black with indigo bias
                    vec3 crimson = vec3(0.34, 0.03, 0.12);
                    vec3 violet  = vec3(0.32, 0.12, 0.50);

                    vec3 col = abyss;
                    col = mix(col, crimson, crimsonCore);
                    col += vec3(streamerLighten * 1.4);   // subtle lift on streamers
                    col = mix(col, violet, rim * 0.65);

                    float alpha = clamp(disc * u_alpha, 0.0, 1.0);
                    gl_FragColor = vec4(col, alpha);
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    }

    // Crack — jagged dark fissure radiating from the gate during QUAKE. Extends
    // outward over u_progress; FBM jitter makes the centreline irregular.
    private createCrackMesh(length: number, thickness: number): THREE.Mesh {
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
                    float along = v_uv.x;
                    float across = v_uv.y - 0.5;
                    float reach = u_progress;

                    float jitter = (vnoise(vec2(along * 22.0, u_time * 2.0)) - 0.5) * 0.30;
                    float seam = abs(across + jitter);

                    float core = smoothstep(0.06, 0.0, seam);
                    float glow = smoothstep(0.40, 0.0, seam) * 0.4;
                    float lengthMask = smoothstep(reach + 0.05, reach - 0.02, along) *
                                       smoothstep(0.0, 0.06, along);

                    float intensity = (core + glow) * lengthMask;
                    vec3 abyss  = vec3(0.02, 0.00, 0.06);
                    vec3 violet = vec3(0.45, 0.18, 0.65);
                    vec3 col = mix(abyss, violet, glow);

                    gl_FragColor = vec4(col, clamp(intensity * u_alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(length, thickness), material);
    }

    // Tendril — curling shadow wisp emerging from the void. UV.x along, FBM noise
    // bends the path into a curl. Dark indigo body with subtle violet edges.
    private createTendrilMesh(length: number, thickness: number): THREE.Mesh {
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
                    float along = v_uv.x;
                    float across = v_uv.y - 0.5;
                    float reach = u_progress;

                    // Curl — wave the centreline using a low-freq sine + noise.
                    float curl = 0.30 * sin(along * 5.0 + u_time * 1.2) +
                                 (vnoise(vec2(along * 6.0, u_time * 0.6)) - 0.5) * 0.40;

                    float seam = abs(across - curl);
                    float core = smoothstep(0.10, 0.0, seam);
                    float glow = smoothstep(0.36, 0.0, seam) * 0.55;

                    float lengthMask = smoothstep(reach + 0.10, reach - 0.04, along) *
                                       smoothstep(0.0, 0.03, along);

                    float intensity = (core + glow) * lengthMask;
                    vec3 abyss  = vec3(0.01, 0.00, 0.04);
                    vec3 indigo = vec3(0.18, 0.10, 0.34);
                    vec3 violet = vec3(0.45, 0.20, 0.60);
                    vec3 col = mix(abyss, indigo, glow);
                    col = mix(col, violet, core * 0.4);

                    gl_FragColor = vec4(col, clamp(intensity * u_alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(length, thickness), material);
    }

    // Summoned-card placeholder — a card-shaped DARK silhouette with a bright violet
    // edge halo for visibility. The undead summon is born from the abyss, so the
    // body itself is pitch-black with a subtle inner crimson; the rim glow is the
    // only emissive part, ensuring the card stays readable against the dark void
    // and the dimmed scene. NormalBlending for the body, but the rim is bright
    // enough that it reads against any background.
    private createSummonedCardMesh(width: number, height: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:     { value: 0 },
                u_alpha:    { value: 1 },
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

                void main() {
                    // Card-shaped silhouette — soft rounded rectangle SDF.
                    vec2 c = v_uv - 0.5;
                    vec2 ac = abs(c);
                    float bx = max(ac.x - 0.40, 0.0);
                    float by = max(ac.y - 0.45, 0.0);
                    float dist = length(vec2(bx, by));
                    float shape = smoothstep(0.06, 0.0, dist);

                    // Inner core — subtle crimson smear so the body has hue, not flat black.
                    float core = smoothstep(0.40, 0.0, length(c));
                    core = pow(core, 1.4);

                    // Edge ring — distance from the card's outer silhouette. We want a
                    // bright violet halo right at the boundary that fades quickly inward;
                    // this is the only part that reads against a dark background.
                    float edge = smoothstep(0.045, 0.0, dist) - smoothstep(0.020, 0.0, dist);

                    // Pulse at ~3 Hz so the rim throbs as the card flies — adds life
                    // and ties to the seal pulse on the gate.
                    float pulse = 0.75 + 0.25 * sin(u_time * 6.0);

                    vec3 abyss   = vec3(0.02, 0.00, 0.06);
                    vec3 crimson = vec3(0.28, 0.04, 0.12);
                    vec3 violet  = vec3(0.55, 0.25, 0.85);
                    vec3 violetHi = vec3(0.78, 0.42, 1.00);

                    // Body: abyss with subtle crimson centre.
                    vec3 body = mix(abyss, crimson, core * 0.8);
                    // Rim: bright violet glow, pulsing.
                    vec3 rim  = mix(violet, violetHi, pulse) * pulse;

                    // Combine — rim adds emissive contribution on top of dark body.
                    vec3 col = body + rim * edge * 1.4;

                    // Final alpha = card silhouette + extra rim opacity so the halo
                    // pokes slightly outside the body geometry.
                    float alpha = clamp((shape + edge * 0.8) * u_alpha, 0.0, 1.0);
                    gl_FragColor = vec4(col, alpha);
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Utilities
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
        mesh: THREE.Mesh,
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

    private tweenPosX(
        mesh: THREE.Mesh,
        targetX: number,
        duration: number,
        easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad',
    ): Promise<void> {
        return new Promise((resolve) => {
            const start = performance.now();
            const fromX = mesh.position.x;
            const step = () => {
                const t = Math.min(1, (performance.now() - start) / duration);
                let v: number;
                switch (easing) {
                    case 'easeInQuad':    v = t * t; break;
                    case 'easeOutQuad':   v = 1 - (1 - t) * (1 - t); break;
                    case 'easeInOutQuad': v = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; break;
                    default:              v = t;
                }
                mesh.position.x = fromX + (targetX - fromX) * v;
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
