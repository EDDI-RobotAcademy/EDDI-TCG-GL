import * as THREE from "three";

import { NetherBladeChargeVisual } from "./NetherBladeChargeVisual";

// 마검의 지배자 네더 블레이드 — first passive: AoE 광역기. Two-layer fullscreen
// cinematic in the style of the user's reference (Sword Wind / 망령의 바다 vibe):
//
//   1) GATHER + HOLD (Canvas-2D overlay) — purple energy converges to screen
//      centre, particles spiral in, wisps orbit, core orb grows.
//   2) FLASH + DIMENSIONAL SLASH (WebGL ShaderMaterial overlay) — at the end
//      of HOLD a bright white flash punches in, then 8 dimensional blades
//      rush from depth into the camera, each at its own delay/angle/origin,
//      with searing white cores + purple tails + spark particles.
//   3) DECAY — both overlays fade.
//
// The slashes are NOT projectiles fired from the orb anymore — they are a
// reality-tear effect rendered by a separate fragment shader, ported from the
// user-supplied React WebGL component, that runs as a fullscreen Three.js
// plane on top of the gather overlay.
//
// Phases (frame-counted at ~60 Hz, dt-normalised):
//   gather   ~0.13 s  flash-bulb energy build-up at screen centre
//   hold     ~0.23 s  peak intensity hold + ring spin
//   release  ~1.10 s  WHITE FLASH → dimensional slashes punch through screen
//                       — onStrike(idx) fires for each target at 30 % through
//   decay    ~0.50 s  fog dissipates, slash mesh fades naturally
//
// API unchanged: play(originPos, targets, canvas, onStrike). originPos is
// ignored (fullscreen, screen-centre anchored).
export class NetherBladeFirstPassiveEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        _originPos: THREE.Vector3,
        targetPositions: readonly THREE.Vector3[],
        canvasElement: HTMLElement,
        onStrike: (idx: number) => void,
        // Optional renderer + camera: when provided, the shatter phase captures
        // the underlying scene (battlefield) into a render target so the
        // shatter shader can show the ACTUAL game texture being cut and pushed
        // apart by the slashes — not abstract dark shards.
        renderer?: THREE.WebGLRenderer,
        camera?: THREE.Camera,
    ): Promise<void> {
        console.log(`[NetherBladeFirstPassiveEffect] fullscreen play() — targets=${targetPositions.length}`);

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const CX = vw / 2;
        const CY = vh / 2;

        // ─── Random slash generation (reference: edge-anchored, balanced) ───
        // Each slash is two edge points on a "canvas" that produce a line
        // crossing the canvas at some angle. Origins are stored normalised to
        // [-1, +1] so the same set works for both wave 1 (full viewport) and
        // wave 2 (rect-scoped). Angle is in pixel-space radians; pixels are
        // square so visual angle is preserved across both meshes.
        type RefSlash = { ox: number; oy: number; angle: number; delay: number };
        const REF_GEN_W = 1000;  // virtual canvas size used by the generator —
        const REF_GEN_H = 700;   //   only the aspect matters for angles.
        const randomEdgePoint = (cw: number, ch: number) => {
            const edge = Math.floor(Math.random() * 4);
            const margin = 0.05;
            const r = margin + Math.random() * (1 - margin * 2);
            let x: number, y: number;
            if      (edge === 0) { x = r * cw; y = 0;  }
            else if (edge === 1) { x = cw;     y = r * ch; }
            else if (edge === 2) { x = r * cw; y = ch; }
            else                 { x = 0;      y = r * ch; }
            return { x, y, edge };
        };
        const edgePointInQuadrant = (cw: number, ch: number, q: number) => {
            type Opt = { edge: number; xMin?: number; xMax?: number; yMin?: number; yMax?: number; xFixed?: number; yFixed?: number };
            const cands: Record<number, Opt[]> = {
                0: [{ edge: 0, xMin: 0.05, xMax: 0.55, yFixed: 0 }, { edge: 3, yMin: 0.05, yMax: 0.55, xFixed: 0 }],
                1: [{ edge: 0, xMin: 0.45, xMax: 0.95, yFixed: 0 }, { edge: 1, yMin: 0.05, yMax: 0.55, xFixed: 1 }],
                2: [{ edge: 2, xMin: 0.05, xMax: 0.55, yFixed: 1 }, { edge: 3, yMin: 0.45, yMax: 0.95, xFixed: 0 }],
                3: [{ edge: 2, xMin: 0.45, xMax: 0.95, yFixed: 1 }, { edge: 1, yMin: 0.45, yMax: 0.95, xFixed: 1 }],
            };
            const opts = cands[q];
            const opt = opts[Math.floor(Math.random() * opts.length)];
            let x: number, y: number;
            if (opt.yFixed !== undefined) {
                x = (opt.xMin! + Math.random() * (opt.xMax! - opt.xMin!)) * cw;
                y = opt.yFixed * ch;
            } else {
                x = opt.xFixed! * cw;
                y = (opt.yMin! + Math.random() * (opt.yMax! - opt.yMin!)) * ch;
            }
            return { x, y, edge: opt.edge };
        };
        const edgePointsToSlash = (
            p1: { x: number; y: number }, p2: { x: number; y: number }, cw: number, ch: number,
        ): { ox: number; oy: number; angle: number } => {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const ox = (mx / cw - 0.5) * 2;
            const oy = -(my / ch - 0.5) * 2;
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            return { ox, oy, angle };
        };
        const generateSlashes = (cw: number, ch: number): RefSlash[] => {
            const count = 6 + Math.floor(Math.random() * 4);
            const baseDelay = 0.048 + Math.random() * 0.025;
            const slashes: RefSlash[] = [];
            for (let i = 0; i < count; i++) {
                let p1, p2;
                do {
                    p1 = randomEdgePoint(cw, ch);
                    p2 = randomEdgePoint(cw, ch);
                } while (p1.edge === p2.edge);
                const { ox, oy, angle } = edgePointsToSlash(p1, p2, cw, ch);
                slashes.push({ ox, oy, angle, delay: i * baseDelay });
            }
            // Quadrant balance — find the 2 sparsest quadrants and add a slash
            // crossing each so the field of cuts feels evenly distributed.
            const counts = [0, 0, 0, 0];
            for (const sl of slashes) {
                const q = (sl.ox < 0 ? 0 : 1) + (sl.oy > 0 ? 0 : 2);
                counts[q]++;
            }
            const sparse = [0, 1, 2, 3].sort((a, b) => counts[a] - counts[b]).slice(0, 2);
            const lastDelay = slashes[slashes.length - 1].delay;
            for (let i = 0; i < sparse.length; i++) {
                let p1, p2, tries = 0;
                do {
                    p1 = edgePointInQuadrant(cw, ch, sparse[i]);
                    p2 = randomEdgePoint(cw, ch);
                    tries++;
                } while (p1.edge === p2.edge && tries < 20);
                const { ox, oy, angle } = edgePointsToSlash(p1, p2, cw, ch);
                slashes.push({ ox, oy, angle, delay: lastDelay + (i + 1) * 0.045 });
            }
            return slashes;
        };
        const refSlashes = generateSlashes(REF_GEN_W, REF_GEN_H);
        const N_SLASH_MAX = 12;
        // Pad to N_SLASH_MAX so the shader's fixed-loop iteration is safe.
        const slashUniformArray: THREE.Vector4[] = [];
        for (let i = 0; i < N_SLASH_MAX; i++) {
            const s = refSlashes[i];
            slashUniformArray.push(s
                ? new THREE.Vector4(s.ox, s.oy, s.angle, s.delay)
                : new THREE.Vector4(0, 0, 0, 999));   // delay > t cap → never drawn
        }
        const refSlashCount = Math.min(refSlashes.length, N_SLASH_MAX);

        // ─── Reference-style slash shader factory ───────────────────────────
        // Edge-to-edge layered glow strokes with z-perspective. zStart/zEnd
        // control the direction: wave 1 uses (+30, -60) → slash flies TOWARD
        // the camera; wave 2 uses (-60, +30) → slash flies AWAY into the panel.
        const createRefSlashMaterial = (
            canvasW: number, canvasH: number,
            zStart: number, zEnd: number,
            triggerOffset: number,
            pureLine: boolean = false,
        ): THREE.ShaderMaterial => {
            return new THREE.ShaderMaterial({
                transparent: true,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    u_resolution:  { value: new THREE.Vector2(canvasW, canvasH) },
                    u_time:        { value: 0 },
                    u_triggerTime: { value: triggerOffset },
                    u_alpha:       { value: 0 },
                    u_zStart:      { value: zStart },
                    u_zEnd:        { value: zEnd },
                    u_focal:       { value: 400.0 },
                    u_slashes:     { value: slashUniformArray },
                    u_slashCount:  { value: refSlashCount },
                    u_pureLine:    { value: pureLine ? 1.0 : 0.0 },
                },
                vertexShader: `
                    varying vec2 v_uv01;
                    void main() {
                        v_uv01 = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    precision highp float;
                    uniform vec2  u_resolution;
                    uniform float u_time;
                    uniform float u_triggerTime;
                    uniform float u_alpha;
                    uniform float u_zStart;
                    uniform float u_zEnd;
                    uniform float u_focal;
                    uniform vec4  u_slashes[${N_SLASH_MAX}];
                    uniform int   u_slashCount;
                    uniform float u_pureLine;
                    varying vec2  v_uv01;

                    // One slash. v_uv01 maps to the canvas pixel position via
                    // u_resolution. Origin (slash.xy) is normalised [-1,1] of
                    // the same canvas. Angle (slash.z) is in pixel-space rad.
                    vec3 drawSlashRef(vec2 frag, vec4 slash, float t) {
                        vec2 origin = slash.xy;
                        float ang   = slash.z;
                        float delay = slash.w;
                        float lt = t - delay;
                        if (lt <= 0.0) return vec3(0.0);

                        // Z perspective: slash interpolates from zStart (lt=0)
                        // to zEnd (lt=1). After lt=1, hold at zEnd while alpha
                        // fades (no extra "explode past camera" so the visual
                        // works for both directions).
                        float wz;
                        if (lt <= 1.0) {
                            wz = u_zStart + (u_zEnd - u_zStart) * pow(lt, 3.2);
                        } else {
                            wz = u_zEnd;
                        }

                        // Project origin to canvas pixels with FOCAL projection.
                        // s explodes when wz approaches -focal/12 → slash blows
                        // up just before it crosses the camera plane.
                        float s = u_focal / max(1.0, u_focal + wz * 12.0);
                        vec2 cxy = u_resolution * 0.5 + origin * (u_resolution * 0.5) * s;
                        // Origin stored with y-up; flip to canvas y-down.
                        cxy.y = u_resolution.y - cxy.y;
                        float baseThick = max(1.5, 28.0 * s);

                        vec2 d = frag - cxy;
                        float dPerp = -sin(ang) * d.x + cos(ang) * d.y;
                        float aPerp = abs(dPerp);

                        float a;
                        if      (lt < 0.06) a = lt / 0.06;
                        else if (lt <= 1.0) a = 1.0;
                        else                a = max(0.0, 1.0 - (lt - 1.0) / 0.55);
                        if (a <= 0.0) return vec3(0.0);

                        // Colour shifts slightly across the camera-cross point
                        // for wave 1 (zStart > 0 > zEnd). For wave 2 (zStart<0,
                        // zEnd>0), tCross may be negative or > 1; clamp it.
                        float zRange = u_zStart - u_zEnd;
                        float tCross = (abs(zRange) > 1e-3) ? (u_zStart / zRange) : 0.5;
                        tCross = clamp(tCross, 0.0, 1.0);
                        float beforeCross = step(lt, tCross);
                        float rVal = mix(150.0, 200.0, beforeCross);
                        float gVal = mix(  0.0,  40.0, beforeCross);
                        vec3 col = vec3(rVal, gVal, 255.0) / 255.0;

                        // FULL mode: 4 layered glow widths (reference's stroke
                        // gradients) — gives the slash a thick beam-of-light feel.
                        float g0 = (1.0 - smoothstep(baseThick * 4.5, baseThick * 9.0, aPerp)) * 0.08;
                        float g1 = (1.0 - smoothstep(baseThick * 2.2, baseThick * 4.5, aPerp)) * 0.20;
                        float g2 = (1.0 - smoothstep(baseThick * 1.0, baseThick * 2.2, aPerp)) * 0.45;
                        float g3 = (1.0 - smoothstep(baseThick * 0.5, baseThick * 1.0, aPerp)) * 0.70;
                        float layersFull = g0 + g1 + g2 + g3;

                        // PURE-LINE mode: just a thin coloured stroke around the
                        // core — no soft halo, no broad surface. Wave 2 uses
                        // this so the slashes flying toward the panel are
                        // strictly LINES, not glowing beams.
                        float strokeW = max(1.0, baseThick * 0.45);
                        float layersPure = (1.0 - smoothstep(strokeW * 0.5, strokeW, aPerp)) * 0.70;

                        float layers = mix(layersFull, layersPure, u_pureLine);
                        vec3 result = col * layers * a;

                        // Bright white core (kept for both modes — it IS the line).
                        float coreW = max(0.8, baseThick * 0.18);
                        float core = (1.0 - smoothstep(coreW * 0.5, coreW, aPerp)) * 0.65;
                        result += vec3(1.0) * core * a;

                        return result;
                    }

                    void main() {
                        vec2 frag = v_uv01 * u_resolution;
                        float t = (u_time - u_triggerTime) / 0.65;   // DURATION = 0.65 from reference
                        vec3 result = vec3(0.0);
                        for (int i = 0; i < ${N_SLASH_MAX}; i++) {
                            if (i >= u_slashCount) break;
                            result += drawSlashRef(frag, u_slashes[i], t);
                        }
                        float alpha = max(max(result.r, result.g), result.b) * u_alpha;
                        gl_FragColor = vec4(result * u_alpha, alpha);
                    }
                `,
            });
        };
        // ─── Canvas-2D overlay (gather + hold visuals) ──────────────────────
        const canvas = document.createElement('canvas');
        canvas.width = vw;
        canvas.height = vh;
        const ctx = canvas.getContext('2d')!;

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;

        const overlayMaterial = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });
        const overlayGeom = new THREE.PlaneGeometry(vw, vh);
        const overlay = new THREE.Mesh(overlayGeom, overlayMaterial);
        overlay.position.set(0, 0, 8);
        overlay.renderOrder = 9999;
        this.scene.add(overlay);

        // Wave-1 slash mesh — fullscreen, reference-style. Slashes fly TOWARD
        // the camera (z: +30 → -60). Triggered later when release phase begins.
        const slashMaterial = createRefSlashMaterial(vw, vh, 30.0, -60.0, -1000);
        const slashGeom = new THREE.PlaneGeometry(vw, vh);
        const slashMesh = new THREE.Mesh(slashGeom, slashMaterial);
        slashMesh.position.set(0, 0, 8);
        slashMesh.renderOrder = 10000;
        this.scene.add(slashMesh);

        // ─── Phase durations (frames @ 60 Hz, dt-normalised) ────────────────
        const GATHER_DURATION = 8;     // ~0.13 s — single flash
        const HOLD_DURATION   = 14;    // ~0.23 s — peak hold
        const RELEASE_DURATION = 66;   // ~1.10 s — fullscreen wave 1 covers the slash shader's full t-window
        const DECAY_DURATION  = 30;    // ~0.50 s — wave 1 fades, screen returns to normal
        const PAUSE_DURATION  = 6;     // ~0.10 s — brief beat where the screen looks normal again
        // Wave-2 slashes are spawned at zStart = -60 and need ~0.65 s real time
        // to reach the panel at zEnd = +30 (slash shader's t = (u_time -
        // u_triggerTime) / 0.65). With ~0.85 s the leading slashes have
        // visibly LANDED on the panel and the trailing ones are arriving —
        // only THEN does the panel break. No more "panel shatters before the
        // slashes have even passed through".
        // Wave 2 covers the FULL viewport — same scale as wave 1, no
        // opponent-rect zoom. Slashes traverse the screen during rectSlash;
        // the captured scene then shatters fullscreen.
        const RECT_SLASH_DURATION = 50; // ~0.83 s — slashes traverse the screen
        const SHATTER_DURATION = 70;   // ~1.17 s — captured texture pieces drift apart along the slash lines

        // ─── 충전 비주얼 (입자 / 위습 / 코어 오브 / 배경 / 안개) ─────────────
        // 단일기와 공유하는 도입부. 상태와 그리기가 전부 모듈 안에 있다.
        const charge = new NetherBladeChargeVisual(vw, vh, CX, CY);

        // ─── Phase state ────────────────────────────────────────────────────
        let phase: 'gather' | 'hold' | 'release' | 'decay' | 'pause' | 'rectSlash' | 'shatter' | 'done' = 'gather';
        let phaseTimer = 0;
        let shatterStartedAt = 0;
        let captureRT: THREE.WebGLRenderTarget | null = null;
        let rectSlashMesh: THREE.Mesh | null = null;
        let rectSlashMaterial: THREE.ShaderMaterial | null = null;

        // Per-fragment data for the polygon-shatter (reference-style: panel is
        // clipped by each slash's line via Sutherland-Hodgman; each fragment
        // becomes its own Three.js mesh that drifts perpendicular to the
        // nearest cut, carrying its slice of the captured battlefield with it).
        type FragmentInfo = {
            origCx: number;
            origCy: number;
            driftX: number;
            driftY: number;
            splitSpeed: number;
            mesh: THREE.Mesh;
            material: THREE.ShaderMaterial;
        };
        const fragments: FragmentInfo[] = [];
        // Opaque black panel behind the fragments — covers the live scene
        // during the shatter so the breaking pieces don't reveal the
        // unbroken battlefield through the gaps. Fades out at the end of
        // shatter, restoring the live scene to its original look.
        let panelBackdrop: THREE.Mesh | null = null;
        let panelBackdropMat: THREE.MeshBasicMaterial | null = null;

        // Slash defs for the polygon clipping. Built from refSlashes so the
        // CUT LINES on the panel match the visible slash strokes from the
        // shader. The slash shader stores origin in normalised [-1,1] of its
        // canvas (with y-up); for clipping inside the panel rect we map back
        // into rect-relative half-extents (same coordinate convention as the
        // old SLASHES_DATA: ox / oy in [-0.5, 0.5] within the rect).
        const SLASHES_DATA = refSlashes.map(s => ({
            ox: s.ox * 0.5,
            oy: s.oy * 0.5,
            angle: -s.angle,   // flip back from shader's y-up to world-y up math
        }));

        // Sutherland-Hodgman: clip a polygon by the half-plane on the LEFT
        // side of the directed line (ax, ay) → (bx, by). To split a polygon
        // by a full line, run twice (once with each direction).
        const clipPolygonByLine = (
            poly: [number, number][],
            ax: number, ay: number, bx: number, by: number,
        ): [number, number][] => {
            const out: [number, number][] = [];
            const n = poly.length;
            if (n === 0) return out;
            const dx = bx - ax, dy = by - ay;
            const side = (px: number, py: number) => dx * (py - ay) - dy * (px - ax);
            for (let i = 0; i < n; i++) {
                const cur = poly[i];
                const nxt = poly[(i + 1) % n];
                const sc = side(cur[0], cur[1]);
                const sn = side(nxt[0], nxt[1]);
                if (sc >= 0) out.push(cur);
                if ((sc > 0 && sn < 0) || (sc < 0 && sn > 0)) {
                    const t = sc / (sc - sn);
                    out.push([cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1])]);
                }
            }
            return out;
        };
        const polygonCentroid = (poly: [number, number][]): [number, number] => {
            let cx = 0, cy = 0;
            for (const p of poly) { cx += p[0]; cy += p[1]; }
            return [cx / poly.length, cy / poly.length];
        };
        let flashAlpha = 0;
        let cameraShake = 0;
        let screenScale = 1;
        let coreRadius = 0;
        let coreAlpha = 0;

        // ─── Canvas shake ───────────────────────────────────────────────────
        const origTransform = canvasElement.style.transform;
        const applyShake = (sx: number, sy: number) => {
            canvasElement.style.transform = `${origTransform} translate(${sx}px, ${sy}px)`;
        };

        // ─── Per-target onStrike timing ─────────────────────────────────────
        const strikeFired: boolean[] = targetPositions.map(() => false);

        // ─── Main loop ───────────────────────────────────────────────────────
        const startMs = performance.now();
        let lastTime = 0;
        let resolveDone: () => void;
        const donePromise = new Promise<void>((r) => { resolveDone = r; });

        const loop = (ts: number): void => {
            const dt = lastTime > 0 ? Math.min((ts - lastTime) / 16.67, 3) : 1;
            lastTime = ts;
            phaseTimer += dt;

            // Camera shake decay + apply.
            cameraShake *= 0.82;
            const shakeX = (Math.random() - 0.5) * cameraShake;
            const shakeY = (Math.random() - 0.5) * cameraShake;
            applyShake(shakeX, shakeY);

            flashAlpha *= 0.88;
            if (flashAlpha < 0.01) flashAlpha = 0;

            // Slash shader uniforms — keep u_time monotonically advancing in
            // seconds since the effect started; u_triggerTime is set when the
            // release phase begins.
            const elapsedSec = (ts - startMs) / 1000;
            slashMaterial.uniforms.u_time.value = elapsedSec;
            if (rectSlashMaterial) rectSlashMaterial.uniforms.u_time.value = elapsedSec;

            let intensity = 1;
            screenScale = 1;

            if (phase === 'gather') {
                const t = Math.min(phaseTimer / GATHER_DURATION, 1);
                const fast = Math.pow(t, 0.30);
                const pulse = Math.sin(t * 30) * 0.55;
                intensity = 1 + fast * 5.0 + pulse;
                coreAlpha = Math.min(fast * 2.2, 1);
                coreRadius = 14 + fast * 105;
                screenScale = 1 + fast * 0.07;
                if (phaseTimer >= GATHER_DURATION) {
                    phase = 'hold'; phaseTimer = 0;
                    flashAlpha = 1.0;
                }
            } else if (phase === 'hold') {
                intensity = 4.5 + Math.sin(phaseTimer * 0.3) * 0.5;
                coreRadius = 105 + Math.sin(phaseTimer * 0.4) * 8;
                coreAlpha = 1;
                screenScale = 1.05 + Math.sin(phaseTimer * 0.3) * 0.01;
                if (phaseTimer >= HOLD_DURATION) {
                    phase = 'release'; phaseTimer = 0;
                    // BAM — full white flash.
                    flashAlpha = 1.0;
                    cameraShake = 22;
                    // Trigger the dimensional slash. u_alpha snaps to 1 so the
                    // shader becomes visible; the shader's own internal t-window
                    // handles the slash timing.
                    slashMaterial.uniforms.u_triggerTime.value = elapsedSec;
                    slashMaterial.uniforms.u_alpha.value = 1.0;
                }
            } else if (phase === 'release') {
                const t = phaseTimer / RELEASE_DURATION;
                // The orb collapses out as the slashes take over the screen.
                intensity = Math.max(4.5 - t * 5, 0.05);
                coreAlpha = Math.max(1 - t * 3, 0);
                coreRadius = Math.max(105 - t * 130, 0);
                screenScale = 1;

                // Fire onStrike at 30 % through release for each target.
                if (t >= 0.30) {
                    for (let i = 0; i < strikeFired.length; i++) {
                        if (!strikeFired[i]) {
                            strikeFired[i] = true;
                            try { onStrike(i); }
                            catch (e) { console.error('[NetherBladeFirstPassiveEffect] onStrike error:', e); }
                        }
                    }
                }

                if (phaseTimer >= RELEASE_DURATION) {
                    phase = 'decay'; phaseTimer = 0;
                }
            } else if (phase === 'decay') {
                intensity = 0.1;
                coreAlpha = 0;
                coreRadius = 0;
                screenScale = 1;
                // Slash overlay fades back to nothing — the screen briefly
                // returns to its normal appearance before the shatter phase.
                const decayT = Math.min(phaseTimer / DECAY_DURATION, 1);
                slashMaterial.uniforms.u_alpha.value = Math.max(1.0 - decayT, 0);
                if (phaseTimer >= DECAY_DURATION) {
                    phase = 'pause';
                    phaseTimer = 0;
                }
            } else if (phase === 'pause') {
                // A short beat where the slash is gone and the underlying scene
                // is visible — sells the "back to normal" moment before wave 2
                // strikes the opponent battlefield.
                if (phaseTimer >= PAUSE_DURATION) {
                    // Capture the FULL scene (battlefield) into a render target
                    // so the shatter shader can show actual texture pieces being
                    // shredded. Overlays toggled off during capture so only the
                    // game scene lands in the texture.
                    if (renderer && camera) {
                        const dpr = renderer.getPixelRatio();
                        captureRT = new THREE.WebGLRenderTarget(
                            Math.floor(vw * dpr),
                            Math.floor(vh * dpr),
                            { magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter },
                        );
                        const wasOverlayVisible = overlay.visible;
                        const wasSlashVisible = slashMesh.visible;
                        overlay.visible = false;
                        slashMesh.visible = false;
                        const oldTarget = renderer.getRenderTarget();
                        renderer.setRenderTarget(captureRT);
                        renderer.render(this.scene, camera);
                        renderer.setRenderTarget(oldTarget);
                        overlay.visible = wasOverlayVisible;
                        slashMesh.visible = wasSlashVisible;
                    }
                    // Wave-2 mesh — SAME reference-style slash shader as wave 1
                    // but z is INVERTED (-60 → +30) so the slashes fly AWAY
                    // from the camera, INTO the field. Same RefSlash array so
                    // the cuts continue along the same trajectories — only the
                    // depth direction flips ("monitor 쪽으로 → monitor 에서 멀어지면서").
                    rectSlashMaterial = createRefSlashMaterial(
                        vw, vh,
                        -60.0, 30.0,
                        elapsedSec,
                    );
                    rectSlashMaterial.uniforms.u_alpha.value = 1.0;
                    rectSlashMesh = new THREE.Mesh(
                        new THREE.PlaneGeometry(vw, vh),
                        rectSlashMaterial,
                    );
                    rectSlashMesh.position.set(0, 0, 8.5);
                    rectSlashMesh.renderOrder = 10002;
                    this.scene.add(rectSlashMesh);
                    phase = 'rectSlash';
                    phaseTimer = 0;
                    cameraShake = 18;
                }
            } else if (phase === 'rectSlash') {
                // Wave 2 — slashes fly across the FULL viewport. The mesh's
                // slash shader handles its own animation via u_time -
                // u_triggerTime; we just hold here until it's time to start
                // tearing the captured texture apart.
                if (phaseTimer >= RECT_SLASH_DURATION) {
                    phase = 'shatter';
                    phaseTimer = 0;
                    shatterStartedAt = elapsedSec;
                }
            } else if (phase === 'shatter') {
                // Lazily generate fragments on first entry — one Three.js mesh
                // per polygon piece. Each piece carries its slice of the
                // captured battlefield (via UVs computed from each vertex's
                // ORIGINAL world position) and drifts perpendicular to the
                // nearest cut line. Pieces visibly peel away from each other.
                if (fragments.length === 0 && captureRT) {
                    // Spawn the opaque black backdrop FIRST, behind the
                    // fragments. While the field is "broken" the live scene
                    // beneath is hidden — gaps between drifting pieces show
                    // black void instead of revealing the intact battlefield.
                    panelBackdropMat = new THREE.MeshBasicMaterial({
                        color: 0x000000,
                        transparent: true,
                        opacity: 1.0,
                        depthTest: false,
                        depthWrite: false,
                    });
                    panelBackdrop = new THREE.Mesh(
                        new THREE.PlaneGeometry(vw, vh),
                        panelBackdropMat,
                    );
                    panelBackdrop.position.set(0, 0, 8.05);
                    panelBackdrop.renderOrder = 10000;     // BELOW fragments (10001)
                    this.scene.add(panelBackdrop);

                    const minDim = Math.min(vw, vh);
                    // Seed polygon list with the full viewport.
                    let polys: [number, number][][] = [[
                        [-vw * 0.5, -vh * 0.5],
                        [ vw * 0.5, -vh * 0.5],
                        [ vw * 0.5,  vh * 0.5],
                        [-vw * 0.5,  vh * 0.5],
                    ]];
                    // Apply each slash as a cut line — splits each existing
                    // polygon into the two half-polygons on either side.
                    const lineLen = Math.max(vw, vh) * 1.6;
                    for (const sl of SLASHES_DATA) {
                        const cx = sl.ox * minDim;
                        const cy = sl.oy * minDim;
                        const cosA = Math.cos(sl.angle), sinA = Math.sin(sl.angle);
                        const ax = cx - cosA * lineLen, ay = cy - sinA * lineLen;
                        const bx = cx + cosA * lineLen, by = cy + sinA * lineLen;
                        const next: [number, number][][] = [];
                        for (const poly of polys) {
                            const above = clipPolygonByLine(poly, ax, ay, bx, by);
                            const below = clipPolygonByLine(poly, bx, by, ax, ay);
                            if (above.length >= 3) next.push(above);
                            if (below.length >= 3) next.push(below);
                        }
                        if (next.length > 0) polys = next;
                    }

                    // Build a mesh for each surviving polygon.
                    const cap = captureRT.texture;
                    for (const poly of polys.filter(p => p.length >= 3)) {
                        const [pcx, pcy] = polygonCentroid(poly);
                        // Find the nearest slash → drift direction = its
                        // perpendicular, sign chosen by which side of the line
                        // this fragment's centroid sits on.
                        let bestDist = Infinity;
                        let driftX = 0, driftY = 0;
                        for (const sl of SLASHES_DATA) {
                            const slCx = sl.ox * minDim;
                            const slCy = sl.oy * minDim;
                            const cosA = Math.cos(sl.angle), sinA = Math.sin(sl.angle);
                            const nx = -sinA, ny = cosA;
                            const dx = pcx - slCx, dy = pcy - slCy;
                            const perpD  = Math.abs(dx * nx + dy * ny);
                            const alongD = Math.abs(dx * cosA + dy * sinA);
                            if (perpD < bestDist && alongD < minDim * 0.95) {
                                bestDist = perpD;
                                const dot = dx * nx + dy * ny;
                                const sign = dot >= 0 ? 1 : -1;
                                driftX = nx * sign;
                                driftY = ny * sign;
                            }
                        }
                        if (bestDist === Infinity) {
                            // Fallback — drift away from screen centre.
                            const len = Math.hypot(pcx, pcy) || 1;
                            driftX = pcx / len; driftY = pcy / len;
                        }

                        const splitSpeed = 0.3 + Math.random() * 0.5;

                        // Build a flat polygon mesh; vertices are stored
                        // RELATIVE to the centroid so we can translate the
                        // whole mesh by mesh.position.
                        const shape = new THREE.Shape();
                        for (let pi = 0; pi < poly.length; pi++) {
                            const px = poly[pi][0] - pcx;
                            const py = poly[pi][1] - pcy;
                            if (pi === 0) shape.moveTo(px, py);
                            else shape.lineTo(px, py);
                        }
                        const geom = new THREE.ShapeGeometry(shape);

                        // Per-fragment shader: each vertex's UV maps to its
                        // ORIGINAL world position on the captured texture,
                        // computed as origCentroid + position.xy. This keeps
                        // the texture content "pinned" to the fragment as it
                        // drifts — the shard is literally carrying its slice
                        // of the actual battlefield with it.
                        const mat = new THREE.ShaderMaterial({
                            transparent: true,
                            depthTest: false,
                            depthWrite: false,
                            uniforms: {
                                u_captured:     { value: cap },
                                u_origCentroid: { value: new THREE.Vector2(pcx, pcy) },
                                u_viewSize:     { value: new THREE.Vector2(vw, vh) },
                                u_alpha:        { value: 1.0 },
                                u_edgeGlow:     { value: 0.0 },
                            },
                            vertexShader: `
                                uniform vec2 u_origCentroid;
                                uniform vec2 u_viewSize;
                                varying vec2 v_uv;
                                varying vec2 v_local;
                                void main() {
                                    v_local = position.xy;
                                    vec2 origWorld = position.xy + u_origCentroid;
                                    v_uv = vec2(
                                        0.5 + origWorld.x / u_viewSize.x,
                                        0.5 + origWorld.y / u_viewSize.y
                                    );
                                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                                }
                            `,
                            fragmentShader: `
                                precision highp float;
                                uniform sampler2D u_captured;
                                uniform float     u_alpha;
                                uniform float     u_edgeGlow;
                                varying vec2      v_uv;
                                varying vec2      v_local;
                                void main() {
                                    vec4 c = texture2D(u_captured, v_uv);
                                    gl_FragColor = vec4(c.rgb, c.a * u_alpha);
                                }
                            `,
                        });

                        const mesh = new THREE.Mesh(geom, mat);
                        mesh.position.set(pcx, pcy, 8.2);
                        mesh.renderOrder = 10001;
                        this.scene.add(mesh);

                        fragments.push({
                            origCx: pcx, origCy: pcy,
                            driftX, driftY,
                            splitSpeed,
                            mesh, material: mat,
                        });
                    }
                }

                // Per-frame fragment update. Slow-drift easeOut so the pieces
                // start barely moving and gradually peel apart — the "tearing"
                // feel rather than an explosion.
                const sT = Math.min(phaseTimer / SHATTER_DURATION, 1);
                const slowT = Math.min(sT * 0.65, 1);
                const ease = 1 - Math.pow(1 - slowT, 3);
                const distScale = Math.max(vw, vh) * 0.55;
                // Fragments + backdrop fade in lockstep over the last 30 % so
                // the field's "shatter" dissolves cleanly into the live scene
                // (field is restored to its original look — 원상복구).
                const breakAlpha = sT > 0.70 ? Math.max(1 - (sT - 0.70) / 0.30, 0) : 1;
                for (const f of fragments) {
                    const d = ease * f.splitSpeed * distScale;
                    f.mesh.position.x = f.origCx + f.driftX * d;
                    f.mesh.position.y = f.origCy + f.driftY * d;
                    f.material.uniforms.u_alpha.value = breakAlpha;
                }
                if (panelBackdropMat) panelBackdropMat.opacity = breakAlpha;

                if (phaseTimer >= SHATTER_DURATION) {
                    // Hide fragments + backdrop. The live battlefield is now
                    // fully visible again — the panel has been "restored".
                    for (const f of fragments) f.mesh.visible = false;
                    if (panelBackdrop) panelBackdrop.visible = false;
                    phase = 'done';
                }
            }

            // ── 충전 비주얼 갱신 ────────────────────────────────────────────
            charge.update(dt, phase === 'decay' ? 0.05 : intensity);

            // ── Draw Canvas-2D overlay ──────────────────────────────────────
            ctx.clearRect(0, 0, vw, vh);
            ctx.save();
            ctx.translate(CX, CY);
            ctx.scale(screenScale, screenScale);
            ctx.translate(-CX, -CY);

            // 배경 / 안개 / 입자 / 코어 오브 / 플래시 / 비네트 — 전부 공유 모듈이 그린다.
            // 페이즈별 가시성만 여기서 정한다. wave 2(pause 이후)는 bgAlpha를 0으로 둬
            // 원래 게임 화면이 그대로 비치게 한다.
            let bgAlpha = 0;
            if (phase === 'gather') bgAlpha = Math.min(phaseTimer / GATHER_DURATION, 1) * 0.92;
            else if (phase === 'hold' || phase === 'release') bgAlpha = 0.92;
            else if (phase === 'decay') bgAlpha = 0.92 * (1 - Math.min(phaseTimer / DECAY_DURATION, 1));

            let fogT = 0;
            if (phase === 'gather') fogT = Math.min(phaseTimer / GATHER_DURATION, 1);
            else if (phase === 'hold' || phase === 'release') fogT = 1;
            else if (phase === 'decay') fogT = Math.max(1 - phaseTimer / DECAY_DURATION, 0);

            let particleVis = 0;
            if (phase === 'gather' || phase === 'hold' || phase === 'release') particleVis = 1;
            else if (phase === 'decay') particleVis = Math.max(1 - phaseTimer / DECAY_DURATION, 0);

            charge.draw(ctx, {
                bgAlpha,
                fogT,
                particleVis,
                coreAlpha,
                coreRadius,
                intensity,
                ringSpin: phase === 'hold' ? 2.5 : 1,
                flashAlpha,
                dt,
            });

            ctx.restore();
            tex.needsUpdate = true;

            if (phase === 'done') {
                resolveDone();
                return;
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);

        await donePromise;

        // ─── Cleanup ────────────────────────────────────────────────────────
        canvasElement.style.transform = origTransform;
        this.scene.remove(overlay);
        overlayGeom.dispose();
        overlayMaterial.dispose();
        tex.dispose();
        this.scene.remove(slashMesh);
        slashGeom.dispose();
        slashMaterial.dispose();
        for (const f of fragments) {
            this.scene.remove(f.mesh);
            f.mesh.geometry.dispose();
            f.material.dispose();
        }
        fragments.length = 0;
        if (panelBackdrop !== null) {
            const m = panelBackdrop as THREE.Mesh;
            this.scene.remove(m);
            m.geometry.dispose();
            (m.material as THREE.Material).dispose();
        }
        if (rectSlashMesh !== null) {
            const m = rectSlashMesh as THREE.Mesh;
            this.scene.remove(m);
            m.geometry.dispose();
        }
        if (rectSlashMaterial !== null) {
            (rectSlashMaterial as THREE.ShaderMaterial).dispose();
        }
        if (captureRT !== null) {
            (captureRT as THREE.WebGLRenderTarget).dispose();
        }
    }

    // ───────────────────────────────────────────────────────────────────────
    // Screen-shatter overlay — spawns AFTER the slash effect has fully faded
    // and the screen has briefly returned to normal. The shader divides the
    // viewport into pieces along the same 8 slash axes; each piece drifts in
    // the sum-of-perpendicular direction of its bounding cuts so the screen
    // visibly splits apart. Pixels in the cut gaps go transparent, revealing
    // whatever is rendered behind this mesh (i.e. the actual game scene).
    // u_shatter (0..1) drives the scatter; u_alpha controls the fade in/out.
    // ───────────────────────────────────────────────────────────────────────
    private createShatterMesh(
        rectW: number, rectH: number,
        capturedScene: THREE.Texture | null,
        // Mapping from this plane's v_uv01 (0..1) into the captured full-scene
        // texture's UV: capturedUv = (capUvOffsetX, capUvOffsetY) + v_uv01 * (capUvScaleX, capUvScaleY).
        // For a fullscreen rect: offset=(0,0), scale=(1,1). For the opponent
        // field rect: offset/scale shifts/zooms into just that portion.
        capUvOffsetX: number, capUvOffsetY: number,
        capUvScaleX: number,  capUvScaleY: number,
    ): THREE.Mesh {
        const hasCapture = capturedScene !== null;
        // Tiny transparent placeholder texture — only used when capture isn't
        // supplied; the shader's `u_useCapture = 0` branch drives a procedural
        // dark fill instead of sampling.
        const placeholder = new THREE.DataTexture(
            new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat,
        );
        placeholder.needsUpdate = true;
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_resolution:  { value: new THREE.Vector2(rectW, rectH) },
                u_shatter:     { value: 0 },
                u_alpha:       { value: 0 },
                u_captured:    { value: capturedScene ?? placeholder },
                u_useCapture:  { value: hasCapture ? 1 : 0 },
                u_capUvOffset: { value: new THREE.Vector2(capUvOffsetX, capUvOffsetY) },
                u_capUvScale:  { value: new THREE.Vector2(capUvScaleX,  capUvScaleY) },
            },
            vertexShader: `
                varying vec2 v_uv01;
                void main() {
                    v_uv01 = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform vec2      u_resolution;
                uniform float     u_shatter;
                uniform float     u_alpha;
                uniform sampler2D u_captured;
                uniform float     u_useCapture;
                uniform vec2      u_capUvOffset;
                uniform vec2      u_capUvScale;
                varying vec2      v_uv01;

                void main() {
                    // Work directly in v_uv01 space (0..1 across the rect,
                    // square in this coord system). For the wide upper-half
                    // rect, aspect-scaled uv would compress drift in the long
                    // axis when converted back to v_uv01 — pieces wouldn't
                    // travel far. v_uv01 space drifts each piece the same
                    // fraction of rect width AND height, so pieces visibly
                    // fly off both axes.
                    vec2 uv01 = v_uv01;

                    // Cut origins in v_uv01 space (0..1). Spread across the
                    // rect so the 8 cuts divide it into clear pieces.
                    vec2 origins[8];
                    origins[0] = vec2(0.50, 0.50);
                    origins[1] = vec2(0.20, 0.70);
                    origins[2] = vec2(0.80, 0.30);
                    origins[3] = vec2(0.35, 0.15);
                    origins[4] = vec2(0.85, 0.70);
                    origins[5] = vec2(0.55, 0.85);
                    origins[6] = vec2(0.15, 0.50);
                    origins[7] = vec2(0.65, 0.40);

                    float angles[8];
                    angles[0] =  0.78;
                    angles[1] = -0.50;
                    angles[2] =  2.10;
                    angles[3] =  0.20;
                    angles[4] = -1.80;
                    angles[5] = -1.20;
                    angles[6] =  0.10;
                    angles[7] =  2.80;

                    float maxInGap = 0.0;
                    vec2  drift = vec2(0.0);
                    for (int i = 0; i < 8; i++) {
                        vec2 d = uv01 - origins[i];
                        vec2 perpDir = vec2(-sin(angles[i]), cos(angles[i]));
                        float perpSigned = dot(d, perpDir);
                        float perpAbs = abs(perpSigned);

                        // Cut-line gap (in v_uv01 space — half-width grows up
                        // to 0.10 by end of shatter, i.e. ~10 % of rect span).
                        float gapHalf = u_shatter * 0.10;
                        float inGap = 1.0 - smoothstep(gapHalf * 0.50, gapHalf, perpAbs);
                        maxInGap = max(maxInGap, inGap);

                        // Drift — UNIFORM per side. With 8 cuts contributing
                        // ±0.16 each in v_uv01 space, the worst-case drift
                        // magnitude is ~1.3 — pieces clearly fly off the
                        // [0,1]² rect. Pieces at the rect corners drift the
                        // most (more sides agree); centre pieces drift less
                        // (sides cancel). Each piece is a coherent unit.
                        float side = sign(perpSigned);
                        drift += perpDir * side * u_shatter * 0.16;
                    }

                    // srcUv01 directly — drift is already in v_uv01 space.
                    vec2 srcUv01 = uv01 - drift;

                    // Source-in-rect mask — when the pre-drift origin has
                    // exited THIS rect's bounds, the shard has scattered off
                    // the affected area and this pixel goes transparent.
                    float inFrameX = step(0.0, srcUv01.x) * step(srcUv01.x, 1.0);
                    float inFrameY = step(0.0, srcUv01.y) * step(srcUv01.y, 1.0);
                    float inFrame  = inFrameX * inFrameY;

                    // Sample the captured FULL-SCENE texture at the texel that
                    // lived at the pre-drift world position. The shard then
                    // visibly carries that battlefield content as it slides.
                    vec2 capturedUv = u_capUvOffset + srcUv01 * u_capUvScale;
                    vec3 capturedCol = texture2D(u_captured, capturedUv).rgb;

                    // Fallback: when no capture is supplied, fill with a dark
                    // glassy tint that still reads as broken pieces.
                    vec3 fallbackCol;
                    {
                        vec3 baseDark = vec3(0.04, 0.0, 0.10);
                        float hueShift = sin(srcUv01.x * 7.3 + srcUv01.y * 5.1) * 0.5 + 0.5;
                        fallbackCol = mix(baseDark, vec3(0.10, 0.02, 0.18), hueShift);
                    }

                    vec3 shardCol = mix(fallbackCol, capturedCol, u_useCapture);

                    // Darken shards as they fly to suggest they're "leaving" —
                    // also helps the eye accept that the live scene takes over
                    // once shatter fades out.
                    shardCol *= mix(1.0, 0.55, u_shatter);

                    // Bright violet rim glow at active fracture edges.
                    float edgeGlow = smoothstep(0.85, 1.0, maxInGap);
                    vec3 col = shardCol + vec3(1.0, 0.6, 1.0) * edgeGlow * 0.7 * u_shatter;

                    float shardAlpha = (1.0 - maxInGap) * inFrame;
                    float alpha = shardAlpha * u_alpha;
                    gl_FragColor = vec4(col, alpha);
                }
            `,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        // Stash the placeholder on the mesh so dispose() can drop it cleanly.
        mesh.userData.placeholderTex = placeholder;
        return mesh;
    }
}
