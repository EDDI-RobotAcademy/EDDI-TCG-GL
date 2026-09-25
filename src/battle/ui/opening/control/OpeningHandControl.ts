import {OpeningHandFrame, createDefaultOpeningHandFrame} from "../frame/OpeningHandFrame";
import {OpeningHandRenderer} from "../renderer/OpeningHandRenderer";

// 대전을 시작할 때 받은 카드를 보여 주는 일을 다루는 곳이다.
//
// 사용자가 보는 순서가 그대로 상태다.
//
//   전투에 들어온다 → 받은 다섯 장이 화면 가운데 크게 뜬다 (한 장씩 차례로)
//                   → 바꾸고 싶은 카드를 누른다 (네온 테두리가 붙는다)
//                   → [바꾸기] 를 누르면 고른 것만 덱에서 새로 온다
//                   → [시작] 을 누르면 겹이 걷히고 판이 차려진다
//
// **바꾸기는 한 번뿐이다.** 여러 번 되면 마음에 들 때까지 돌릴 수 있어 뽑기가 뜻을 잃는다.
//
// **무엇으로 바뀌는지는 여기가 정하지 않는다.** 고른 자리만 넘기고 바뀐 다섯 장을 받는다 —
// 덱에 돌려 넣고 섞고 다시 뽑는 것은 판을 차리는 쪽 일이고, 서버가 붙으면 서버 일이다.

export interface OpeningHandDeps {
    // 화면 위에 얹는 겹을 몸통에 붙인다. 화면을 떠날 때 같이 치우려고 화면이 든다.
    appendToBody(element: HTMLElement): void;
    listen(target: HTMLElement, type: string, handler: (event: never) => void): void;
    // 고른 자리를 덱에서 새로 받아 온다. 바뀐 다섯 장을 돌려준다.
    swap(indexes: readonly number[]): readonly number[];
    // 겹이 걷혔다. 전투를 시작해도 된다.
    onConfirmed(): void;
}

export class OpeningHandControl {
    private root: HTMLElement | null = null;
    // 걷는 중에 또 누르는 것을 막는다.
    private leaving = false;
    private timer: ReturnType<typeof setTimeout> | null = null;
    // 바꾸기를 이미 썼나. 한 번뿐이다.
    private mulliganUsed = false;

    private constructor(
        private readonly deps: OpeningHandDeps,
        private readonly frame: OpeningHandFrame,
        private readonly renderer: OpeningHandRenderer,
    ) {}

    public static build(deps: OpeningHandDeps): OpeningHandControl {
        return new OpeningHandControl(
            deps, createDefaultOpeningHandFrame(), new OpeningHandRenderer(),
        );
    }

    // 받은 카드를 띄운다.
    public async present(cardIds: readonly number[]): Promise<void> {
        if (this.root) return;
        const root = await this.renderer.build(this.frame);
        this.deps.appendToBody(root);
        this.root = root;

        this.renderer.layCards(this.frame, root, cardIds);
        this.renderer.setMulliganState(this.frame, root, 0, false);

        const confirm = this.renderer.confirmButton(root);
        if (confirm) this.deps.listen(confirm, 'click', () => this.confirm());

        const mulligan = this.renderer.mulliganButton(root);
        if (mulligan) this.deps.listen(mulligan, 'click', () => this.runMulligan());

        // 카드를 눌러 고른다. 이미 바꾼 뒤에는 더 못 고른다.
        this.deps.listen(root, 'click', (event: never) => {
            if (this.mulliganUsed || this.leaving) return;
            const target = (event as unknown as Event).target as HTMLElement | null;
            const at = this.renderer.slotIndexOf(root, target);
            if (at < 0) return;
            const slots = this.renderer.cardSlots(root);
            this.renderer.setPicked(slots[at], !this.renderer.isPicked(slots[at]));
            this.renderer.setMulliganState(this.frame, root, this.pickedIndexes().length, false);
        });

        // 붙인 바로 다음 칸에 켠다. 붙이면서 켜면 브라우저가 처음 상태를 못 보고
        // 나타나는 움직임을 건너뛴다.
        requestAnimationFrame(() => {
            if (this.root) this.renderer.show(this.root);
        });
    }

    // 고른 자리. 화면에 붙은 표시가 곧 상태다 — 따로 적어 두면 둘이 어긋난다.
    private pickedIndexes(): number[] {
        const root = this.root;
        if (!root) return [];
        const out: number[] = [];
        this.renderer.cardSlots(root).forEach((slot, at) => {
            if (this.renderer.isPicked(slot)) out.push(at);
        });
        return out;
    }

    private runMulligan(): void {
        const root = this.root;
        if (!root || this.mulliganUsed || this.leaving) return;
        const picked = this.pickedIndexes();
        if (picked.length === 0) return;

        this.mulliganUsed = true;
        const swapped = this.deps.swap(picked);
        this.renderer.replaceCards(this.frame, root, swapped, picked);
        this.renderer.setMulliganState(this.frame, root, 0, true);
    }

    private confirm(): void {
        const root = this.root;
        if (!root || this.leaving) return;
        this.leaving = true;

        const fadeMs = this.renderer.fadeOut(this.frame, root);
        this.timer = setTimeout(() => {
            this.dispose();
            this.deps.onConfirmed();
        }, fadeMs);
    }

    // 화면을 떠날 때 부른다. 걷는 중이었으면 예약도 취소한다.
    public dispose(): void {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.root) {
            this.renderer.dispose(this.root);
            this.root = null;
        }
    }
}
