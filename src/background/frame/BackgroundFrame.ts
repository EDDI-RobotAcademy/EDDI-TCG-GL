export interface BackgroundFrame {
    readonly imageSrc: string;
    readonly widthPercent: number;
    readonly heightPercent: number;
    readonly xPercent: number;
    readonly yPercent: number;
    readonly renderOrder: number;
}

export function createBattleFieldBackgroundFrame(): BackgroundFrame {
    return {
        imageSrc: 'resource/background/battle_field.png',
        widthPercent: 1,
        heightPercent: 1,
        xPercent: 0,
        yPercent: 0,
        renderOrder: 0,
    };
}

// 로비 배경. 전투와 같은 렌더러를 쓴다 — 화면 전체를 덮는 그림 한 장이라 같은 일이다.
export function createMainLobbyBackgroundFrame(): BackgroundFrame {
    return {
        imageSrc: 'resource/main_lobby/background.png',
        widthPercent: 1,
        heightPercent: 1,
        xPercent: 0,
        yPercent: 0,
        renderOrder: 0,
    };
}

// 상점 배경. 전투·로비와 같은 렌더러를 쓴다.
export function createShopBackgroundFrame(): BackgroundFrame {
    return {
        imageSrc: 'resource/shop/shop_background.png',
        widthPercent: 1,
        heightPercent: 1,
        xPercent: 0,
        yPercent: 0,
        renderOrder: 0,
    };
}
