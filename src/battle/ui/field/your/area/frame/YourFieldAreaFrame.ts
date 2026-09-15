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

export interface YourFieldAreaBounds {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
}

// World-space axis-aligned bounds of the field area. Used for drop-hit tests.
export function computeYourFieldAreaBounds(
    frame: YourFieldAreaFrame,
    viewportWidth: number,
    viewportHeight: number,
): YourFieldAreaBounds {
    const centerX = frame.xPercent * viewportWidth;
    const centerY = frame.yPercent * viewportHeight;
    const halfWidth = (frame.widthPercent * viewportWidth) / 2;
    const halfHeight = (frame.heightPercent * viewportHeight) / 2;
    return {
        minX: centerX - halfWidth,
        maxX: centerX + halfWidth,
        minY: centerY - halfHeight,
        maxY: centerY + halfHeight,
    };
}
