// Mirror of YourFieldAreaFrame across the horizontal axis. Legacy OpponentFieldAreaServiceImpl
// computes a positive yPos that would land above the viewport; the entity constructor silently
// overrides it with (h/2) - 0.347*h — the actually-correct opponent Y. V2 encodes the correct
// value directly in the Frame, no service/entity gymnastics.

export interface OpponentFieldAreaFrame {
    readonly color: number;
    readonly opacity: number;
    readonly widthPercent: number;
    readonly heightPercent: number;
    readonly xPercent: number;
    readonly yPercent: number;
    readonly renderOrder: number;
}

export function createDefaultOpponentFieldAreaFrame(): OpponentFieldAreaFrame {
    return {
        color: 0x000000,
        opacity: 0.1,
        widthPercent: 0.7,
        heightPercent: 0.23,
        xPercent: 0,
        // Mirror of your field: yPercent = +0.5 - 0.347 = +0.153
        yPercent: 0.5 - (0.024 * 3 + 0.11 * 2.5),
        renderOrder: 1,
    };
}
