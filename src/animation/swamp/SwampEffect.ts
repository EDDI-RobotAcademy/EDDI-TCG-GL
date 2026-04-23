import * as THREE from "three";

// 망자의 늪 (Swamp of the Dead) — draw-3 visual.
//
// Five layered phases:
//   1) SWAMP forms on Your field: green/purple FBM bubbling pool.          (~400 ms)
//   2) WRAITHS rise from the pool — translucent smoky figures with glowing
//      eyes, one per drawn card.                                            (~600 ms)
//   3) SPECTRAL CARDS materialise above each wraith (ectoplasm-outlined
//      card rectangles that solidify).                                      (~500 ms)
//   4) Each spectral card FLIES along a bezier arc to the hand. On arrival
//      onCardArrive(cardId, index) fires so the caller can append the real
//      card to the hand. Motes are staggered ~150 ms apart.                (~800 ms + stagger)
//   5) Wraiths sink, swamp dissipates.                                      (~400 ms)
//
// All meshes scene-local and disposed on completion. Wraith count scales with drawn
// count — if the deck ran dry at 2 cards, only 2 wraiths spawn.
export class SwampEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        fieldCenter: THREE.Vector3,
        fieldWidth: number,
        fieldHeight: number,
        deckPos: THREE.Vector3,
        handDestination: THREE.Vector3,
        cardIds: readonly number[],
        onCardArrive: (cardId: number, index: number) => void,
    ): Promise<void> {
        if (cardIds.length === 0) return;

        // ─── Swamp pool ───────────────────────────────────────────────────────────
        // Slightly oversized vs. the field so the rim bleeds past the field edges.
        const poolW = fieldWidth * 1.05;
        const poolH = fieldHeight * 1.15;
        const pool = this.createSwampMesh(poolW, poolH);
        pool.position.copy(fieldCenter);
        pool.renderOrder = 480;
        this.scene.add(pool);
        const poolMat = pool.material as THREE.ShaderMaterial;

        // Shared clock drives all shader u_time uniforms.
        const clockStart = performance.now();
        let clockRunning = true;
        const extraClockTargets: THREE.ShaderMaterial[] = [];
        const runClock = () => {
            if (!clockRunning) return;
            const t = (performance.now() - clockStart) / 1000;
            poolMat.uniforms.u_time.value = t;
            for (const mat of extraClockTargets) mat.uniforms.u_time.value = t;
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // Phase 1 — pool rises in.
        await this.tween(poolMat.uniforms.u_alpha, 1.0, 400, 'easeOutQuad');

        // ─── Single wraith + gaze beam + N spectral cards ────────────────────────
        // One pair of fierce eyes rises in the centre of the swamp, regardless of how many
        // cards are being drawn. A single beam links those eyes to the deck; the N spectral
        // cards all spawn AT THE DECK (with small perp offsets so they stack visibly).
        const count = cardIds.length;

        const wraithW = fieldWidth * 0.32;
        const wraithH = wraithW * 0.7;
        const wraithX = fieldCenter.x;
        const wraithY = fieldCenter.y;

        const wraith = this.createWraithMesh(wraithW, wraithH);
        wraith.position.set(wraithX, wraithY - wraithH * 0.30, fieldCenter.z + 0.5);
        wraith.renderOrder = 490;
        this.scene.add(wraith);
        const wraithMat = wraith.material as THREE.ShaderMaterial;
        extraClockTargets.push(wraithMat);

        // Eye world y when wraith is FULLY risen (plane centred at wraithY; eye UV y=0.75).
        const eyeY = wraithY + (0.75 - 0.5) * wraithH;
        const eyeStart = new THREE.Vector3(wraithX, eyeY, fieldCenter.z + 0.6);
        const beam = this.createGazeBeamMesh(eyeStart, deckPos);
        beam.renderOrder = 495;
        this.scene.add(beam);
        const beamMat = beam.material as THREE.ShaderMaterial;
        extraClockTargets.push(beamMat);

        // Per-card perp offset so stacked cards at the deck read as a small fan.
        const cardW = wraithW * 0.42;
        const cardH = cardW * 1.55;
        const dx = handDestination.x - deckPos.x;
        const dy = handDestination.y - deckPos.y;
        const perpLen = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const perpUX = -dy / perpLen;
        const perpUY =  dx / perpLen;
        const cardSpreadStep = cardW * 0.35;

        interface SpectralCard {
            card: THREE.Mesh;
            cardMat: THREE.ShaderMaterial;
        }
        const cards: SpectralCard[] = [];
        for (let i = 0; i < count; i++) {
            const offsetIndex = i - (count - 1) / 2;
            const spawnCardX = deckPos.x + perpUX * cardSpreadStep * offsetIndex;
            const spawnCardY = deckPos.y + perpUY * cardSpreadStep * offsetIndex;
            const card = this.createSpectralCardMesh(cardW, cardH);
            card.position.set(spawnCardX, spawnCardY, fieldCenter.z + 0.7);
            card.renderOrder = 500;
            this.scene.add(card);
            const cardMat = card.material as THREE.ShaderMaterial;
            extraClockTargets.push(cardMat);
            cards.push({ card, cardMat });
        }

        // Phase 2 — wraith rises + glow, gaze beam materialises pointing at the deck.
        await Promise.all([
            this.tween(wraithMat.uniforms.u_alpha, 1.0, 600, 'easeOutQuad'),
            this.tweenPositionY(wraith, wraithY - wraithH * 0.30, wraithY, 600, 'easeOutQuad'),
            this.tween(beamMat.uniforms.u_alpha, 1.0, 600, 'easeOutQuad'),
        ]);

        // Phase 3 — spectral cards solidify AT THE DECK.
        await Promise.all(
            cards.map((c) => this.tween(c.cardMat.uniforms.u_alpha, 1.0, 500, 'easeOutQuad')),
        );

        // ─── Phase 4 — cards fly to hand. Beam fades gradually as they release. ─────
        // Total flight window ≈ (count-1)·stagger + flight. Fade the single beam over
        // that whole window so it's gone by the time the last card arrives.
        const stagger = 150;
        const flightMs = 800;
        const totalWindowMs = Math.max(flightMs, (count - 1) * stagger + flightMs);
        void this.tween(beamMat.uniforms.u_alpha, 0.0, totalWindowMs, 'easeInQuad');

        const flightPromises: Promise<void>[] = [];
        for (let i = 0; i < cards.length; i++) {
            if (i > 0) await this.delay(stagger);
            flightPromises.push(
                this.flyCardToHand(
                    cards[i].card,
                    cards[i].cardMat,
                    cards[i].card.position.clone(),
                    handDestination,
                    flightMs,
                    () => onCardArrive(cardIds[i], i),
                ),
            );
        }
        await Promise.all(flightPromises);

        // ─── Phase 5 — eyes sink, pool evaporates ────────────────────────────────
        await Promise.all([
            this.tween(wraithMat.uniforms.u_alpha, 0.0, 380, 'easeInQuad'),
            this.tweenPositionY(wraith, wraith.position.y, wraithY - wraithH * 0.30, 380, 'easeInQuad'),
            this.tween(poolMat.uniforms.u_alpha, 0.0, 400, 'easeInQuad'),
        ]);

        clockRunning = false;
        this.scene.remove(wraith);
        this.scene.remove(beam);
        for (const c of cards) this.scene.remove(c.card);
        this.scene.remove(pool);
        this.disposeMesh(wraith);
        this.disposeMesh(beam);
        for (const c of cards) this.disposeMesh(c.card);
        this.disposeMesh(pool);
    }

    // Fly a spectral card from its hover position to the hand destination. Resolves once
    // the arrival flash + fade complete. onArrive fires when the card reaches the hand.
    private async flyCardToHand(
        card: THREE.Mesh,
        mat: THREE.ShaderMaterial,
        startPos: THREE.Vector3,
        destPos: THREE.Vector3,
        durationMs: number,
        onArrive: () => void,
    ): Promise<void> {
        // Bezier control — midpoint pushed perpendicular + random jitter so paths differ.
        const midX = (startPos.x + destPos.x) / 2;
        const midY = (startPos.y + destPos.y) / 2;
        const dx = destPos.x - startPos.x;
        const dy = destPos.y - startPos.y;
        const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const perpX = -dy / dist;
        const perpY =  dx / dist;
        const lift = dist * 0.14 + (Math.random() - 0.5) * dist * 0.08;
        const ctrlX = midX + perpX * lift;
        const ctrlY = midY + perpY * lift;
        const curve = new THREE.QuadraticBezierCurve3(
            startPos,
            new THREE.Vector3(ctrlX, ctrlY, startPos.z),
            destPos,
        );

        const startMs = performance.now();
        await new Promise<void>((resolve) => {
            const step = () => {
                const t = Math.min(1, (performance.now() - startMs) / durationMs);
                const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                const p = curve.getPoint(e);
                card.position.set(p.x, p.y, p.z);
                mat.uniforms.u_progress.value = e;
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        onArrive();
        await this.tween(mat.uniforms.u_arrival, 1.0, 140, 'easeOutQuad');
        await this.tween(mat.uniforms.u_alpha, 0.0, 220, 'easeInQuad');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Swamp — bubbling necrotic pool on Your field area.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createSwampMesh(planeW: number, planeH: number): THREE.Mesh {
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
                float fbm(vec2 p) {
                    float v = 0.0; float a = 0.5;
                    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
                    return v;
                }

                void main() {
                    // Flowing surface noise — slow horizontal drift + slight vertical bob.
                    float n1 = fbm(vec2(v_uv.x * 4.0 + u_time * 0.4, v_uv.y * 3.0 - u_time * 0.2));
                    float n2 = fbm(vec2(v_uv.x * 8.0 - u_time * 0.3, v_uv.y * 6.0 + u_time * 0.25));
                    float surface = n1 * 0.7 + n2 * 0.3;

                    // Elliptical radial falloff — darker toward the pool edge so the pool
                    // reads as a contained shape, not a square.
                    vec2 c = v_uv - 0.5;
                    float r = length(c * vec2(2.0, 1.8));
                    float radial = 1.0 - smoothstep(0.55, 1.0, r);

                    // Bubble highlights — bright pinpoints at noise-driven positions.
                    float bubble = smoothstep(0.78, 0.9, surface) * smoothstep(0.85, 0.95,
                        fbm(vec2(v_uv.x * 14.0 + u_time * 0.9, v_uv.y * 14.0 - u_time * 0.7)));

                    // Palette — deep necrotic green body, dark violet shadows, sickly bubble glow.
                    vec3 deep    = vec3(0.02, 0.08, 0.03);
                    vec3 green   = vec3(0.10, 0.35, 0.14);
                    vec3 violet  = vec3(0.22, 0.04, 0.32);
                    vec3 bubbleC = vec3(0.50, 0.95, 0.35);

                    vec3 col = mix(deep, green, smoothstep(0.25, 0.65, surface));
                    col = mix(col, violet, smoothstep(0.55, 0.85, surface) * 0.6);
                    col = mix(col, bubbleC, bubble);

                    float body = smoothstep(0.18, 0.55, surface) * radial;
                    float a = clamp(body + bubble * radial * 0.5, 0.0, 1.0) * u_alpha;
                    gl_FragColor = vec4(col, a);
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // "Wraith" — no body, only fierce SHARP eyes peering out through the fog.
    // Two elongated almond slits glow intensely, surrounded by a soft ambient haze that
    // bleeds into the swamp pool below. Eyes breathe + occasional sharp glint for menace.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createWraithMesh(planeW: number, planeH: number): THREE.Mesh {
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
                    // Two fierce eye slits — horizontal elongated ovals near top of plane.
                    vec2 eyeL = vec2(0.42, 0.75);
                    vec2 eyeR = vec2(0.58, 0.75);
                    vec2 dL = v_uv - eyeL;
                    vec2 dR = v_uv - eyeR;

                    // Bright CORE slit — almond-shaped (5:1 horizontal:vertical).
                    // Implemented as an elongated ellipse; tight smoothstep edge so the
                    // slit reads as sharp, not a soft blob.
                    float rxCore = 0.042;
                    float ryCore = 0.008;
                    float coreNormL = (dL.x * dL.x) / (rxCore * rxCore)
                                    + (dL.y * dL.y) / (ryCore * ryCore);
                    float coreNormR = (dR.x * dR.x) / (rxCore * rxCore)
                                    + (dR.y * dR.y) / (ryCore * ryCore);
                    float coreL = 1.0 - smoothstep(0.55, 1.0, coreNormL);
                    float coreR = 1.0 - smoothstep(0.55, 1.0, coreNormR);

                    // Wider SOFT GLOW — bleeds slightly around each slit.
                    float rxOuter = 0.080;
                    float ryOuter = 0.020;
                    float outNormL = (dL.x * dL.x) / (rxOuter * rxOuter)
                                   + (dL.y * dL.y) / (ryOuter * ryOuter);
                    float outNormR = (dR.x * dR.x) / (rxOuter * rxOuter)
                                   + (dR.y * dR.y) / (ryOuter * ryOuter);
                    float outL = (1.0 - smoothstep(0.30, 1.0, outNormL)) * 0.60;
                    float outR = (1.0 - smoothstep(0.30, 1.0, outNormR)) * 0.60;

                    // Wide ambient HAZE — radial, blends the eyes into the surrounding fog.
                    float hazeL = smoothstep(0.20, 0.0, distance(v_uv, eyeL)) * 0.22;
                    float hazeR = smoothstep(0.20, 0.0, distance(v_uv, eyeR)) * 0.22;

                    // Breathing pulse + rare sharp "glint" (predatory blink brightness).
                    float pulse = 0.86 + 0.14 * sin(u_time * 4.0);
                    float glint = pow(0.5 + 0.5 * sin(u_time * 6.0 + 1.7), 18.0);

                    // Icy bright core → sickly green outer → dark green haze.
                    vec3 coreCol = vec3(0.95, 1.00, 0.80);
                    vec3 glowCol = vec3(0.40, 0.95, 0.50);
                    vec3 hazeCol = vec3(0.15, 0.45, 0.22);

                    vec3 col = hazeCol;
                    col = mix(col, glowCol, outL + outR);
                    col = mix(col, coreCol, clamp(coreL + coreR + glint * 0.7, 0.0, 1.0));

                    float intensity = (coreL + coreR) * (1.0 + glint * 0.6)
                                    + (outL  + outR)
                                    + (hazeL + hazeR);
                    float a = intensity * pulse * u_alpha;
                    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Gaze beam — thin glowing tube from a wraith's eye position to the deck. Baseline
    // glow along the length + two traveling pulses toward the deck (pull direction).
    // ═══════════════════════════════════════════════════════════════════════════════
    private createGazeBeamMesh(
        eyePos: THREE.Vector3,
        deckPos: THREE.Vector3,
    ): THREE.Mesh {
        // Slight perpendicular lift on the control point for a gentle arc instead of a
        // ruler-straight line.
        const midX = (eyePos.x + deckPos.x) / 2;
        const midY = (eyePos.y + deckPos.y) / 2;
        const dx = deckPos.x - eyePos.x;
        const dy = deckPos.y - eyePos.y;
        const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const perpX = -dy / dist;
        const perpY =  dx / dist;
        const lift = dist * 0.08;
        const ctrlX = midX + perpX * lift;
        const ctrlY = midY + perpY * lift;
        const curve = new THREE.QuadraticBezierCurve3(
            eyePos,
            new THREE.Vector3(ctrlX, ctrlY, eyePos.z),
            deckPos,
        );

        const geometry = new THREE.TubeGeometry(curve, 36, 2.2, 6, false);
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
                    // Cross-section brightness — peaks at centre of tube, fades to edges.
                    float cross = 1.0 - smoothstep(0.0, 0.5, abs(v_uv.y - 0.5));
                    float crossSoft = pow(cross, 1.3);

                    // Two pulses travelling FROM eye (v_uv.x = 0) TOWARD deck (v_uv.x = 1)
                    // — makes the gaze direction unmistakable.
                    float speed = 0.6;
                    float p0 = fract(u_time * speed);
                    float p1 = fract(u_time * speed + 0.5);
                    float pulseW = 0.14;
                    float pulse = max(
                        smoothstep(pulseW, 0.0, abs(v_uv.x - p0)),
                        smoothstep(pulseW, 0.0, abs(v_uv.x - p1))
                    );

                    float baseline = crossSoft * 0.35;
                    vec3 eyeGreen  = vec3(0.55, 1.0, 0.70);
                    vec3 deckHaze  = vec3(0.25, 0.70, 0.35);
                    vec3 col = mix(eyeGreen, deckHaze, v_uv.x);

                    float intensity = baseline + pulse * crossSoft * 0.85;
                    float alpha = intensity * u_alpha;
                    gl_FragColor = vec4(col * (0.7 + intensity * 0.7), clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Spectral card — ectoplasm-outlined card rectangle with flowing interior.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createSpectralCardMesh(planeW: number, planeH: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:     { value: 0 },
                u_alpha:    { value: 0 },
                u_progress: { value: 0 },  // 0 at start → 1 on arrival at hand
                u_arrival:  { value: 0 },  // brief flash as card lands
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
                uniform float u_arrival;
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
                    // Border: bright edge ring via distance-to-nearest-edge in UV space.
                    float dx = min(v_uv.x, 1.0 - v_uv.x);
                    float dy = min(v_uv.y, 1.0 - v_uv.y);
                    float edgeDist = min(dx, dy);
                    float border = smoothstep(0.09, 0.0, edgeDist) * smoothstep(0.0, 0.012, edgeDist);
                    float borderGlow = smoothstep(0.16, 0.0, edgeDist) * 0.35;

                    // Interior ectoplasm — flowing FBM pattern.
                    float ecto = fbm(vec2(v_uv.x * 3.5 + u_time * 0.4, v_uv.y * 4.5 - u_time * 0.6));
                    float interior = smoothstep(0.35, 0.85, ecto);

                    // Colour — cyan-green border, violet-green interior, brighten on arrival.
                    vec3 borderC = vec3(0.35, 1.00, 0.55);
                    vec3 interA  = vec3(0.18, 0.40, 0.22);
                    vec3 interB  = vec3(0.42, 0.08, 0.52);
                    vec3 col = mix(interA, interB, smoothstep(0.3, 0.8, ecto));
                    col = mix(col, borderC, border);
                    col = mix(col, vec3(1.0, 1.0, 0.95), u_arrival * 0.7);

                    float alpha = (border * 0.95 + borderGlow + interior * 0.55) * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        return new THREE.Mesh(geometry, material);
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

    private tweenPositionY(
        obj: THREE.Object3D,
        from: number,
        to: number,
        duration: number,
        easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad',
    ): Promise<void> {
        return new Promise((resolve) => {
            const start = performance.now();
            const step = () => {
                const t = Math.min(1, (performance.now() - start) / duration);
                let v: number;
                switch (easing) {
                    case 'easeInQuad':    v = t * t; break;
                    case 'easeOutQuad':   v = 1 - (1 - t) * (1 - t); break;
                    case 'easeInOutQuad': v = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; break;
                    default:              v = t;
                }
                obj.position.y = from + (to - from) * v;
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
