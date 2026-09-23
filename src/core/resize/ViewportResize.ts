// 창 크기가 바뀔 때 다시 재야 하는 것을 모아 둔다.
//
// 전투에서 만들었지만 전투만의 것이 아니다 (R2-131). 로비도 레이드도 같은 일을 한다 —
// 창 크기에서 제 크기를 내는 것은 다시 재야 하고, 남에게 붙어 있는 것은 남이 다시 재진
// 뒤에 해야 한다. 그래서 core 에 둔다.
//
// **만드는 자리에서 바로 등록한다.** 전에는 만드는 곳과 다시 재는 곳이 삼천 줄 떨어져
// 있었다. 새로 그리는 것을 더할 때 다시 재는 것을 잊는 일이 여덟 번 났고 (R2-86 ~ R2-93)
// 그중 다섯을 사용자가 찾았다. 안 보이는 것은 안 맞아도 눈에 안 띈다.
//
// 순서가 있다. 셋으로 나눈다.
//
//   layout    제 크기를 스스로 내는 것. 창 크기만 보면 된다. 서로 순서가 없다
//   attached  남에게 붙어 있어서 남의 크기를 읽는 것. 남이 다시 재진 뒤에 해야 한다
//   last      옮겨진 카드를 따라가는 것. 카드가 새 자리로 간 뒤에 해야 한다
//
// 이 셋이 순서다. 같은 칸 안에서는 등록한 차례로 돈다.
export type ResizePhase = 'layout' | 'attached' | 'last';

export type ResizeStep = (viewportWidth: number, viewportHeight: number) => void;

export class ViewportResize {
    private readonly steps: Record<ResizePhase, ResizeStep[]> = {
        layout: [],
        attached: [],
        last: [],
    };

    // 다시 재는 방법을 등록한다. 만드는 자리에서 바로 부른다.
    public add(phase: ResizePhase, step: ResizeStep): void {
        this.steps[phase].push(step);
    }

    // 창 크기가 바뀌었다. 등록된 것을 순서대로 다 돌린다.
    public apply(viewportWidth: number, viewportHeight: number): void {
        for (const phase of ['layout', 'attached', 'last'] as const) {
            for (const step of this.steps[phase]) step(viewportWidth, viewportHeight);
        }
    }

    // 몇 개가 등록되어 있나. 확인용이다.
    public count(): number {
        return this.steps.layout.length + this.steps.attached.length + this.steps.last.length;
    }
}
