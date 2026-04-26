import * as THREE from "three";

// 마검의 지배자 네더 블레이드 — first passive: triggers on deployment ("출격 시"). AoE
// strike on every opponent unit (master excluded). Visualised as a fan of elongated
// dark blade-slashes radiating from the deployed unit's position to each target. All
// slashes extend simultaneously; at their peak extension every target is struck and
// the onStrike callback fires per index, letting the pilot apply damage in lockstep.
//
// Phases:
//   1) CHARGE (~440 ms) — dark crimson aura blooms + pulses at the unit's position;
//      gentle canvas shake establishes the "summoning ominous power" beat.
//   2) SLASH (~520 ms) — N slashes simultaneously animate from origin → target. Each
//      slash is an elongated plane with a bright cutting edge that extends along its
//      length via u_progress. At peak extension (~250 ms in) a screen-shake spike +
//      per-target impact flash + onStrike callback fire. Slashes fade after.
//   3) SETTLE (~280 ms) — aura fades, canvas shake decays to zero, all meshes dispose.
//
// Signature: play(originPos, targetPositions, canvasElement, onStrike).
//   - originPos:        world-space position of the deployed Nether Blade (slash source).
//   - targetPositions:  one Vector3 per opponent target (master EXCLUDED by caller).
//   - canvasElement:    the Three.js renderer canvas — receives the screen shake.
//   - onStrike:         fired per-target at the strike peak; pilot ticks HP per index.
export class NetherBladeFirstPassiveEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        originPos: THREE.Vector3,
        targetPositions: readonly THREE.Vector3[],
        canvasElement: HTMLElement,
        onStrike: (idx: number) => void,
    ): Promise<void> {
        // Save canvas inline transform so SETTLE can restore it.
        const origTransform = canvasElement.style.transform;

        // Canvas shake amplitude — phase-driven.
        const shakeAmp = { value: 0 };
        const stopShake = this.startElementShake(canvasElement, shakeAmp);

        // Shared shader clock.
        const tickClocks = new Set<THREE.ShaderMaterial>();
        const clockStart = performance.now();
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            const t = (performance.now() - clockStart) / 1000;
            tickClocks.forEach((mat) => { mat.uniforms.u_time.value = t; });
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // ── PHASE 1: CHARGE ────────────────────────────────────────────────────────
        const aura = this.createChargeAuraMesh(220);
        aura.position.copy(originPos);
        aura.position.z = originPos.z + 0.2;
        aura.renderOrder = 545;
        this.scene.add(aura);
        const auraMat = aura.material as THREE.ShaderMaterial;
        tickClocks.add(auraMat);

        shakeAmp.value = 3.0;
        await this.tween(auraMat.uniforms.u_alpha, 1.0, 280, 'easeOutQuad');
        // Brief charging pulse — scale aura up + back as power gathers.
        void this.tweenScale(aura, 1.18, 200, 'easeOutQuad').then(() =>
            this.tweenScale(aura, 1.0, 120, 'easeInQuad')
        );
        await this.delay(280);

        // ── PHASE 2: SLASH ─────────────────────────────────────────────────────────
        // Big shake spike on unleash.
        shakeAmp.value = 13.0;

        const SLASH_MS = 520;
        // Fire all slashes in parallel — true AoE simultaneity.
        const slashPromises: Promise<void>[] = [];
        for (let i = 0; i < targetPositions.length; i++) {
            const idx = i;  // capture
            slashPromises.push(this.fireSlash(
                originPos,
                targetPositions[idx],
                SLASH_MS,
                () => onStrike(idx),
                tickClocks,
            ));
        }
        await Promise.all(slashPromises);

        // Decay shake to medium for settle.
        shakeAmp.value = 4.0;

        // ── PHASE 3: SETTLE ────────────────────────────────────────────────────────
        const settleStart = performance.now();
        const SETTLE_MS = 280;
        const settleStep = () => {
            const t = Math.min(1, (performance.now() - settleStart) / SETTLE_MS);
            shakeAmp.value = 4.0 * (1 - t);
            if (t < 1) requestAnimationFrame(settleStep);
        };
        requestAnimationFrame(settleStep);

        await this.tween(auraMat.uniforms.u_alpha, 0.0, 280, 'easeInQuad');

        stopShake();
        canvasElement.style.transform = origTransform;
        clockRunning = false;
        this.scene.remove(aura);
        this.disposeMesh(aura);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Per-slash flight + impact
    // ═══════════════════════════════════════════════════════════════════════════════
    private async fireSlash(
        origin: THREE.Vector3,
        target: THREE.Vector3,
        durationMs: number,
        onPeak: () => void,
        tickClocks: Set<THREE.ShaderMaterial>,
    ): Promise<void> {
        const dx = target.x - origin.x;
        const dy = target.y - origin.y;
        const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const angle = Math.atan2(dy, dx);
        const thickness = Math.max(28, dist * 0.10);

        // Slash mesh — anchored so its inner edge sits at origin and it extends outward
        // along its local x toward the target. We do this by positioning the mesh CENTRE
        // at the midpoint between origin and target, rotated to align with that vector.
        const slash = this.createSlashMesh(dist, thickness);
        slash.position.set((origin.x + target.x) / 2, (origin.y + target.y) / 2, origin.z + 0.15);
        slash.rotation.z = angle;
        slash.renderOrder = 548;
        this.scene.add(slash);
        const mat = slash.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        // Strike peak ratio — at this fraction of duration, fire the onPeak callback +
        // spawn the impact flash at the target. Ratio chosen so the slash visibly
        // reaches the target before the damage tick (extension at ~0.5).
        const PEAK_RATIO = 0.50;
        let firedPeak = false;

        const startMs = performance.now();
        await new Promise<void>((resolve) => {
            const step = () => {
                const now = performance.now();
                const t = Math.min(1, (now - startMs) / durationMs);

                // u_progress: 0 → 1 across the duration. Drives the "extending blade"
                // animation in the shader.
                mat.uniforms.u_progress.value = t;

                // Alpha curve: fast rise (extension), hold mid, fade out at end.
                let alpha: number;
                if (t < 0.10) alpha = t / 0.10;
                else if (t < 0.65) alpha = 1.0;
                else alpha = 1.0 - (t - 0.65) / 0.35;
                mat.uniforms.u_alpha.value = alpha;

                if (!firedPeak && t >= PEAK_RATIO) {
                    firedPeak = true;
                    onPeak();
                    this.spawnImpactFlash(target, 220, 280, tickClocks);
                }

                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        tickClocks.delete(mat);
        this.scene.remove(slash);
        this.disposeMesh(slash);
    }

    private spawnImpactFlash(
        origin: THREE.Vector3,
        size: number,
        durationMs: number,
        tickClocks: Set<THREE.ShaderMaterial>,
    ): void {
        const flash = this.createImpactFlashMesh(size);
        flash.position.copy(origin);
        flash.position.z = origin.z + 0.3;
        flash.renderOrder = 552;
        this.scene.add(flash);
        const mat = flash.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_alpha.value = t < 0.08 ? t / 0.08 : Math.pow(1 - (t - 0.08) / 0.92, 1.7);
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                tickClocks.delete(mat);
                this.scene.remove(flash);
                this.disposeMesh(flash);
            }
        };
        requestAnimationFrame(step);
    }

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

    // Charge aura — dark crimson swirling cloud at the unit's position. FBM-driven
    // turbulence + radial falloff. Same family as Dead Lands' vortex but smaller and
    // tinted toward sword-crimson rather than pure abyss.
    private createChargeAuraMesh(size: number): THREE.Mesh {
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
                    float swirl = ang - u_time * 4.5 - (1.0 - r) * 5.0;
                    vec2 sq = vec2(cos(swirl), sin(swirl)) * r * 2.2;
                    float density = fbm(sq * 2.4 + vec2(-u_time * 0.9, 0.0));

                    float radial = 1.0 - smoothstep(0.05, 1.0, r);
                    density *= radial;

                    vec3 abyss   = vec3(0.02, 0.00, 0.04);
                    vec3 crimson = vec3(0.42, 0.06, 0.16);
                    vec3 hot     = vec3(0.78, 0.20, 0.30);
                    vec3 col = mix(abyss, crimson, smoothstep(0.10, 0.55, density));
                    col = mix(col, hot, smoothstep(0.65, 0.95, density));

                    float a = smoothstep(0.08, 0.70, density) * u_alpha;
                    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    // Slash mesh — elongated rectangle (length × thickness). v_uv.x runs along the
    // length (0 = origin, 1 = target). Shader draws:
    //   - A bright cutting edge that extends from origin to current u_progress
    //   - A dark trailing wake behind the edge
    //   - Crimson glow surrounding the edge for menace
    private createSlashMesh(length: number, thickness: number): THREE.Mesh {
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
                    float along = v_uv.x;             // 0 → 1 along blade length
                    float across = v_uv.y - 0.5;       // -0.5 → 0.5 across width

                    // Visible only up to the current extension reach.
                    float reach = clamp(u_progress, 0.0, 1.0);
                    if (along > reach) {
                        gl_FragColor = vec4(0.0); return;
                    }

                    // Bright leading edge — concentrated at the current reach point.
                    float edge = 1.0 - smoothstep(0.04, 0.0, abs(along - reach));
                    edge = 1.0 - edge;  // invert: 1 at edge, 0 elsewhere

                    // Centre line of the blade — bright cutting seam down the middle.
                    float seam = smoothstep(0.18, 0.0, abs(across));
                    // Add some FBM jitter so the seam isn't perfectly straight.
                    float jitter = (vnoise(vec2(along * 14.0, u_time * 3.0)) - 0.5) * 0.06;
                    float jSeam = smoothstep(0.20, 0.0, abs(across + jitter));

                    // Body glow — broader, dimmer falloff.
                    float body = smoothstep(0.50, 0.0, abs(across));

                    // Trailing wake fades behind the leading edge.
                    float wake = smoothstep(0.0, reach, along) * (1.0 - smoothstep(reach - 0.08, reach, along));

                    float seamPulse = 0.85 + 0.15 * sin(u_time * 12.0);

                    vec3 abyss   = vec3(0.02, 0.00, 0.05);
                    vec3 crimson = vec3(0.78, 0.14, 0.28);
                    vec3 white   = vec3(1.00, 0.92, 0.86);

                    vec3 col = abyss;
                    col = mix(col, crimson, body);
                    col = mix(col, crimson * 1.4, jSeam * seamPulse);
                    col = mix(col, white, edge * 1.6);

                    // Intensity sums: body for breadth, seam for the cut, edge for the tip.
                    float intensity = body * 0.45 + jSeam * 0.85 + edge * 1.6 + wake * 0.25;
                    float alpha = intensity * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(length, thickness), material);
    }

    // Impact flash — bright crimson-white burst at strike target.
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
                    float glow = smoothstep(0.92, 0.0, r);
                    glow = pow(glow, 1.7);
                    vec3 white   = vec3(1.00, 0.94, 0.88);
                    vec3 crimson = vec3(0.92, 0.24, 0.40);
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
