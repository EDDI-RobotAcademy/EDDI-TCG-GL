import {DomFrameRenderer} from "../../../../core/renderer/DomFrameRenderer";
import {OpeningHandFrame} from "../frame/OpeningHandFrame";

// 대전을 시작할 때 받은 카드를 화면 가운데 크게 그린다. **DOM 을 만드는 것은 여기뿐이다.**

export class OpeningHandRenderer implements DomFrameRenderer<OpeningHandFrame> {
    public async build(frame: OpeningHandFrame): Promise<HTMLElement> {
        ensureStyle(frame);

        const root = document.createElement('div');
        root.className = 'battle-opening';
        root.dataset.state = 'hidden';
        root.innerHTML = `
            <div class="battle-opening-scrim"></div>
            <div class="battle-opening-title">${frame.title}</div>
            <div class="battle-opening-hint">${frame.hint}</div>
            <div class="battle-opening-cards"></div>
            <div class="battle-opening-buttons">
                <button class="battle-opening-mulligan" type="button" disabled
                        data-label="${frame.mulliganLabel}">${frame.mulliganLabel}</button>
                <button class="battle-opening-confirm" type="button">${frame.confirmLabel}</button>
            </div>
        `;
        return root;
    }

    // 크기를 화면에서 바로 내므로 창이 바뀌어도 따라간다.
    public update(): void {
        // CSS 가 화면 크기에서 카드 크기를 낸다.
    }

    public dispose(element: HTMLElement): void {
        element.remove();
    }

    // ── 안에 있는 것을 꺼내 주는 창구 ──────────────────────────────────────────

    public confirmButton(root: HTMLElement): HTMLElement | null {
        return root.querySelector('.battle-opening-confirm');
    }

    public mulliganButton(root: HTMLElement): HTMLButtonElement | null {
        return root.querySelector('.battle-opening-mulligan');
    }

    public cardSlots(root: HTMLElement): HTMLElement[] {
        return Array.prototype.slice.call(
            root.querySelectorAll('.battle-opening-card'),
        ) as HTMLElement[];
    }

    // 누른 것이 몇 번째 카드인가. 카드 밖을 눌렀으면 -1.
    public slotIndexOf(root: HTMLElement, target: HTMLElement | null): number {
        const slot = target?.closest<HTMLElement>('.battle-opening-card');
        if (!slot) return -1;
        return this.cardSlots(root).indexOf(slot);
    }

    public setPicked(slot: HTMLElement, picked: boolean): void {
        slot.classList.toggle('is-picked', picked);
    }

    public isPicked(slot: HTMLElement): boolean {
        return slot.classList.contains('is-picked');
    }

    // 바꾸기 단추. 고른 것이 없거나 이미 썼으면 못 누른다.
    public setMulliganState(
        frame: OpeningHandFrame, root: HTMLElement, pickedCount: number, used: boolean,
    ): void {
        const button = this.mulliganButton(root);
        if (!button) return;
        button.disabled = used || pickedCount === 0;
        button.textContent = used
            ? `${frame.mulliganLabel} 완료`
            : (pickedCount === 0 ? frame.mulliganLabel : `${frame.mulliganLabel} ${pickedCount}`);
    }

    // 바뀐 카드만 그림을 갈아 끼우고 한 번 번쩍인다. 판을 다시 깔지 않는다 —
    // 다시 깔면 안 바뀐 카드까지 나타나는 움직임을 처음부터 다시 한다.
    public replaceCards(
        frame: OpeningHandFrame, root: HTMLElement,
        cardIds: readonly number[], changed: readonly number[],
    ): void {
        const slots = this.cardSlots(root);
        for (const at of changed) {
            const slot = slots[at];
            const image = slot?.querySelector('img');
            if (!slot || !image) continue;
            image.src = frame.cardImage(cardIds[at]);
            slot.classList.remove('is-picked');
            slot.classList.remove('is-swapped');
            void slot.offsetWidth;
            slot.classList.add('is-swapped');
        }
    }

    // 받은 카드를 깐다. 한 장씩 차례로 나타난다.
    public layCards(
        frame: OpeningHandFrame, root: HTMLElement, cardIds: readonly number[],
    ): void {
        const holder = root.querySelector('.battle-opening-cards');
        if (!holder) return;
        holder.innerHTML = '';

        cardIds.forEach((cardId, index) => {
            const slot = document.createElement('div');
            slot.className = 'battle-opening-card';
            slot.style.setProperty('--deal-delay', `${index * frame.dealStepMs}ms`);
            slot.innerHTML = `<img src="${frame.cardImage(cardId)}" alt="">`;
            holder.appendChild(slot);
        });
    }

    public show(root: HTMLElement): void {
        root.dataset.state = 'shown';
    }

    // 겹을 걷는다. 다 걷히기까지 걸리는 시간을 돌려준다 — 부르는 쪽이 그 뒤에 치운다.
    public fadeOut(frame: OpeningHandFrame, root: HTMLElement): number {
        root.dataset.state = 'leaving';
        return frame.fadeMs;
    }
}

// 모양을 한 번만 넣는다.
function ensureStyle(frame: OpeningHandFrame): void {
    const id = 'battle-opening-style';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
.battle-opening {
    position: fixed; inset: 0; z-index: 1800;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
    user-select: none; -webkit-user-select: none;
    opacity: 0; pointer-events: none;
    transition: opacity ${frame.fadeMs}ms ease;
}
.battle-opening[data-state="shown"] { opacity: 1; pointer-events: auto; }
.battle-opening[data-state="leaving"] { opacity: 0; pointer-events: none; }

.battle-opening-scrim {
    position: absolute; inset: 0; z-index: -1;
    background: radial-gradient(ellipse at center,
        rgba(8, 12, 22, 0.82) 0%, rgba(2, 4, 8, 0.94) 80%);
    -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
}

.battle-opening-title {
    font-size: 22px; font-weight: 800; letter-spacing: 8px; color: #f7e6b5;
    text-shadow: 0 0 22px rgba(247, 230, 181, 0.45), 0 2px 4px rgba(0, 0, 0, 0.8);
}
.battle-opening-hint {
    margin-top: -2vh; font-size: 12px; letter-spacing: 3px; color: #8fa3c7;
}

/* 다섯 장을 한 줄로.
 *
 * 카드 폭은 [가로로 넣을 수 있는 폭] 과 [세로에 들어가는 폭] 중 작은 쪽이다.
 * 세로만 보면 납작한 창에서 화면 밖으로 나가고, 가로만 보면 낮은 창에서 잘린다. */
.battle-opening-cards {
    --count: 5;
    --gap: calc(var(--card-w) * ${frame.gapRatio});
    --by-height: calc(${(frame.heightRatio * 100).toFixed(0)}vh / ${frame.cardAspect});
    --by-width: calc(${(frame.widthRatio * 100).toFixed(0)}vw
                     / (var(--count) + (var(--count) - 1) * ${frame.gapRatio}));
    --card-w: min(var(--by-height), var(--by-width));
    display: flex; align-items: center; justify-content: center;
    gap: var(--gap);
}
.battle-opening-card {
    position: relative; flex: 0 0 auto; cursor: pointer;
    width: var(--card-w); height: calc(var(--card-w) * ${frame.cardAspect});
    opacity: 0;
    filter: drop-shadow(0 14px 34px rgba(0, 0, 0, 0.7));
    transition: transform 0.18s ease;
}
.battle-opening-card:hover { transform: translateY(-1.2%); }

/* 바꿀 카드로 고른 표시 — 네온 테두리.
 *
 * 카드 그림에 둘레 여백(1.3%)이 있어서 테두리를 카드 끝에 붙이려면 안으로 조금 들인다. */
.battle-opening-card.is-picked::after {
    content: ''; position: absolute; inset: 1.2%;
    border: 3px solid ${frame.pickBaseColor};
    border-radius: 3%;
    box-shadow: 0 0 16px ${frame.pickGlowColor},
                0 0 34px ${frame.pickGlowColor}80,
                inset 0 0 14px ${frame.pickGlowColor}66;
    pointer-events: none;
    animation: battle-opening-pulse ${frame.pickPulseMs}ms ease-in-out infinite;
}
/* 고른 카드는 살짝 가라앉는다. 테두리만으로는 [고름] 인지 [강조] 인지 헷갈린다 */
.battle-opening-card.is-picked img { filter: brightness(0.62) saturate(0.7); }
/* 바뀔 것이라는 표 */
.battle-opening-card.is-picked::before {
    content: '↻'; position: absolute; z-index: 2;
    top: 4%; right: 4%; width: 1.9em; height: 1.9em;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%; font-size: calc(var(--card-w) * 0.11); line-height: 1;
    color: #1a1207; background: ${frame.pickBaseColor};
    box-shadow: 0 0 12px ${frame.pickGlowColor};
}
@keyframes battle-opening-pulse {
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 1; }
}

/* 새로 받은 카드가 한 번 번쩍인다 */
.battle-opening-card.is-swapped {
    animation: battle-opening-swap 520ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes battle-opening-swap {
    0%   { transform: rotateY(90deg) scale(0.9); filter: brightness(2.4); }
    100% { transform: none; filter: none; }
}
.battle-opening-card img { width: 100%; height: 100%; object-fit: contain; display: block; }

/* 한 장씩 차례로 올라온다. 다섯 장이 한꺼번에 뜨면 한 덩어리로 보인다 */
.battle-opening[data-state="shown"] .battle-opening-card {
    animation: battle-opening-deal ${frame.dealMs}ms cubic-bezier(0.16, 1, 0.3, 1)
               var(--deal-delay) both;
}
@keyframes battle-opening-deal {
    0%   { opacity: 0; transform: translateY(14%) scale(0.86); }
    100% { opacity: 1; transform: none; }
}

.battle-opening-buttons { display: flex; align-items: center; gap: 14px; }

.battle-opening-mulligan {
    padding: 12px 30px; font-size: 13px; font-weight: 700; letter-spacing: 3px;
    border-radius: 30px; cursor: pointer; outline: none;
    color: ${frame.pickBaseColor}; background: rgba(20, 14, 4, 0.7);
    border: 1px solid ${frame.pickBaseColor};
    transition: background 0.2s ease, opacity 0.2s ease;
}
.battle-opening-mulligan:hover:not(:disabled) { background: rgba(255, 154, 46, 0.22); }
.battle-opening-mulligan:disabled {
    opacity: 0.38; cursor: default;
    color: #8fa3c7; border-color: rgba(143, 163, 199, 0.35);
}

.battle-opening-confirm {
    padding: 12px 40px; font-size: 14px; font-weight: 700; letter-spacing: 4px;
    border: none; border-radius: 30px; cursor: pointer; outline: none;
    background: linear-gradient(135deg, #e3b85d 0%, #aa7720 100%);
    color: #0c121e; box-shadow: 0 4px 18px rgba(227, 184, 93, 0.45);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.battle-opening-confirm:hover {
    transform: translateY(-2px); box-shadow: 0 6px 24px rgba(227, 184, 93, 0.65);
}

@media (max-width: 768px) {
    .battle-opening-title { font-size: 16px; letter-spacing: 4px; }
    .battle-opening-cards { --by-height: calc(46vh / ${frame.cardAspect}); }
    .battle-opening-confirm, .battle-opening-mulligan {
        padding: 10px 24px; font-size: 12px; letter-spacing: 2px;
    }
    .battle-opening-hint { font-size: 11px; letter-spacing: 2px; }
}

@media (prefers-reduced-motion: reduce) {
    .battle-opening { transition-duration: 0.01ms !important; }
    .battle-opening[data-state="shown"] .battle-opening-card,
    .battle-opening-card.is-picked::after,
    .battle-opening-card.is-swapped {
        animation: none !important; opacity: 1;
    }
}
`;
    document.head.appendChild(style);
}
