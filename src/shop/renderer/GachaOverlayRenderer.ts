import {DomFrameRenderer} from "../../core/renderer/DomFrameRenderer";
import {CardGrade} from "../../card/grade";
import {getCardById} from "../../card/utility";
import {GachaOverlayFrame} from "../frame/GachaOverlayFrame";

// 뽑기 연출을 화면 위에 얹는 겹으로 그린다. **DOM 을 만드는 것은 여기뿐이다.**
//
// 겹이 넷이다. 아래에서 위로 쌓인다.
//
//   영상        책자가 펼쳐지는 것
//   결과 판     카드 열 장과 단추
//   파문        빛이 터진 자리에서 퍼지는 고리
//   흰 빛       영상에서 결과로 넘어가는 순간을 덮는다
//   건너뛰기    영상이 도는 동안 오른쪽 위
//
// 카드 한 장도 겹이 셋이다. **각자 하는 일이 다르다.**
//
//   halo    카드 뒤. 앉을 때 퍼지는 고리, 좋은 등급이 뒤집히기 전 맥동
//   inner   카드 자체. 앞뒤 두 면이 3D 로 돈다
//   flare   카드 앞. 뒤집히는 한가운데에서 터지는 섬광
//
// 글자 크기와 자리는 CSS 가 스스로 맞춘다. 그래서 `update` 가 할 일이 거의 없다 — 창 크기가
// 바뀌어도 격자와 글자가 따라간다. 그림판(WebGL)에 그릴 때는 그 일을 전부 손으로 했다.

// 뽑힌 카드 한 장. 화면에 보여 줄 것만 추렸다.
export interface DrawnCardView {
    readonly cardId: number;
    readonly name: string;
    readonly grade: CardGrade | null;
    readonly cost: number;
}

// 카드 번호로 화면에 보여 줄 것을 찾는다. 없는 번호면 null.
export function toDrawnCardView(cardId: number): DrawnCardView | null {
    const card = getCardById(cardId);
    if (!card) return null;
    const grade = Number(card.등급);
    return {
        cardId,
        name: card.카드명,
        // 등급이 안 적힌 카드가 한 장 있다. 그때는 null 로 둔다.
        grade: Number.isFinite(grade) && grade >= 1 && grade <= 5 ? (grade as CardGrade) : null,
        cost: card.필요_에너지 ?? 0,
    };
}

export class GachaOverlayRenderer implements DomFrameRenderer<GachaOverlayFrame> {
    public async build(frame: GachaOverlayFrame): Promise<HTMLElement> {
        ensureStyle(frame);

        const root = document.createElement('div');
        root.className = 'gacha-overlay';
        root.innerHTML = `
            <div class="gacha-video-wrap">
                ${frame.videoSrc
                    ? `<video class="gacha-video" playsinline preload="auto" muted>
                           <source src="${frame.videoSrc}" type="video/mp4">
                       </video>`
                    : ''}
            </div>
            <button class="gacha-skip" type="button">건너뛰기 &raquo;</button>
            <div class="gacha-ripple"></div>
            <div class="gacha-flash"></div>
            <div class="gacha-result">
                <div class="gacha-parchment">
                    ${legendHtml(frame)}
                    <div class="gacha-cards"></div>
                    <button class="gacha-tab" type="button" data-action="again"
                            aria-label="다시 소환"></button>
                    <button class="gacha-tab" type="button" data-action="close"
                            aria-label="닫기"></button>
                    <button class="gacha-tab gacha-tab-drawn" type="button"
                            data-action="flip-all">전체 뒤집기</button>
                </div>
                <div class="gacha-controls">
                    <button class="gacha-btn gacha-btn-secondary" type="button"
                            data-action="flip-all">전체 뒤집기</button>
                    <button class="gacha-btn gacha-btn-primary" type="button"
                            data-action="again">다시 소환</button>
                    <button class="gacha-btn gacha-btn-secondary" type="button"
                            data-action="close">닫기</button>
                </div>
            </div>
        `;
        return root;
    }

    // CSS 가 스스로 맞추므로 여기서 다시 잴 것이 없다.
    //
    // 비워 두지 않고 왜 비었는지 적는다. 안 적으면 [다시 재는 것을 잊었나] 로 읽힌다.
    public update(): void {
        // 격자와 글자 크기를 CSS 가 화면 크기에 맞춰 스스로 바꾼다.
    }

    public dispose(element: HTMLElement): void {
        element.remove();
    }

    // ── 안에 있는 것을 꺼내 주는 창구 ──────────────────────────────────────────
    //
    // 무엇을 어떻게 찾는지는 그리는 쪽만 안다. 부르는 쪽이 CSS 이름을 알면 안 된다.

    public video(root: HTMLElement): HTMLVideoElement | null {
        return root.querySelector('video');
    }

    public skipButton(root: HTMLElement): HTMLElement | null {
        return root.querySelector('.gacha-skip');
    }

    // 한 가지 일을 누르는 자리가 **둘**이다 — 넓은 화면은 양피지에 그려진 딱지,
    // 좁은 화면은 아래 글자 단추. 둘 다 돌려준다. 하나만 돌려주면 다른 쪽이 안 눌린다.
    public actionButtons(root: HTMLElement, action: string): HTMLElement[] {
        return Array.prototype.slice.call(
            root.querySelectorAll(`[data-action="${action}"]`),
        ) as HTMLElement[];
    }

    public cardSlots(root: HTMLElement): HTMLElement[] {
        return Array.prototype.slice.call(
            root.querySelectorAll('.gacha-card'),
        ) as HTMLElement[];
    }

    // 카드 열 장을 깐다. 전부 뒷면이다.
    public layCards(
        frame: GachaOverlayFrame, root: HTMLElement, cards: readonly DrawnCardView[],
    ): void {
        const holder = root.querySelector('.gacha-cards');
        if (!holder) return;
        holder.innerHTML = '';

        for (const card of cards) {
            const look = frame.gradeLook(card.grade);
            const slot = document.createElement('div');
            slot.className = 'gacha-card';
            slot.dataset.cardId = String(card.cardId);
            slot.dataset.flipDelay = String(look.flipDelayMs);
            slot.style.setProperty('--grade-border', look.border);
            slot.style.setProperty('--grade-glow', look.glow || 'none');
            slot.style.setProperty('--grade-tag-color', look.tagColor);

            if (look.anticipate) slot.dataset.anticipate = '1';
            if (look.beam) slot.classList.add('has-beam');
            slot.style.setProperty('--grade-reveal-glow', look.revealGlow || 'none');
            // 뒤쪽 빛은 좋은 등급만 받는다. 값이 있는 것에만 표를 달아 CSS 가 가른다.
            if (look.revealHalo) {
                slot.classList.add('has-aura');
                slot.style.setProperty('--grade-reveal-halo', look.revealHalo);
            }

            slot.innerHTML = `
                <div class="gacha-card-halo"></div>
                <div class="gacha-card-inner">
                    <div class="gacha-card-face gacha-card-back${
                        frame.cardBackImage !== null ? ' has-image' : ''}">
                        ${frame.cardBackImage !== null
                            ? `<img src="${frame.cardBackImage}" alt="">`
                            : DRAWN_BACK}
                    </div>
                    <div class="gacha-card-face gacha-card-front">
                        <img src="${frame.cardImage(card.cardId)}"
                             alt="${escapeText(card.name)}">
                        <div class="gacha-card-beam"></div>
                        <span class="gacha-card-glint gacha-glint-a"></span>
                        <span class="gacha-card-glint gacha-glint-b"></span>
                        <span class="gacha-card-glint gacha-glint-c"></span>
                    </div>
                </div>
                <div class="gacha-card-flare"></div>
            `;
            holder.appendChild(slot);
        }
    }

    public setStage(root: HTMLElement, stage: 'video' | 'result'): void {
        root.dataset.stage = stage;
    }

    public setFlash(root: HTMLElement, on: boolean, fastMs: number): void {
        const flash = root.querySelector<HTMLElement>('.gacha-flash');
        if (!flash) return;
        flash.style.transitionDuration = `${fastMs}ms`;
        flash.style.opacity = on ? '1' : '0';
    }

    public flip(slot: HTMLElement, flipped: boolean): void {
        slot.classList.toggle('is-flipped', flipped);
        // 뒤집혔으면 맥동을 멈춘다. **드러난 카드가 계속 두근거리면 안 된다.**
        if (flipped) slot.classList.remove('is-anticipating');
    }

    // ── 카드가 날아와 앉는다 ───────────────────────────────────────────────────
    //
    // 한 점에서 흩어져 제자리로 온다. 어디서 어디로 가는지는 **자리를 재서** 정한다 —
    // 격자가 창 크기에 따라 달라지므로 값으로 적어 둘 수 없다.
    //
    // 재는 데 offsetLeft/offsetTop 을 쓴다. 결과 판이 뜨는 동안 살짝 커지는 중이라
    // getBoundingClientRect 로 재면 그 크기가 섞여 들어간다. offset 은 안 섞인다.
    //
    // 돌려주는 값은 **마지막 장이 앉는 시각**이다. 부르는 쪽이 같은 셈을 두 번 하지 않게.
    public flyIn(frame: GachaOverlayFrame, root: HTMLElement): number {
        const holder = root.querySelector<HTMLElement>('.gacha-cards');
        if (!holder) return 0;
        const slots = this.cardSlots(root);
        if (slots.length === 0) return 0;

        // 흩어져 나오는 점. 판 가운데보다 조금 아래라 카드가 솟아오르는 것으로 읽힌다.
        const burstX = holder.offsetLeft + holder.offsetWidth * 0.5;
        const burstY = holder.offsetTop
            + holder.offsetHeight * (0.5 + frame.flyFromBelowRatio);

        slots.forEach((slot, index) => {
            const cx = slot.offsetLeft + slot.offsetWidth * 0.5;
            const cy = slot.offsetTop + slot.offsetHeight * 0.5;
            const tilt = (scatter(index) - 0.5) * 2 * frame.flyFromTiltDeg;
            const delay = frame.flyStartMs + index * frame.flyStepMs;
            slot.style.setProperty('--fly-dx', `${(burstX - cx).toFixed(1)}px`);
            slot.style.setProperty('--fly-dy', `${(burstY - cy).toFixed(1)}px`);
            slot.style.setProperty('--fly-rot', `${tilt.toFixed(1)}deg`);
            slot.style.setProperty('--fly-scale', String(frame.flyFromScale));
            slot.style.setProperty('--fly-ms', `${frame.flyInMs}ms`);
            slot.style.setProperty('--fly-delay', `${delay}ms`);
            // 고리는 카드가 거의 다 온 뒤에 퍼진다. 앉는 소리처럼 들려야 한다.
            slot.style.setProperty('--land-delay', `${delay + frame.flyInMs * 0.62}ms`);
        });

        // 다시 소환할 때 처음부터 돌게 한다. 클래스만 다시 붙이면 브라우저가 안 돌린다.
        holder.classList.remove('is-flying');
        void holder.offsetWidth;
        holder.classList.add('is-flying');

        return frame.flyStartMs + (slots.length - 1) * frame.flyStepMs + frame.flyInMs;
    }

    // 좋은 등급이 뒤집히기 전에 맥동한다. 아직 덮여 있는 것만.
    public startAnticipation(root: HTMLElement): void {
        for (const slot of this.cardSlots(root)) {
            if (slot.dataset.anticipate !== '1') continue;
            if (this.isFlipped(slot)) continue;
            slot.classList.add('is-anticipating');
        }
    }

    // 빛이 터진 순간. 화면이 흔들리고 파문이 퍼진다.
    public burst(root: HTMLElement): void {
        root.classList.remove('is-bursting');
        void root.offsetWidth;
        root.classList.add('is-bursting');
    }

    public isFlipped(slot: HTMLElement): boolean {
        return slot.classList.contains('is-flipped');
    }
}

// 뒷면 그림이 없을 때 값으로 그리는 것.
//
// 어두운 남빛 바탕에 금테, 가운데 팔각별, 점선 고리. 모양은 아래 CSS 에 있다.
// **그림이 생기면 이것을 안 쓴다.** 지우지 않고 남겨 둔다 — 카드 스킨이 생기면 스킨이
// 없는 카드에 다시 필요하다.
const DRAWN_BACK = `
    <div class="gacha-back-emblem">
        <div class="gacha-back-ring"></div>
        <div class="gacha-back-star"></div>
    </div>
`;

// 오른쪽 위 등급표. 어느 색이 어느 등급인지 한 군데서만 말한다.
function legendHtml(frame: GachaOverlayFrame): string {
    const rows = frame.legendGrades.map((grade) => {
        const look = frame.gradeLook(grade);
        return `<span class="gacha-legend-row" style="--legend-color:${look.tagColor}">`
            + `${look.label}</span>`;
    });
    return `<div class="gacha-legend">`
        + `<span class="gacha-legend-title">${frame.legendTitle}</span>`
        + rows.join('')
        + `</div>`;
}

// 장마다 조금씩 다르게 기울어지게 하는 값. 0~1.
//
// **난수가 아니다.** 같은 자리는 언제나 같게 기울어진다 — 뽑기를 다시 해도 판이 똑같이
// 흩어져야 어색하지 않고, 이상하게 보일 때 다시 볼 수 있다.
function scatter(index: number): number {
    const x = Math.sin((index + 1) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

// 카드 이름이 값이라 그대로 넣으면 안 된다. 태그로 읽힐 글자를 막는다.
function escapeText(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 모양을 한 번만 넣는다. 뽑기를 여러 번 해도 늘어나지 않는다.
function ensureStyle(frame: GachaOverlayFrame): void {
    const id = 'gacha-overlay-style';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
.gacha-overlay {
    position: fixed; inset: 0; z-index: 2000;
    color: #e0e6ed;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
    user-select: none; -webkit-user-select: none;
    background: radial-gradient(circle at center, #0d1527 0%, #05070d 85%);
}

/* 영상 겹 */
.gacha-video-wrap {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
    transition: opacity 0.8s ease;
}
/* 영상이 세로(768x1152)다. 화면은 가로가 길다.
 *
 * contain 으로 높이에 맞춘다 — 양옆에 여백이 생기지만, 그 자리에 겹의 어두운 바탕이
 * 보여 테두리처럼 읽힌다. cover 로 채우면 위아래가 크게 잘려 책이 화면을 벗어난다.
 *
 * (이 모양은 템플릿 문자열 안이다. 주석에 백틱을 쓰면 문자열이 끊긴다.) */
.gacha-video {
    height: 100%; width: auto; max-width: 100%;
    object-fit: contain; background: transparent;
}
.gacha-overlay[data-stage="result"] .gacha-video-wrap { opacity: 0; }

/* 건너뛰기 — 영상이 도는 동안만 보인다 */
.gacha-skip {
    position: absolute; top: 24px; right: 28px; z-index: 60;
    background: rgba(10, 15, 26, 0.65);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
    border: 1px solid rgba(202, 163, 87, 0.4);
    color: #f7e6b5; padding: 8px 18px; border-radius: 20px;
    font-size: 12px; font-weight: 600; letter-spacing: 2px; cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
}
.gacha-skip:hover { background: rgba(202, 163, 87, 0.2); border-color: #f7e6b5; }
.gacha-overlay[data-stage="result"] .gacha-skip { display: none; }

/* 빛이 터진 자리에서 퍼지는 고리.
 *
 * 흰 빛만으로는 [화면이 하얘졌다] 로 끝난다. 고리가 한 번 지나가야 [무언가 터졌다] 가 된다. */
.gacha-ripple {
    position: absolute; left: 50%; top: 50%; z-index: 45; pointer-events: none;
    width: 40vmin; height: 40vmin; margin: -20vmin 0 0 -20vmin;
    border-radius: 50%; border: 2px solid rgba(255, 236, 180, 0.9);
    opacity: 0;
}
.gacha-overlay.is-bursting .gacha-ripple {
    animation: gacha-ripple 1.1s cubic-bezier(0.1, 0.7, 0.3, 1);
}
@keyframes gacha-ripple {
    0%   { opacity: 0.95; transform: scale(0.12); border-width: 7px; }
    100% { opacity: 0;    transform: scale(3.4);  border-width: 1px; }
}

/* 터질 때 화면이 흔들린다.
 *
 * 흔드는 동안 1.03배로 키운다. 안 키우면 화면 끝이 밀려 검은 띠가 보인다. */
.gacha-overlay.is-bursting {
    animation: gacha-shake 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
@keyframes gacha-shake {
    0%, 100% { transform: scale(1)     translate(0, 0); }
    12%      { transform: scale(1.035) translate(-9px, 5px); }
    28%      { transform: scale(1.035) translate(7px, -6px); }
    46%      { transform: scale(1.03)  translate(-6px, -4px); }
    66%      { transform: scale(1.02)  translate(4px, 3px); }
    84%      { transform: scale(1.01)  translate(-2px, 1px); }
}

/* 흰 빛 */
.gacha-flash {
    position: absolute; inset: 0; z-index: 50; pointer-events: none;
    background: radial-gradient(circle at center, #ffffff 30%, #fff7d6 70%, #ffdf80 100%);
    opacity: 0; mix-blend-mode: screen;
    transition: opacity 0.15s ease-out;
}

/* 결과 판 — 양피지를 화면 가운데 놓는 틀 */
.gacha-result {
    position: absolute; inset: 0; z-index: 30;
    display: flex; align-items: center; justify-content: center;
    /* 양피지가 화면보다 크다. 넘치는 둘레는 잘라 낸다 */
    overflow: hidden;
    opacity: 0; pointer-events: none; transform: scale(0.96);
    transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.gacha-overlay[data-stage="result"] .gacha-result {
    opacity: 1; pointer-events: auto; transform: scale(1);
}

/* 상점이 원래 뽑기 결과를 보여주던 양피지.
 *
 * **그림 비율대로 놓는다.** 늘리거나 잘라 채우면 그림에 그려진 Again / Lobby 딱지가
 * 옮겨 앉아, 누르는 자리가 딱지 위에 안 온다.
 *
 * 제목(New Cards)과 딱지 둘은 그림에 이미 있다. 그래서 여기서 다시 그리지 않는다. */
.gacha-parchment {
    /* 화면에 딱 맞는 크기에서 ${frame.resultOverscan} 배 키운다. 넘치는 둘레의 갈색 여백은
     * 잘려 나가고, 종이와 딱지는 화면 안에 남는다 */
    --pw: calc(min(100vw, 100vh * ${frame.resultAspect}) * ${frame.resultOverscan});
    --ph: calc(var(--pw) / ${frame.resultAspect});
    position: relative; flex: 0 0 auto;
    width: var(--pw); height: var(--ph);
    background: url("${frame.resultBackground}") center / 100% 100% no-repeat;
}

/* 카드 판
 *
 * **칸을 남은 자리에 맞춰 늘리지 않는다.** 칸이 카드 비율(${frame.cardAspect})을 지키고,
 * 남는 자리는 판 둘레에 여백으로 남는다. 전에는 반대였다 — 높이를 2줄로 나눠 쓰다 보니
 * 창이 낮으면 카드가 납작해지고 뒷면 그림이 위아래로 잘렸다.
 *
 * 카드 폭은 [가로로 넣을 수 있는 폭] 과 [세로에 들어가는 폭] 중 작은 쪽이다. 하나만
 * 보면 다른 쪽으로 넘친다 — 2560x1080 처럼 납작한 창에서 그랬다. */
/* 등급표. **종이 안**, 제목 오른쪽 · 카드 위의 빈 자리에 한 줄로 눕힌다.
 *
 * 글자는 **먹빛**이고 색은 동그라미가 맡는다. 종이가 밝아서 밝은 색 글자는 안 읽힌다 —
 * 어두운 판에서 쓰던 색을 그대로 가져오면 희귀(금색)가 종이에 묻는다.
 *
 * 크기도 자리도 양피지에 딸린다. 창이 작아지면 같이 작아진다. */
.gacha-legend {
    position: absolute; z-index: 20; pointer-events: none;
    left: ${(frame.legendArea.left * 100).toFixed(2)}%;
    right: ${((1 - frame.legendArea.right) * 100).toFixed(2)}%;
    top: ${(frame.legendArea.top * 100).toFixed(2)}%;
    bottom: ${((1 - frame.legendArea.bottom) * 100).toFixed(2)}%;
    display: flex; align-items: center; justify-content: flex-end;
    gap: calc(var(--pw) * 0.0115);
    font-size: calc(var(--pw) * 0.0098);
    font-weight: 700; letter-spacing: 0.5px;
    opacity: 0; transition: opacity 0.6s ease 0.35s;
}
.gacha-overlay[data-stage="result"] .gacha-legend { opacity: 1; }
.gacha-legend-title {
    color: #6b4b2a; letter-spacing: 3px; opacity: 0.85;
    font-size: calc(var(--pw) * 0.0086);
    padding-right: calc(var(--pw) * 0.0105);
    border-right: 1px solid rgba(107, 75, 42, 0.32);
}
.gacha-legend-row {
    display: flex; align-items: center; gap: calc(var(--pw) * 0.0048);
    color: #4c3618;
}
/* 색 동그라미. 카드 둘레에 번지는 빛과 같은 색이다.
 *
 * 테를 두른다. 종이 위에서는 금색처럼 옅은 색이 묻는데, 테가 있으면 다 읽힌다.
 * 종이에 눌러 찍은 봉인처럼 보이기도 한다. */
.gacha-legend-row::after {
    content: '';
    width: calc(var(--pw) * 0.0064); height: calc(var(--pw) * 0.0064);
    border-radius: 50%;
    background: var(--legend-color, #8fa3c7);
    border: 1px solid rgba(58, 38, 16, 0.5);
    box-shadow: 0 1px 2px rgba(58, 38, 16, 0.3);
}

/* 카드는 양피지 안, 제목 아래 · 오른쪽 딱지 왼쪽에 놓인다.
 *
 * 자리도 사이 간격도 **양피지 크기에 대한 비율**이다. 픽셀로 적으면 창이 작아질 때
 * 카드만 작아지고 간격은 그대로라 판이 성글어진다.
 *
 * 카드 폭은 [가로로 넣을 수 있는 폭] 과 [세로에 들어가는 폭] 중 작은 쪽이다. */
.gacha-cards {
    position: absolute;
    left: ${(frame.cardArea.left * 100).toFixed(2)}%;
    right: ${((1 - frame.cardArea.right) * 100).toFixed(2)}%;
    top: ${(frame.cardArea.top * 100).toFixed(2)}%;
    bottom: ${((1 - frame.cardArea.bottom) * 100).toFixed(2)}%;
    --gx: calc(var(--pw) * 0.009);
    --gy: calc(var(--ph) * 0.014);
    --area-w: calc(var(--pw) * ${(frame.cardArea.right - frame.cardArea.left).toFixed(3)});
    --area-h: calc(var(--ph) * ${(frame.cardArea.bottom - frame.cardArea.top).toFixed(3)});
    --card-w: min(
        calc((var(--area-w) - ${frame.columns - 1} * var(--gx)) / ${frame.columns}),
        calc((var(--area-h) - ${frame.rows - 1} * var(--gy)) / ${frame.rows} / ${frame.cardAspect})
    );
    display: grid;
    grid-template-columns: repeat(${frame.columns}, var(--card-w));
    grid-auto-rows: calc(var(--card-w) * ${frame.cardAspect});
    gap: var(--gy) var(--gx);
    justify-content: center; align-content: center;
}

.gacha-card {
    position: relative; width: 100%; height: 100%; cursor: pointer; perspective: 1000px;
    /* 날아오는 길. 자리를 잰 뒤 그리는 쪽이 채워 넣는다 */
    --fly-dx: 0px; --fly-dy: 0px; --fly-rot: 0deg; --fly-scale: 0.42;
    --fly-ms: ${frame.flyInMs}ms; --fly-delay: 0ms; --land-delay: 0ms;
}
.gacha-card-inner {
    position: relative; z-index: 1; width: 100%; height: 100%;
    border-radius: 10px; transform-style: preserve-3d;
    transition: transform ${frame.flipMs}ms cubic-bezier(0.2, 0.85, 0.4, 1.2);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
}

/* 한 점에서 흩어져 제자리로 온다.
 *
 * 78% 에서 1.07배로 지나쳤다가 100% 에서 제자리에 선다. 이 되튐이 [앉았다] 로 읽힌다. */
.gacha-cards.is-flying .gacha-card {
    animation: gacha-fly-in var(--fly-ms) cubic-bezier(0.17, 0.84, 0.28, 1.06)
               var(--fly-delay) both;
}
@keyframes gacha-fly-in {
    0%   { opacity: 0;
           transform: translate(var(--fly-dx), var(--fly-dy))
                      scale(var(--fly-scale)) rotate(var(--fly-rot)); }
    14%  { opacity: 1; }
    78%  { transform: translate(0, 0) scale(1.07) rotate(0deg); }
    100% { opacity: 1; transform: none; }
}

/* 카드 뒤의 고리. 두 가지 일을 한다 — 앉을 때 한 번 퍼지고, 좋은 등급이면 맥동한다 */
.gacha-card-halo {
    position: absolute; inset: -5px; z-index: 0; pointer-events: none;
    border-radius: 14px; opacity: 0;
    border: 2px solid var(--grade-border, #caa357);
    box-shadow: 0 0 30px 4px var(--grade-border, #caa357);
}
.gacha-cards.is-flying .gacha-card-halo {
    animation: gacha-land 460ms ease-out var(--land-delay) both;
}
@keyframes gacha-land {
    0%   { opacity: 0;    transform: scale(0.72); }
    30%  { opacity: 0.9;  transform: scale(1.0); }
    100% { opacity: 0;    transform: scale(1.5); }
}

/* 좋은 등급은 뒤집히기 전에 두근거린다. **어디에 좋은 것이 있는지 먼저 알려 준다.**
 * 이 규칙이 위의 착지 고리보다 뒤에 있어야 맥동이 이긴다 */
.gacha-card.is-anticipating .gacha-card-halo {
    animation: gacha-anticipate 1.05s ease-in-out infinite;
}
@keyframes gacha-anticipate {
    0%, 100% { opacity: 0.22; transform: scale(1); }
    50%      { opacity: 0.85; transform: scale(1.06); }
}

/* 뒤집힌 카드의 고리는 멈춘다.
 *
 * 이 줄이 없으면 맥동이 꺼지는 순간 착지 고리 규칙이 되살아나 한 번 더 퍼진다. */
.gacha-card.is-flipped .gacha-card-halo {
    animation: none; opacity: 0; transform: none;
    border-color: transparent;
}

/* 좋은 등급은 고리 대신 **카드 뒤에 은은한 빛**을 깐다.
 *
 * 앞면의 빛이 카드에서 나오는 빛이라면, 이것은 카드가 놓인 자리에 번지는 빛이다.
 * 둘이 겹쳐야 양피지처럼 밝은 바탕에서도 [빛난다] 로 읽힌다.
 *
 * 숨을 아주 느리게 쉰다 (2.8초 한 바퀴). 빠르면 깜박임이 되어 지저분하다. */
.gacha-card.is-flipped.has-aura .gacha-card-halo {
    inset: -9%;
    border-radius: 18px;
    box-shadow: var(--grade-reveal-halo, none);
    opacity: 0.85;
    animation: gacha-aura 2.8s ease-in-out infinite;
}
@keyframes gacha-aura {
    0%, 100% { opacity: 0.62; }
    50%      { opacity: 1; }
}

/* 뒤집히는 한가운데에서 터지는 섬광 */
.gacha-card-flare {
    position: absolute; inset: 0; z-index: 3; pointer-events: none;
    border-radius: 10px; opacity: 0; mix-blend-mode: screen;
    background: radial-gradient(circle at center,
        rgba(255, 255, 255, 1) 0%, rgba(255, 246, 214, 0.62) 42%,
        rgba(255, 230, 170, 0.22) 66%, transparent 80%);
}
.gacha-card.is-flipped .gacha-card-flare {
    animation: gacha-flare ${frame.flipMs}ms ease-out;
}
@keyframes gacha-flare {
    0%   { opacity: 0; transform: scale(0.9); }
    50%  { opacity: 1; transform: scale(1.18); }
    100% { opacity: 0; transform: scale(1.32); }
}
.gacha-card:hover .gacha-card-inner { transform: translateY(-6px) scale(1.02); }
.gacha-card.is-flipped .gacha-card-inner { transform: rotateY(180deg); }
.gacha-card.is-flipped:hover .gacha-card-inner {
    transform: rotateY(180deg) translateY(-6px) scale(1.02);
}

.gacha-card-face {
    position: absolute; inset: 0; border-radius: 10px;
    backface-visibility: hidden; -webkit-backface-visibility: hidden;
    overflow: hidden; display: flex; flex-direction: column;
}

/* 뒷면 */
.gacha-card-back {
    background: radial-gradient(circle at center, #131d33 0%, #090e1a 100%);
    border: 2px solid #caa357;
    box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);
    align-items: center; justify-content: center;
}
.gacha-card-back::before {
    content: ''; position: absolute; inset: 6px;
    border: 1px solid rgba(202, 163, 87, 0.4); border-radius: 6px; pointer-events: none;
}
.gacha-back-emblem {
    width: 60%; height: 60%;
    display: flex; align-items: center; justify-content: center; position: relative;
}
.gacha-back-star {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, #f5d78e 0%, #b88628 100%);
    clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
    filter: drop-shadow(0 0 8px rgba(245, 215, 142, 0.7));
}
.gacha-back-ring {
    position: absolute; width: 64px; height: 64px;
    border: 1px dashed rgba(245, 215, 142, 0.5); border-radius: 50%;
}

/* **두 면이 그림을 똑같이 놓는다.** 이 한 규칙이 앞뒤 크기를 맞춘다.
 *
 * 카드 앞면 그림과 뒷면 그림은 판 크기(952x1540)도, 그 안에 든 카드 크기(927x1501)도,
 * 둘레 여백도 같다. 그래서 같은 자리에 같은 방식으로 놓으면 저절로 겹친다.
 * contain 이라 어느 쪽도 잘리지 않는다. */
.gacha-card-face img {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: contain; display: block;
}

/* 앞면 — **카드 그림이 곧 카드다.** 둘레에 테를 두르지 않는다.
 *
 * 전에는 여기 테와 여백을 두고 그 안에 카드 그림을 줄여 넣었다. 뒷면은 칸을 꽉 채우는데
 * 앞면은 그보다 작아, 뒤집으면 카드가 쪼그라든 것처럼 보였다.
 *
 * 등급은 테가 아니라 **바깥으로 번지는 빛과 왼쪽 위 딱지**가 말해 준다. */
.gacha-card-front {
    transform: rotateY(180deg);
    background: transparent;
    box-shadow: var(--grade-glow, none);
}

/* **카드 위에는 아무것도 안 얹는다.** 그림이 곧 카드다.
 *
 * 등급 이름도 비용 숫자도 붙였다가 뺐다. 열 장에 딱지가 스무 개 붙으면 그림이 안 보인다.
 * 등급은 카드 둘레 빛이 색으로 말하고, 그 색이 무슨 뜻인지는 오른쪽 위 등급표가 말한다. */
/* 뒷면을 그림으로 쓸 때.
 *
 * 값으로 그릴 때 두르던 금테와 안쪽 테를 지운다 — 뒷면 그림에 테가 이미 그려져 있어서,
 * 안 지우면 테가 하나 더 얹힌다. */
.gacha-card-back.has-image {
    border: none; background: none; box-shadow: none; padding: 0;
}
.gacha-card-back.has-image::before { content: none; }
/* 드러난 뒤에는 빛이 세진다. 덮여 있을 때가 아니라 **보이는 순간이 정점이어야 한다** */
.gacha-card.is-flipped .gacha-card-front {
    box-shadow: var(--grade-reveal-glow, none);
}

/* 신화와 전설만. 카드 표면을 **대각선으로** 한 번 훑고 지나간다.
 *
 * 세로로 지나가면 문이 열리는 것처럼 보인다. 기울이면 표면이 반짝이는 것처럼 보인다.
 *
 * 자르는 틀(부모)은 가만히 있고 **빛줄기만 움직인다.** 부모를 움직이면 자르는 자리까지
 * 같이 움직여서 카드 밖으로 빛이 새어 나간다. */
.gacha-card-beam {
    position: absolute; inset: 0; pointer-events: none; overflow: hidden;
    border-radius: 10px;
}
.gacha-card-beam::before {
    content: ''; position: absolute;
    /* 기울이면 위아래가 모자란다. 넉넉히 늘려 잡아야 모서리까지 지나간다 */
    top: -60%; bottom: -60%; left: 50%; width: 30%; margin-left: -15%;
    opacity: 0; filter: blur(6px);
    transform: rotate(${frame.beamTiltDeg}deg);
    background: linear-gradient(90deg, transparent,
        rgba(255, 255, 255, 0.45) 30%, rgba(255, 255, 255, 1) 50%,
        rgba(255, 255, 255, 0.45) 70%, transparent);
}
/* **한 번 훑고 끝나지 않는다.** 되풀이한다.
 *
 * 처음 도는 한 바퀴가 곧 드러나는 순간의 훑기다. 따로 만들지 않았다 — 하나는 한 번 돌고
 * 하나는 계속 도는 식으로 둘을 두면, 둘의 시간이 어긋나는 순간 겹쳐 보인다.
 *
 * 한 바퀴 ${frame.shineRepeatMs}밀리초 가운데 ${frame.beamMs}밀리초만 지나가고
 * 나머지는 쉰다. 쉬는 동안 빛줄기는 카드 밖에 숨어 있다. */
.gacha-card.is-flipped.has-beam .gacha-card-beam::before {
    animation: gacha-beam ${frame.shineRepeatMs}ms linear 340ms infinite;
}
@keyframes gacha-beam {
    0% { opacity: 0; transform: rotate(${frame.beamTiltDeg}deg) translateX(-280%); }
    ${(frame.beamMs / frame.shineRepeatMs * 18).toFixed(2)}% { opacity: 1; }
    ${(frame.beamMs / frame.shineRepeatMs * 82).toFixed(2)}% { opacity: 1; }
    ${(frame.beamMs / frame.shineRepeatMs * 100).toFixed(2)}% {
        opacity: 0; transform: rotate(${frame.beamTiltDeg}deg) translateX(280%); }
    100% { opacity: 0; transform: rotate(${frame.beamTiltDeg}deg) translateX(280%); }
}

/* 빛줄기가 지나가면서 튀는 반짝임 둘.
 *
 * 가로줄과 세로줄이 겹친 네 갈래 별이다. 빛줄기가 그 자리를 지날 때쯤 터지게 시간을
 * 맞췄다 — 따로 놀면 그냥 깜박이는 점으로 보인다. */
.gacha-card-glint {
    position: absolute; z-index: 3; pointer-events: none;
    width: 30%; height: 30%; margin: -15% 0 0 -15%;
    opacity: 0;
    background: radial-gradient(circle at center,
        rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.55) 7%, transparent 26%);
}
.gacha-card-glint::before, .gacha-card-glint::after {
    content: ''; position: absolute; left: 50%; top: 50%;
    background: radial-gradient(ellipse at center,
        rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.7) 18%, transparent 68%);
}
.gacha-card-glint::before { width: 100%; height: 11%; transform: translate(-50%, -50%); }
.gacha-card-glint::after  { width: 11%; height: 100%; transform: translate(-50%, -50%); }

/* 빛줄기가 왼쪽 아래에서 오른쪽 위로 지나간다. 반짝임 둘이 그 차례로 터진다.
 *
 * 셋째는 **빛줄기와 상관없는 때**(2.6초)에 혼자 터진다. 둘만 두면 같은 장단이 되풀이되는
 * 것이 눈에 보인다. 어긋난 것이 하나 있으면 규칙으로 안 읽힌다. */
.gacha-glint-a { left: 31%; top: 63%; }
.gacha-glint-b { left: 69%; top: 31%; }
.gacha-glint-c { left: 55%; top: 74%; width: 22%; height: 22%; margin: -11% 0 0 -11%; }
.gacha-card.is-flipped.has-beam .gacha-glint-a {
    animation: gacha-glint ${frame.shineRepeatMs}ms ease-out 620ms infinite;
}
.gacha-card.is-flipped.has-beam .gacha-glint-b {
    animation: gacha-glint ${frame.shineRepeatMs}ms ease-out 980ms infinite;
}
.gacha-card.is-flipped.has-beam .gacha-glint-c {
    animation: gacha-glint ${frame.shineRepeatMs}ms ease-out 2600ms infinite;
}
@keyframes gacha-glint {
    0% { opacity: 0; transform: scale(0.2) rotate(-28deg); }
    ${(560 / frame.shineRepeatMs * 40).toFixed(2)}% {
        opacity: 1; transform: scale(1) rotate(0deg); }
    ${(560 / frame.shineRepeatMs * 100).toFixed(2)}% {
        opacity: 0; transform: scale(0.45) rotate(24deg); }
    100% { opacity: 0; transform: scale(0.45) rotate(24deg); }
}

/* 양피지에 그려진 딱지를 누르는 자리.
 *
 * **단추를 그리지 않는다.** Again 과 Lobby 는 그림에 이미 있다. 여기 있는 것은 그 위에
 * 겹쳐 둔 투명한 자리다 — 손을 올리면 살짝 밝아져 누를 수 있다는 것만 알린다.
 *
 * 자리가 비율이라 양피지가 커지든 작아지든 딱지를 따라간다. */
.gacha-tab {
    position: absolute; z-index: 40; cursor: pointer;
    background: transparent; border: none; padding: 0;
    border-radius: 4px;
    transition: background 0.18s ease, filter 0.18s ease;
}
.gacha-tab:hover { background: rgba(255, 236, 180, 0.22); filter: brightness(1.15); }
.gacha-tab:active { background: rgba(255, 236, 180, 0.34); }

.gacha-tab[data-action="again"] {
    left: ${(frame.againTab.left * 100).toFixed(2)}%;
    right: ${((1 - frame.againTab.right) * 100).toFixed(2)}%;
    top: ${(frame.againTab.top * 100).toFixed(2)}%;
    bottom: ${((1 - frame.againTab.bottom) * 100).toFixed(2)}%;
}
.gacha-tab[data-action="close"] {
    left: ${(frame.lobbyTab.left * 100).toFixed(2)}%;
    right: ${((1 - frame.lobbyTab.right) * 100).toFixed(2)}%;
    top: ${(frame.lobbyTab.top * 100).toFixed(2)}%;
    bottom: ${((1 - frame.lobbyTab.bottom) * 100).toFixed(2)}%;
}

/* 전체 뒤집기만 그림에 없다. 딱지 둘 아래에 같은 결로 그려 넣는다 */
.gacha-tab-drawn {
    left: ${(frame.flipAllTab.left * 100).toFixed(2)}%;
    right: ${((1 - frame.flipAllTab.right) * 100).toFixed(2)}%;
    top: ${(frame.flipAllTab.top * 100).toFixed(2)}%;
    bottom: ${((1 - frame.flipAllTab.bottom) * 100).toFixed(2)}%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(180deg, #2c4636 0%, #1b2d22 100%);
    border: 1px solid rgba(202, 163, 87, 0.55);
    border-radius: 3px;
    color: #e8d9a8; font-weight: 700; letter-spacing: 1px;
    /* 글자 크기도 양피지에 딸린다. 픽셀로 적으면 작은 창에서 딱지 밖으로 넘친다 */
    font-size: calc(var(--pw) * 0.0092);
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
}
.gacha-tab-drawn:hover {
    background: linear-gradient(180deg, #3a5c46 0%, #243c2d 100%);
    border-color: #e8d9a8;
}

/* 아래 단추 — 좁은 화면에서만 쓴다. 넓은 화면은 위의 딱지가 대신한다 */
.gacha-controls { display: none; align-items: center; gap: 16px; z-index: 40; }
.gacha-btn {
    padding: 12px 28px; font-size: 14px; font-weight: 700; letter-spacing: 2px;
    border: none; border-radius: 30px; cursor: pointer; outline: none;
    transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.gacha-btn-primary {
    background: linear-gradient(135deg, #e3b85d 0%, #aa7720 100%);
    color: #0c121e; box-shadow: 0 4px 18px rgba(227, 184, 93, 0.45);
}
.gacha-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(227, 184, 93, 0.65);
    background: linear-gradient(135deg, #ebd082 0%, #bb8528 100%);
}
.gacha-btn-secondary {
    background: rgba(20, 32, 54, 0.8); color: #a6b8d4;
    border: 1px solid rgba(166, 184, 212, 0.3);
}
.gacha-btn-secondary:hover {
    background: rgba(30, 48, 80, 0.9); color: #fff; border-color: #a6b8d4;
}

/* 좁은 화면 */
@media (max-width: ${frame.narrowMaxWidthPx}px) {
    /* 좁은 화면(세로로 긴 손전화)에서는 양피지가 화면 가운데 납작한 띠가 된다.
     *
     * 그래서 여기서는 **양피지를 잘라 화면에 채우고**, 그림에 그려진 딱지는 잘려 나가
     * 자리를 믿을 수 없으므로 누르는 자리를 감추고 아래 글자 단추를 쓴다. */
    .gacha-parchment {
        width: 100vw; height: 100vh;
        background-size: cover;
    }
    .gacha-tab { display: none; }
    /* 종이를 잘라 채우므로 제목 오른쪽 자리를 믿을 수 없다. 위쪽에 한 줄로 눕힌다 */
    .gacha-legend {
        left: 4%; right: 4%; top: 4%; bottom: auto; height: 7%;
        justify-content: center; flex-wrap: wrap;
        gap: 10px; font-size: 11px;
    }
    .gacha-legend-title { display: none; }
    .gacha-legend-row { gap: 5px; }
    .gacha-legend-row::after { width: 8px; height: 8px; }
    .gacha-controls {
        display: flex; position: absolute; left: 0; right: 0; bottom: 14px;
        justify-content: center; z-index: 40;
    }

    /* 칸은 카드 비율을 지키되 **가로만 보고 정하고 넘치면 굴린다.** 5줄을 세로에 다
     * 우겨넣으면 카드가 손톱만 해져서 무슨 카드인지 안 보인다. */
    .gacha-cards {
        left: 5%; right: 5%; top: 14%; bottom: 76px;
        --gx: 12px; --gy: 12px;
        --card-w: calc((100% - ${frame.narrowColumns - 1} * 12px) / ${frame.narrowColumns});
        grid-template-columns: repeat(${frame.narrowColumns}, var(--card-w));
        align-content: start; overflow-y: auto;
    }
    /* 좁은 화면에서는 세로로 세우면 카드를 가린다. 한 줄로 눕히고 제목은 뺀다 */
    .gacha-legend {
        top: auto; bottom: 8px; left: 12px; right: 12px;
        flex-direction: row; justify-content: center; flex-wrap: wrap;
        gap: 4px 12px; font-size: 10px; letter-spacing: 1px;
    }
    .gacha-legend-title { display: none; }
    .gacha-legend-row::after { width: 7px; height: 7px; }
    .gacha-skip { top: 16px; right: 16px; padding: 6px 14px; font-size: 11px; }
    .gacha-btn { padding: 10px 18px; font-size: 12px; letter-spacing: 1px; }
}

/* 움직임을 줄이라고 설정한 사람에게는 뒤집기만 남긴다.
 *
 * 날아오기, 흔들림, 파문, 맥동, 광주를 전부 끈다. 무엇이 뽑혔는지는 그대로 보인다 —
 * **연출을 끄는 것이지 결과를 가리는 것이 아니다.** */
@media (prefers-reduced-motion: reduce) {
    .gacha-card-inner, .gacha-result, .gacha-video-wrap, .gacha-flash {
        transition-duration: 0.01ms !important;
    }
    .gacha-cards.is-flying .gacha-card,
    .gacha-cards.is-flying .gacha-card-halo,
    .gacha-card.is-anticipating .gacha-card-halo,
    .gacha-card.is-flipped.has-aura .gacha-card-halo,
    .gacha-card.is-flipped .gacha-card-flare,
    .gacha-card.is-flipped.has-beam .gacha-card-beam::before,
    .gacha-card.is-flipped.has-beam .gacha-glint-a,
    .gacha-card.is-flipped.has-beam .gacha-glint-b,
    .gacha-card.is-flipped.has-beam .gacha-glint-c,
    .gacha-overlay.is-bursting,
    .gacha-overlay.is-bursting .gacha-ripple {
        animation: none !important;
    }
}
`;
    document.head.appendChild(style);
}
