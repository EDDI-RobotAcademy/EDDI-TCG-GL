// Single-slot placement frame for a card dropped onto your field area.
// Pilot C uses a single center slot; later pilots can extend this into a grid.

export interface PlacedCardPlacementFrame {
    readonly xPercent: number;
    readonly yPercent: number;
}

export function createDefaultPlacedCardPlacementFrame(): PlacedCardPlacementFrame {
    // Default: same center as the field area (yPercent mirrors YourFieldAreaFrame default).
    return {
        xPercent: 0,
        yPercent: -0.5 + (0.024 * 3 + 0.11 * 2.5),
    };
}

export function computePlacedCardPosition(
    frame: PlacedCardPlacementFrame,
    viewportWidth: number,
    viewportHeight: number,
): { x: number; y: number } {
    return {
        x: frame.xPercent * viewportWidth,
        y: frame.yPercent * viewportHeight,
    };
}
