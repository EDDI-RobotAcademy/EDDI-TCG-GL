import * as THREE from "three";

import { NetherBladeChargeVisual } from "./NetherBladeChargeVisual";

// 네더 블레이드 단일기(패시브 2).
//
// 도입부 gather / hold 는 광역기와 **같은 모듈**(NetherBladeChargeVisual)을 쓴다.
// 그 뒤가 갈린다 — 광역기는 release → decay → pause → rectSlash → shatter 로 화면을
// 통째로 찢지만, 단일기는 이렇게 간다.
//
//   gather → hold → volley → converge → rip
//
//   volley   화면 전체를 가로지르는 보라 검풍이 카메라를 향해 날아온다.
//            어느 한 대상을 겨냥하지 않는다 — 광역기와 같은 스케일의 도입 타격.
//   converge 검풍이 사방에서 **사용자가 지정한 카드**로 모여든다.
//   rip      모여든 검풍의 절단선을 따라 그 카드가 다각형 조각으로 갈라져 흩날린다.
//
// 조각내기는 Sutherland–Hodgman 반평면 클리핑이다. 절단선마다 폴리곤을 둘로 쪼개면
// 검풍 수에 따라 조각이 자연스럽게 늘어난다 — 미리 정한 격자보다 훨씬 그럴듯하다.

// ── 검풍 (volley) ─────────────────────────────────────────────────────────────
const Z_START = 60;
const Z_END = -388;
const FOCAL = 400;
const VOLLEY_COUNT = 5;
const VOLLEY_GAP = 0.06;      // 발 사이 간격(초)
const NUM_BLADES = 2;         // 한 발에 겹치는 초승달 수
const SPEED_MULT = 1.7;
const DURATION = 1.6;         // 한 발이 Z_START → Z_END 를 지나는 시간(초)
const APPROACH_START = 0.12;
const APPROACH_END = 2.6;
const LANE_SPREAD = 165;      // 발마다 자기 차선을 지켜 겹치지 않게 한다
const TRAIL_KEEP = 12;
const GLOW_SCALE = 1.6;
const OUT_LEN_MULT = 1.9;     // 발사 검풍 길이 배율
const OUT_SLIM = 0.78;        // 발사 검풍 두께 (작을수록 날렵)
const MIN_ANGLE_SEP = 0.30;

// ── 수렴 (converge) ───────────────────────────────────────────────────────────
const RETURN_BLADES = 5;
const RETURN_SPEED = 2.4;     // p 진행 속도(1/초)
const RETURN_DONE = 1.25;     // p 가 이 값을 넘으면 그 검풍은 끝

// ── 찢김 (rip) ────────────────────────────────────────────────────────────────
const PIECE_HOLD = 1.15;      // 조각이 흩날리는 시간(초)
const BURST = 12;
const SHAKE_AMOUNT = 7;

type Poly = Array<[number, number]>;

interface OutSlash {
    t: number;
    delay: number;
    angle: number;
    laneT: number;
    trail: Array<[number, number]>;
    renderSize: number;
    done: boolean;
}

interface ReturnSlash {
    slashAngle: number;
    sx: number; sy: number;
    p: number;
    trail: Array<[number, number]>;
    done: boolean;
}

interface RipFragment {
    readonly mesh: THREE.Mesh;
    readonly material: THREE.ShaderMaterial;
    readonly origCx: number;
    readonly origCy: number;
    readonly driftX: number;
    readonly driftY: number;
    readonly speed: number;
    readonly spin: number;
}

export class NetherBladeSecondPassiveEffect {
    private filamentSeed = 0;

    constructor(private readonly scene: THREE.Scene) {}

    // targetPos     — 지정된 대상의 월드 좌표 (검풍이 모여드는 지점)
    // targetGroup   — 잘려 나갈 대상 그룹. 조각이 흩날리는 동안 숨겼다가 되돌린다
    // canvasElement — 화면 흔들림을 걸 캔버스
    // renderer/camera — 잘리는 순간의 화면을 캡처하는 데 쓴다. 카드 아트를 다시
    //   불러오는 게 아니라 **실제로 렌더된 대상**을 오려내야 하므로 필수에 가깝다
    //   (없으면 조각내기를 건너뛴다).
    // onStrike      — 검풍이 대상에 닿는 순간 (데미지 타이밍 훅)
    // lethal        — 이 일격으로 대상이 죽는가. true면 조각이 흩어진 뒤 원본을
    //   되돌리지 않는다. 갈라지는 연출이 그대로 사망 처리가 되어야지, 카드가
    //   되살아났다가 곧바로 사라지면 어색하다.
    public async play(
        targetPos: THREE.Vector3,
        targetGroup: THREE.Group | null,
        canvasElement: HTMLElement,
        renderer?: THREE.WebGLRenderer,
        camera?: THREE.Camera,
        onStrike?: () => void,
        lethal = false,
    ): Promise<void> {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const CX = vw / 2;
        const CY = vh / 2;

        // 월드 → 화면 픽셀. OrthographicCamera 가 화면을 1:1로 덮고 +y 가 위쪽이다.
        const TX = CX + targetPos.x;
        const TY = CY - targetPos.y;

        const ud = (targetGroup?.userData ?? {}) as { baseCardWidth?: number; baseCardHeight?: number };
        const cardW = (ud.baseCardWidth ?? 100) * (targetGroup?.scale.x ?? 1);
        const cardH = (ud.baseCardHeight ?? 160) * (targetGroup?.scale.y ?? 1);

        // 잘라 낼 범위 — 카드 사각형이 아니라 대상이 실제로 차지하는 영역.
        // 무기 / HP 아트가 카드 밖으로 크게 삐져나와 있어서, 카드 사각형만 자르면
        // 그 부분이 잘리지 않고 남는다.
        const targetBounds = (() => {
            if (!targetGroup) {
                return {
                    minX: targetPos.x - cardW / 2, minY: targetPos.y - cardH / 2,
                    maxX: targetPos.x + cardW / 2, maxY: targetPos.y + cardH / 2,
                };
            }
            // 대상이 실제로 차지하는 영역만 자른다. 바깥으로 여유를 주면 옆 카드까지
            // 잘려 나가므로 확장하지 않는다 — 카드의 투명한 여백에 배경이 들어 있어서
            // 배경 일부는 어차피 조각과 함께 뜯겨 나간다.
            const box = new THREE.Box3().setFromObject(targetGroup);
            return { minX: box.min.x, minY: box.min.y, maxX: box.max.x, maxY: box.max.y };
        })();

        // ─── Canvas-2D 오버레이 ────────────────────────────────────────────
        const canvas = document.createElement('canvas');
        canvas.width = vw;
        canvas.height = vh;
        const ctx = canvas.getContext('2d')!;

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;

        const overlay = new THREE.Mesh(
            new THREE.PlaneGeometry(vw, vh),
            new THREE.MeshBasicMaterial({
                map: tex, transparent: true, depthTest: false, depthWrite: false,
            }),
        );
        overlay.position.set(0, 0, 8);
        overlay.renderOrder = 9999;
        this.scene.add(overlay);

        const origTransform = canvasElement.style.transform;
        const applyShake = (sx: number, sy: number) => {
            canvasElement.style.transform = `${origTransform} translate(${sx}px, ${sy}px)`;
        };

        // 도입부는 화면 중앙에서 모인다 — 광역기와 동일.
        const charge = new NetherBladeChargeVisual(vw, vh, CX, CY);

        // ─── 페이즈 ────────────────────────────────────────────────────────
        // 프레임 수 (60Hz, dt 정규화). gather / hold 는 광역기와 같은 길이.
        const GATHER_DURATION = 8;
        const HOLD_DURATION = 14;

        let phase: 'gather' | 'hold' | 'volley' | 'converge' | 'rip' | 'done' = 'gather';
        let phaseTimer = 0;
        let intensity = 1;
        let screenScale = 1;
        let coreAlpha = 0;
        let coreRadius = 0;
        let flashAlpha = 0;
        let cameraShake = 0;

        const outSlashes: OutSlash[] = [];
        const pastTrails: Array<{ pts: Array<[number, number]>; a: number; size: number }> = [];
        const returnSlashes: ReturnSlash[] = [];
        const usedAngles: number[] = [];
        let fragments: RipFragment[] = [];
        let captureRT: THREE.WebGLRenderTarget | null = null;
        let cutMarks: Array<{ ang: number; a: number }> = [];
        let hiddenChildren: THREE.Object3D[] = [];
        let ripFlash = 0;
        let ripT = 0;
        let strikeFired = false;

        const startMs = performance.now();
        let lastTs = 0;

        await new Promise<void>((resolve) => {
            const loop = (ts: number) => {
                const dt = lastTs > 0 ? Math.min((ts - lastTs) / 16.67, 3) : 1;
                lastTs = ts;
                const dtSec = dt / 60;
                phaseTimer += dt;

                cameraShake *= 0.82;
                applyShake((Math.random() - 0.5) * cameraShake, (Math.random() - 0.5) * cameraShake);
                flashAlpha *= 0.88;
                if (flashAlpha < 0.01) flashAlpha = 0;
                ripFlash = Math.max(0, ripFlash - dtSec * 5);

                intensity = 1;
                screenScale = 1;

                // ── gather / hold — 광역기와 동일한 수치 ────────────────────
                if (phase === 'gather') {
                    const t = Math.min(phaseTimer / GATHER_DURATION, 1);
                    const fast = Math.pow(t, 0.30);
                    intensity = 1 + fast * 5.0 + Math.sin(t * 30) * 0.55;
                    coreAlpha = Math.min(fast * 2.2, 1);
                    coreRadius = 14 + fast * 105;
                    screenScale = 1 + fast * 0.07;
                    if (phaseTimer >= GATHER_DURATION) {
                        phase = 'hold'; phaseTimer = 0; flashAlpha = 1.0;
                    }
                } else if (phase === 'hold') {
                    intensity = 4.5 + Math.sin(phaseTimer * 0.3) * 0.5;
                    coreRadius = 105 + Math.sin(phaseTimer * 0.4) * 8;
                    coreAlpha = 1;
                    screenScale = 1.05 + Math.sin(phaseTimer * 0.3) * 0.01;
                    if (phaseTimer >= HOLD_DURATION) {
                        phase = 'volley'; phaseTimer = 0;
                        flashAlpha = 1.0;
                        cameraShake = 22;
                        for (let i = 0; i < VOLLEY_COUNT; i++) {
                            outSlashes.push({
                                t: 0,
                                delay: i * VOLLEY_GAP,
                                angle: this.pickAngle(usedAngles),
                                laneT: VOLLEY_COUNT > 1 ? (i / (VOLLEY_COUNT - 1)) * 2 - 1 : 0,
                                trail: [],
                                renderSize: 80,
                                done: false,
                            });
                        }
                    }
                } else if (phase === 'volley') {
                    intensity = Math.max(4.5 - phaseTimer * 0.15, 0.05);
                    coreAlpha = Math.max(1 - phaseTimer * 0.09, 0);
                    coreRadius = Math.max(105 - phaseTimer * 4, 0);
                    for (const sl of outSlashes) {
                        if (sl.done) continue;
                        if (sl.delay > 0) { sl.delay -= dtSec; continue; }
                        sl.t += dtSec * SPEED_MULT / DURATION;
                        if (sl.t >= 1) {
                            // 본체는 카메라를 지나쳐 사라지고 궤적만 잔상으로 남는다.
                            pastTrails.push({ pts: sl.trail, a: 1, size: sl.renderSize });
                            sl.done = true;
                        }
                    }
                    if (outSlashes.every((sl) => sl.done)) {
                        phase = 'converge'; phaseTimer = 0;
                        const RAD = Math.max(vw, vh) * 0.95;
                        for (let i = 0; i < RETURN_BLADES; i++) {
                            const inAng = (i / RETURN_BLADES) * Math.PI * 2;
                            returnSlashes.push({
                                slashAngle: inAng * 0.5 + (Math.random() - 0.5) * 0.2,
                                sx: TX + Math.cos(inAng) * RAD,
                                sy: TY + Math.sin(inAng) * RAD,
                                p: 0,
                                trail: [],
                                done: false,
                            });
                        }
                    }
                } else if (phase === 'converge') {
                    coreAlpha = 0;
                    coreRadius = 0;
                    intensity = 0.1;
                    for (const rs of returnSlashes) {
                        if (rs.done) continue;
                        rs.p += dtSec * RETURN_SPEED;
                        if (rs.p >= 1 && !strikeFired) {
                            strikeFired = true;
                            try { onStrike?.(); }
                            catch (e) { console.error('[NetherBladeSecondPassiveEffect] onStrike error:', e); }
                        }
                        if (rs.p >= RETURN_DONE) rs.done = true;
                    }
                    if (returnSlashes.every((rs) => rs.done)) {
                        // ── 잘려 나가기 ────────────────────────────────────
                        // 카드 아트를 새로 불러오지 않는다. 지금 화면에 렌더된 그대로를
                        // 캡처해서 오려내야 무기·HP·에너지·네온까지 붙은 **그 대상**이
                        // 잘리는 것으로 보인다.
                        if (renderer && camera && targetGroup) {
                            captureRT = this.captureTargetOnly(renderer, camera, vw, vh, targetGroup);
                            fragments = this.buildFragments(
                                captureRT.texture, returnSlashes, targetBounds, vw, vh,
                            );
                            for (const f of fragments) this.scene.add(f.mesh);
                            // 원본을 숨긴다 — 조각 밑에 멀쩡한 대상이 남아 있으면
                            // 잘려 나간 것으로 보이지 않는다.
                            hiddenChildren = targetGroup.children.filter((c) => c.visible);
                            for (const c of hiddenChildren) c.visible = false;
                            console.log(`[NetherBladeSecondPassiveEffect] rip — ${fragments.length} fragments`);
                        }
                        cutMarks = returnSlashes.map((rs) => ({ ang: rs.slashAngle, a: 1 }));
                        ripFlash = 1;
                        cameraShake = SHAKE_AMOUNT * 2;
                        phase = 'rip'; phaseTimer = 0; ripT = 0;
                    }
                } else if (phase === 'rip') {
                    ripT += dtSec;
                    const t = Math.min(ripT / PIECE_HOLD, 1);
                    // 처음엔 거의 안 움직이다 서서히 벌어진다 — 폭발이 아니라 '갈라짐'.
                    const ease = t * t;
                    // 앞 65%는 온전히 보이고 뒤 35%에서만 사라진다 — 초반부터 옅어지면
                    // 플래시에 묻혀 잘린 게 안 보인다.
                    const alpha = 1 - Math.max(0, (t - 0.65) / 0.35);
                    for (const f of fragments) {
                        const spread = Math.max(
                            targetBounds.maxX - targetBounds.minX,
                            targetBounds.maxY - targetBounds.minY,
                        );
                        const d = ease * f.speed * spread * 0.9;
                        f.mesh.position.x = f.origCx + f.driftX * d;
                        f.mesh.position.y = f.origCy + f.driftY * d;
                        f.mesh.rotation.z = f.spin * ease;
                        f.material.uniforms.u_alpha.value = alpha;
                    }
                    // 자국은 조각이 사라진 뒤에도 잠깐 남았다가 끝날 때 맞춰 지워진다.
                    // 앞 35% 는 그대로 두고 나머지 구간에서 서서히 옅어진다.
                    const gouge = 1 - Math.max(0, (t - 0.35) / 0.65);
                    for (const cm of cutMarks) cm.a = gouge;
                    if (ripT >= PIECE_HOLD) phase = 'done';
                }

                charge.update(dt, phase === 'gather' || phase === 'hold' ? intensity : 0.05);

                // ─── 그리기 ────────────────────────────────────────────────
                ctx.clearRect(0, 0, vw, vh);
                ctx.save();
                ctx.translate(CX, CY);
                ctx.scale(screenScale, screenScale);
                ctx.translate(-CX, -CY);

                // 어두운 배경은 gather/hold/volley 동안만. 이후는 게임 화면이 비쳐야
                // 검풍이 실제 필드 위를 지나가는 것으로 읽힌다.
                let bgAlpha = 0;
                if (phase === 'gather') bgAlpha = Math.min(phaseTimer / GATHER_DURATION, 1) * 0.92;
                else if (phase === 'hold' || phase === 'volley') bgAlpha = 0.92;
                else if (phase === 'converge') bgAlpha = Math.max(0.92 - phaseTimer * 0.06, 0);

                let particleVis = 0;
                if (phase === 'gather' || phase === 'hold' || phase === 'volley') particleVis = 1;
                else if (phase === 'converge') particleVis = Math.max(1 - phaseTimer * 0.08, 0);

                charge.draw(ctx, {
                    bgAlpha,
                    fogT: particleVis,
                    particleVis,
                    coreAlpha,
                    coreRadius,
                    intensity,
                    ringSpin: phase === 'hold' ? 2.5 : 1,
                    flashAlpha,
                    dt,
                });

                // 발사 검풍 — 화면 전체를 가로지르며 카메라로 다가온다.
                for (const sl of outSlashes) {
                    if (sl.done || sl.delay > 0) continue;
                    const prog = this.ease3(Math.min(Math.max(sl.t, 0), 1));
                    const z = Z_START + (Z_END - Z_START) * prog;
                    const scale = FOCAL / (FOCAL + z);
                    const approach = APPROACH_START + (APPROACH_END - APPROACH_START) * prog;
                    // 카메라를 지나칠 때 무한히 커지지 않도록 상한을 둔다.
                    const size = Math.min(approach * scale * 120, Math.max(vw, vh) * 1.6);
                    sl.renderSize = size;

                    const ox = Math.cos(sl.angle) * (1 - prog) * 80 * scale;
                    const oy = Math.sin(sl.angle) * (1 - prog) * 80 * scale;
                    const bx = CX + sl.laneT * LANE_SPREAD * scale + ox;
                    const by = CY + oy;

                    sl.trail.push([bx, by]);
                    if (sl.trail.length > TRAIL_KEEP) sl.trail.shift();

                    const fadeA = prog < 0.1 ? prog * 10 : (prog > 0.85 ? (1 - prog) / 0.15 : 1);
                    this.drawTrail(ctx, sl.trail, size * 0.8, 1);
                    for (let b = 0; b < NUM_BLADES; b++) {
                        this.drawBlade(ctx, bx, by, size, sl.angle + b * 0.18 - 0.09,
                            fadeA * 0.92, OUT_LEN_MULT, OUT_SLIM);
                    }
                }

                for (const pt of pastTrails) {
                    pt.a -= dtSec * 2.2;
                    if (pt.a > 0) this.drawTrail(ctx, pt.pts, pt.size * 0.8, pt.a);
                }

                // 수렴 검풍 — 사방에서 지정 대상으로 모여든다.
                for (const rs of returnSlashes) {
                    const p = Math.min(Math.max(rs.p, 0), 1);
                    const ep = 1 - (1 - p) * (1 - p);
                    const cx2 = rs.sx + (TX - rs.sx) * ep;
                    const cy2 = rs.sy + (TY - rs.sy) * ep;
                    const size = 40 + ep * 120;

                    rs.trail.push([cx2, cy2]);
                    if (rs.trail.length > TRAIL_KEEP) rs.trail.shift();
                    this.drawTrail(ctx, rs.trail, size * 0.6, 1);

                    if (rs.p < RETURN_DONE) {
                        const fadeA = p > 0.85 ? 1 - (p - 0.85) : 0.9;
                        this.drawBlade(ctx, cx2, cy2, size, rs.slashAngle, fadeA, 1, 1);
                    }
                    if (rs.p >= 1 && rs.p < 1.3) {
                        ctx.save();
                        ctx.globalAlpha = (1.3 - rs.p) / 0.3;
                        this.drawHitSparks(ctx, TX, TY, rs.slashAngle);
                        ctx.restore();
                    }
                }

                // 지면에 파인 자국 — 카드는 조각나 날아가고, 바닥에는 상처만 남는다.
                // 조각 자체는 THREE 메쉬라 여기서 그리지 않는다.
                if (phase === 'rip' && cutMarks.length > 0) {
                    this.drawGroundGouge(
                        ctx, TX, TY,
                        Math.max(cardW, cardH) * 1.35,
                        cutMarks.map((cm) => cm.ang),
                        cutMarks[0].a,
                    );
                }

                if (ripFlash > 0) {
                    ctx.save();
                    ctx.globalAlpha = ripFlash * 0.35;
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillStyle = 'rgba(180,80,255,1)';
                    ctx.fillRect(0, 0, vw, vh);
                    ctx.restore();
                }

                ctx.restore();
                tex.needsUpdate = true;

                if (phase === 'done') { resolve(); return; }
                requestAnimationFrame(loop);
            };

            requestAnimationFrame(loop);
        });

        // ─── 정리 ──────────────────────────────────────────────────────────
        canvasElement.style.transform = origTransform;
        // 죽는 일격이면 숨긴 채로 둔다 — 조각이 흩어진 자리가 곧 사망이다.
        if (!lethal) for (const c of hiddenChildren) c.visible = true;
        for (const f of fragments) {
            this.scene.remove(f.mesh);
            f.mesh.geometry.dispose();
            f.material.dispose();
        }
        // 루프 클로저 안에서 대입되므로 TS의 흐름 분석이 null 로 좁혀 둔다.
        if (captureRT !== null) (captureRT as THREE.WebGLRenderTarget).dispose();
        this.scene.remove(overlay);
        overlay.geometry.dispose();
        (overlay.material as THREE.MeshBasicMaterial).dispose();
        tex.dispose();
        console.log(`[NetherBladeSecondPassiveEffect] done (${Math.round(performance.now() - startMs)}ms)`);
    }

    // ── 검풍 한 장 ────────────────────────────────────────────────────────
    private drawBlade(
        ctx: CanvasRenderingContext2D,
        x: number, y: number, size: number, angle: number,
        alpha: number, lengthMult: number, slim: number,
    ): void {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha;

        const L = size * lengthMult;
        const bulge = size * 0.38 * slim;

        // 바깥 보라 블룸 — 흐림 반경을 달리한 3겹
        for (let b = 3; b >= 1; b--) {
            ctx.save();
            ctx.filter = `blur(${Math.min(b * size * 0.18 * GLOW_SCALE, 80)}px)`;
            ctx.beginPath();
            ctx.moveTo(-L, 0);
            ctx.quadraticCurveTo(0, -bulge * 0.5, L * 0.6, 0);
            ctx.quadraticCurveTo(0, bulge, -L, 0);
            ctx.closePath();
            const og = ctx.createLinearGradient(-L, 0, L, 0);
            og.addColorStop(0, 'rgba(120,0,200,0)');
            og.addColorStop(0.5, `rgba(160,40,255,${0.18 / b})`);
            og.addColorStop(1, 'rgba(80,0,160,0)');
            ctx.fillStyle = og;
            ctx.fill();
            ctx.restore();
        }

        // 중간 청색
        ctx.save();
        ctx.filter = 'blur(3px)';
        ctx.beginPath();
        ctx.moveTo(-L * 0.9, 0);
        ctx.quadraticCurveTo(0, -bulge * 0.25, L * 0.55, 0);
        ctx.quadraticCurveTo(0, bulge * 0.55, -L * 0.9, 0);
        ctx.closePath();
        const mg = ctx.createLinearGradient(-L, 0, L, 0);
        mg.addColorStop(0, 'rgba(0,120,255,0)');
        mg.addColorStop(0.4, 'rgba(80,160,255,0.7)');
        mg.addColorStop(0.85, 'rgba(160,220,255,0.9)');
        mg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = mg;
        ctx.fill();
        ctx.restore();

        // 흰 코어
        ctx.save();
        ctx.filter = 'blur(1.5px)';
        ctx.beginPath();
        ctx.moveTo(-L * 0.7, 0);
        ctx.quadraticCurveTo(0, -bulge * 0.1, L * 0.5, 0);
        ctx.quadraticCurveTo(0, bulge * 0.25, -L * 0.7, 0);
        ctx.closePath();
        const hg = ctx.createLinearGradient(-L * 0.7, 0, L * 0.5, 0);
        hg.addColorStop(0, 'rgba(255,255,255,0)');
        hg.addColorStop(0.6, 'rgba(255,220,255,0.95)');
        hg.addColorStop(1, 'rgba(255,255,255,1)');
        ctx.fillStyle = hg;
        ctx.fill();
        ctx.restore();

        // 선단 발광 노드
        ctx.save();
        ctx.filter = 'blur(2px)';
        const tg = ctx.createRadialGradient(L * 0.5, 0, 0, L * 0.5, 0, size * 0.22);
        tg.addColorStop(0, 'rgba(255,255,255,1)');
        tg.addColorStop(0.4, 'rgba(200,180,255,0.8)');
        tg.addColorStop(1, 'rgba(160,80,255,0)');
        ctx.fillStyle = tg;
        ctx.beginPath();
        ctx.arc(L * 0.5, 0, size * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 번개 필라멘트
        ctx.save();
        ctx.filter = 'blur(0.8px)';
        for (let f = 0; f < 4; f++) {
            ctx.beginPath();
            let fx = -L * 0.3, fy = 0;
            ctx.moveTo(fx, fy);
            for (let s = 1; s <= 5; s++) {
                fx += (L * 0.8 / 5) + this.jitter(4);
                fy += this.jitter(size * 0.15);
                ctx.lineTo(fx, fy);
            }
            ctx.strokeStyle = `rgba(180,200,255,${0.35 - f * 0.06})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            if (f < 2) {
                const bx = fx - L * 0.25;
                ctx.beginPath();
                ctx.moveTo(bx, fy);
                ctx.lineTo(bx + 10 + Math.abs(this.jitter(10)), fy + this.jitter(12));
                ctx.stroke();
            }
        }
        ctx.restore();

        ctx.restore();
    }

    private drawTrail(
        ctx: CanvasRenderingContext2D,
        trail: Array<[number, number]>,
        size: number,
        alphaScale: number,
    ): void {
        if (trail.length < 2) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < trail.length - 1; i++) {
            const t = i / trail.length;
            ctx.beginPath();
            ctx.moveTo(trail[i][0], trail[i][1]);
            ctx.lineTo(trail[i + 1][0], trail[i + 1][1]);
            ctx.strokeStyle = `rgba(160,80,255,${t * 0.25 * alphaScale})`;
            ctx.lineWidth = size * t * 0.6 * 0.5;
            ctx.filter = 'blur(3px)';
            ctx.stroke();
        }
        ctx.restore();
    }

    private drawHitSparks(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number): void {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 18; i++) {
            const sa = ang + (Math.random() - 0.5) * Math.PI;
            const sl = 8 + Math.random() * 32;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(sa) * sl, y + Math.sin(sa) * sl);
            ctx.strokeStyle = `rgba(255,${Math.floor(120 + Math.random() * 100)},255,${0.5 + Math.random() * 0.5})`;
            ctx.lineWidth = 0.5 + Math.random() * 1.5;
            ctx.filter = 'blur(1px)';
            ctx.stroke();
        }
        ctx.restore();
    }

    // ── 잘려 나가기 ──────────────────────────────────────────────────────
    // **대상만** 담긴 텍스처를 만든다. 씬을 통째로 캡처하면 카드의 투명한 여백에
    // 배경이 배어 들어가, 조각이 배경 조각까지 들고 날아간다. 지면은 그 자리에
    // 남아 있어야 하고, 대신 파인 자국으로 피해를 표현한다.
    //
    // 대상에서 씬 루트까지 거슬러 올라가며 형제 노드를 전부 숨긴 뒤, 배경을
    // 투명하게 지우고 렌더한다.
    private captureTargetOnly(
        renderer: THREE.WebGLRenderer,
        camera: THREE.Camera,
        vw: number,
        vh: number,
        targetGroup: THREE.Group,
    ): THREE.WebGLRenderTarget {
        const dpr = renderer.getPixelRatio();
        const rt = new THREE.WebGLRenderTarget(
            Math.floor(vw * dpr),
            Math.floor(vh * dpr),
            { magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter },
        );

        const restore: Array<[THREE.Object3D, boolean]> = [];
        let node: THREE.Object3D = targetGroup;
        while (node.parent) {
            for (const sibling of node.parent.children) {
                if (sibling === node) continue;
                restore.push([sibling, sibling.visible]);
                sibling.visible = false;
            }
            node = node.parent;
        }

        const oldTarget = renderer.getRenderTarget();
        const oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearAlpha(0);
        renderer.setRenderTarget(rt);
        renderer.clear();
        renderer.render(this.scene, camera);
        renderer.setRenderTarget(oldTarget);
        renderer.setClearAlpha(oldClearAlpha);

        for (const [obj, was] of restore) obj.visible = was;
        return rt;
    }

    // 지면에 베인 자국. 검풍이 지나간 선을 따라 바닥이 얕게 파인 정도만 남긴다.
    // 발광이나 색은 넣지 않는다 — 보랏빛이 남으면 이펙트 잔재처럼 보이지, 땅이
    // 베인 것으로 보이지 않는다. 어두운 홈 하나면 충분하다.
    private drawGroundGouge(
        ctx: CanvasRenderingContext2D,
        cx: number, cy: number,
        len: number,
        angles: readonly number[],
        alpha: number,
    ): void {
        for (const ang of angles) {
            // 선마다 두께를 조금씩 다르게 — 다섯 줄이 똑같으면 그어 놓은 것처럼 보인다.
            const thick = len * (0.012 + Math.abs(Math.sin(ang * 3.1)) * 0.010);
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ang);

            // 가운데가 가장 깊고 양 끝으로 뾰족하게 사라진다.
            ctx.beginPath();
            ctx.moveTo(-len / 2, 0);
            ctx.quadraticCurveTo(0, -thick, len / 2, 0);
            ctx.quadraticCurveTo(0, thick, -len / 2, 0);
            ctx.closePath();

            // 양 끝 알파를 0으로 떨어뜨려 홈의 경계가 드러나지 않게 한다.
            const g = ctx.createLinearGradient(-len / 2, 0, len / 2, 0);
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(0.3, `rgba(4,3,6,${alpha * 0.55})`);
            g.addColorStop(0.7, `rgba(4,3,6,${alpha * 0.55})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.filter = 'blur(1.2px)';
            ctx.fill();

            ctx.restore();
        }
    }

    // 대상 카드의 월드 사각형을 검풍 절단선마다 반평면으로 쪼갠 뒤(Sutherland–Hodgman),
    // 각 조각을 캡처 텍스처를 입은 폴리곤 메쉬로 만든다. 정점 UV가 원래 화면 위치를
    // 가리키므로, 조각이 밀려나도 자기 몫의 그림을 그대로 들고 간다.
    private buildFragments(
        captured: THREE.Texture,
        slashes: readonly ReturnSlash[],
        bounds: { minX: number; minY: number; maxX: number; maxY: number },
        vw: number, vh: number,
    ): RipFragment[] {
        // 시드는 대상의 **실제 바운딩 박스**다. 카드 사각형만 쓰면 밖으로 삐져나온
        // 무기 / HP 아트가 잘리지 않고 남는다.
        const { minX, minY, maxX, maxY } = bounds;
        const wx = (minX + maxX) / 2;
        const wy = (minY + maxY) / 2;
        let polys: Poly[] = [[
            [minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY],
        ]];

        // 검풍 각도는 화면 좌표(y 아래쪽)라 월드로 뒤집는다.
        const worldAngles = slashes.map((rs) => -rs.slashAngle);
        for (const ang of worldAngles) {
            const nx = Math.sin(ang);
            const ny = -Math.cos(ang);
            const d = -(nx * wx + ny * wy);
            const next: Poly[] = [];
            for (const poly of polys) {
                for (const part of [
                    this.clipPolyByLine(poly, nx, ny, d),
                    this.clipPolyByLine(poly, -nx, -ny, -d),
                ]) {
                    if (part.length >= 3) next.push(part);
                }
            }
            if (next.length > 0) polys = next;
        }

        const out: RipFragment[] = [];
        for (const poly of polys) {
            const [pcx, pcy] = this.polyCentroid(poly);

            const shape = new THREE.Shape();
            poly.forEach(([px, py], i) => {
                if (i === 0) shape.moveTo(px - pcx, py - pcy);
                else shape.lineTo(px - pcx, py - pcy);
            });

            const material = new THREE.ShaderMaterial({
                transparent: true,
                depthTest: false,
                depthWrite: false,
                uniforms: {
                    u_captured: { value: captured },
                    u_origCentroid: { value: new THREE.Vector2(pcx, pcy) },
                    u_viewSize: { value: new THREE.Vector2(vw, vh) },
                    u_alpha: { value: 1.0 },
                },
                vertexShader: `
                    uniform vec2 u_origCentroid;
                    uniform vec2 u_viewSize;
                    varying vec2 v_uv;
                    void main() {
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
                    uniform float u_alpha;
                    varying vec2 v_uv;
                    void main() {
                        vec4 c = texture2D(u_captured, v_uv);
                        gl_FragColor = vec4(c.rgb, c.a * u_alpha);
                    }
                `,
            });

            const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
            mesh.position.set(pcx, pcy, 8.2);
            mesh.renderOrder = 10001;

            // 카드 중심에서 바깥으로 벌어진다.
            const dx = pcx - wx;
            const dy = pcy - wy;
            const dist = Math.hypot(dx, dy) || 1;
            out.push({
                mesh,
                material,
                origCx: pcx,
                origCy: pcy,
                driftX: dx / dist,
                driftY: dy / dist,
                speed: 0.35 + Math.random() * 0.55,
                spin: (Math.random() - 0.5) * 0.5,
            });
        }
        return out;
    }

    // 반평면 nx*x + ny*y + d >= 0 으로 폴리곤을 자른다 (Sutherland–Hodgman).
    private clipPolyByLine(poly: Poly, nx: number, ny: number, d: number): Poly {
        if (poly.length === 0) return [];
        const out: Poly = [];
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i];
            const b = poly[(i + 1) % poly.length];
            const da = nx * a[0] + ny * a[1] + d;
            const db = nx * b[0] + ny * b[1] + d;
            if (da >= 0) out.push(a);
            if ((da >= 0) !== (db >= 0)) {
                const t = da / (da - db);
                out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
            }
        }
        return out;
    }

    private polyCentroid(p: Poly): [number, number] {
        let cx = 0, cy = 0;
        for (const pt of p) { cx += pt[0]; cy += pt[1]; }
        return [cx / p.length, cy / p.length];
    }

    private pickAngle(used: number[]): number {
        for (let i = 0; i < 100; i++) {
            const a = (Math.random() * 2 - 1) * Math.PI;
            if (used.every((u) => this.angleDiff(a, u) >= MIN_ANGLE_SEP)) {
                used.push(a);
                if (used.length > VOLLEY_COUNT * 2) used.shift();
                return a;
            }
        }
        return (Math.random() * 2 - 1) * Math.PI;
    }

    private angleDiff(a: number, b: number): number {
        const norm = (v: number) => ((v % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let d = Math.abs(norm(a) - norm(b));
        if (d > Math.PI) d = Math.PI * 2 - d;
        return d;
    }

    private ease3(t: number): number { return t * t * t; }

    private jitter(range: number): number { 
        this.filamentSeed++;
        return (Math.random() - 0.5) * 2 * range;
    }
}
