import * as THREE from "three";

// 죽음의 대지 (Dead Lands) — "dark essence converges from all sides, TEARS APART, and
// SHATTERS the opponent's Field Energy." Five phases:
//
//   1) GATHER (~760 ms) — the whole screen feels it: an ambient dark vignette fades
//      in, a MASSIVE contracting dark ring sweeps inward toward the HUD, and TWELVE
//      big motes streak in from a very wide outer radius. The Three.js canvas gets
//      a gentle screen-wide shake that ramps up through the phase.
//   2) COALESCE (~360 ms) — motes arrive; a turbulent VORTEX orb grows at the target
//      position, pulsing. Shake intensifies.
//   3) TEAR (~480 ms) — orb bursts; four jagged RIFT beams radiate outward like
//      cracks splitting glass. HUD element gets a high-frequency DOM shake + red
//      darkening filter. Canvas shake intensifies further.
//   4) SHATTER (~440 ms) — peak. onDrain() fires (count ticks down). Shockwave ring
//      + bright impact flash + 12 dark shards explode outward. Maximum canvas shake.
//   5) SETTLE (~280 ms) — shake stops, filter/transforms restored, vignette fades.
//
// Signature: play(targetPos, targetBounds, target, canvasElement, onDrain).
//   - targetPos:     world-space centre of the opponent field energy area
//   - targetBounds:  world width/height (orb + shards are sized off this, not the viewport)
//   - target:        부서지는 대상. 떨림과 손상 정도를 받는다
//   - canvasElement: the Three.js renderer canvas — receives the AMBIENT screen shake
//   - onDrain:       fired at SHATTER peak so the count ticks exactly on impact
// 부서지는 대상에게 연출이 주는 되먹임.
//
// 예전에는 화면 위에 얹힌 조각(DOM)만 대상이라 style 을 직접 만졌다. 지금은 캔버스 안
// 메시도 대상이 될 수 있어서, 무엇을 하느냐만 정하고 어떻게 하는지는 대상 쪽에 맡긴다.
export interface DeadLandsTarget {
    // 떨림. 그 자리에서 조금씩 어긋나게 한다.
    setOffset(dx: number, dy: number): void;
    // 0 은 멀쩡한 상태, 1 은 균열이 열릴 때, 2 는 부서지는 순간이다.
    setDamageLevel(level: 0 | 1 | 2): void;
}

export class DeadLandsEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        targetPos: THREE.Vector3,
        targetBounds: { width: number; height: number },
        target: DeadLandsTarget,
        canvasElement: HTMLElement,
        onDrain: () => void,
    ): Promise<void> {
        const targetSize = Math.max(targetBounds.width, targetBounds.height);
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Outer radius scales with the viewport diagonal — motes and the contracting
        // ring need to sweep across much of the screen, not just the HUD's neighbourhood.
        const diagonal = Math.sqrt(vw * vw + vh * vh);


        // Canvas shake — starts gentle in GATHER, intensifies through TEAR/SHATTER.
        // Amplitude is mutated in-place by each phase transition; a single RAF loop
        // reads `canvasShakeAmp.value` every frame.
        const canvasShakeAmp = { value: 0 };
        const stopCanvasShake = this.startElementShake(canvasElement, canvasShakeAmp);

        // ─── AMBIENT VIGNETTE ─────────────────────────────────────────────────────
        // Full-viewport dark overlay plane sitting at the camera. Darkens the scene
        // so the gathering doom reads across the whole screen, not just near the HUD.
        const vignette = this.createVignetteMesh(vw, vh);
        vignette.position.set(0, 0, 4);  // slightly in front of the scene, behind effects
        vignette.renderOrder = 495;
        this.scene.add(vignette);
        const vignetteMat = vignette.material as THREE.ShaderMaterial;
        const vignetteClockStart = performance.now();
        let vignetteClockRunning = true;
        const vignetteClock = () => {
            if (!vignetteClockRunning) return;
            vignetteMat.uniforms.u_time.value = (performance.now() - vignetteClockStart) / 1000;
            requestAnimationFrame(vignetteClock);
        };
        requestAnimationFrame(vignetteClock);
        void this.tween(vignetteMat.uniforms.u_alpha, 1.0, 500, 'easeOutQuad');

        // ─── CONTRACTING RING ─────────────────────────────────────────────────────
        // Massive dark ring that STARTS at screen radius and shrinks to the HUD.
        // Fires across almost the entire GATHER phase — this is the backbone of the
        // "forces closing in" feel.
        this.spawnContractingRing(targetPos, diagonal * 0.55, targetSize * 0.6, 700);

        // ─── 12 motes converging inward ──────────────────────────────────────────
        const MOTE_COUNT = 12;
        const OUTER_RADIUS = Math.max(targetSize * 4.8, diagonal * 0.42);
        const motePromises: Promise<void>[] = [];
        // Start light shake as the first motes launch.
        canvasShakeAmp.value = 2.0;
        for (let i = 0; i < MOTE_COUNT; i++) {
            if (i > 0) await this.delay(40);
            const angle = (i / MOTE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
            const sourcePos = new THREE.Vector3(
                targetPos.x + Math.cos(angle) * OUTER_RADIUS,
                targetPos.y + Math.sin(angle) * OUTER_RADIUS,
                targetPos.z,
            );
            motePromises.push(this.flyConvergingMote(sourcePos, targetPos, 560));
            // Ramp shake during the gathering — from 2 → 5 as motes spawn.
            canvasShakeAmp.value = 2.0 + (i / MOTE_COUNT) * 3.0;
        }
        await Promise.all(motePromises);

        // ─── COALESCE: dark orb grows at target ──────────────────────────────────
        const orb = this.createVortexOrbMesh(targetSize * 1.4);
        orb.position.copy(targetPos);
        orb.renderOrder = 540;
        orb.scale.set(0.001, 0.001, 1);
        this.scene.add(orb);
        const orbMat = orb.material as THREE.ShaderMaterial;

        const orbClockStart = performance.now();
        let orbClockRunning = true;
        const orbClock = () => {
            if (!orbClockRunning) return;
            orbMat.uniforms.u_time.value = (performance.now() - orbClockStart) / 1000;
            requestAnimationFrame(orbClock);
        };
        requestAnimationFrame(orbClock);

        orbMat.uniforms.u_alpha.value = 1.0;
        canvasShakeAmp.value = 6.0;  // ramp up for coalesce
        await this.tweenScale(orb, 1.0, 300, 'easeOutQuad');
        // Small menacing pulse before the burst.
        await this.tweenScale(orb, 0.88, 80, 'easeInQuad');

        // ─── TEAR: orb bursts + 4 rifts radiate + HUD shake + red filter ────────
        // Apply the DOM feedback up-front; let it run through TEAR + SHATTER.
        target.setDamageLevel(1);
        const stopShake = this.startHudShake(target, targetSize * 0.065);
        canvasShakeAmp.value = 10.0;  // big jolt as the rifts open

        // Spawn the 4 rifts — offset by a slight random rotation so they don't look
        // like a perfect cross stamp.
        const riftBase = (Math.random() - 0.5) * Math.PI * 0.25;
        for (let i = 0; i < 4; i++) {
            const angle = riftBase + (i / 4) * Math.PI * 2;
            this.spawnRift(targetPos, angle, targetSize * 3.6, 520);
        }

        // Orb explodes outward + fades.
        void this.tweenScale(orb, 2.6, 320, 'easeOutQuad');
        void this.tween(orbMat.uniforms.u_alpha, 0.0, 360, 'easeInQuad');

        // Hold TEAR visual for a beat before the SHATTER peak.
        await this.delay(420);

        // ─── SHATTER: drain fires + shockwave + shards + bright flash ───────────
        onDrain();
        // Stronger red flash on the HUD for the peak moment.
        target.setDamageLevel(2);
        canvasShakeAmp.value = 14.0;  // peak screen shake on shatter
        this.spawnImpactFlash(targetPos, targetSize * 2.8, 260);
        this.spawnShockwaveRing(targetPos, targetSize * 3.2, 520);

        // 12 SHARDS exploding outward in random directions, rotating as they fade.
        const SHARD_COUNT = 12;
        for (let i = 0; i < SHARD_COUNT; i++) {
            const angle = (i / SHARD_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const speed = targetSize * (3.2 + Math.random() * 1.8);
            const spin = (Math.random() - 0.5) * 8.0;
            this.spawnShard(targetPos, angle, speed, spin, 560);
        }

        await this.delay(440);

        // ─── SETTLE ───────────────────────────────────────────────────────────────
        stopShake();
        // Canvas shake decays over SETTLE — ramp the amplitude down to 0 before the
        // RAF loop is stopped. Otherwise the scene would suddenly jolt back flat.
        const settleShakeStart = performance.now();
        const SETTLE_SHAKE_MS = 240;
        const settleShakeStep = () => {
            const t = Math.min(1, (performance.now() - settleShakeStart) / SETTLE_SHAKE_MS);
            canvasShakeAmp.value = 14.0 * (1 - t);
            if (t < 1) requestAnimationFrame(settleShakeStep);
        };
        requestAnimationFrame(settleShakeStep);

        target.setDamageLevel(0);
        target.setOffset(0, 0);
        void this.tween(vignetteMat.uniforms.u_alpha, 0.0, 360, 'easeInQuad');
        await this.delay(280);

        stopCanvasShake();
        canvasElement.style.transform = '';

        // Clean up orb (was faded but still in scene).
        orbClockRunning = false;
        this.scene.remove(orb);
        this.disposeMesh(orb);

        vignetteClockRunning = false;
        this.scene.remove(vignette);
        this.disposeMesh(vignette);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Converging mote — small dark shadow blob streaking inward. Slight curve so the
    // six streams visibly sweep into the target rather than draw straight radii.
    // ═══════════════════════════════════════════════════════════════════════════════
    private async flyConvergingMote(
        sourcePos: THREE.Vector3,
        targetPos: THREE.Vector3,
        durationMs: number,
    ): Promise<void> {
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const perpX = -dy / dist;
        const perpY =  dx / dist;
        const lift = dist * 0.12 * (Math.random() > 0.5 ? 1 : -1);
        const curve = new THREE.QuadraticBezierCurve3(
            sourcePos,
            new THREE.Vector3(midX + perpX * lift, midY + perpY * lift, sourcePos.z),
            targetPos,
        );

        const mote = this.createConvergingMoteMesh(54);
        mote.renderOrder = 530;
        mote.position.copy(sourcePos);
        this.scene.add(mote);
        const mat = mote.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        await new Promise<void>((resolve) => {
            const step = () => {
                const now = performance.now();
                const t = Math.min(1, (now - startMs) / durationMs);
                // Accelerate into the target — looks like violent attraction.
                const e = t * t;
                const p = curve.getPoint(e);
                mote.position.set(p.x, p.y, p.z);
                mat.uniforms.u_time.value = (now - startMs) / 1000;
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        // Disappear into the coalescing orb — quick fade.
        await this.tween(mat.uniforms.u_alpha, 0.0, 80, 'easeInQuad');
        this.scene.remove(mote);
        this.disposeMesh(mote);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Rift — jagged crack radiating outward from the centre along a given angle.
    // Drawn as an elongated plane aligned to the angle; shader renders a noise-
    // distorted bright seam running along its length with soft outer glow.
    // ═══════════════════════════════════════════════════════════════════════════════
    private spawnRift(
        origin: THREE.Vector3,
        angle: number,
        length: number,
        durationMs: number,
    ): void {
        const THICKNESS = length * 0.18;
        const rift = this.createRiftMesh(length, THICKNESS);
        // Positioned so its LEFT edge sits at origin and it extends outward along angle.
        rift.position.set(
            origin.x + Math.cos(angle) * length * 0.5,
            origin.y + Math.sin(angle) * length * 0.5,
            origin.z,
        );
        rift.rotation.z = angle;
        rift.renderOrder = 535;
        this.scene.add(rift);
        const mat = rift.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            // Fast rise, slow fall — rift slams open then lingers.
            mat.uniforms.u_alpha.value = t < 0.12 ? t / 0.12 : Math.pow(1 - (t - 0.12) / 0.88, 1.6);
            mat.uniforms.u_time.value = (performance.now() - startMs) / 1000;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                this.scene.remove(rift);
                this.disposeMesh(rift);
            }
        };
        requestAnimationFrame(step);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Shard — small dark shrapnel flying outward at a given angle + spin. Fades out.
    // ═══════════════════════════════════════════════════════════════════════════════
    private spawnShard(
        origin: THREE.Vector3,
        angle: number,
        speed: number,
        spin: number,
        durationMs: number,
    ): void {
        const size = 14 + Math.random() * 12;
        const shard = this.createShardMesh(size);
        shard.position.copy(origin);
        shard.renderOrder = 538;
        this.scene.add(shard);
        const mat = shard.material as THREE.ShaderMaterial;

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const startMs = performance.now();
        const step = () => {
            const now = performance.now();
            const t = Math.min(1, (now - startMs) / durationMs);
            // Decelerate slightly so shards don't fly to infinity (ease-out drift).
            const travel = 1 - Math.pow(1 - t, 2);
            shard.position.x = origin.x + vx * travel;
            shard.position.y = origin.y + vy * travel;
            shard.rotation.z = spin * t;
            mat.uniforms.u_alpha.value = 1 - Math.pow(t, 1.4);
            mat.uniforms.u_time.value = (now - startMs) / 1000;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                this.scene.remove(shard);
                this.disposeMesh(shard);
            }
        };
        requestAnimationFrame(step);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Shockwave + impact flash — reused-style spawners for the SHATTER peak.
    // ═══════════════════════════════════════════════════════════════════════════════
    private spawnShockwaveRing(origin: THREE.Vector3, baseSize: number, durationMs: number): void {
        const ring = this.createShockwaveRingMesh(baseSize);
        ring.position.copy(origin);
        ring.renderOrder = 537;
        this.scene.add(ring);
        const mat = ring.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            mat.uniforms.u_alpha.value = t < 0.12 ? t / 0.12 : 1.0 - (t - 0.12) / 0.88;
            mat.uniforms.u_time.value = (performance.now() - startMs) / 1000;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                this.scene.remove(ring);
                this.disposeMesh(ring);
            }
        };
        requestAnimationFrame(step);
    }

    private spawnImpactFlash(origin: THREE.Vector3, size: number, durationMs: number): void {
        const flash = this.createImpactFlashMesh(size);
        flash.position.copy(origin);
        flash.renderOrder = 539;
        this.scene.add(flash);
        const mat = flash.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_alpha.value = t < 0.08 ? t / 0.08 : Math.pow(1 - (t - 0.08) / 0.92, 1.8);
            mat.uniforms.u_time.value = (performance.now() - startMs) / 1000;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                this.scene.remove(flash);
                this.disposeMesh(flash);
            }
        };
        requestAnimationFrame(step);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // HUD shake — high-frequency random translate on the DOM element. Returns a
    // stop function the caller invokes to halt the shake.
    // ═══════════════════════════════════════════════════════════════════════════════
    private startHudShake(target: DeadLandsTarget, ampPx: number): () => void {
        let running = true;
        const step = () => {
            if (!running) return;
            const dx = (Math.random() - 0.5) * ampPx * 2;
            const dy = (Math.random() - 0.5) * ampPx * 2;
            target.setOffset(dx, dy);
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        return () => { running = false; };
    }

    // Element shake with dynamic amplitude — the caller mutates `ampRef.value` in
    // place between phases so the RAF loop reads the current amplitude every frame.
    // Used for the whole-canvas screen shake (separate from the HUD's high-freq shake).
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

    // Contracting ring — huge dark ring whose radius shrinks from startRadius → endRadius
    // over durationMs. Drawn as a viewport-sized plane; the ring is computed in the
    // fragment shader against world-space UV → pixel distance. Fades in, then out.
    private spawnContractingRing(
        origin: THREE.Vector3,
        startRadius: number,
        endRadius: number,
        durationMs: number,
    ): void {
        // Plane is sized slightly larger than the outer radius so the ring is never
        // clipped at max size. Render-order above the vignette, below motes/orb.
        const planeSize = startRadius * 2.3;
        const ring = this.createContractingRingMesh(planeSize, startRadius, endRadius);
        ring.position.copy(origin);
        ring.renderOrder = 498;
        this.scene.add(ring);
        const mat = ring.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            // Fade up over the first 20 %, hold, decay across the rest.
            mat.uniforms.u_alpha.value = t < 0.2 ? t / 0.2 : Math.pow(1 - (t - 0.2) / 0.8, 1.2);
            mat.uniforms.u_time.value = (performance.now() - startMs) / 1000;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                this.scene.remove(ring);
                this.disposeMesh(ring);
            }
        };
        requestAnimationFrame(step);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Mesh factories
    // ═══════════════════════════════════════════════════════════════════════════════
    private createConvergingMoteMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 1 },
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
                    float noise = vnoise(v_uv * 4.0 + vec2(u_time * 2.0, 0.0));
                    float shape = (1.0 - smoothstep(0.15, 1.0, r)) * (0.55 + noise * 0.60);
                    float core = smoothstep(0.30, 0.0, r);

                    vec3 abyss  = vec3(0.02, 0.01, 0.06);
                    vec3 indigo = vec3(0.14, 0.08, 0.28);
                    vec3 edge   = vec3(0.38, 0.20, 0.55);
                    vec3 col = mix(abyss, indigo, core);
                    col = mix(col, edge, smoothstep(0.55, 0.90, noise) * 0.5);

                    float alpha = (shape + core * 0.4) * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    // Vortex orb — swirling FBM with hot dark-violet core. Spins menacingly.
    private createVortexOrbMesh(size: number): THREE.Mesh {
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
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float ang = atan(c.y, c.x);
                    // Inward-spiraling swirl (fast spin).
                    float swirl = ang - u_time * 5.5 - (1.0 - r) * 6.0;
                    vec2 sq = vec2(cos(swirl), sin(swirl)) * r * 2.2;
                    float n1 = fbm(sq * 2.2 + vec2(-u_time * 0.8, 0.0));
                    float density = n1;

                    float radial = 1.0 - smoothstep(0.05, 1.0, r);
                    density *= radial;

                    vec3 abyss   = vec3(0.01, 0.00, 0.04);
                    vec3 indigo  = vec3(0.12, 0.05, 0.25);
                    vec3 violet  = vec3(0.35, 0.18, 0.55);
                    vec3 crimson = vec3(0.52, 0.08, 0.25);  // small dark-crimson peek — "destructive" tint
                    vec3 col = mix(abyss, indigo, smoothstep(0.05, 0.40, density));
                    col = mix(col, violet,  smoothstep(0.40, 0.75, density));
                    col = mix(col, crimson, smoothstep(0.72, 0.95, density) * 0.45);

                    float a = smoothstep(0.08, 0.70, density) * u_alpha;
                    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    // Rift — jagged crack along the plane's local X axis. v_uv.x runs along the rift
    // length; v_uv.y across its thickness. Shader draws a noise-perturbed bright seam
    // down the centre, with a soft outer glow that fades at the rift's far end.
    private createRiftMesh(length: number, thickness: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
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
                    // v_uv.x along length (0 at origin, 1 at far end)
                    // v_uv.y across thickness (0.5 = centre)
                    float along = v_uv.x;
                    float across = v_uv.y - 0.5;

                    // Progress gate: rift EXTENDS outward over time. At t=0 only the
                    // near end is visible; at t=1 the full length is drawn.
                    float reach = u_progress;

                    // Jagged centre seam — offset the effective centre by noise.
                    float jitter = (vnoise(vec2(along * 18.0, u_time * 3.0)) - 0.5) * 0.25;
                    float seam = abs(across + jitter);

                    // Core bright line — thin, near-white.
                    float core = smoothstep(0.05, 0.0, seam);
                    // Outer glow — softer, broader.
                    float glow = smoothstep(0.40, 0.0, seam) * 0.45;

                    // Length envelope: 0 at origin edge (hot), taper at far end.
                    float lengthMask = smoothstep(reach + 0.05, reach - 0.02, along) *
                                       smoothstep(0.0, 0.08, along);

                    // Random micro-spikes along the seam — short perpendicular flickers
                    // breaking out from the main line.
                    float spike = vnoise(vec2(along * 40.0, u_time * 6.0));
                    spike = smoothstep(0.78, 0.95, spike);
                    float spikeMask = spike * smoothstep(0.24, 0.0, seam) * 0.8;

                    float intensity = (core + glow + spikeMask) * lengthMask;

                    vec3 abyss  = vec3(0.02, 0.01, 0.05);
                    vec3 violet = vec3(0.62, 0.30, 0.88);
                    vec3 white  = vec3(1.00, 0.95, 1.00);
                    vec3 col = mix(abyss, violet, glow + spikeMask);
                    col = mix(col, white, core * 0.9);

                    float alpha = intensity * u_alpha;
                    gl_FragColor = vec4(col * (0.6 + intensity * 0.8), clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(length, thickness), material);
    }

    private createShardMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 1 },
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
                    // Shard shape — elongated triangle-ish sliver via signed distance
                    // against two angled lines, intersected to form a thin dark dart.
                    vec2 c = v_uv - 0.5;
                    float d1 = abs(c.y) - 0.40 * (0.5 + 0.5 * (1.0 - abs(c.x) * 2.0));
                    float d2 = abs(c.x) - 0.48;
                    float inside = 1.0 - smoothstep(-0.02, 0.04, max(d1, d2));

                    // Bright edge highlight along the shard's long axis.
                    float edge = 1.0 - smoothstep(0.0, 0.05, abs(c.y + 0.02));

                    vec3 abyss  = vec3(0.02, 0.01, 0.06);
                    vec3 violet = vec3(0.40, 0.20, 0.58);
                    vec3 col = mix(abyss, violet, edge * inside);

                    float alpha = inside * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size * 2.6, size), material);
    }

    private createShockwaveRingMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
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

                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float ringR = mix(0.08, 1.1, u_progress);
                    float thickness = 0.13 * (1.0 - u_progress * 0.3);
                    float ring = smoothstep(thickness, 0.0, abs(r - ringR));

                    // Crimson-tinted for dead-lands specifically (distinguishes from the
                    // cold-violet rings used elsewhere).
                    vec3 col = vec3(0.70, 0.22, 0.45);
                    float alpha = ring * u_alpha * 1.1;
                    gl_FragColor = vec4(col * (1.0 + ring * 0.5), clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    // Ambient dark vignette covering the whole viewport. Darkens the scene during
    // the entire effect so the gathering doom reads across all of the screen, not
    // just the HUD area. Centre is slightly lighter than edges so the focus stays
    // near the HUD region.
    private createVignetteMesh(viewportWidth: number, viewportHeight: number): THREE.Mesh {
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
                    // Darker at edges, softer in centre.
                    float edge = smoothstep(0.35, 1.35, r);
                    // Subtle turbulent drift so it doesn't look like a flat filter.
                    float noise = vnoise(v_uv * 3.0 + vec2(u_time * 0.4, -u_time * 0.3));
                    float darkness = (0.45 + edge * 0.45) * (0.88 + noise * 0.20);

                    vec3 abyss = vec3(0.02, 0.01, 0.04);
                    gl_FragColor = vec4(abyss, clamp(darkness * u_alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(viewportWidth, viewportHeight), material);
    }

    // Massive contracting ring — a thick dark seam that tracks between startRadius
    // (at u_progress=0) and endRadius (at u_progress=1). Radius values are in the
    // same units as the plane size; shader computes r from UV × plane size.
    private createContractingRingMesh(
        planeSize: number,
        startRadius: number,
        endRadius: number,
    ): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:        { value: 0 },
                u_alpha:       { value: 0 },
                u_progress:    { value: 0 },
                u_planeSize:   { value: planeSize },
                u_startRadius: { value: startRadius },
                u_endRadius:   { value: endRadius },
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
                uniform float u_planeSize;
                uniform float u_startRadius;
                uniform float u_endRadius;
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
                    // Distance in pixels = |UV centre offset| × planeSize
                    float rPx = length(c) * u_planeSize;
                    float curR = mix(u_startRadius, u_endRadius, u_progress);

                    // Ring thickness scales with current radius — thick seam at start,
                    // tightens as it converges (adds acceleration feel).
                    float thickness = mix(u_startRadius * 0.10, u_endRadius * 0.35, u_progress);
                    float ring = smoothstep(thickness, 0.0, abs(rPx - curR));

                    // Noise modulation for rough texture — dark seam isn't a clean circle.
                    float noise = vnoise(vec2(atan(c.y, c.x) * 3.0, u_time * 1.5));
                    ring *= (0.70 + noise * 0.60);

                    vec3 abyss  = vec3(0.03, 0.01, 0.08);
                    vec3 indigo = vec3(0.22, 0.10, 0.36);
                    vec3 col = mix(abyss, indigo, noise);

                    float alpha = ring * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), material);
    }

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
                    float glow = smoothstep(0.9, 0.0, r);
                    glow = pow(glow, 1.8);

                    vec3 white   = vec3(1.00, 0.94, 0.96);
                    vec3 crimson = vec3(0.88, 0.30, 0.50);
                    vec3 col = mix(crimson, white, glow * 0.55);

                    gl_FragColor = vec4(col * (1.0 + glow * 0.7), clamp(glow * u_alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
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
