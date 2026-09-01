// Row layout for opponent field units. Mirrors OpponentFieldServiceImpl.calculateOpponentFieldPosition:
//   x = (OPPONENT_FIELD_INITIAL_X + cardIndex * GAP_OF_EACH_CARD) * innerWidth
//   y = OPPONENT_FIELD_INITIAL_Y * innerHeight + (CARD_HEIGHT_RATIO * HALF * innerWidth)

export interface OpponentFieldLayoutFrame {
    readonly startXRatio: number;
    readonly baselineYHeightRatio: number;
    readonly baselineYWidthOffsetRatio: number;
    readonly cardGapRatio: number;
}

export function createDefaultOpponentFieldLayoutFrame(): OpponentFieldLayoutFrame {
    const HALF = 0.5;
    const OPPONENT_FIELD_X_CRITERIA = 0.186458;
    const OPPONENT_FIELD_Y_CRITERIA = 0.44564;
    const CARD_WIDTH_RATIO = 0.06493506493;
    const CARD_HEIGHT_RATIO = CARD_WIDTH_RATIO * 1.615;

    return {
        // OPPONENT_FIELD_INITIAL_X = OPPONENT_FIELD_X_CRITERIA - HALF = -0.313542
        startXRatio: OPPONENT_FIELD_X_CRITERIA - HALF,
        // OPPONENT_FIELD_INITIAL_Y = HALF - OPPONENT_FIELD_Y_CRITERIA = +0.05436
        baselineYHeightRatio: HALF - OPPONENT_FIELD_Y_CRITERIA,
        baselineYWidthOffsetRatio: CARD_HEIGHT_RATIO * HALF,
        cardGapRatio: 0.094696,
    };
}

export function computeOpponentFieldCardCenter(
    layout: OpponentFieldLayoutFrame,
    cardIndex: number,
    viewportWidth: number,
    viewportHeight: number,
): { x: number; y: number } {
    const x = (layout.startXRatio + cardIndex * layout.cardGapRatio) * viewportWidth;
    const y =
        layout.baselineYHeightRatio * viewportHeight +
        layout.baselineYWidthOffsetRatio * viewportWidth;
    return { x, y };
}
