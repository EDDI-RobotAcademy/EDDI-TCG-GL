export interface YourFieldAreaFrame {
    readonly color: number;
    readonly opacity: number;
    readonly widthPercent: number;
    readonly heightPercent: number;
    readonly xPercent: number;
    readonly yPercent: number;
    readonly renderOrder: number;
}

// Mirrors the hardcoded math in YourFieldAreaServiceImpl.calculateFieldDimensions:
//   yPos = -(h/2) + (0.024 * 3 + 0.11 * 2.5) * h   →   yPercent = -0.5 + 0.347 = -0.153
//   width  = 0.7  * w
//   height = 0.23 * h
export function createDefaultYourFieldAreaFrame(): YourFieldAreaFrame {
    return {
        color: 0x000000,
        opacity: 0.1,
        widthPercent: 0.7,
        heightPercent: 0.23,
        xPercent: 0,
        yPercent: -0.5 + (0.024 * 3 + 0.11 * 2.5),
        renderOrder: 1,
    };
}
