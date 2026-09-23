// 레이드 화면에 놓이는 글자 한 덩이.
//
// **THREE 를 모른다.** 값만 든다 (frame-no-three).
//
// 레이드가 무엇을 하는 화면인지 아직 안 정했다. 그래서 지금은 [준비 중] 이라고 알리는
// 글자와 돌아가는 길만 있다. 실제 기능이 붙으면 이 프레임 옆에 그 기능의 프레임이 생기고
// 이것은 없어진다.
export interface RaidPlaceholderFrame {
    readonly title: string;
    readonly message: string;
    // 창 크기에 대한 비율. 화면 가운데가 0 이다.
    readonly titleYRatio: number;
    readonly messageYRatio: number;
    readonly titleHeightRatio: number;
    readonly messageHeightRatio: number;
    readonly renderOrder: number;
}

export function createDefaultRaidPlaceholderFrame(): RaidPlaceholderFrame {
    return {
        title: '레이드',
        message: '준비 중입니다. 아무 곳이나 눌러 로비로 돌아갑니다.',
        titleYRatio: 60 / 1080,
        messageYRatio: -40 / 1080,
        titleHeightRatio: 120 / 1080,
        messageHeightRatio: 48 / 1080,
        renderOrder: 1,
    };
}
