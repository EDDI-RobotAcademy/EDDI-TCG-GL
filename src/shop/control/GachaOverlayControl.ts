import {CardDraw, DRAW_COUNT} from "../draw/CardDraw";
import {CardRace} from "../../card/race";
import {
    GachaOverlayFrame, createDefaultGachaOverlayFrame,
} from "../frame/GachaOverlayFrame";
import {
    GachaOverlayRenderer, DrawnCardView, toDrawnCardView,
} from "../renderer/GachaOverlayRenderer";
import {createCardZoomFrame} from "../frame/CardZoomFrame";
import {CardZoomControl} from "./CardZoomControl";

// 카드 뽑기 연출을 다루는 곳이다.
//
// 사용자가 하는 순서가 그대로 상태다.
//
//   뽑기를 확인한다 → 영상이 돈다 → 빛이 터진다 (화면이 흔들리고 파문이 퍼진다)
//                                → 카드 열 장이 한 점에서 흩어져 자리에 앉는다
//                                → 좋은 등급 자리가 두근거린다
//                                → 한 장씩 뒤집힌다 (섬광, 신화·전설은 광주)
//                                → 드러난 카드를 누르면 한 장을 크게 본다
//                                → 다시 소환 / 전체 뒤집기 / 닫기
//
// 영상이 도는 동안 [건너뛰기] 를 누르면 곧바로 빛이 터진다. 두 번째부터 영상을 다 보게
// 하면 지겹다.
//
// **무엇이 뽑히는지는 여기가 정하지 않는다.** 뽑는 창구에 묻고 받은 것을 보여 준다. 재화도
// 확률도 서버 일이다 (규칙 25).
export interface GachaOverlayDeps {
    // 화면 위에 얹는 겹을 몸통에 붙인다. 화면을 떠날 때 같이 치우려고 화면이 든다.
    appendToBody(element: HTMLElement): void;
    // 창(window)도 받는다. 크게 보기가 Esc 와 화살표를 듣는다.
    listen(
        target: Window | Document | HTMLElement,
        type: string,
        handler: (event: never) => void,
    ): void;
    readonly cardDraw: CardDraw;
    announce(message: string): void;
    // 연출이 닫혔다. 화면이 뒤를 다시 누를 수 있게 한다.
    onClosed(): void;
}

export class GachaOverlayControl {
    private root: HTMLElement | null = null;
    private open = false;
    // 지금 무엇을 뽑는 중인가. [다시 소환] 이 같은 것을 다시 뽑는다.
    private race: CardRace | null = null;
    // 뽑는 동안 또 누르는 것을 막는다.
    private drawing = false;
    // 빛이 터져 결과로 넘어갔나. 두 번 넘어가지 않게 든다.
    private revealed = false;
    // 뒤집기를 예약해 둔 것. 닫을 때 취소한다.
    private readonly timers: ReturnType<typeof setTimeout>[] = [];
    // 카드 한 장을 크게 보는 겹.
    private readonly zoom: CardZoomControl;

    private constructor(
        private readonly deps: GachaOverlayDeps,
        private readonly frame: GachaOverlayFrame,
        private readonly renderer: GachaOverlayRenderer,
    ) {
        this.zoom = CardZoomControl.build(
            {
                // 뽑기 판 안에 붙인다. 뽑기 판을 치우면 같이 치워진다.
                attach: (element) => this.root?.appendChild(element),
                listen: (target, type, handler) => this.deps.listen(target, type, handler),
            },
            createCardZoomFrame(frame),
        );
    }

    public static build(deps: GachaOverlayDeps): GachaOverlayControl {
        return new GachaOverlayControl(
            deps, createDefaultGachaOverlayFrame(), new GachaOverlayRenderer(),
        );
    }

    // 연출이 떠 있나. 떠 있으면 뒤의 단추를 누를 수 없다.
    public isOpen(): boolean {
        return this.open;
    }

    // 뽑기를 시작한다. 이 종족에서 뽑는다. null 이면 전 종족.
    public async start(race: CardRace | null): Promise<void> {
        if (this.open) return;
        this.race = race;

        const root = await this.renderer.build(this.frame);
        this.deps.appendToBody(root);
        this.root = root;
        this.open = true;

        this.installHandlers(root);
        await this.zoom.attach();
        await this.runOnce();
    }

    public close(): void {
        this.clearTimers();
        this.zoom.close();
        if (this.root) {
            this.renderer.dispose(this.root);
            this.root = null;
        }
        this.open = false;
        this.revealed = false;
        this.drawing = false;
        this.deps.onClosed();
    }

    // ── 한 번 뽑는 흐름 ─────────────────────────────────────────────────────────

    private async runOnce(): Promise<void> {
        const root = this.root;
        if (!root || this.drawing) return;
        this.drawing = true;
        this.revealed = false;
        this.clearTimers();

        try {
            const cardIds = await this.deps.cardDraw.draw(this.race, DRAW_COUNT);
            const cards = cardIds
                .map(toDrawnCardView)
                .filter((it): it is DrawnCardView => it !== null);

            if (cards.length === 0) {
                this.deps.announce('뽑을 카드가 없습니다.');
                this.close();
                return;
            }

            // 카드를 먼저 깐다. 영상이 도는 동안 뒤에서 준비된다.
            this.renderer.layCards(this.frame, root, cards);
            this.zoom.setCards(cards);
            this.renderer.setStage(root, 'video');
            this.renderer.setFlash(root, false, 0);

            console.log(`[shop] 뽑기 ${cards.length}장: ${cards.map((it) => it.cardId).join(', ')}`);

            const video = this.renderer.video(root);
            if (!video) {
                // 영상이 아직 없다. 곧바로 결과로 간다.
                this.reveal();
                return;
            }
            video.currentTime = 0;
            // 막히면 그대로 결과로 간다. 영상이 안 돈다고 뽑기가 멈추면 안 된다.
            await video.play().catch(() => { this.reveal(); });
        } finally {
            this.drawing = false;
        }
    }

    // 빛이 터지고 결과가 드러난다.
    private reveal(): void {
        const root = this.root;
        if (!root || this.revealed) return;
        this.revealed = true;

        // 1. 세게 번쩍이고, 화면이 흔들리며 파문이 퍼진다.
        this.renderer.setFlash(root, true, 120);
        this.renderer.burst(root);

        this.after(220, () => {
            if (!this.root) return;
            // 2. 영상을 멈추고 결과 판을 띄운다.
            this.renderer.video(this.root)?.pause();
            this.renderer.setStage(this.root, 'result');
            // 3. 빛이 천천히 걷힌다.
            this.renderer.setFlash(this.root, false, 900);
            // 4. 카드가 한 점에서 흩어져 자리로 날아온다.
            const landedMs = this.renderer.flyIn(this.frame, this.root);
            // 5. 다 앉으면 좋은 등급 자리가 두근거린다.
            this.after(landedMs, () => {
                if (this.root) this.renderer.startAnticipation(this.root);
            });
            // 6. 한 박자 쉬고 한 장씩 뒤집는다.
            this.after(landedMs + this.frame.flipStartMs, () => this.flipInOrder());
        });
    }

    // 한 장씩 뒤집는다. **좋은 등급은 늦게 뒤집힌다.**
    //
    // 다 똑같이 뒤집히면 좋은 것이 나왔는지 알 길이 없다. 늦게 나오는 것이 뽑기의 재미다.
    private flipInOrder(): void {
        const root = this.root;
        if (!root) return;

        this.renderer.cardSlots(root).forEach((slot, index) => {
            const extra = Number(slot.dataset.flipDelay ?? 0);
            this.after(
                index * this.frame.flipStepMs + extra,
                () => this.renderer.flip(slot, true),
            );
        });
    }

    // ── 누름 ────────────────────────────────────────────────────────────────────

    private installHandlers(root: HTMLElement): void {
        const skip = this.renderer.skipButton(root);
        if (skip) this.deps.listen(skip, 'click', () => this.reveal());

        for (const it of this.renderer.actionButtons(root, 'again')) {
            this.deps.listen(it, 'click', () => { void this.runOnce(); });
        }
        for (const it of this.renderer.actionButtons(root, 'close')) {
            this.deps.listen(it, 'click', () => this.close());
        }
        for (const it of this.renderer.actionButtons(root, 'flip-all')) {
            this.deps.listen(it, 'click', () => this.toggleAll());
        }

        // 카드 한 장을 누른다. **덮여 있으면 뒤집고, 드러나 있으면 크게 본다.**
        //
        // 기다리기 싫은 사람은 눌러서 먼저 뒤집고, 읽고 싶은 사람은 한 번 더 눌러 키운다.
        // 뒤집힌 것을 다시 덮는 길은 [전체 뒤집기] 가 맡는다 — 한 장씩 덮을 일이 없다.
        this.deps.listen(root, 'click', (event: never) => {
            if (this.zoom.isOpen()) return;
            const target = (event as unknown as Event).target as HTMLElement | null;
            const slot = target?.closest<HTMLElement>('.gacha-card');
            if (!slot) return;
            if (!this.renderer.isFlipped(slot)) {
                this.renderer.flip(slot, true);
                return;
            }
            this.zoom.open(this.renderer.cardSlots(root).indexOf(slot));
        });

        // 영상이 빛나는 순간에 넘어간다. 영상이 끝나도 넘어간다.
        const video = this.renderer.video(root);
        if (!video) return;
        this.deps.listen(video, 'timeupdate', () => {
            if (video.currentTime >= this.frame.flashAtSeconds) this.reveal();
        });
        this.deps.listen(video, 'ended', () => this.reveal());
        // 영상을 못 읽어도 뽑기는 돌아야 한다.
        this.deps.listen(video, 'error', () => {
            console.error('[shop] 뽑기 영상을 못 읽었다');
            this.reveal();
        });
    }

    private toggleAll(): void {
        const root = this.root;
        if (!root) return;
        const slots = this.renderer.cardSlots(root);
        // 한 장이라도 덮여 있으면 전부 뒤집는다. 다 뒤집혀 있으면 전부 덮는다.
        const anyCovered = slots.some((it) => !this.renderer.isFlipped(it));
        for (const slot of slots) this.renderer.flip(slot, anyCovered);
    }

    // ── 예약 ────────────────────────────────────────────────────────────────────

    // 예약한 것을 적어 둔다. 닫을 때 취소해야 한다 — 안 하면 닫힌 뒤에 뒤집기가 돈다.
    private after(ms: number, run: () => void): void {
        this.timers.push(setTimeout(run, ms));
    }

    private clearTimers(): void {
        for (const it of this.timers) clearTimeout(it);
        this.timers.length = 0;
    }
}
