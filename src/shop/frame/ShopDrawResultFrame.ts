import {CARD_ASPECT} from "../../card/shape";

// 뽑은 카드를 보여 주는 화면이다.
//
// **THREE 를 모른다.** 값만 든다 (frame-no-three).
//
// 카드 크기를 직접 적지 않는다. **판이 화면의 얼마를 차지하는가**를 적고 카드 폭은 거기서
// 낸다. 그러면 장수나 칸 수가 바뀌어도 판이 화면을 벗어나지 않고, 근거 없는 숫자가
// 안 생긴다.
//
// 세로 비율은 카드 그림 자체의 사실이라 한 곳에서 가져온다 (`card/shape`). 전에는 여기에
// 두 번째로 적었다 — 같은 사실이 두 곳에 있으면 한쪽만 고쳐진다.
export interface ShopDrawResultFrame {
    readonly backgroundImage: string;
    readonly dimOpacity: number;
    readonly dimRenderOrder: number;

    // 카드 판 전체가 창 너비의 얼마를 차지하나.
    readonly gridWidthRatio: number;
    // 카드 판 전체가 창 높이의 얼마를 차지하나.
    //
    // **둘 중 작은 쪽이 카드 크기를 정한다.** 너비만 보면 2560x1080 처럼 넓고 낮은 창에서
    // 두 줄이 화면 높이를 넘는다.
    readonly gridHeightRatio: number;
    readonly cardAspect: number;
    // 몇 칸으로 놓나. 장수를 칸 수로 나눈 만큼 줄이 된다.
    readonly columns: number;
    // 칸과 줄 사이 간격. 카드 크기에 대한 비율이다.
    readonly columnGapRatio: number;
    readonly rowGapRatio: number;
    // 카드 판 전체의 가운데. 장수가 바뀌어도 줄이 안 밀린다 (R2-132 에서 배운 것).
    readonly centerYRatio: number;

    readonly renderOrder: number;
    // 카드 그림 경로를 카드 번호로 만든다.
    cardImage(cardId: number): string;
}

// 카드 한 장의 폭. 창 크기에 맞춰 낸다.
//
// 너비로 재 본 것과 높이로 재 본 것 중 **작은 쪽**을 쓴다. 한쪽만 보면 다른 쪽이 넘친다.
export function resultCardWidth(
    frame: ShopDrawResultFrame, rows: number,
    viewportWidth: number, viewportHeight: number,
): number {
    const columnSpan = frame.columns + (frame.columns - 1) * frame.columnGapRatio;
    const byWidth = (frame.gridWidthRatio * viewportWidth) / columnSpan;

    const rowSpan = rows + (rows - 1) * frame.rowGapRatio;
    const byHeight = (frame.gridHeightRatio * viewportHeight) / (rowSpan * frame.cardAspect);

    return Math.min(byWidth, byHeight);
}

export function createDefaultShopDrawResultFrame(): ShopDrawResultFrame {
    return {
        backgroundImage: 'resource/shop/background/new_card_background.png',
        dimOpacity: 0.85,
        dimRenderOrder: 20,

        // 다섯 칸이 창 너비의 이만큼, 두 줄이 창 높이의 이만큼을 차지한다.
        // 16:9 화면에서는 너비가 먼저 걸려 카드 한 장이 창 너비의 약 0.12 가 된다 —
        // 전투 손패 카드(0.0649)의 약 1.8 배다. 뽑은 카드를 크게 보여 주는 화면이다.
        gridWidthRatio: 0.66,
        gridHeightRatio: 0.72,
        cardAspect: CARD_ASPECT,
        columns: 5,
        columnGapRatio: 0.12,
        rowGapRatio: 0.12,
        centerYRatio: -20 / 1080,

        renderOrder: 21,
        cardImage: (cardId) => `resource/my_card/card/${cardId}.png`,
    };
}
