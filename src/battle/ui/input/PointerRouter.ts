// 화면을 누를 때 누가 먼저 받을지를 정한다.
//
// 전에는 같은 자리에 누름 처리기 다섯이 따로 붙어 있었고, 누가 먼저 받는지가 **등록한
// 줄 순서와 capture 표시에만** 있었다. 주석에 [끌어다 놓기보다 먼저] 라고 적어 두는
// 식이라, 새 처리기를 더할 때 어디에 끼워야 하는지 코드를 위아래로 읽어야 알았다.
//
// 순서에 이름을 붙인다. 등록하는 자리가 어디든 이름이 순서를 정한다.
//
//   modal     창이 열려 있으면 그 창이 다 먹는다. 뒤의 것은 아무것도 못 받는다
//   hud       화면 가장자리의 단추들 — 쪽 넘기기, 턴 종료
//   target    겨냥 중일 때의 누름 — 액티브 패널 단추, 상대 카드 고르기
//   intercept 무엇을 붙이는 중일 때 카드 누름을 가로채는 것
//   hand      손패를 집고 끌어다 놓는 것. 가장 나중이다
//
// 처리기가 [내가 먹었다] 고 말하는 방법은 전과 같다 — stopImmediatePropagation 을 부른다.
// 라우터가 그것을 알아채고 뒤의 것을 안 돌린다. 실제 DOM 에도 그대로 전하므로, 라우터
// 밖에 따로 붙어 있는 것(손패 끌어다 놓기)도 전처럼 막힌다.
export type PointerStage = 'modal' | 'hud' | 'target' | 'intercept' | 'hand';

const STAGE_ORDER: readonly PointerStage[] = ['modal', 'hud', 'target', 'intercept', 'hand'];

export type PointerHandler = (event: MouseEvent) => void;

interface Registered {
    readonly stage: PointerStage;
    readonly handler: PointerHandler;
}

export class PointerRouter {
    private readonly handlers: Registered[] = [];

    constructor(private readonly target: HTMLElement) {}

    public add(stage: PointerStage, handler: PointerHandler): void {
        this.handlers.push({stage, handler});
    }

    // 실제로 듣기 시작한다. 등록을 다 한 뒤에 한 번 부른다.
    //
    // capture 로 듣는다. 라우터 밖에 붙어 있는 것보다 먼저 받아야, 창이 열려 있을 때
    // 그쪽으로 새어 나가는 것을 막을 수 있다.
    public attach(
        type: 'mousedown',
        listen: (target: HTMLElement, type: string, listener: EventListener, options?: unknown) => void,
    ): void {
        listen(this.target, type, ((event: MouseEvent) => {
            let claimed = false;
            // 부른 것을 알아채되 실제 DOM 에도 그대로 전한다.
            const original = event.stopImmediatePropagation.bind(event);
            (event as MouseEvent & {stopImmediatePropagation: () => void})
                .stopImmediatePropagation = () => {
                    claimed = true;
                    original();
                };

            for (const stage of STAGE_ORDER) {
                for (const it of this.handlers) {
                    if (it.stage !== stage) continue;
                    it.handler(event);
                    if (claimed) return;
                }
            }
        }) as EventListener, true);
    }

    public count(): number {
        return this.handlers.length;
    }
}
