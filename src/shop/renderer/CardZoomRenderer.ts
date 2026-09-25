import {DomFrameRenderer} from "../../core/renderer/DomFrameRenderer";
import {CardZoomFrame} from "../frame/CardZoomFrame";
import {DrawnCardView} from "./GachaOverlayRenderer";

// 카드 한 장을 크게 띄우는 겹을 그린다. **DOM 을 만드는 것은 여기뿐이다.**
//
// 뽑기 판 위에 한 겹 더 얹는다. 뒤가 어두워지고 카드 한 장만 남는다.

export class CardZoomRenderer implements DomFrameRenderer<CardZoomFrame> {
    public async build(frame: CardZoomFrame): Promise<HTMLElement> {
        ensureStyle(frame);

        const root = document.createElement('div');
        root.className = 'gacha-zoom';
        root.dataset.open = 'false';
        root.innerHTML = `
            <div class="gacha-zoom-scrim" data-zoom="close"></div>
            <span class="gacha-zoom-grade"></span>
            <button class="gacha-zoom-step" type="button" data-zoom="prev"
                    aria-label="앞 카드">&lsaquo;</button>
            <div class="gacha-zoom-card"><img alt=""></div>
            <button class="gacha-zoom-step" type="button" data-zoom="next"
                    aria-label="다음 카드">&rsaquo;</button>
            <button class="gacha-zoom-close" type="button" data-zoom="close"
                    aria-label="닫기">&times;</button>
            <span class="gacha-zoom-count"></span>
        `;
        return root;
    }

    // 크기는 CSS 가 화면에서 바로 낸다. 창이 바뀌어도 따라간다.
    public update(): void {
        // 카드 크기를 화면 높이에서 뽑으므로 여기서 다시 잴 것이 없다.
    }

    public dispose(element: HTMLElement): void {
        element.remove();
    }

    // ── 안에 있는 것을 꺼내 주는 창구 ──────────────────────────────────────────

    // 누른 것이 무엇을 하라는 것인가. 겹 바깥을 눌렀으면 null.
    public actionOf(target: HTMLElement | null): string | null {
        return target?.closest<HTMLElement>('[data-zoom]')?.dataset.zoom ?? null;
    }

    // 한 장을 띄운다. `position` 은 열 장 가운데 몇 번째인가 (1 부터).
    public show(
        frame: CardZoomFrame, root: HTMLElement,
        card: DrawnCardView, position: number, total: number,
    ): void {
        const look = frame.gradeLook(card.grade);

        const image = root.querySelector('img');
        if (image) {
            image.src = frame.cardImage(card.cardId);
            image.alt = card.name;
        }

        const grade = root.querySelector<HTMLElement>('.gacha-zoom-grade');
        if (grade) {
            grade.textContent = look.label;
            grade.style.color = look.tagColor;
            grade.style.borderColor = look.border;
        }

        const count = root.querySelector<HTMLElement>('.gacha-zoom-count');
        if (count) count.textContent = `${position} / ${total}`;

        root.style.setProperty('--zoom-glow', look.revealGlow || 'none');
        root.style.setProperty('--zoom-color', look.border);
        root.dataset.open = 'true';
    }

    public hide(root: HTMLElement): void {
        root.dataset.open = 'false';
    }

    public isOpen(root: HTMLElement): boolean {
        return root.dataset.open === 'true';
    }
}

// 모양을 한 번만 넣는다.
function ensureStyle(frame: CardZoomFrame): void {
    const id = 'gacha-zoom-style';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
.gacha-zoom {
    position: fixed; inset: 0; z-index: 2100;
    display: flex; align-items: center; justify-content: center;
    gap: 2vw;
    opacity: 0; pointer-events: none;
    transition: opacity ${frame.fadeMs}ms ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
    user-select: none; -webkit-user-select: none;
}
.gacha-zoom[data-open="true"] { opacity: 1; pointer-events: auto; }

.gacha-zoom-scrim {
    position: absolute; inset: 0; cursor: pointer;
    background: radial-gradient(ellipse at center,
        rgba(6, 9, 16, 0.86) 0%, rgba(2, 3, 6, 0.96) 80%);
    -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}

/* 카드.
 *
 * 화면 높이에서 크기를 낸다. **가로로도 막아 둔다** — 세로만 보면 납작한 창에서
 * 좌우 화살표를 밀어내고 화면 밖으로 나간다. */
.gacha-zoom-card {
    --zh: min(${(frame.heightRatio * 100).toFixed(0)}vh,
              calc(${(frame.widthRatio * 100).toFixed(0)}vw * ${frame.cardAspect}));
    position: relative; flex: 0 0 auto;
    height: var(--zh); width: calc(var(--zh) / ${frame.cardAspect});
    filter: drop-shadow(0 18px 50px rgba(0, 0, 0, 0.75));
    transform: scale(0.92);
    transition: transform ${frame.fadeMs}ms cubic-bezier(0.16, 1, 0.3, 1);
}
.gacha-zoom[data-open="true"] .gacha-zoom-card { transform: scale(1); }
.gacha-zoom-card img {
    width: 100%; height: 100%; object-fit: contain; display: block;
}
/* 등급 빛. 카드 그림에 둘레 여백이 있어서 테를 두르면 카드에서 떨어져 보인다.
 * 그래서 테 대신 뒤에 깔린 빛으로만 말한다 */
.gacha-zoom-card::before {
    content: ''; position: absolute; inset: 4%; z-index: -1;
    border-radius: 2%; box-shadow: var(--zoom-glow, none);
}

/* 좌우로 넘기기 */
.gacha-zoom-step {
    position: relative; flex: 0 0 auto;
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(14, 20, 34, 0.7); color: #e8d9a8;
    border: 1px solid rgba(202, 163, 87, 0.45);
    font-size: 30px; line-height: 1; cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease;
}
.gacha-zoom-step:hover { background: rgba(202, 163, 87, 0.25); border-color: #f7e6b5; }

/* 등급 이름. 카드 왼쪽 위 바깥이다 — 카드 위에 얹으면 그림을 가린다 */
.gacha-zoom-grade {
    position: absolute; top: 3vh; left: 3vw;
    padding: 7px 16px; border-radius: 4px;
    border: 1px solid currentColor;
    background: rgba(8, 11, 18, 0.7);
    font-size: 14px; font-weight: 700; letter-spacing: 3px;
}
/* 몇 번째 카드인가 */
.gacha-zoom-count {
    position: absolute; bottom: 3vh; left: 50%; transform: translateX(-50%);
    color: #8a93a8; font-size: 13px; letter-spacing: 3px;
}

.gacha-zoom-close {
    position: absolute; top: 3vh; right: 3vw;
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(14, 20, 34, 0.7); color: #cfd7e6;
    border: 1px solid rgba(207, 215, 230, 0.3);
    font-size: 24px; line-height: 1; cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
}
.gacha-zoom-close:hover { background: rgba(207, 215, 230, 0.2); color: #fff; }

/* 좁은 화면 — 화살표를 카드 아래로 내린다. 옆에 두면 카드가 쪼그라든다 */
@media (max-width: 768px) {
    .gacha-zoom { flex-wrap: wrap; gap: 12px; align-content: center; }
    .gacha-zoom-card { --zh: min(74vh, calc(92vw * ${frame.cardAspect})); order: 1; width: 100%;
                       display: flex; justify-content: center; }
    .gacha-zoom-card img { width: auto; }
    .gacha-zoom-step { order: 2; width: 48px; height: 48px; font-size: 26px; }
    .gacha-zoom-grade { top: 2vh; left: 3vw; font-size: 12px; padding: 5px 12px; }
    .gacha-zoom-count { bottom: 1vh; }
}

@media (prefers-reduced-motion: reduce) {
    .gacha-zoom, .gacha-zoom-card { transition-duration: 0.01ms !important; }
}
`;
    document.head.appendChild(style);
}
