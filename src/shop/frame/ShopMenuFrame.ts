import {ShopMenuType} from "../entity/ShopMenuType";

// 상점에서 누를 수 있는 것 하나가 화면에서 어떻게 보이는가.
//
// **THREE 를 모른다.** 값만 든다 (frame-no-three).
//
// 자리와 크기를 전부 창 크기에 대한 비율로 든다. 전에는 두 가지가 섞여 있었다 — 뽑기
// 단추는 1920x1080 기준 점 좌표, 누르는 자리는 비율. 그러다 비율을 받는 자리에 점 좌표를
// 넘긴 곳이 있었고, 그 자리는 화면 밖에 놓였다 (R2-133 에서 고쳤다).
export interface ShopMenuItemFrame {
    readonly type: ShopMenuType;
    // 그림이 없으면 누르는 자리만 둔다. 그림은 배경에 함께 그려져 있다.
    readonly imageSrc: string | null;
    readonly xRatio: number;
    readonly yRatio: number;
    readonly widthRatio: number;
    readonly heightRatio: number;
    readonly renderOrder: number;
}

export interface ShopMenuFrame {
    readonly items: readonly ShopMenuItemFrame[];
}

// 뽑기 단추 넷. 가로로 나란히 선다.
//
// 기준 화면 1920x1080 에서 재던 값을 비율로 옮긴 것이다.
const DRAW_WIDTH_RATIO = 300 / 1920;
const DRAW_HEIGHT_RATIO = 300 / 1080;
const DRAW_Y_RATIO = -30 / 1080;

// 배경에 이미 그려져 있는 글자를 누르는 자리. 그림을 따로 그리지 않는다.
const NAV_WIDTH_RATIO = 0.09415;
const NAV_HEIGHT_RATIO = 0.06458;

export function createDefaultShopMenuFrame(): ShopMenuFrame {
    return {
        items: [
            drawButton(ShopMenuType.DrawAll, 'resource/shop/buttons/draw_all.png', -650),
            drawButton(ShopMenuType.DrawUndead, 'resource/shop/buttons/draw_undead.png', -220),
            drawButton(ShopMenuType.DrawTrent, 'resource/shop/buttons/draw_trent.png', 210),
            drawButton(ShopMenuType.DrawHuman, 'resource/shop/buttons/draw_human.png', 655),

            // 왼쪽 위 [로비] 글자 위.
            navArea(ShopMenuType.ToLobby, 0.04761 - 0.5, 0.5 - 0.07534),
            // 그 아래 [내 카드] 글자 위. 전에는 이 자리에 점 좌표가 들어가 화면 밖에
            // 놓였다. 로비 자리에서 한 칸 아래로 잡는다.
            navArea(ShopMenuType.ToMyCard, 0.04761 - 0.5, 0.5 - 0.15068),
        ],
    };
}

function drawButton(
    type: ShopMenuType, imageSrc: string, xPoint: number,
): ShopMenuItemFrame {
    return {
        type,
        imageSrc,
        xRatio: xPoint / 1920,
        yRatio: DRAW_Y_RATIO,
        widthRatio: DRAW_WIDTH_RATIO,
        heightRatio: DRAW_HEIGHT_RATIO,
        renderOrder: 1,
    };
}

function navArea(type: ShopMenuType, xRatio: number, yRatio: number): ShopMenuItemFrame {
    return {
        type,
        imageSrc: null,
        xRatio,
        yRatio,
        widthRatio: NAV_WIDTH_RATIO,
        heightRatio: NAV_HEIGHT_RATIO,
        renderOrder: 1,
    };
}
