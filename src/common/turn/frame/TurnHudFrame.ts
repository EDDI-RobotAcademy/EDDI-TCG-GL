// Static "TURN N" box in the upper-right area. Values match showTurn() in
// src/common/turn/Turn.ts (baseHeight 1080 / baseFontSize 32 for font scaling).

export interface TurnHudFrame {
    readonly topPercent: string;
    readonly leftPercent: string;
    readonly widthPercent: string;
    readonly boxPaddingXRatio: number;
    readonly boxPaddingYRatio: number;
    readonly boxBackground: string;
    readonly boxBorderRadius: string;
    readonly color: string;
    readonly fontWeight: string;
    readonly baseViewportHeight: number;
    readonly baseFontSize: number;
    readonly zIndex: string;
}

export function createDefaultTurnHudFrame(): TurnHudFrame {
    return {
        topPercent: '34%',
        leftPercent: '86.4%',
        widthPercent: '13.6%',
        boxPaddingXRatio: 0.00625,
        boxPaddingYRatio: 0.01210898082,
        boxBackground:
            'linear-gradient(to right, rgba(255,255,255,0.2), rgba(139,69,19,0.3), rgba(0,0,0,0.2))',
        boxBorderRadius: '6px',
        color: '#fff',
        fontWeight: 'bold',
        baseViewportHeight: 1080,
        baseFontSize: 32,
        zIndex: '1000',
    };
}
