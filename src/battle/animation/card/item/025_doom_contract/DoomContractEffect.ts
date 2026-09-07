import * as THREE from "three";

// 파멸의 계약 (Contract of Doom) — visual effect with TRUE screen-space warp.
//
// The world is rendered into a render target, then sampled by a warp shader that pinches
// UVs toward the book (radial pull ∝ 1/r²) and twists them tangentially (spiral) with
// extra FBM "crumple" displacement on top — so space itself visibly crushes into the
// grimoire before it explodes.
//
// Pipeline during play():
//   main scene  → render target (captures everything EXCEPT the book / vortex / overlay)
//   warp shader → samples target, distorts UVs based on u_warpStrength, writes to screen
//   overlay scene → book / vortex / flash drawn directly on top (unwarped, so the book is
//                   the still centre of the collapse)
//
// After play() the override is uninstalled and rendering reverts to a single pass.
export class DoomContractEffect {
    constructor(
        private readonly scene: THREE.Scene,
        private readonly renderer: THREE.WebGLRenderer,
        private readonly camera: THREE.Camera,
        private readonly animationLoop: {
            setRenderOverride: (
                fn: ((scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => void) | null,
            ) => void;
        },
    ) {}

    public async play(): Promise<void> {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // ── Overlay scene for effect meshes so they aren't sampled by the warp shader.
        // Uses the same camera as the main scene (passed in).
        const overlayScene = new THREE.Scene();

        // ── Book mesh. Position (0, 0, 0) in overlay scene; since the main camera looks at
        // origin, this lands in screen centre.
        const bookW = w * 0.15;
        const bookH = bookW * 1.10;
        const book = this.createBookMesh(bookW, bookH);
        book.position.set(0, 0, 0);
        book.renderOrder = 2;
        overlayScene.add(book);
        const bookMat = book.material as THREE.ShaderMaterial;

        // ── Vortex (swirling dark energy halo behind the book).
        const vortexSize = Math.max(w, h) * 1.10;
        const vortex = this.createVortexMesh(vortexSize, vortexSize);
        vortex.position.set(0, 0, -0.5);
        vortex.renderOrder = 1;
        overlayScene.add(vortex);
        const vortexMat = vortex.material as THREE.ShaderMaterial;

        // ── Flash/boom overlay (full-screen; explodes outward on impact).
        const flash = this.createFlashMesh(w * 2.5, h * 2.5);
        flash.position.set(0, 0, 0.5);
        flash.renderOrder = 3;
        overlayScene.add(flash);
        const flashMat = flash.material as THREE.ShaderMaterial;

        // ── Render target + warp quad.
        const pixelRatio = this.renderer.getPixelRatio();
        const target = new THREE.WebGLRenderTarget(
            Math.floor(w * pixelRatio),
            Math.floor(h * pixelRatio),
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                depthBuffer: true,
                stencilBuffer: false,
            },
        );
        target.texture.colorSpace = THREE.SRGBColorSpace;

        // Separate tiny scene + ortho camera for the full-screen warp quad. The quad covers
        // NDC (-1, 1)² and uses v_uv directly.
        const warpScene = new THREE.Scene();
        const warpCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const warpQuad = this.createWarpQuad(target.texture);
        warpScene.add(warpQuad);
        const warpMat = warpQuad.material as THREE.ShaderMaterial;

        // Shared clock.
        const clockStart = performance.now();
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            const t = (performance.now() - clockStart) / 1000;
            bookMat.uniforms.u_time.value = t;
            vortexMat.uniforms.u_time.value = t;
            flashMat.uniforms.u_time.value = t;
            warpMat.uniforms.u_time.value = t;
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // ── Install render override. Runs on every animation-loop frame until removed.
        // Behaviour:
        //   1) If warp is active, render main scene → target → warp quad → screen.
        //   2) Else render main scene directly to screen.
        //   3) Always draw overlay scene on top without clearing (autoClear = false).
        this.animationLoop.setRenderOverride((mainScene, camera, renderer) => {
            const prevAutoClear = renderer.autoClear;
            const prevTarget = renderer.getRenderTarget();
            if (warpMat.uniforms.u_warpStrength.value > 0.001) {
                // Scene → target
                renderer.setRenderTarget(target);
                renderer.clear();
                renderer.render(mainScene, camera);
                // Target → warp shader → screen
                renderer.setRenderTarget(prevTarget);
                renderer.autoClear = true;
                renderer.render(warpScene, warpCamera);
            } else {
                renderer.setRenderTarget(prevTarget);
                renderer.autoClear = true;
                renderer.render(mainScene, camera);
            }
            // Overlay (book + vortex + flash) on top — never warped.
            renderer.autoClear = false;
            renderer.render(overlayScene, camera);
            renderer.autoClear = prevAutoClear;
        });

        try {
            // ─── Phase 1 — Book emerges, vortex quickens. ─────────────────────────
            await Promise.all([
                this.tweenUniform(bookMat.uniforms.u_alpha, 1.0, 300, 'easeOutQuad'),
                this.tweenUniform(bookMat.uniforms.u_glow,  0.55, 350, 'easeOutQuad'),
                this.tweenUniform(vortexMat.uniforms.u_alpha, 0.55, 350, 'easeOutQuad'),
            ]);

            // ─── Phase 2 — Cataclysmic scene shake + vortex deepens. ─────────────
            void this.shakeSceneEscalating([
                { amplitude: w * 0.020, duration: 180 },
                { amplitude: w * 0.040, duration: 200 },
                { amplitude: w * 0.015, duration: 120 },
            ]);
            await Promise.all([
                this.tweenUniform(vortexMat.uniforms.u_alpha, 1.0, 400, 'easeInOutQuad'),
                this.tweenUniform(vortexMat.uniforms.u_spin,  1.0, 500, 'easeInQuad'),
                this.tweenUniform(bookMat.uniforms.u_glow,    0.9, 500, 'easeInQuad'),
                // Start the warp subtly so the transition into phase 3 feels like space
                // slowly beginning to buckle.
                this.tweenUniform(warpMat.uniforms.u_warpStrength, 0.35, 500, 'easeInQuad'),
                this.tweenUniform(warpMat.uniforms.u_crumple,      0.25, 500, 'easeInQuad'),
            ]);

            // ─── Phase 3 — Space crumples INTO the book. ─────────────────────────
            // Warp strength climbs hard; crumple noise adds non-uniform pinches so space
            // visibly distorts rather than just shrinking. Tangential spin makes it spiral.
            await Promise.all([
                this.tweenUniform(warpMat.uniforms.u_warpStrength, 1.0, 700, 'easeInQuad'),
                this.tweenUniform(warpMat.uniforms.u_spin,         1.0, 700, 'easeInQuad'),
                this.tweenUniform(warpMat.uniforms.u_crumple,      1.0, 700, 'easeInQuad'),
                this.tweenUniform(bookMat.uniforms.u_glow,        1.35, 700, 'easeInQuad'),
                this.tweenUniform(vortexMat.uniforms.u_spin,       2.4, 700, 'easeInQuad'),
            ]);

            // ─── Phase 4 — BOOM: flash + shake, warp snaps back through 0. ───────
            // The brief warp overshoot (1.0 → 1.15 → 0) gives a "recoil before release"
            // feel: space recoils inward one more beat, then shatters outward with the flash.
            void this.shakeSceneEscalating([
                { amplitude: w * 0.090, duration: 100 },
                { amplitude: w * 0.035, duration: 100 },
                { amplitude: w * 0.010, duration: 80  },
            ]);
            await Promise.all([
                this.tweenUniform(flashMat.uniforms.u_boom, 1.0, 150, 'easeOutQuad'),
                this.tweenUniform(bookMat.uniforms.u_alpha, 0.0, 140, 'easeOutQuad'),
                this.tweenUniform(bookMat.uniforms.u_glow,  2.0, 140, 'easeOutQuad'),
                (async () => {
                    await this.tweenUniform(warpMat.uniforms.u_warpStrength, 1.15, 100, 'easeOutQuad');
                    await this.tweenUniform(warpMat.uniforms.u_warpStrength, 0.0,  200, 'easeInQuad');
                })(),
                this.tweenUniform(warpMat.uniforms.u_crumple, 0.0, 280, 'easeInQuad'),
                this.tweenUniform(warpMat.uniforms.u_spin,    0.0, 280, 'easeInQuad'),
            ]);

            // ─── Phase 5 — Fade. ────────────────────────────────────────────────
            await Promise.all([
                this.tweenUniform(flashMat.uniforms.u_boom,   0.0, 420, 'easeInQuad'),
                this.tweenUniform(vortexMat.uniforms.u_alpha, 0.0, 380, 'easeInQuad'),
            ]);
        } finally {
            // Uninstall override FIRST so gameplay resumes rendering normally even if the
            // cleanup below throws.
            this.animationLoop.setRenderOverride(null);
            clockRunning = false;

            overlayScene.remove(book);
            overlayScene.remove(vortex);
            overlayScene.remove(flash);
            this.disposeMesh(book);
            this.disposeMesh(vortex);
            this.disposeMesh(flash);
            this.disposeMesh(warpQuad);
            target.dispose();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Warp quad — THE key visual. Non-linear radial pinch + spiral + crumple noise.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createWarpQuad(sceneTexture: THREE.Texture): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_scene:         { value: sceneTexture },
                u_time:          { value: 0 },
                u_warpStrength:  { value: 0 },   // 0 = no warp, 1 = full black-hole pinch
                u_spin:          { value: 0 },   // 0 = no swirl, 1 = full tangential twist
                u_crumple:       { value: 0 },   // 0 = no noise distortion
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform sampler2D u_scene;
                uniform float u_time;
                uniform float u_warpStrength;
                uniform float u_spin;
                uniform float u_crumple;
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
                    // Sink is at screen centre (book is at world origin → UV (0.5, 0.5)).
                    vec2 sink = vec2(0.5, 0.5);
                    vec2 delta = v_uv - sink;
                    float r = length(delta);

                    // RADIAL PINCH — gravitational-lens style. The softening term avoids a
                    // singularity at r = 0 (otherwise the centre sampling UV explodes).
                    float pull = u_warpStrength * 0.045 / (r * r + 0.012);
                    // Clamp pull magnitude so fragments near the centre don't sample wildly
                    // out of the texture range; we want a SQUEEZE, not a collapse into chaos.
                    pull = min(pull, 0.7);
                    vec2 radialWarp = -normalize(delta + vec2(0.0001)) * pull;

                    // TANGENTIAL SPIN — stronger near the sink, fades at the outer ring.
                    vec2 tangent = vec2(-delta.y, delta.x);
                    float spinFactor = u_spin * (1.0 - smoothstep(0.0, 0.65, r));
                    vec2 spinWarp = normalize(tangent + vec2(0.0001)) * spinFactor * 0.18;

                    // CRUMPLE — noise-driven per-pixel offset so the distortion isn't smooth.
                    // Creates the "space is being torn/mushed" texture.
                    float cFreq = 6.0;
                    vec2 crumpleOff = vec2(
                        fbm(v_uv * cFreq + vec2(0.0, u_time * 0.45)) - 0.5,
                        fbm(v_uv * cFreq + vec2(13.1, u_time * 0.45 + 4.2)) - 0.5
                    );
                    crumpleOff *= u_crumple * 0.10;
                    // Modulate crumple by distance so it's strongest in the mid-ring where
                    // it looks like cloth being crushed inward.
                    crumpleOff *= smoothstep(0.08, 0.35, r) * (1.0 - smoothstep(0.7, 1.1, r));

                    vec2 warpedUV = v_uv + radialWarp + spinWarp + crumpleOff;

                    // Mirror-wrap sampling so pixels pulled past the centre produce a
                    // "smeared" rather than "empty" look — feels more like crushing than clipping.
                    warpedUV = clamp(warpedUV, 0.0, 1.0);

                    vec4 col = texture2D(u_scene, warpedUV);

                    // As warp deepens, darken everything slightly (light is "bent away").
                    col.rgb *= 1.0 - u_warpStrength * 0.25;

                    gl_FragColor = col;
                }
            `,
            depthWrite: false,
            depthTest: false,
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Book mesh — procedural grimoire with glowing runes.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createBookMesh(planeW: number, planeH: number): THREE.Mesh {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 440;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, 400, 440);

        const bodyGrad = ctx.createLinearGradient(0, 0, 0, 440);
        bodyGrad.addColorStop(0.0, '#1a0a2a');
        bodyGrad.addColorStop(0.5, '#0c0416');
        bodyGrad.addColorStop(1.0, '#1a0a2a');
        ctx.fillStyle = bodyGrad;
        this.roundRect(ctx, 20, 30, 360, 380, 14);
        ctx.fill();

        ctx.fillStyle = '#2a1040';
        this.roundRect(ctx, 40, 50, 158, 340, 6);
        ctx.fill();
        this.roundRect(ctx, 202, 50, 158, 340, 6);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.fillRect(195, 40, 10, 360);

        ctx.strokeStyle = '#d84fff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Pentagram on left page.
        const l1x = 119, l1y = 180, r1 = 50;
        ctx.beginPath(); ctx.arc(l1x, l1y, r1, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 5; i++) {
            const a1 = (i * 72 - 90) * Math.PI / 180;
            const a2 = ((i * 72 + 144) - 90) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(l1x + r1 * Math.cos(a1), l1y + r1 * Math.sin(a1));
            ctx.lineTo(l1x + r1 * Math.cos(a2), l1y + r1 * Math.sin(a2));
            ctx.stroke();
        }

        // Hexagram on right page.
        const l2x = 281, l2y = 180, r2 = 50;
        for (let tri = 0; tri < 2; tri++) {
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const ang = (i * 120 + (tri === 0 ? -90 : 90)) * Math.PI / 180;
                const px = l2x + r2 * Math.cos(ang);
                const py = l2y + r2 * Math.sin(ang);
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }

        ctx.lineWidth = 2;
        for (let row = 0; row < 4; row++) {
            const y = 270 + row * 20;
            ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(180, y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(222, y); ctx.lineTo(342, y); ctx.stroke();
        }

        ctx.fillStyle = '#8030b0';
        for (const [x, y] of [[20, 30], [380, 30], [20, 410], [380, 410]]) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (x < 200 ? 24 : -24), y);
            ctx.lineTo(x, y + (y < 220 ? 24 : -24));
            ctx.closePath();
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            uniforms: {
                u_texture: { value: texture },
                u_time:    { value: 0 },
                u_alpha:   { value: 0 },
                u_glow:    { value: 0 },
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
                uniform sampler2D u_texture;
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_glow;
                varying vec2 v_uv;
                void main() {
                    vec4 src = texture2D(u_texture, v_uv);
                    float runeMask = smoothstep(0.28, 0.62, src.r) * smoothstep(0.15, 0.45, src.b);
                    float pulse = 0.8 + 0.2 * sin(u_time * 6.0);
                    vec3 glowCol = vec3(1.0, 0.4, 0.95);
                    vec3 col = src.rgb + runeMask * glowCol * u_glow * pulse;
                    float bookMask = step(0.02, src.a);
                    col += vec3(0.35, 0.04, 0.55) * bookMask * u_glow * 0.25;
                    gl_FragColor = vec4(col, src.a * u_alpha);
                }
            `,
        });

        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Vortex — swirling dark energy halo behind the book.
    // ═══════════════════════════════════════════════════════════════════════════════
    private createVortexMesh(planeW: number, planeH: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 0 },
                u_spin:  { value: 0.4 },
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
                uniform float u_spin;
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
                    float twist = ang + u_time * 1.5 * u_spin + (1.0 - r) * 4.0;
                    vec2 swirl = vec2(cos(twist), sin(twist)) * r * 2.5;
                    float n = fbm(swirl + vec2(u_time * 0.3, 0.0));
                    float radial = 1.0 - smoothstep(0.15, 1.05, r);
                    float density = n * radial;
                    vec3 deep   = vec3(0.04, 0.00, 0.08);
                    vec3 violet = vec3(0.30, 0.04, 0.55);
                    vec3 hot    = vec3(0.75, 0.18, 0.95);
                    float t = clamp(density * 1.4, 0.0, 1.0);
                    vec3 col = mix(deep, violet, smoothstep(0.1, 0.55, t));
                    col = mix(col, hot, smoothstep(0.65, 0.95, t));
                    float a = smoothstep(0.15, 0.85, density) * u_alpha;
                    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Flash — full-screen boom burst. Only u_boom matters (no suck streaks here,
    // that was moved into the real warp shader).
    // ═══════════════════════════════════════════════════════════════════════════════
    private createFlashMesh(planeW: number, planeH: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            uniforms: {
                u_time: { value: 0 },
                u_boom: { value: 0 },
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
                uniform float u_boom;
                varying vec2 v_uv;
                void main() {
                    vec2 c = v_uv - 0.5;
                    float r = length(c) * 2.0;
                    float boomR = u_boom * 1.4;
                    float boomCore = 1.0 - smoothstep(0.0, boomR * 0.7, r);
                    float boomShell = smoothstep(boomR - 0.12, boomR, r) * (1.0 - smoothstep(boomR, boomR + 0.22, r));
                    float boom = clamp(boomCore + boomShell * 2.0, 0.0, 1.8) * u_boom;
                    vec3 boomCol = mix(vec3(0.85, 0.20, 1.0), vec3(1.0, 0.95, 1.0), smoothstep(0.0, 0.4, boom));
                    gl_FragColor = vec4(boomCol * boom, boom * 0.95);
                }
            `,
        });
        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        return new THREE.Mesh(geometry, material);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Utilities
    // ═══════════════════════════════════════════════════════════════════════════════
    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

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

    private tweenUniform(
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

    private disposeMesh(mesh: THREE.Mesh): void {
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
    }
}
