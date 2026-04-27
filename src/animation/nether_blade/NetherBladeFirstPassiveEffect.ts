import * as THREE from "three";

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
        // Optional world-space target rect (centre x/y + width/height, world
        // coords). When provided, the slash + shatter visuals are confined to
        // that rect — e.g. the opponent battlefield gets sliced and the rest of
        // the screen stays untouched. When omitted, the effect runs fullscreen.
        targetRect?: { x: number; y: number; width: number; height: number },
    ): Promise<void> {
        console.log(`[NetherBladeFirstPassiveEffect] fullscreen play() — targets=${targetPositions.length}`);

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const CX = vw / 2;
        const CY = vh / 2;

        // Wave 1 (fullscreen cinematic) is always full-viewport. Wave 2 + the
        // shatter use w2Rect — scoped to targetRect if the caller supplied one
        // (e.g. opponent battlefield), otherwise also full viewport.
        const fullscreenRect = { x: 0, y: 0, width: vw, height: vh };
        const w2Rect = targetRect ?? fullscreenRect;

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
        // Derived UV mapping from the wave-2/shatter plane into the captured
        // full-scene texture. Camera is OrthographicCamera spanning
        // [-vw/2,vw/2] × [-vh/2,vh/2], so a world point (x, y) maps to UV
        // (0.5 + x/vw, 0.5 + y/vh) on the captured texture.
        const capUvOffsetX = 0.5 + (w2Rect.x - w2Rect.width  * 0.5) / vw;
        const capUvOffsetY = 0.5 + (w2Rect.y - w2Rect.height * 0.5) / vh;
        const capUvScaleX  = w2Rect.width  / vw;
        const capUvScaleY  = w2Rect.height / vh;

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
        // Wave 2 is split into a slow zoom-in followed by the actual slashes
        // so the player has time to register that the enemy field has grown
        // to fill the viewport ("지금 적진이 전체 화면이 되었구나") before
        // the strike lands. ZOOM_IN_FRAMES occupies the front of the
        // rectSlash phase; slashes are u_triggerTime-delayed by that same
        // amount so they only become visible after zoom-in finishes.
        const ZOOM_IN_FRAMES   = 36;   // ~0.60 s gradual zoom-in (easeInOut)
        const RECT_SLASH_DURATION = 80; // ~1.33 s — zoom-in + slash traversal
        // Shatter holds full zoom for the first half (panel breaks at full
        // scale), then zooms back over the second half alongside the
        // fragment fade — so the restoration also reads as a slow,
        // perceptible "back to original size" rather than a snap.
        const SHATTER_DURATION = 80;   // ~1.33 s — break + slow zoom-out
        const SHATTER_HOLD_RATIO = 0.50; // first 50 %: full zoom, fragments drift

        // ─── Particles — purple sparks spiralling INTO screen centre ────────
        type Particle = {
            x: number; y: number;
            angle: number; dist: number;
            speed: number; size: number;
            alpha: number; life: number; maxLife: number;
            hue: number; spiral: number;
            tail: { x: number; y: number }[];
        };
        const resetParticle = (p: Particle, initial: boolean): void => {
            const angle = Math.random() * Math.PI * 2;
            const dist = 200 + Math.random() * Math.max(vw, vh) * 0.55;
            p.x = CX + Math.cos(angle) * dist;
            p.y = CY + Math.sin(angle) * dist;
            p.angle = angle;
            p.dist = dist;
            p.speed = 1.5 + Math.random() * 2.5;
            p.size = 1.5 + Math.random() * 3;
            p.alpha = initial ? Math.random() : 0;
            p.life = 0;
            p.maxLife = 60 + Math.random() * 60;
            p.hue = 260 + Math.random() * 40;
            p.spiral = 0.03 + Math.random() * 0.04;
            p.tail = [];
        };
        const newParticle = (initial: boolean): Particle => {
            const p: Particle = {
                x: 0, y: 0, angle: 0, dist: 0, speed: 0, size: 0,
                alpha: 0, life: 0, maxLife: 0, hue: 0, spiral: 0, tail: [],
            };
            resetParticle(p, initial);
            return p;
        };
        const PARTICLE_COUNT = 160;
        const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => newParticle(true));

        // ─── Wisps — ambient energy specks orbiting the core ────────────────
        type Wisp = {
            angle: number; dist: number; speed: number;
            size: number; alpha: number; hue: number; phase: number;
            x: number; y: number;
        };
        const resetWisp = (w: Wisp): void => {
            w.angle = Math.random() * Math.PI * 2;
            w.dist = 60 + Math.random() * 100;
            w.speed = 0.012 + Math.random() * 0.02;
            w.size = 2 + Math.random() * 4;
            w.alpha = 0.3 + Math.random() * 0.5;
            w.hue = 255 + Math.random() * 50;
            w.phase = Math.random() * Math.PI * 2;
            w.x = 0; w.y = 0;
        };
        const newWisp = (): Wisp => {
            const w: Wisp = { angle: 0, dist: 0, speed: 0, size: 0, alpha: 0, hue: 0, phase: 0, x: 0, y: 0 };
            resetWisp(w);
            return w;
        };
        const wisps: Wisp[] = Array.from({ length: 10 }, () => newWisp());

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
        // Captured-field plane — single intact mesh that shows the rect's
        // slice of the captured live scene. Visible during the rectSlash
        // phase so as w2Group ZOOMS up, the player sees the enemy field
        // itself grow to fill the viewport. Hidden the moment the shatter
        // starts (the fragment meshes take over rendering the captured
        // content from there).
        let panelField: THREE.Mesh | null = null;
        let panelFieldMat: THREE.ShaderMaterial | null = null;
        // Group that holds all wave-2 visuals (panelBackdrop + fragments +
        // rectSlashMesh). Animated to ZOOM IN during the AoE strike — the
        // upper rect scales up to fill the entire viewport so the slashes
        // and the panel-shatter feel screen-wide. After the panel breaks the
        // group ZOOMS BACK OUT to the original rect, restoring the live scene
        // ratio while the fragments fade.
        let w2Group: THREE.Group | null = null;

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
        let ringAngle = 0;

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
                    // Wave-2 group — anchored at the rect centre. All wave-2
                    // visuals (panelField / panelBackdrop / rectSlashMesh /
                    // fragments) are attached as children. Per-frame the
                    // group's scale/pos is animated so the rect ZOOMS to fill
                    // the viewport during the strike + shatter, then ZOOMS
                    // BACK during restoration.
                    w2Group = new THREE.Group();
                    w2Group.position.set(w2Rect.x, w2Rect.y, 8);
                    this.scene.add(w2Group);

                    // Captured-field plane — shows the rect slice of the
                    // captured live scene. Lives at local (0,0) so when the
                    // group zooms, this plane is the thing the player SEES
                    // growing to fullscreen ("적진이 전체 화면이 되었구나").
                    // Sampling uses the vertex's ORIGINAL world position so
                    // the texture content stays "pinned" to its real
                    // battlefield coordinates while the parent scales.
                    if (captureRT) {
                        panelFieldMat = new THREE.ShaderMaterial({
                            transparent: true,
                            depthTest: false,
                            depthWrite: false,
                            uniforms: {
                                u_captured:   { value: captureRT.texture },
                                u_rectCenter: { value: new THREE.Vector2(w2Rect.x, w2Rect.y) },
                                u_viewSize:   { value: new THREE.Vector2(vw, vh) },
                                u_alpha:      { value: 1.0 },
                            },
                            vertexShader: `
                                uniform vec2 u_rectCenter;
                                uniform vec2 u_viewSize;
                                varying vec2 v_uv;
                                void main() {
                                    vec2 origWorld = position.xy + u_rectCenter;
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
                                varying vec2      v_uv;
                                void main() {
                                    vec4 c = texture2D(u_captured, v_uv);
                                    gl_FragColor = vec4(c.rgb, c.a * u_alpha);
                                }
                            `,
                        });
                        panelField = new THREE.Mesh(
                            new THREE.PlaneGeometry(w2Rect.width, w2Rect.height),
                            panelFieldMat,
                        );
                        panelField.position.set(0, 0, 0.04);
                        panelField.renderOrder = 9999;
                        w2Group.add(panelField);
                    }

                    // Wave-2 mesh — SAME reference-style slash shader as wave 1
                    // but z is INVERTED (-60 → +30) so the slashes fly AWAY
                    // from the camera, INTO the panel. Same RefSlash array so
                    // the cuts continue along the same trajectories — only the
                    // depth direction flips ("monitor 쪽으로 → monitor 에서 멀어지면서").
                    // u_triggerTime is delayed by the zoom-in duration so the
                    // slashes only start flying AFTER the zoom-in completes —
                    // the player gets a clean beat to register the fullscreen
                    // enemy field before the strike lands.
                    const slashTriggerDelaySec = ZOOM_IN_FRAMES / 60;
                    rectSlashMaterial = createRefSlashMaterial(
                        w2Rect.width, w2Rect.height,
                        -60.0, 30.0,
                        elapsedSec + slashTriggerDelaySec,
                    );
                    rectSlashMaterial.uniforms.u_alpha.value = 1.0;
                    rectSlashMesh = new THREE.Mesh(
                        new THREE.PlaneGeometry(w2Rect.width, w2Rect.height),
                        rectSlashMaterial,
                    );
                    rectSlashMesh.position.set(0, 0, 0.5);
                    rectSlashMesh.renderOrder = 10002;
                    w2Group.add(rectSlashMesh);
                    phase = 'rectSlash';
                    phaseTimer = 0;
                    cameraShake = 18;
                }
            } else if (phase === 'rectSlash') {
                // Wave 2 — slashes fly across the opponent battlefield. The
                // mesh's slash shader handles its own animation via u_time -
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
                    // The captured-field mesh is replaced by the per-shard
                    // meshes from this point on — hide it cleanly.
                    if (panelField) panelField.visible = false;
                    // Spawn the opaque black backdrop FIRST, behind the
                    // fragments. While the panel is "broken" the live scene
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
                        new THREE.PlaneGeometry(w2Rect.width, w2Rect.height),
                        panelBackdropMat,
                    );
                    panelBackdrop.position.set(0, 0, 0.05);
                    panelBackdrop.renderOrder = 10000;     // BELOW fragments (10001)
                    if (w2Group) (w2Group as THREE.Group).add(panelBackdrop);
                    else this.scene.add(panelBackdrop);

                    const minDim = Math.min(w2Rect.width, w2Rect.height);
                    // Seed polygon list with the rect itself.
                    let polys: [number, number][][] = [[
                        [w2Rect.x - w2Rect.width  * 0.5, w2Rect.y - w2Rect.height * 0.5],
                        [w2Rect.x + w2Rect.width  * 0.5, w2Rect.y - w2Rect.height * 0.5],
                        [w2Rect.x + w2Rect.width  * 0.5, w2Rect.y + w2Rect.height * 0.5],
                        [w2Rect.x - w2Rect.width  * 0.5, w2Rect.y + w2Rect.height * 0.5],
                    ]];
                    // Apply each slash as a cut line — splits each existing
                    // polygon into the two half-polygons on either side.
                    const lineLen = Math.max(w2Rect.width, w2Rect.height) * 1.6;
                    for (const sl of SLASHES_DATA) {
                        const cx = w2Rect.x + sl.ox * minDim;
                        const cy = w2Rect.y + sl.oy * minDim;
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
                    const distScaleHint = Math.max(w2Rect.width, w2Rect.height); // for drift fallback
                    for (const poly of polys.filter(p => p.length >= 3)) {
                        const [pcx, pcy] = polygonCentroid(poly);
                        // Find the nearest slash → drift direction = its
                        // perpendicular, sign chosen by which side of the line
                        // this fragment's centroid sits on.
                        let bestDist = Infinity;
                        let driftX = 0, driftY = 0;
                        for (const sl of SLASHES_DATA) {
                            const slCx = w2Rect.x + sl.ox * minDim;
                            const slCy = w2Rect.y + sl.oy * minDim;
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
                            // Fallback — drift away from rect centre.
                            const ddx = pcx - w2Rect.x, ddy = pcy - w2Rect.y;
                            const len = Math.hypot(ddx, ddy) || 1;
                            driftX = ddx / len; driftY = ddy / len;
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
                        // Position is LOCAL to w2Group (rect-centre origin).
                        // The vertex shader still uses the WORLD centroid
                        // (u_origCentroid) for texture sampling so each shard
                        // carries its original slice of the captured scene
                        // even while the parent group is zooming.
                        mesh.position.set(pcx - w2Rect.x, pcy - w2Rect.y, 0.2);
                        mesh.renderOrder = 10001;
                        if (w2Group) (w2Group as THREE.Group).add(mesh);
                        else this.scene.add(mesh);

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
                const distScale = Math.max(w2Rect.width, w2Rect.height) * 0.55;
                // Fragments + backdrop fade alongside the slow zoom-out
                // (last 50 % of shatter) so restoration reads as one
                // continuous motion: pieces fade WHILE the panel shrinks
                // back to its original size — 원상복구.
                const breakAlpha = sT > SHATTER_HOLD_RATIO
                    ? Math.max(1 - (sT - SHATTER_HOLD_RATIO) / (1 - SHATTER_HOLD_RATIO), 0)
                    : 1;
                for (const f of fragments) {
                    const d = ease * f.splitSpeed * distScale;
                    // Drift in LOCAL space (relative to w2Group's rect-centre
                    // origin) so the zoom transform on w2Group multiplies the
                    // motion correctly.
                    f.mesh.position.x = (f.origCx - w2Rect.x) + f.driftX * d;
                    f.mesh.position.y = (f.origCy - w2Rect.y) + f.driftY * d;
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

            // ── Wave-2 ZOOM animation ───────────────────────────────────────
            // The whole upper rect (w2Group) scales up to fill the viewport
            // GRADUALLY (~0.6 s easeInOut) so the player perceives the
            // enemy field becoming the full screen ("적진이 전체 화면이
            // 되었구나") before the strike lands. After the panel breaks,
            // it eases BACK to its original ratio over the second half of
            // the shatter — restoration reads as one slow continuous motion
            // rather than a snap.
            if (w2Group) {
                // easeInOutCubic: smooth ramp at both ends.
                const easeInOutCubic = (t: number): number =>
                    t < 0.5
                        ? 4 * t * t * t
                        : 1 - Math.pow(-2 * t + 2, 3) / 2;
                let zoomT = 0;
                if (phase === 'rectSlash') {
                    // First ZOOM_IN_FRAMES of rectSlash: gradual easeInOut
                    // ramp from 0 → 1. Slashes are u_triggerTime-delayed by
                    // the same amount so they only fire AFTER zoom-in.
                    if (phaseTimer <= ZOOM_IN_FRAMES) {
                        const raw = Math.max(0, phaseTimer / ZOOM_IN_FRAMES);
                        zoomT = easeInOutCubic(Math.min(raw, 1));
                    } else {
                        zoomT = 1;
                    }
                } else if (phase === 'shatter') {
                    const sT = Math.min(phaseTimer / SHATTER_DURATION, 1);
                    if (sT <= SHATTER_HOLD_RATIO) {
                        zoomT = 1;
                    } else {
                        // Last (1 - HOLD) fraction of shatter: ease BACK out.
                        const outRaw = (sT - SHATTER_HOLD_RATIO) / (1 - SHATTER_HOLD_RATIO);
                        zoomT = 1 - easeInOutCubic(Math.min(outRaw, 1));
                    }
                }
                const scaleX = 1 + (vw / w2Rect.width  - 1) * zoomT;
                const scaleY = 1 + (vh / w2Rect.height - 1) * zoomT;
                w2Group.scale.set(scaleX, scaleY, 1);
                w2Group.position.x = w2Rect.x * (1 - zoomT);
                w2Group.position.y = w2Rect.y * (1 - zoomT);
            }

            // ── Update particles ────────────────────────────────────────────
            const activeIntensity = phase === 'decay' ? 0.05 : intensity;
            const partI = activeIntensity * 0.4 + 0.6;
            for (const p of particles) {
                p.life += dt;
                if (p.life < 10) p.alpha += 0.08 * dt;
                if (p.life > p.maxLife - 10) p.alpha -= 0.10 * dt;
                if (p.alpha < 0) p.alpha = 0;
                p.angle += p.spiral * partI * dt;
                const pull = Math.max(0.05, 1 - p.dist / 400);
                p.dist -= p.speed * partI * (1.2 + pull * 4.0) * dt;
                p.x = CX + Math.cos(p.angle) * p.dist;
                p.y = CY + Math.sin(p.angle) * p.dist;
                p.tail.unshift({ x: p.x, y: p.y });
                if (p.tail.length > 12) p.tail.pop();
                if (p.dist < 8 || p.life > p.maxLife) resetParticle(p, false);
            }

            // ── Update wisps ────────────────────────────────────────────────
            const wispI = Math.min(intensity * 0.3, 1);
            for (const w of wisps) {
                w.angle += w.speed * dt;
                w.phase += 0.04 * dt;
                w.dist -= 0.3 * wispI * dt;
                if (w.dist < 20) resetWisp(w);
                w.x = CX + Math.cos(w.angle) * w.dist + Math.cos(w.phase * 2.1) * 12;
                w.y = CY + Math.sin(w.angle) * w.dist + Math.sin(w.phase * 1.7) * 12;
            }

            // ── Draw Canvas-2D overlay ──────────────────────────────────────
            ctx.clearRect(0, 0, vw, vh);
            ctx.save();
            ctx.translate(CX, CY);
            ctx.scale(screenScale, screenScale);
            ctx.translate(-CX, -CY);

            // Backdrop — held through gather/hold/release so the wave-1 slashes
            // fly over the SAME dark violet energy-gather background instead of
            // suddenly playing over the bare game screen. Fades out during the
            // decay phase. Wave 2 (pause/rectSlash/shatter) gets bgAlpha = 0
            // → original game scene shows through.
            let bgAlpha = 0;
            if (phase === 'gather') bgAlpha = Math.min(phaseTimer / GATHER_DURATION, 1) * 0.92;
            else if (phase === 'hold') bgAlpha = 0.92;
            else if (phase === 'release') bgAlpha = 0.92;
            else if (phase === 'decay') {
                const decayT = Math.min(phaseTimer / DECAY_DURATION, 1);
                bgAlpha = 0.92 * (1 - decayT);
            }
            if (bgAlpha > 0) {
                ctx.fillStyle = `rgba(5, 3, 8, ${bgAlpha})`;
                ctx.fillRect(0, 0, vw, vh);
            }

            // Ambient purple fog — held through gather/hold/release; fades
            // during decay alongside the backdrop.
            {
                let fogT = 0;
                if (phase === 'gather') fogT = Math.min(phaseTimer / GATHER_DURATION, 1);
                else if (phase === 'hold' || phase === 'release') fogT = 1;
                else if (phase === 'decay') fogT = Math.max(1 - phaseTimer / DECAY_DURATION, 0);
                if (fogT > 0) {
                    const fog = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(vw, vh) * 0.50);
                    fog.addColorStop(0,   `rgba(60, 10, 120, ${0.35 * fogT})`);
                    fog.addColorStop(0.6, `rgba(30,  5,  80, ${0.18 * fogT})`);
                    fog.addColorStop(1,   'rgba(0,0,0,0)');
                    ctx.fillStyle = fog;
                    ctx.fillRect(0, 0, vw, vh);
                }
            }

            // Particles — visible through gather/hold/release; fade during decay.
            let particleVis = 0;
            if (phase === 'gather' || phase === 'hold' || phase === 'release') particleVis = 1;
            else if (phase === 'decay') particleVis = Math.max(1 - phaseTimer / DECAY_DURATION, 0);
            if (particleVis > 0) {
                for (const p of particles) {
                    if (p.alpha <= 0) continue;
                    const pa = p.alpha * particleVis;
                    for (let i = 0; i < p.tail.length; i++) {
                        const tt = p.tail[i];
                        const a = (1 - i / p.tail.length) * pa * 0.5;
                        ctx.beginPath();
                        ctx.arc(tt.x, tt.y, p.size * (1 - i / p.tail.length), 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${a})`;
                        ctx.fill();
                    }
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue}, 90%, 80%, ${pa})`;
                    ctx.fill();
                }
                for (const w of wisps) {
                    ctx.beginPath();
                    ctx.arc(w.x, w.y, w.size * wispI, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${w.hue}, 80%, 70%, ${w.alpha * wispI * particleVis})`;
                    ctx.fill();
                }
            }

            // Core orb (gather/hold/early release).
            if (coreAlpha > 0) {
                const jitter = (Math.random() - 0.5) * intensity * 2;
                ctx.save();
                ctx.translate(jitter, jitter);

                for (let i = 4; i >= 1; i--) {
                    const gr = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreRadius * (i * 1.8));
                    gr.addColorStop(0,   `rgba(200, 160, 255, ${coreAlpha * 0.15 / i})`);
                    gr.addColorStop(0.5, `rgba(130,  70, 230, ${coreAlpha * 0.08 / i})`);
                    gr.addColorStop(1,   `rgba( 80,  20, 180, 0)`);
                    ctx.beginPath();
                    ctx.arc(CX, CY, coreRadius * (i * 1.8), 0, Math.PI * 2);
                    ctx.fillStyle = gr;
                    ctx.fill();
                }

                const flicker = 0.85 + Math.random() * 0.3;
                const gr = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreRadius);
                gr.addColorStop(0,   `rgba(255, 255, 255, ${coreAlpha * flicker})`);
                gr.addColorStop(0.2, `rgba(230, 210, 255, ${coreAlpha * 0.95})`);
                gr.addColorStop(0.5, `rgba(160,  90, 255, ${coreAlpha * 0.7})`);
                gr.addColorStop(0.8, `rgba( 80,  30, 200, ${coreAlpha * 0.4})`);
                gr.addColorStop(1,   `rgba( 40,   0, 120, 0)`);
                ctx.beginPath();
                ctx.arc(CX, CY, coreRadius, 0, Math.PI * 2);
                ctx.fillStyle = gr;
                ctx.fill();

                ringAngle += 0.06 * intensity * (phase === 'hold' ? 2.5 : 1) * dt;
                ctx.save();
                ctx.translate(CX, CY);
                ctx.rotate(ringAngle);
                for (let i = 0; i < 3; i++) {
                    ctx.rotate((Math.PI * 2) / 3);
                    ctx.beginPath();
                    ctx.arc(0, 0, coreRadius * 1.6, 0, Math.PI * 0.6);
                    ctx.strokeStyle = `rgba(180, 120, 255, ${coreAlpha * 0.5})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                ctx.restore();

                ctx.restore();
            }

            // Bright white screen flash — punches into release.
            if (flashAlpha > 0) {
                const fc = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(vw, vh));
                fc.addColorStop(0,   `rgba(255, 250, 255, ${flashAlpha * 0.95})`);
                fc.addColorStop(0.3, `rgba(220, 180, 255, ${flashAlpha * 0.6})`);
                fc.addColorStop(1,   `rgba(100,  60, 200, 0)`);
                ctx.fillStyle = fc;
                ctx.fillRect(0, 0, vw, vh);
            }

            // Vignette.
            if (bgAlpha > 0) {
                const vig = ctx.createRadialGradient(CX, CY, vh * 0.25, CX, CY, vh * 0.8);
                vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
                vig.addColorStop(1, `rgba(0, 0, 8, ${0.75 * bgAlpha / 0.92})`);
                ctx.fillStyle = vig;
                ctx.fillRect(0, 0, vw, vh);
            }

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
        // Wave-2 children live under w2Group; dispose their resources but
        // skip the per-mesh scene.remove (the whole group goes at once).
        for (const f of fragments) {
            f.mesh.geometry.dispose();
            f.material.dispose();
        }
        fragments.length = 0;
        if (panelBackdrop !== null) {
            const m = panelBackdrop as THREE.Mesh;
            m.geometry.dispose();
            (m.material as THREE.Material).dispose();
        }
        if (panelField !== null) {
            const m = panelField as THREE.Mesh;
            m.geometry.dispose();
        }
        if (panelFieldMat !== null) {
            (panelFieldMat as THREE.ShaderMaterial).dispose();
        }
        if (rectSlashMesh !== null) {
            const m = rectSlashMesh as THREE.Mesh;
            m.geometry.dispose();
        }
        if (rectSlashMaterial !== null) {
            (rectSlashMaterial as THREE.ShaderMaterial).dispose();
        }
        if (w2Group !== null) {
            this.scene.remove(w2Group as THREE.Group);
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
