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
