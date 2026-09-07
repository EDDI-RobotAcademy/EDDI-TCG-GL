import * as THREE from "three";

// 사기 전환 (Morale Conversion) — death-energy transfer effect.
//
// Three layered elements work together so the flow reads clearly:
//   1) Dramatic AURA at the sacrificed ally's former position — a dark, turbulent violet
//      cloud with hot magenta core, multi-octave FBM, rising smoke tendrils, and sharp
//      contrast so it feels menacing rather than decorative.
//   2) A persistent curved BEAM (TubeGeometry along a quadratic bezier) connecting source
//      to the Field Energy HUD — always visible during the flow phase, with a baseline
//      glow plus three travelling pulses so the direction of travel is obvious.
//   3) Bright MOTES spawned along the beam. Each mote's arrival fires the onArrive
//      callback so the pilot can tick the Field Energy number in sync with the visible
//      impacts.
export class MoraleConvertEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        sourcePos: THREE.Vector3,
        destPos: THREE.Vector3,
        moteCount: number,
        onArrive: () => void,
    ): Promise<void> {
        // Bezier control point — midpoint pushed perpendicular so the beam arches. Used
        // by BOTH the beam and the motes so they share the exact same path.
        const midX = (sourcePos.x + destPos.x) / 2;
        const midY = (sourcePos.y + destPos.y) / 2;
        const dx = destPos.x - sourcePos.x;
        const dy = destPos.y - sourcePos.y;
        const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const perpX = -dy / dist;
        const perpY =  dx / dist;
        // Perpendicular lift = 18% of path distance, always upward in world y (so arc bows
        // upward if the destination is to the upper-right — looks like the energy rising).
        const lift = dist * 0.18;
        const ctrlOffsetSign = perpY >= 0 ? 1 : -1;
        const ctrlX = midX + perpX * lift * ctrlOffsetSign;
        const ctrlY = midY + perpY * lift * ctrlOffsetSign;
        const curve = new THREE.QuadraticBezierCurve3(
            sourcePos,
            new THREE.Vector3(ctrlX, ctrlY, sourcePos.z),
            destPos,
        );

        // ─── Aura ─────────────────────────────────────────────────────────────────
        const auraSize = 280;
        const aura = this.createAuraMesh(auraSize);
        aura.position.copy(sourcePos);
        aura.renderOrder = 500;
        this.scene.add(aura);
        const auraMat = aura.material as THREE.ShaderMaterial;

        // ─── Beam ─────────────────────────────────────────────────────────────────
        const beam = this.createBeamMesh(curve);
        beam.renderOrder = 505;
        this.scene.add(beam);
        const beamMat = beam.material as THREE.ShaderMaterial;

        // Shared clock for shader time uniforms.
        const clockStart = performance.now();
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            const t = (performance.now() - clockStart) / 1000;
            auraMat.uniforms.u_time.value = t;
            beamMat.uniforms.u_time.value = t;
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // Aura ignites.
        await this.tween(auraMat.uniforms.u_alpha, 1.0, 350, 'easeOutQuad');

        // Beam materialises after the aura has established presence.
        await this.tween(beamMat.uniforms.u_alpha, 1.0, 260, 'easeOutQuad');

        // ─── Motes ────────────────────────────────────────────────────────────────
        const stagger = 120;
        const moteFlightMs = 800;
        const motePromises: Promise<void>[] = [];
        for (let i = 0; i < moteCount; i++) {
            if (i > 0) await this.delay(stagger);
            motePromises.push(this.flyMote(curve, moteFlightMs, onArrive));
        }
        await Promise.all(motePromises);

        // ─── Fade out ─────────────────────────────────────────────────────────────
        await Promise.all([
            this.tween(auraMat.uniforms.u_alpha, 0.0, 380, 'easeInQuad'),
            this.tween(beamMat.uniforms.u_alpha, 0.0, 300, 'easeInQuad'),
        ]);

        clockRunning = false;
        this.scene.remove(aura);
        this.scene.remove(beam);
        this.disposeMesh(aura);
        this.disposeMesh(beam);
    }

    // Fly one mote along the shared bezier curve, LEAVING A TRAIL OF SMOKE PUFFS behind.
    // Each puff spawns every ~40 ms, captures the mote's current position + progress, and
    // fades itself out over ~450 ms — so behind each mote is a visible wake of dissipating
    // death energy rather than a clean empty path.
    private async flyMote(
        curve: THREE.QuadraticBezierCurve3,
        durationMs: number,
        onArrive: () => void,
    ): Promise<void> {
        const mote = this.createMoteMesh(45);
        mote.renderOrder = 520;
        mote.position.copy(curve.v0);
        this.scene.add(mote);
        const mat = mote.material as THREE.ShaderMaterial;

        const PUFF_INTERVAL = 40;
        let lastPuffMs = 0;

        const startMs = performance.now();
        await new Promise<void>((resolve) => {
            const step = () => {
                const now = performance.now();
                const t = Math.min(1, (now - startMs) / durationMs);
                // easeInOutQuad for accel-out + decel-in feel
                const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                const p = curve.getPoint(e);
                mote.position.set(p.x, p.y, p.z);
                mat.uniforms.u_time.value = (now - startMs) / 1000;
                mat.uniforms.u_progress.value = e;

                if (now - lastPuffMs >= PUFF_INTERVAL) {
                    lastPuffMs = now;
                    this.spawnTrailPuff(mote.position.clone(), e);
                }

                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        onArrive();
        await this.tween(mat.uniforms.u_arrival, 1.0, 130, 'easeOutQuad');
        await this.tween(mat.uniforms.u_alpha, 0.0, 220, 'easeInQuad');

        this.scene.remove(mote);
        this.disposeMesh(mote);
    }

    // Self-managed smoke puff — creates, animates alpha-fade + slight growth, removes +
    // disposes itself. Captures the spawning mote's progress so the puff's colour matches
    // wherever the mote was on its journey (violet near source, only greening near arrival).
    private spawnTrailPuff(pos: THREE.Vector3, progress: number): void {
        const puff = this.createPuffMesh(30);
        puff.position.copy(pos);
        puff.renderOrder = 515;
        this.scene.add(puff);
        const mat = puff.material as THREE.ShaderMaterial;
        mat.uniforms.u_progress.value = progress;

        const DURATION = 450;
        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / DURATION);
            mat.uniforms.u_alpha.value = (1 - t) * 0.65;
            mat.uniforms.u_grow.value = t;
            mat.uniforms.u_time.value = (performance.now() - startMs) / 1000;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                this.scene.remove(puff);
                this.disposeMesh(puff);
            }
        };
        requestAnimationFrame(step);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Aura — bigger, darker, more menacing. Multi-octave FBM with domain warp + rising
    // smoke tendrils + hot magenta core against near-black violet body.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createAuraMesh(size: number): THREE.Mesh {
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
                    for (int i = 0; i < 6; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
                    return v;
                }

                void main() {
                    float t = u_time;

                    // Domain warp — twisting tendrils. Strong coefficient so the aura feels
                    // violently turbulent rather than a gentle swirl.
                    vec2 warp = vec2(
                        fbm(v_uv * 2.5 + vec2(0.0, -t * 1.1)),
                        fbm(v_uv * 2.5 + vec2(5.1, -t * 1.4 + 2.3))
                    );
                    vec2 q = v_uv + (warp - 0.5) * 0.42;

                    // Spiral inflow angle + radius.
                    vec2 c = q - 0.5;
                    float r = length(c) * 2.0;
                    float ang = atan(c.y, c.x);
                    float swirl = ang + t * 2.2 + (1.0 - r) * 4.5;
                    vec2 sq = vec2(cos(swirl), sin(swirl)) * r * 2.4;

                    // Two layered noise passes. Fast upward drift on layer 1 = rising smoke.
                    float n1 = fbm(sq * 1.9 + vec2(0.0, -t * 1.1));
                    float n2 = fbm(sq * 4.0 + vec2(3.1, -t * 1.6));
                    float density = n1 * 0.7 + n2 * 0.3;

                    // Radial envelope — strong core, tapering edges.
                    float radial = 1.0 - smoothstep(0.05, 1.15, r);

                    // Vertical tendril layer — gives the cloud rising smoke streaks.
                    float tendrils = fbm(vec2(v_uv.x * 7.0, v_uv.y * 3.2 - t * 1.8));
                    float tendrilMask = smoothstep(0.45, 0.75, tendrils) * radial * 0.8;
                    density = max(density * radial, tendrilMask);

                    // Colour ramp — 4 stops from near-black through violet to hot magenta,
                    // with a sickly green tinge where the density is mid-range.
                    vec3 abyss   = vec3(0.02, 0.00, 0.05);
                    vec3 violet  = vec3(0.32, 0.02, 0.52);
                    vec3 bile    = vec3(0.15, 0.48, 0.20);
                    vec3 magenta = vec3(0.88, 0.12, 0.90);
                    vec3 col = mix(abyss, violet, smoothstep(0.10, 0.45, density));
                    // Bile peeks through in the mid-density band.
                    col = mix(col, bile, smoothstep(0.35, 0.55, density) * (1.0 - smoothstep(0.55, 0.75, density)) * 0.55);
                    col = mix(col, magenta, smoothstep(0.75, 1.0, density));

                    // Smoke patches — subtract darker pockets for extra turbulence contrast.
                    float shadow = fbm(sq * 1.1 + vec2(4.0, 0.0));
                    col *= mix(1.0, 0.55, smoothstep(0.55, 0.85, shadow) * density);

                    float a = smoothstep(0.10, 0.72, density) * u_alpha;
                    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Beam — a glowing curved tube between source and destination. Baseline glow is
    // constant; THREE travelling pulses make the flow direction unmistakable.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createBeamMesh(curve: THREE.QuadraticBezierCurve3): THREE.Mesh {
        // Tube along the bezier. 40 segments for smoothness, 8 radial segments, radius 9.
        const geometry = new THREE.TubeGeometry(curve, 40, 9, 8, false);

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
                    // TubeGeometry uvs: x runs from 0 (source) → 1 (dest) along length,
                    // y wraps around the tube circumference 0..1.
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
                    // Cross-section glow: brightest along the centre line of the tube
                    // (v_uv.y = 0.5), falling off toward the edges.
                    float cross = 1.0 - smoothstep(0.0, 0.5, abs(v_uv.y - 0.5));
                    float crossSoft = pow(cross, 1.2);

                    // Baseline glow along the whole beam — always visible during flow.
                    float baseline = crossSoft * 0.35;

                    // THREE travelling pulses so motion is obvious regardless of mote cadence.
                    float speed = 0.45;
                    float p0 = fract(u_time * speed);
                    float p1 = fract(u_time * speed + 0.333);
                    float p2 = fract(u_time * speed + 0.666);
                    float pulseW = 0.13;
                    float pulse = max(max(
                        smoothstep(pulseW, 0.0, abs(v_uv.x - p0)),
                        smoothstep(pulseW, 0.0, abs(v_uv.x - p1))
                    ),      smoothstep(pulseW, 0.0, abs(v_uv.x - p2)));

                    // Colour shifts along length — violet death → green field energy.
                    vec3 violet = vec3(0.70, 0.15, 0.95);
                    vec3 green  = vec3(0.30, 0.98, 0.50);
                    vec3 col = mix(violet, green, v_uv.x);

                    float intensity = baseline + pulse * crossSoft * 0.95;
                    float alpha = intensity * u_alpha;
                    gl_FragColor = vec4(col * (0.6 + intensity * 0.6), clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Mote — turbulent DEATH-energy globule. Not a clean glowing orb; the shader uses
    // FBM noise internally + swirl so the shape is irregular and smoky. Dominant violet /
    // hot magenta throughout the flight; green only tints at the last 20 % of progress as
    // the energy "converts" on arrival. Arrival flashes toward white briefly.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createMoteMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            // NormalBlending (not additive) so the mote reads as a solid mass of smoke
            // rather than a pure glow. The shader boosts the core's brightness to keep
            // visibility on dark backgrounds.
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:     { value: 0 },
                u_alpha:    { value: 1 },
                u_progress: { value: 0 },
                u_arrival:  { value: 0 },
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
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float ang = atan(c.y, c.x);

                    // Internal swirl so the smoke rotates within the mote.
                    float swirl = ang + u_time * 4.5 + (1.0 - r) * 3.2;
                    vec2 sq = vec2(cos(swirl), sin(swirl)) * r * 2.2;
                    float noise = fbm(sq * 2.0 + vec2(u_time * 0.6, 0.0));

                    // Irregular outline — radial falloff modulated by noise so the silhouette
                    // breathes and wisps rather than forming a perfect circle.
                    float shape = (1.0 - smoothstep(0.15, 1.0, r)) * (0.45 + noise * 0.85);

                    // Bright turbulent core (hotter toward centre).
                    float core = smoothstep(0.32, 0.0, r) * (0.7 + noise * 0.5);

                    // DEATH palette: deep violet body, hot magenta core.
                    vec3 deepViolet = vec3(0.22, 0.02, 0.42);
                    vec3 hotMagenta = vec3(0.88, 0.14, 0.92);
                    vec3 bile       = vec3(0.22, 0.55, 0.30);  // small green whisper mid-body
                    vec3 col = mix(deepViolet, hotMagenta, core);
                    // Bile-green peek through at high-noise pockets (necrotic feel).
                    col = mix(col, bile, smoothstep(0.55, 0.85, noise) * 0.35);
                    // FIELD-ENERGY green only tints the final stretch of the flight.
                    col = mix(col, vec3(0.35, 1.0, 0.55), smoothstep(0.80, 1.0, u_progress) * 0.55);
                    // Arrival flash toward white.
                    col = mix(col, vec3(1.0, 1.0, 0.95), u_arrival * 0.75);

                    float alpha = (shape + core * 0.4) * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Trail puff — small smoke clump left behind by a travelling mote. Shader is a
    // simpler, dimmer version of the mote shader: noise-shaped, violet-dominant, fading.
    // u_grow stretches the effective radius so the puff expands while it fades.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createPuffMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:     { value: 0 },
                u_alpha:    { value: 0.6 },
                u_progress: { value: 0 },  // spawning mote's progress; drives colour tint
                u_grow:     { value: 0 },  // 0 → 1 growth factor across puff lifetime
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
                uniform float u_grow;
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
                    for (int i = 0; i < 3; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
                    return v;
                }

                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    // Effective radius shrinks as u_grow rises, making the puff appear larger.
                    float effR = r / (1.0 + u_grow * 0.7);
                    float noise = fbm(v_uv * 3.2 + vec2(u_time * 0.8, 0.0));

                    float shape = (1.0 - smoothstep(0.2, 1.0, effR)) * (0.35 + noise * 0.75);

                    // Same violet-dominant palette as the mote, but dimmer and without a
                    // bright core — this is residual smoke, not active energy.
                    vec3 deepViolet = vec3(0.20, 0.02, 0.38);
                    vec3 hotMagenta = vec3(0.55, 0.08, 0.72);
                    vec3 col = mix(deepViolet, hotMagenta, noise * 0.7);
                    // Puffs near the end of the mote's path pick up a faint green hint.
                    col = mix(col, vec3(0.25, 0.65, 0.35), smoothstep(0.85, 1.0, u_progress) * 0.3);

                    gl_FragColor = vec4(col, clamp(shape * u_alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
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
