import {OpeningHandFrame, createDefaultOpeningHandFrame} from "../frame/OpeningHandFrame";
import {OpeningHandRenderer} from "../renderer/OpeningHandRenderer";

// 대전을 시작할 때 받은 카드를 보여 주는 일을 다루는 곳이다.
//
// 사용자가 보는 순서가 그대로 상태다.
//
//   전투에 들어온다 → 받은 다섯 장이 화면 가운데 크게 뜬다 (한 장씩 차례로)
//                   → [시작] 을 누른다
//                   → 겹이 걷히고 그 카드들이 손패에 있다
//
// **손패는 이미 깔려 있다.** 이 겹은 그 위를 덮고 있을 뿐이라, 걷히면 바로 쓸 수 있다.
// 여기서 카드를 손패로 옮기지 않는다 — 옮기는 것은 판을 차릴 때 이미 끝났다.
//
// 멀리건이 붙을 자리가 여기다. [시작] 옆에 [다시 받기] 가 생긴다.

export interface OpeningHandDeps {
    // 화면 위에 얹는 겹을 몸통에 붙인다. 화면을 떠날 때 같이 치우려고 화면이 든다.
    appendToBody(element: HTMLElement): void;
    listen(target: HTMLElement, type: string, handler: (event: never) => void): void;
    // 겹이 걷혔다. 전투를 시작해도 된다.
    onConfirmed(): void;
}

export class OpeningHandControl {
    private root: HTMLElement | null = null;
    // 걷는 중에 또 누르는 것을 막는다.
    private leaving = false;
    private timer: ReturnType<typeof setTimeout> | null = null;

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

        const confirm = this.renderer.confirmButton(root);
        if (confirm) this.deps.listen(confirm, 'click', () => this.confirm());

        // 붙인 바로 다음 칸에 켠다. 붙이면서 켜면 브라우저가 처음 상태를 못 보고
        // 나타나는 움직임을 건너뛴다.
        requestAnimationFrame(() => {
            if (this.root) this.renderer.show(this.root);
        });
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
