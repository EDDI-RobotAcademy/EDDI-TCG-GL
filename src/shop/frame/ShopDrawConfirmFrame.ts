import {ShopMenuType} from "../entity/ShopMenuType";

// 뽑기를 누른 뒤 [정말 뽑겠습니까] 를 묻는 화면이다.
//
// **THREE 를 모른다.** 값만 든다 (frame-no-three).
//
// 그림을 번호로 찾지 않고 파일 이름으로 직접 가리킨다. 그림 목록 셋의 차례가 서로 달라서
// (단추는 all·human·trent·undead, 고르기 화면은 all·trent·human·undead) 번호로 찾으면
// 종족이 뒤바뀐다. 종족과 그림을 한 줄에 두면 뒤바뀔 자리가 없다.
export interface ShopDrawConfirmFrame {
    // 화면 전체를 덮어 뒤를 못 누르게 하는 판.
    readonly dimOpacity: number;
    readonly dimRenderOrder: number;
    // 무엇을 뽑는지 크게 보여 주는 그림.
    readonly boardWidthRatio: number;
    readonly boardHeightRatio: number;
    readonly boardXRatio: number;
    readonly boardYRatio: number;
    // 예 / 아니오 단추.
    readonly buttonWidthRatio: number;
    readonly buttonHeightRatio: number;
    readonly yesXRatio: number;
    readonly noXRatio: number;
    readonly buttonYRatio: number;
    readonly renderOrder: number;
}

// 뽑기 종류마다 다른 것은 보여 주는 그림 하나뿐이다.
const BOARD_IMAGE: Readonly<Record<string, string>> = {
    [ShopMenuType.DrawAll]: 'resource/shop/select_screen/select_all.png',
    [ShopMenuType.DrawUndead]: 'resource/shop/select_screen/select_undead.png',
    [ShopMenuType.DrawTrent]: 'resource/shop/select_screen/select_trent.png',
    [ShopMenuType.DrawHuman]: 'resource/shop/select_screen/select_human.png',
};

export function confirmBoardImage(type: ShopMenuType): string | null {
    return BOARD_IMAGE[type] ?? null;
}

export const YES_IMAGE = 'resource/shop/yes_or_no/yes_button.png';
export const NO_IMAGE = 'resource/shop/yes_or_no/no_button.png';

export function createDefaultShopDrawConfirmFrame(): ShopDrawConfirmFrame {
    return {
        // 뒤가 보이되 누를 수는 없게. 0 이면 안 보이고 1 이면 뒤가 안 보인다.
        dimOpacity: 0.6,
        dimRenderOrder: 10,

        // 기준 화면 1920x1080 에서 재던 값을 비율로 옮긴 것이다.
        boardWidthRatio: 500 / 1920,
        boardHeightRatio: 700 / 1080,
        boardXRatio: 25 / 1920,
        boardYRatio: -15 / 1080,

        buttonWidthRatio: 150 / 1920,
        buttonHeightRatio: 60 / 1080,
        yesXRatio: -70 / 1920,
        noXRatio: 120 / 1920,
        buttonYRatio: -270 / 1080,

        renderOrder: 11,
    };
}
