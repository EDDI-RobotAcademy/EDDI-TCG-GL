import {CardZoomFrame} from "../frame/CardZoomFrame";
import {CardZoomRenderer} from "../renderer/CardZoomRenderer";
import {DrawnCardView} from "../renderer/GachaOverlayRenderer";

// 카드 한 장을 크게 보는 일을 다루는 곳이다.
//
// 사용자가 하는 순서가 그대로 상태다.
//
//   드러난 카드를 누른다 → 그 한 장이 크게 뜬다
//                        → 좌우로 옆 카드를 본다
//                        → 어두운 데를 누르거나 X 나 Esc 로 닫는다
//
// **덮여 있는 카드는 눌러도 안 뜬다.** 그 누름은 뒤집기다. 뒤집기와 크게 보기를 가르는
// 것은 뽑기 판 쪽이고, 여기는 [크게 띄우라] 는 말만 받는다.

export interface CardZoomDeps {
    // 겹을 붙일 자리. 뽑기 판과 같이 치워지도록 뽑기 판이 든다.
    attach(element: HTMLElement): void;
    listen(
        target: Window | Document | HTMLElement,
        type: string,
        handler: (event: never) => void,
    ): void;
}

export class CardZoomControl {
    private root: HTMLElement | null = null;
    // 지금 보고 있는 것이 몇 번째인가. -1 이면 안 떠 있다.
    private index = -1;
    // 이번에 뽑힌 열 장. 좌우로 넘길 때 쓴다.
    private cards: readonly DrawnCardView[] = [];

    private constructor(
        private readonly deps: CardZoomDeps,
        private readonly frame: CardZoomFrame,
        private readonly renderer: CardZoomRenderer,
    ) {}

    public static build(deps: CardZoomDeps, frame: CardZoomFrame): CardZoomControl {
        return new CardZoomControl(deps, frame, new CardZoomRenderer());
    }

    // 뽑기 판이 떴을 때 한 번 부른다.
    public async attach(): Promise<void> {
        if (this.root) return;
        const root = await this.renderer.build(this.frame);
        this.deps.attach(root);
        this.root = root;
        this.installHandlers(root);
    }

    // 이번 판에 뽑힌 것. 다시 소환할 때마다 갈린다.
    public setCards(cards: readonly DrawnCardView[]): void {
        this.cards = cards;
        this.close();
    }

    public isOpen(): boolean {
        return this.index >= 0;
    }

    public open(index: number): void {
        const root = this.root;
        if (!root) return;
        const card = this.cards[index];
        if (!card) return;
        this.index = index;
        this.renderer.show(this.frame, root, card, index + 1, this.cards.length);
    }

    public close(): void {
        this.index = -1;
        if (this.root) this.renderer.hide(this.root);
    }

    // 좌우로 넘긴다. 끝에서 넘기면 반대쪽 끝으로 돈다 — 열 장뿐이라 막다른 길이 성가시다.
    private step(by: number): void {
        if (!this.isOpen() || this.cards.length === 0) return;
        const size = this.cards.length;
        this.open((this.index + by + size) % size);
    }

    // ── 누름 ────────────────────────────────────────────────────────────────────

    private installHandlers(root: HTMLElement): void {
        this.deps.listen(root, 'click', (event: never) => {
            const target = (event as unknown as Event).target as HTMLElement | null;
            switch (this.renderer.actionOf(target)) {
                case 'close': this.close(); break;
                case 'prev': this.step(-1); break;
                case 'next': this.step(1); break;
                default: break;
            }
        });

        // 열쇠판. **떠 있을 때만 받는다** — 안 떠 있는데 화살표를 먹으면 다른 것이 안 된다.
        this.deps.listen(window, 'keydown', (event: never) => {
            if (!this.isOpen()) return;
            const key = (event as unknown as KeyboardEvent).key;
            if (key === 'Escape') this.close();
            else if (key === 'ArrowLeft') this.step(-1);
            else if (key === 'ArrowRight') this.step(1);
            else return;
            (event as unknown as Event).preventDefault();
        });
    }
}
