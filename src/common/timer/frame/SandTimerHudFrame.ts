// Hourglass timer HUD — mirrors showSandTimer() in src/common/timer/Timer.ts. The Renderer
// owns the rAF loop that animates sand grains and draws the top/bottom reservoirs via bezier
// curves on a <canvas>.

export interface SandTimerHudFrame {
    readonly durationSeconds: number;
    readonly topPercent: string;
    readonly leftPercent: string;
    readonly widthPercent: string;
    readonly boxPaddingXRatio: number;
    readonly boxPaddingYRatio: number;
    readonly boxBorderRadius: string;
    readonly boxBackground: string;
    readonly canvasWidthRatio: number;
    readonly canvasHeightRatio: number;
    readonly color: string;
    readonly warningColor: string;
    readonly warningThresholdSeconds: number;
    readonly textMarginLeftRatio: number;
    readonly baseViewportHeight: number;
    readonly baseFontSize: number;
    readonly zIndex: string;
}

export function createDefaultSandTimerHudFrame(): SandTimerHudFrame {
    return {
        durationSeconds: 60,
        topPercent: '26%',
        leftPercent: '86.4%',
        widthPercent: '13.6%',
        boxPaddingXRatio: 0.00625,
        boxPaddingYRatio: 0.01210898082,
        boxBorderRadius: '6px',
        boxBackground:
            'linear-gradient(to right, rgba(255,255,255,0.2), rgba(139,69,19,0.3), rgba(0,0,0,0.2))',
        canvasWidthRatio: 0.027,
        canvasHeightRatio: 0.055,
        color: '#fff',
        warningColor: '#ff3c3c',
        warningThresholdSeconds: 20,
        textMarginLeftRatio: 0.0125,
        baseViewportHeight: 1080,
        baseFontSize: 32,
        zIndex: '1000',
    };
}
