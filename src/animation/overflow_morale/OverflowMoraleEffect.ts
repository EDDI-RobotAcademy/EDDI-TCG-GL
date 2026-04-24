import * as THREE from "three";

// 넘쳐흐르는 사기 (Overflowing Morale) — powerful dark-essence transfer from the deck
// into the target ally. This is ONE OF THE STRONGER support cards (it effectively skips
// field-energy accumulation + unlocks freeze/dark-flame on the receiving unit) so the
// visual has to HIT HARD. Progression:
//
//   1) CHARGE (~420 ms) — aura blooms at the deck and pulses larger, while two dark
//      rings CONVERGE inward onto the deck centre. Reads as "summoning / gathering".
//   2) LAUNCH BURST (~180 ms) — a violent outward radial burst flashes from the deck at
//      mote release. Pops the screen.
//   3) MOTE FLIGHT (~640 ms per mote, 100 ms stagger) — large inky motes with bright
//      cold-violet inner cores streak along a bezier. Each leaves a shadowy trail.
//   4) IMPACT (per arrival) — outward TRIPLE SHOCKWAVE ring + bright impact flash +
//      inward shrink ring on the target, all firing simultaneously. The target "soaks up"
//      the essence visibly.
//   5) HALO LINGER (~520 ms) — a dark pulsing halo hangs on the target after the last
//      arrival before everything fades. The unit feels charged.
//   6) FADE (~360 ms).
export class OverflowMoraleEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        deckPos: THREE.Vector3,
        targetPos: THREE.Vector3,
        moteCount: number,
        onArrive: () => void,
    ): Promise<void> {
        // ─── Curve ────────────────────────────────────────────────────────────────
        const midX = (deckPos.x + targetPos.x) / 2;
        const midY = (deckPos.y + targetPos.y) / 2;
        const dx = targetPos.x - deckPos.x;
        const dy = targetPos.y - deckPos.y;
        const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const perpX = -dy / dist;
        const perpY =  dx / dist;
        const lift = dist * 0.22;
        const sign = perpY >= 0 ? 1 : -1;
        const curve = new THREE.QuadraticBezierCurve3(
            deckPos,
            new THREE.Vector3(midX + perpX * lift * sign, midY + perpY * lift * sign, deckPos.z),
            targetPos,
        );

        // ─── Gather aura at the deck (BIG) ────────────────────────────────────────
        const AURA_SIZE = 260;
        const aura = this.createGatherAuraMesh(AURA_SIZE);
        aura.position.copy(deckPos);
        aura.renderOrder = 500;
        this.scene.add(aura);
        const auraMat = aura.material as THREE.ShaderMaterial;

        const clockStart = performance.now();
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            auraMat.uniforms.u_time.value = (performance.now() - clockStart) / 1000;
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // Aura ignites.
        await this.tween(auraMat.uniforms.u_alpha, 1.0, 240, 'easeOutQuad');

        // ─── Charge — two converging rings + aura swell ──────────────────────────
        // Rings shrink INTO the deck centre (1.8x → 0.0 of AURA_SIZE). Staggered 110 ms
        // so you see two distinct sweeps. The aura also pulses larger during this window
        // so the deck visually "breathes in" energy before firing.
        this.spawnChargeRing(deckPos, AURA_SIZE * 1.9, 420);
        await this.delay(110);
        this.spawnChargeRing(deckPos, AURA_SIZE * 1.5, 360);
        // Aura swell — scale up ~22% then settle.
        void this.tweenScale(aura, 1.22, 280, 'easeOutQuad').then(() =>
            this.tweenScale(aura, 1.0, 180, 'easeInQuad')
        );
        await this.delay(260);

        // ─── Launch burst ─────────────────────────────────────────────────────────
        // Bright outward radial slam fired the instant motes leave the deck.
        this.spawnLaunchBurst(deckPos, AURA_SIZE * 2.6, 520);

        // ─── Motes ────────────────────────────────────────────────────────────────
        if (moteCount > 0) {
            const stagger = 100;
            const flightMs = 640;
            const motePromises: Promise<void>[] = [];
            for (let i = 0; i < moteCount; i++) {
                if (i > 0) await this.delay(stagger);
                motePromises.push(this.flyMote(curve, flightMs, onArrive, targetPos));
            }
            await Promise.all(motePromises);
        }

        // ─── Halo linger on target ────────────────────────────────────────────────
        if (moteCount > 0) {
            this.spawnHaloPulse(targetPos, 200, 520);
            await this.delay(360);
        }

        // ─── Fade aura ────────────────────────────────────────────────────────────
        await this.tween(auraMat.uniforms.u_alpha, 0.0, 360, 'easeInQuad');

        clockRunning = false;
        this.scene.remove(aura);
        this.disposeMesh(aura);
    }

    // One mote along the bezier. On arrival: onArrive() + outward triple shockwave +
    // impact flash + inward shrink ring, all simultaneous so the hit reads as a SLAM.
    private async flyMote(
        curve: THREE.QuadraticBezierCurve3,
        durationMs: number,
        onArrive: () => void,
        targetPos: THREE.Vector3,
    ): Promise<void> {
        const mote = this.createMoteMesh(64);
        mote.renderOrder = 520;
        mote.position.copy(curve.v0);
        this.scene.add(mote);
        const mat = mote.material as THREE.ShaderMaterial;

        const PUFF_INTERVAL = 38;
        let lastPuffMs = 0;

        const startMs = performance.now();
        await new Promise<void>((resolve) => {
            const step = () => {
                const now = performance.now();
                const t = Math.min(1, (now - startMs) / durationMs);
                // easeInQuad-ish on the back half so the mote ACCELERATES into the target
                // (instead of the gentle decel of easeInOutQuad). Hit feels heavier.
                const e = t < 0.5 ? 1.8 * t * t : 0.2 + 0.8 * (1 - Math.pow(1 - ((t - 0.5) * 2), 2));
                const p = curve.getPoint(e);
                mote.position.set(p.x, p.y, p.z);
                mat.uniforms.u_time.value = (now - startMs) / 1000;
                mat.uniforms.u_progress.value = e;

                if (now - lastPuffMs >= PUFF_INTERVAL) {
                    lastPuffMs = now;
                    this.spawnTrailPuff(mote.position.clone());
                }

                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        // IMPACT — fire them all at once for maximum thud.
        onArrive();
        this.spawnImpactFlash(targetPos, 220);
        this.spawnShockwaveRing(targetPos, 240, 380, 0);
        this.spawnShockwaveRing(targetPos, 300, 460, 80);
        this.spawnShockwaveRing(targetPos, 360, 540, 160);
        this.spawnShrinkRing(targetPos, 150, 380);

        await this.tween(mat.uniforms.u_alpha, 0.0, 120, 'easeInQuad');
        this.scene.remove(mote);
        this.disposeMesh(mote);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // One-shot spawners
    // ═══════════════════════════════════════════════════════════════════════════════

    // Inward-converging charge ring at the deck — radius shrinks from start → 0 as it
    // fades, so it reads as energy being INHALED into the deck.
    private spawnChargeRing(pos: THREE.Vector3, startSize: number, durationMs: number): void {
        const ring = this.createChargeRingMesh(startSize);
        ring.position.copy(pos);
        ring.renderOrder = 505;
        this.scene.add(ring);
        const mat = ring.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            // Alpha peaks mid-travel (0.5) so the ring fades IN then OUT.
            mat.uniforms.u_alpha.value = Math.sin(t * Math.PI);
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

    // Violent radial release burst at the deck when motes launch. Scales outward from
    // a small hot core to ~2.6× size, fading as it expands.
    private spawnLaunchBurst(pos: THREE.Vector3, maxSize: number, durationMs: number): void {
        const burst = this.createLaunchBurstMesh(maxSize);
        burst.position.copy(pos);
        burst.renderOrder = 510;
        this.scene.add(burst);
        const mat = burst.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            // Bright peak at t=0.2, then decay.
            mat.uniforms.u_alpha.value = t < 0.2 ? t / 0.2 : Math.pow(1 - (t - 0.2) / 0.8, 1.4);
            mat.uniforms.u_time.value = (performance.now() - startMs) / 1000;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                this.scene.remove(burst);
                this.disposeMesh(burst);
            }
        };
        requestAnimationFrame(step);
    }

    // Outward shockwave ring at the target on mote impact. Expands from near-zero to
    // ~1.5× its plane size, fading. Stack three of these with staggered delays for a
    // thicker triple-wave slam.
    private spawnShockwaveRing(
        pos: THREE.Vector3,
        baseSize: number,
        durationMs: number,
        delayMs: number,
    ): void {
        const fire = () => {
            const ring = this.createShockwaveRingMesh(baseSize);
            ring.position.copy(pos);
            ring.renderOrder = 527;
            this.scene.add(ring);
            const mat = ring.material as THREE.ShaderMaterial;

            const startMs = performance.now();
            const step = () => {
                const t = Math.min(1, (performance.now() - startMs) / durationMs);
                mat.uniforms.u_progress.value = t;
                // Quick rise, gradual fall — shockwave slam feel.
                mat.uniforms.u_alpha.value = t < 0.15 ? t / 0.15 : 1.0 - (t - 0.15) / 0.85;
                mat.uniforms.u_time.value = (performance.now() - startMs) / 1000;
                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    this.scene.remove(ring);
                    this.disposeMesh(ring);
                }
            };
            requestAnimationFrame(step);
        };
        if (delayMs > 0) setTimeout(fire, delayMs);
        else fire();
    }

    // Bright cold-violet flash at the target — paired with the shockwave for a big pop.
    private spawnImpactFlash(pos: THREE.Vector3, durationMs: number): void {
        const flash = this.createImpactFlashMesh(180);
        flash.position.copy(pos);
        flash.renderOrder = 530;
        this.scene.add(flash);
        const mat = flash.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            // Peak at t=0.1, decay sharply after.
            mat.uniforms.u_alpha.value = t < 0.1 ? t / 0.1 : Math.pow(1 - (t - 0.1) / 0.9, 2.0);
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

    // Dark halo that pulses around the target after the last mote arrives — "empowered"
    // state hold before the aura fades and everything disposes.
    private spawnHaloPulse(pos: THREE.Vector3, size: number, durationMs: number): void {
        const halo = this.createHaloPulseMesh(size);
        halo.position.copy(pos);
        halo.renderOrder = 518;
        this.scene.add(halo);
        const mat = halo.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            mat.uniforms.u_alpha.value = Math.sin(t * Math.PI) * 0.9;
            mat.uniforms.u_time.value = (performance.now() - startMs) / 1000;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                this.scene.remove(halo);
                this.disposeMesh(halo);
            }
        };
        requestAnimationFrame(step);
    }

    private spawnShrinkRing(pos: THREE.Vector3, size: number, durationMs: number): void {
        const ring = this.createShrinkRingMesh(size);
        ring.position.copy(pos);
        ring.renderOrder = 525;
        this.scene.add(ring);
        const mat = ring.material as THREE.ShaderMaterial;

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            mat.uniforms.u_alpha.value = 1.0 - t;
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

    private spawnTrailPuff(pos: THREE.Vector3): void {
        const puff = this.createPuffMesh(34);
        puff.position.copy(pos);
        puff.renderOrder = 515;
        this.scene.add(puff);
        const mat = puff.material as THREE.ShaderMaterial;

        const DURATION = 500;
        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / DURATION);
            mat.uniforms.u_alpha.value = (1 - t) * 0.7;
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
    // Gather aura — inward-spiralling dark cloud at the deck. Same design as before;
    // just drawn bigger so the charge phase occupies more screen real estate.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createGatherAuraMesh(size: number): THREE.Mesh {
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
                    float t = u_time;
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float ang = atan(c.y, c.x);
                    float swirl = ang - t * 3.0 - (1.0 - r) * 5.8;
                    vec2 sq = vec2(cos(swirl), sin(swirl)) * r * 2.0;

                    float n1 = fbm(sq * 2.2 + vec2(-t * 0.9, 0.0));
                    float n2 = fbm(sq * 5.0 + vec2(2.4, -t * 1.2));
                    float density = n1 * 0.7 + n2 * 0.3;

                    float radial = 1.0 - smoothstep(0.08, 1.0, r);
                    density *= radial;

                    vec3 abyss      = vec3(0.01, 0.00, 0.05);
                    vec3 indigoDark = vec3(0.09, 0.04, 0.22);
                    vec3 indigo     = vec3(0.22, 0.12, 0.42);
                    vec3 coldViolet = vec3(0.45, 0.28, 0.72);
                    vec3 col = mix(abyss, indigoDark, smoothstep(0.05, 0.30, density));
                    col = mix(col, indigo,     smoothstep(0.30, 0.55, density));
                    col = mix(col, coldViolet, smoothstep(0.60, 0.92, density));

                    float shadow = fbm(sq * 1.3 + vec2(5.0, 0.0));
                    col *= mix(1.0, 0.50, smoothstep(0.55, 0.85, shadow) * density);

                    float a = smoothstep(0.08, 0.72, density) * u_alpha;
                    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Charge ring — dark ring whose radius shrinks INTO the deck centre as it
    // progresses. Slight angular flicker so it doesn't look static.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createChargeRingMesh(size: number): THREE.Mesh {
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
                    float ringR = mix(0.95, 0.05, u_progress);
                    float thickness = 0.08;
                    float ring = smoothstep(thickness, 0.0, abs(r - ringR));

                    float flick = 0.20 * sin(atan(c.y, c.x) * 8.0 + u_time * 12.0);
                    ring *= (0.85 + flick);

                    vec3 col = vec3(0.55, 0.35, 0.88);  // bright cold-violet
                    gl_FragColor = vec4(col, clamp(ring * u_alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Launch burst — bright radial flash at the deck when motes fire. Expanding hot
    // core with ray-like streaks. Additive blending so it POPS against the dark aura.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createLaunchBurstMesh(size: number): THREE.Mesh {
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
                    float ang = atan(c.y, c.x);

                    // Core expands outward with progress; fades radially.
                    float coreR = mix(0.10, 1.0, u_progress);
                    float core = smoothstep(coreR, 0.0, r) * (1.0 - u_progress * 0.5);

                    // Ray streaks — 12 equally spaced rays that rotate slowly.
                    float rays = 0.5 + 0.5 * cos(ang * 12.0 + u_time * 2.0);
                    rays = pow(rays, 6.0);
                    float rayFalloff = smoothstep(1.1, 0.15, r) * (1.0 - u_progress * 0.6);
                    float rayGlow = rays * rayFalloff;

                    float intensity = core * 1.2 + rayGlow * 0.9;

                    // Bright cold-violet body, near-white hot core.
                    vec3 violetHot = vec3(0.72, 0.52, 1.00);
                    vec3 white     = vec3(1.00, 0.96, 1.00);
                    vec3 col = mix(violetHot, white, core * 0.7);

                    float alpha = intensity * u_alpha;
                    gl_FragColor = vec4(col * (0.6 + intensity * 0.8), clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Shockwave ring — outward-expanding cold-violet ring on target impact. Thicker
    // than the shrink ring + additive blending so the slam reads hard.
    // ═══════════════════════════════════════════════════════════════════════════════
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
                    // Ring expands 0.08 → 1.1 across lifetime, thickness stays constant.
                    float ringR = mix(0.08, 1.1, u_progress);
                    float thickness = 0.12 * (1.0 - u_progress * 0.3);
                    float ring = smoothstep(thickness, 0.0, abs(r - ringR));

                    vec3 col = vec3(0.55, 0.35, 0.90);
                    float alpha = ring * u_alpha * 1.2;
                    gl_FragColor = vec4(col * (1.0 + ring * 0.5), clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Impact flash — bright near-white cold-violet burst at the target on arrival.
    // Additive, short-lived, bright peak.
    // ═══════════════════════════════════════════════════════════════════════════════
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
                    glow = pow(glow, 1.6);

                    vec3 white  = vec3(1.00, 0.96, 1.00);
                    vec3 violet = vec3(0.65, 0.42, 0.95);
                    vec3 col = mix(violet, white, glow * 0.6);

                    gl_FragColor = vec4(col * (1.0 + glow * 0.8), clamp(glow * u_alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Halo pulse — dark cold-violet aura around the target after absorption. Ring
    // expands slightly while dimming so it reads as a lingering empowered state.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createHaloPulseMesh(size: number): THREE.Mesh {
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

                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;

                    float ringR = mix(0.55, 0.85, u_progress);
                    float thickness = 0.28;
                    float halo = smoothstep(thickness, 0.0, abs(r - ringR));
                    halo = pow(halo, 1.3);

                    // Soft breathing shimmer — sin modulates intensity.
                    float shimmer = 0.85 + 0.15 * sin(u_time * 5.0);
                    halo *= shimmer;

                    vec3 col = vec3(0.38, 0.22, 0.62);
                    gl_FragColor = vec4(col, clamp(halo * u_alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Mote — inky shadow glob with BRIGHT cold-violet inner core. Bigger than before
    // (64 vs 42) and with a hotter core so it reads as a heavy charged projectile
    // rather than a gentle puff.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createMoteMesh(size: number): THREE.Mesh {
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
                    float swirl = ang + u_time * 5.0 + (1.0 - r) * 3.2;
                    vec2 sq = vec2(cos(swirl), sin(swirl)) * r * 2.2;
                    float noise = fbm(sq * 2.2 + vec2(u_time * 0.7, 0.0));

                    float shape = (1.0 - smoothstep(0.15, 1.0, r)) * (0.55 + noise * 0.80);
                    // BRIGHT core — hotter than v1 so the mote feels charged.
                    float core  = smoothstep(0.34, 0.0, r) * (0.85 + noise * 0.40);
                    // Inner hot spot — tiny near-white point at centre.
                    float hotspot = smoothstep(0.14, 0.0, r);

                    vec3 abyss      = vec3(0.02, 0.01, 0.08);
                    vec3 indigo     = vec3(0.18, 0.10, 0.38);
                    vec3 coldViolet = vec3(0.55, 0.32, 0.85);
                    vec3 white      = vec3(0.95, 0.88, 1.00);
                    vec3 col = mix(abyss, indigo, core);
                    col = mix(col, coldViolet, smoothstep(0.50, 0.90, noise + core * 0.5));
                    col = mix(col, white, hotspot * 0.85);

                    float alpha = (shape + core * 0.5 + hotspot * 0.4) * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    private createPuffMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 0.6 },
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
                float fbm(vec2 p) {
                    float v = 0.0; float a = 0.5;
                    for (int i = 0; i < 3; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
                    return v;
                }

                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float effR = r / (1.0 + u_grow * 0.65);
                    float noise = fbm(v_uv * 3.2 + vec2(u_time * 0.6, 0.0));
                    float shape = (1.0 - smoothstep(0.2, 1.0, effR)) * (0.30 + noise * 0.75);

                    vec3 abyss  = vec3(0.03, 0.02, 0.10);
                    vec3 indigo = vec3(0.24, 0.12, 0.38);
                    vec3 col = mix(abyss, indigo, noise * 0.7);

                    gl_FragColor = vec4(col, clamp(shape * u_alpha, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(size, size);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Shrink ring — inward-closing ring at target, fires alongside the shockwave for
    // contrast ("gathering in" + "shockwave out" simultaneously = dramatic absorption).
    // ═══════════════════════════════════════════════════════════════════════════════
    private createShrinkRingMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
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
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float ringR = mix(1.0, 0.15, u_progress);
                    float thickness = 0.14;
                    float ring = smoothstep(thickness, 0.0, abs(r - ringR));
                    float wobble = 0.04 * sin(atan(c.y, c.x) * 6.0 + u_time * 8.0);
                    ring *= (0.85 + wobble);

                    vec3 coldViolet = vec3(0.50, 0.30, 0.82);
                    gl_FragColor = vec4(coldViolet, clamp(ring * u_alpha, 0.0, 1.0));
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

    // Scales the full mesh uniformly. Used for the aura charge swell.
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
