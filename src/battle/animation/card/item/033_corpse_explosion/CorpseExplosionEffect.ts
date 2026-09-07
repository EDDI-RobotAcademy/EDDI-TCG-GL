import * as THREE from "three";

// 시체 폭발 (Corpse Explosion) — the sacrificed undead corpse hurls itself toward the
// opponent field, the world rumbles, then it explodes; explosion projectiles fly out
// to each picked enemy target. Four phases:
//
//   1) FLY (~700 ms) — the sacrificed unit's mesh translates from its placed slot to a
//      landing position over the opponent field along a quadratic bezier arc. Slight
//      tumble (z-rotation) + scale pulse. Canvas shake ramps from gentle to medium.
//   2) EXPLODE (~360 ms) — at the landing point: bright crimson/violet shockwave +
//      impact flash + corpse mesh fades + scales away. Canvas shake spikes.
//   3) PROJECTILES (~520 ms each, 80 ms stagger) — N projectiles fan out from the
//      explosion centre toward N target positions (one per pick). Each leaves a
//      trail of dark wisps; on arrival fires onProjectileLand(idx).
//   4) SETTLE (~280 ms) — canvas shake decays to zero, all meshes dispose.
//
// Signature: play(corpseGroup, landingPos, projectileTargets, canvasElement, onProjectileLand).
//   - corpseGroup:        the sacrificed unit's THREE.Group (animated in place, NOT
//                         disposed by this effect — caller owns disposal afterward).
//   - landingPos:         world-space centre of the opponent field (impact site).
//   - projectileTargets:  one Vector3 per pick, in order. May contain duplicates if the
//                         same target was picked twice.
//   - canvasElement:      the Three.js renderer canvas for screen-wide shake.
//   - onProjectileLand:   fires per projectile arrival; pilot uses it for flash + book-
//                         keeping in sync with the visible impact.
export class CorpseExplosionEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        corpseGroup: THREE.Group,
        landingPos: THREE.Vector3,
        projectileTargets: readonly THREE.Vector3[],
        canvasElement: HTMLElement,
        onProjectileLand: (idx: number) => void,
    ): Promise<void> {
        // Save canvas inline transform so SETTLE can restore it.
        const origTransform = canvasElement.style.transform;

        // Canvas shake amplitude — mutated between phases, read every RAF.
        const shakeAmp = { value: 0 };
        const stopShake = this.startElementShake(canvasElement, shakeAmp);

        // Shared clock for shader u_time uniforms.
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

        // ── PHASE 1: FLY ───────────────────────────────────────────────────────────
        const startPos = corpseGroup.position.clone();
        // Bezier control: midpoint pushed perpendicular for a thrown-arc feel.
        const midX = (startPos.x + landingPos.x) / 2;
        const midY = (startPos.y + landingPos.y) / 2;
        const dx = landingPos.x - startPos.x;
        const dy = landingPos.y - startPos.y;
        const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const perpX = -dy / dist;
        const perpY =  dx / dist;
        // Always lift UP (positive world y) — a thrown corpse arcs over.
        const lift = dist * 0.30;
        const sign = perpY >= 0 ? 1 : -1;
        const flightCurve = new THREE.QuadraticBezierCurve3(
            startPos,
            new THREE.Vector3(midX + perpX * lift * sign, midY + perpY * lift * sign, startPos.z),
            landingPos,
        );

        const FLY_MS = 700;
        const initialScale = corpseGroup.scale.x;
        const initialRotation = corpseGroup.rotation.z;
        shakeAmp.value = 2.0;
        const flyStart = performance.now();
        await new Promise<void>((resolve) => {
            const step = () => {
                const now = performance.now();
                const t = Math.min(1, (now - flyStart) / FLY_MS);
                // easeInOutQuad — slow lift, fast mid, decelerate into landing.
                const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                const p = flightCurve.getPoint(e);
                corpseGroup.position.set(p.x, p.y, p.z);
                // Tumble: full rotation by midpoint, settle at landing.
                corpseGroup.rotation.z = initialRotation + e * Math.PI * 1.5;
                // Scale pulse — slightly larger mid-flight, back to start at landing.
                const sBoost = 1.0 + Math.sin(e * Math.PI) * 0.15;
                corpseGroup.scale.set(initialScale * sBoost, initialScale * sBoost, 1);
                // Shake ramps from 2 → 6 across the flight.
                shakeAmp.value = 2.0 + e * 4.0;
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        // Settle rotation + scale at landing for a clean explosion frame.
        corpseGroup.rotation.z = initialRotation;
        corpseGroup.scale.set(initialScale, initialScale, 1);

        // ── PHASE 2: EXPLODE ───────────────────────────────────────────────────────
        shakeAmp.value = 12.0;
        const EXPLODE_SIZE = Math.max(220, Math.min(window.innerWidth, window.innerHeight) * 0.28);

        // Shockwave ring expanding outward.
        this.spawnExplosionShockwave(landingPos, EXPLODE_SIZE * 1.6, 480, tickClocks);
        // Bright impact flash at the centre.
        this.spawnImpactFlash(landingPos, EXPLODE_SIZE, 280, tickClocks);
        // 8 dark fragment shards radiating outward.
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            const speed = EXPLODE_SIZE * (1.4 + Math.random() * 0.8);
            const spin = (Math.random() - 0.5) * 8.0;
            this.spawnFragment(landingPos, angle, speed, spin, 540, tickClocks);
        }

        // Corpse mesh fades + scales out as the explosion peaks.
        void this.tweenScale(corpseGroup, initialScale * 0.2, 280, 'easeInQuad');
        const corpseMatFades = this.collectMaterialOpacities(corpseGroup);
        void this.fadeOpacities(corpseMatFades, 0.0, 280, 'easeInQuad');

        await this.delay(360);

        // ── PHASE 3: PROJECTILES ───────────────────────────────────────────────────
        shakeAmp.value = 6.0;
        const PROJECTILE_FLIGHT_MS = 520;
        const projectilePromises: Promise<void>[] = [];
        for (let i = 0; i < projectileTargets.length; i++) {
            if (i > 0) await this.delay(80);
            const idx = i;  // capture index
            projectilePromises.push(this.flyProjectile(
                landingPos,
                projectileTargets[i],
                PROJECTILE_FLIGHT_MS,
                () => onProjectileLand(idx),
                tickClocks,
                shakeAmp,
            ));
        }
        await Promise.all(projectilePromises);

        // ── PHASE 4: SETTLE ────────────────────────────────────────────────────────
        const settleStart = performance.now();
        const SETTLE_MS = 280;
        const settleStep = () => {
            const t = Math.min(1, (performance.now() - settleStart) / SETTLE_MS);
            shakeAmp.value = 6.0 * (1 - t);
            if (t < 1) requestAnimationFrame(settleStep);
        };
        requestAnimationFrame(settleStep);
        await this.delay(SETTLE_MS);

        stopShake();
        canvasElement.style.transform = origTransform;
        clockRunning = false;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Per-projectile flight
    // ═══════════════════════════════════════════════════════════════════════════════
    private async flyProjectile(
        sourcePos: THREE.Vector3,
        targetPos: THREE.Vector3,
        durationMs: number,
        onLand: () => void,
        tickClocks: Set<THREE.ShaderMaterial>,
        shakeAmp: { value: number },
    ): Promise<void> {
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        const dist = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
        const perpX = -dy / dist;
        const perpY =  dx / dist;
        const lift = dist * 0.16 * (Math.random() > 0.5 ? 1 : -1);
        const curve = new THREE.QuadraticBezierCurve3(
            sourcePos,
            new THREE.Vector3(midX + perpX * lift, midY + perpY * lift, sourcePos.z),
            targetPos,
        );

        // Two stacked meshes: an additive HALO glow surrounding a denser dark-core
        // body. Together they read as a heavy charged comet rather than a small puff.
        const PROJECTILE_SIZE = 78;
        const projectile = this.createProjectileMesh(PROJECTILE_SIZE);
        projectile.position.copy(sourcePos);
        projectile.renderOrder = 540;
        this.scene.add(projectile);
        const mat = projectile.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        const halo = this.createProjectileHaloMesh(PROJECTILE_SIZE * 1.7);
        halo.position.copy(sourcePos);
        halo.renderOrder = 539;  // behind the dense body so the body sits inside the glow
        this.scene.add(halo);
        const haloMat = halo.material as THREE.ShaderMaterial;
        tickClocks.add(haloMat);

        const PUFF_INTERVAL = 38;  // denser trail for a heavier projectile
        let lastPuffMs = 0;

        const startMs = performance.now();
        await new Promise<void>((resolve) => {
            const step = () => {
                const now = performance.now();
                const t = Math.min(1, (now - startMs) / durationMs);
                // Accelerate into target so the impact reads heavy.
                const e = t * t;
                const p = curve.getPoint(e);
                projectile.position.set(p.x, p.y, p.z);
                halo.position.set(p.x, p.y, p.z);
                if (now - lastPuffMs >= PUFF_INTERVAL) {
                    lastPuffMs = now;
                    this.spawnTrailPuff(projectile.position.clone(), tickClocks);
                }
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        // ─── IMPACT — multi-element slam ────────────────────────────────────────
        onLand();

        // Brief screen-shake spike — captures previous level so it auto-decays back.
        const prevShake = shakeAmp.value;
        shakeAmp.value = Math.max(prevShake, 14.0);
        setTimeout(() => { shakeAmp.value = Math.max(0, prevShake); }, 160);

        // Big bright flash + outward shockwave + 5 mini fragment shards. Sized off
        // the projectile so two same-target hits look like cumulative damage.
        this.spawnImpactFlash(targetPos, 240, 320, tickClocks);
        this.spawnExplosionShockwave(targetPos, 260, 420, tickClocks);
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const speed = 200 + Math.random() * 140;
            const spin  = (Math.random() - 0.5) * 6.0;
            this.spawnFragment(targetPos, angle, speed, spin, 460, tickClocks);
        }

        // Projectile + halo dissipate into the impact.
        await Promise.all([
            this.tween(mat.uniforms.u_alpha, 0.0, 140, 'easeInQuad'),
            this.tween(haloMat.uniforms.u_alpha, 0.0, 140, 'easeInQuad'),
        ]);

        tickClocks.delete(mat);
        tickClocks.delete(haloMat);
        this.scene.remove(projectile);
        this.disposeMesh(projectile);
        this.scene.remove(halo);
        this.disposeMesh(halo);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // One-shot spawners
    // ═══════════════════════════════════════════════════════════════════════════════
    private spawnExplosionShockwave(
        origin: THREE.Vector3,
        size: number,
        durationMs: number,
        tickClocks: Set<THREE.ShaderMaterial>,
    ): void {
        const ring = this.createShockwaveRingMesh(size);
        ring.position.copy(origin);
        ring.renderOrder = 535;
        this.scene.add(ring);
        const mat = ring.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / durationMs);
            mat.uniforms.u_progress.value = t;
            mat.uniforms.u_alpha.value = t < 0.10 ? t / 0.10 : 1.0 - (t - 0.10) / 0.90;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                tickClocks.delete(mat);
                this.scene.remove(ring);
                this.disposeMesh(ring);
            }
        };
        requestAnimationFrame(step);
    }

    private spawnImpactFlash(
        origin: THREE.Vector3,
        size: number,
        durationMs: number,
        tickClocks: Set<THREE.ShaderMaterial>,
    ): void {
        const flash = this.createImpactFlashMesh(size);
        flash.position.copy(origin);
        flash.renderOrder = 542;
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

    private spawnFragment(
        origin: THREE.Vector3,
        angle: number,
        speed: number,
        spin: number,
        durationMs: number,
        tickClocks: Set<THREE.ShaderMaterial>,
    ): void {
        const size = 16 + Math.random() * 14;
        const shard = this.createFragmentMesh(size);
        shard.position.copy(origin);
        shard.renderOrder = 538;
        this.scene.add(shard);
        const mat = shard.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const startMs = performance.now();
        const step = () => {
            const now = performance.now();
            const t = Math.min(1, (now - startMs) / durationMs);
            const travel = 1 - Math.pow(1 - t, 2);
            shard.position.x = origin.x + vx * travel;
            shard.position.y = origin.y + vy * travel;
            shard.rotation.z = spin * t;
            mat.uniforms.u_alpha.value = 1 - Math.pow(t, 1.4);
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                tickClocks.delete(mat);
                this.scene.remove(shard);
                this.disposeMesh(shard);
            }
        };
        requestAnimationFrame(step);
    }

    private spawnTrailPuff(
        pos: THREE.Vector3,
        tickClocks: Set<THREE.ShaderMaterial>,
    ): void {
        const puff = this.createTrailPuffMesh(28);
        puff.position.copy(pos);
        puff.renderOrder = 537;
        this.scene.add(puff);
        const mat = puff.material as THREE.ShaderMaterial;
        tickClocks.add(mat);

        const DURATION = 480;
        const startMs = performance.now();
        const step = () => {
            const t = Math.min(1, (performance.now() - startMs) / DURATION);
            mat.uniforms.u_alpha.value = (1 - t) * 0.65;
            mat.uniforms.u_grow.value = t;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                tickClocks.delete(mat);
                this.scene.remove(puff);
                this.disposeMesh(puff);
            }
        };
        requestAnimationFrame(step);
    }

    // Element shake with dynamic amplitude.
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

    // Fade opacity tween across multiple materials in lockstep.
    private collectMaterialOpacities(group: THREE.Group): Array<{ mat: THREE.Material; from: number }> {
        const out: Array<{ mat: THREE.Material; from: number }> = [];
        group.traverse((obj) => {
            if (!(obj instanceof THREE.Mesh) || !obj.material) return;
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            for (const m of mats) {
                if ('opacity' in m && 'transparent' in m) {
                    (m as THREE.Material & { transparent: boolean }).transparent = true;
                    out.push({ mat: m, from: (m as THREE.Material & { opacity: number }).opacity });
                }
            }
        });
        return out;
    }

    private fadeOpacities(
        opacities: Array<{ mat: THREE.Material; from: number }>,
        target: number,
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
                for (const o of opacities) {
                    (o.mat as THREE.Material & { opacity: number }).opacity = o.from + (target - o.from) * v;
                }
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Mesh factories
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
                    float ringR = mix(0.06, 1.05, u_progress);
                    float thickness = 0.13 * (1.0 - u_progress * 0.3);
                    float ring = smoothstep(thickness, 0.0, abs(r - ringR));

                    vec3 col = vec3(0.85, 0.30, 0.45);  // crimson-violet
                    float alpha = ring * u_alpha * 1.2;
                    gl_FragColor = vec4(col * (1.0 + ring * 0.5), clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
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
                    float glow = smoothstep(0.92, 0.0, r);
                    glow = pow(glow, 1.7);
                    vec3 white   = vec3(1.00, 0.92, 0.88);
                    vec3 crimson = vec3(0.92, 0.32, 0.45);
                    vec3 col = mix(crimson, white, glow * 0.55);
                    gl_FragColor = vec4(col * (1.0 + glow * 0.7), clamp(glow * u_alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    private createFragmentMesh(size: number): THREE.Mesh {
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
                    // Elongated dart silhouette.
                    vec2 c = v_uv - 0.5;
                    float d1 = abs(c.y) - 0.42 * (0.5 + 0.5 * (1.0 - abs(c.x) * 2.0));
                    float d2 = abs(c.x) - 0.48;
                    float inside = 1.0 - smoothstep(-0.02, 0.04, max(d1, d2));
                    float edge = 1.0 - smoothstep(0.0, 0.05, abs(c.y + 0.02));
                    vec3 abyss   = vec3(0.04, 0.01, 0.05);
                    vec3 crimson = vec3(0.45, 0.08, 0.15);
                    vec3 col = mix(abyss, crimson, edge * inside);
                    float alpha = inside * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size * 2.4, size), material);
    }

    // Projectile — heavy charged comet. Bigger than v1 with a brighter hot core and a
    // searing white-hot centre. Additive blending so it stacks on top of the halo
    // behind it, producing a very bright impact-projectile read against any background.
    private createProjectileMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
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
                    float ang = atan(c.y, c.x);
                    // Faster swirl + denser noise for a more violent surface.
                    float swirl = ang + u_time * 6.5;
                    vec2 sq = vec2(cos(swirl), sin(swirl)) * r * 2.0;
                    float noise = vnoise(sq * 2.4 + vec2(u_time * 0.8, 0.0));

                    // Outer body — broad coverage.
                    float shape   = (1.0 - smoothstep(0.10, 1.0, r)) * (0.70 + noise * 0.55);
                    // Hot inner core — much wider than v1 (0.45 vs 0.32) + higher base.
                    float core    = smoothstep(0.45, 0.0, r) * (1.05 + noise * 0.30);
                    // Searing white-hot centre point.
                    float hotspot = smoothstep(0.18, 0.0, r) * 1.20;

                    // Pulse so the projectile feels charged, not static.
                    float pulse = 0.85 + 0.15 * sin(u_time * 8.0);

                    vec3 crimson = vec3(0.78, 0.18, 0.28);
                    vec3 hot     = vec3(1.00, 0.62, 0.45);
                    vec3 white   = vec3(1.00, 0.94, 0.88);
                    vec3 col = mix(crimson, hot, core);
                    col = mix(col, white, hotspot * 0.95);
                    col *= pulse;

                    float alpha = (shape * 0.85 + core * 0.6 + hotspot * 0.5) * u_alpha;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    // Projectile halo — additive crimson-violet glow surrounding the dense projectile
    // body. Sits on a SLIGHTLY larger plane and renders BEHIND the body so the dark
    // body is silhouetted against the glow. Pulses at ~3 Hz to feel "charged".
    private createProjectileHaloMesh(size: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
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
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    // Soft radial falloff — peaks at the centre, gone by the rim.
                    float glow = smoothstep(1.0, 0.0, r);
                    glow = pow(glow, 1.6);
                    // Pulse modulates intensity so the halo feels alive.
                    float pulse = 0.78 + 0.22 * sin(u_time * 6.0);
                    vec3 crimson = vec3(0.85, 0.20, 0.32);
                    vec3 violet  = vec3(0.62, 0.18, 0.55);
                    vec3 col = mix(violet, crimson, glow);
                    float alpha = glow * pulse * u_alpha * 0.85;
                    gl_FragColor = vec4(col * (0.9 + glow * 0.6), clamp(alpha, 0.0, 1.0));
                }
            `,
        });
        return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    }

    private createTrailPuffMesh(size: number): THREE.Mesh {
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

                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float effR = r / (1.0 + u_grow * 0.6);
                    float noise = vnoise(v_uv * 3.0 + vec2(u_time * 0.6, 0.0));
                    float shape = (1.0 - smoothstep(0.2, 1.0, effR)) * (0.30 + noise * 0.75);
                    vec3 abyss = vec3(0.03, 0.01, 0.06);
                    vec3 crim  = vec3(0.30, 0.06, 0.14);
                    vec3 col = mix(abyss, crim, noise * 0.6);
                    gl_FragColor = vec4(col, clamp(shape * u_alpha, 0.0, 1.0));
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
