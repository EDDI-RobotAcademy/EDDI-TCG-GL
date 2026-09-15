// Multi-slot row layout for cards placed on your field. Mirrors
// MouseDropServiceImpl.calculateYourFieldPositionByIndex (legacy) using the same YOUR_FIELD_*
// constants from BattleFieldConstants:
//   x = (startXRatio + placedIndex * cardGapRatio) * innerWidth
//   y = baselineYHeightRatio * innerHeight + baselineYWidthOffsetRatio * innerWidth
//
// Shares the Y mix-of-axes idiom with BattleFieldHandLayoutFrame — the baseline anchors to
// innerHeight, the half-card shift scales with innerWidth (because card size is
// innerWidth-driven).

export interface PlacedCardPlacementFrame {
    readonly startXRatio: number;
    readonly baselineYHeightRatio: number;
    readonly baselineYWidthOffsetRatio: number;
    readonly cardGapRatio: number;
}

export function createDefaultPlacedCardPlacementFrame(): PlacedCardPlacementFrame {
    const HALF = 0.5;
    const YOUR_FIELD_X_CRITERIA = 0.186458;
    const YOUR_FIELD_Y_CRITERIA = 0.65206185567;
    const CARD_WIDTH_RATIO = 0.06493506493;
    const CARD_HEIGHT_RATIO = CARD_WIDTH_RATIO * 1.615;

    return {
        // YOUR_FIELD_INITIAL_X = YOUR_FIELD_X_CRITERIA - HALF
        startXRatio: YOUR_FIELD_X_CRITERIA - HALF,
        // YOUR_FIELD_INITIAL_Y = HALF - YOUR_FIELD_Y_CRITERIA - CARD_HEIGHT_RATIO
        baselineYHeightRatio: HALF - YOUR_FIELD_Y_CRITERIA - CARD_HEIGHT_RATIO,
        baselineYWidthOffsetRatio: CARD_HEIGHT_RATIO * HALF,
        cardGapRatio: 0.094696,
    };
}

export function computePlacedCardPosition(
    frame: PlacedCardPlacementFrame,
    placedIndex: number,
    viewportWidth: number,
    viewportHeight: number,
): { x: number; y: number } {
    const x = (frame.startXRatio + placedIndex * frame.cardGapRatio) * viewportWidth;
    const y =
        frame.baselineYHeightRatio * viewportHeight +
        frame.baselineYWidthOffsetRatio * viewportWidth;
    return { x, y };
}
