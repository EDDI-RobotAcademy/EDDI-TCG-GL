// Hand row layout. Mirrors BattleFieldHandServiceImpl.calculateHandPosition:
//   handX = (startXRatio + cardIndex * cardGapRatio) * innerWidth
//   handY = baselineYHeightRatio * innerHeight + baselineYWidthOffsetRatio * innerWidth
//
// Note: Y is a MIX of innerHeight and innerWidth terms — baselineYHeightRatio scales with innerHeight,
// but the +half-card offset scales with innerWidth (because cardHeight itself is derived from innerWidth).

export interface BattleFieldHandLayoutFrame {
    readonly startXRatio: number;
    readonly baselineYHeightRatio: number;
    readonly baselineYWidthOffsetRatio: number;
    readonly cardGapRatio: number;
}

export function createDefaultBattleFieldHandLayoutFrame(): BattleFieldHandLayoutFrame {
    const HALF = 0.5;
    const HAND_X_CRITERIA = 0.357904;
    const HAND_Y_CRITERIA = 1.052107;
    const CARD_WIDTH_RATIO = 0.06493506493;
    const CARD_HEIGHT_RATIO = CARD_WIDTH_RATIO * 1.615;

    return {
        startXRatio: HAND_X_CRITERIA - HALF,             // -0.142096
        baselineYHeightRatio: HALF - HAND_Y_CRITERIA,    // -0.552107
        baselineYWidthOffsetRatio: CARD_HEIGHT_RATIO * HALF,
        cardGapRatio: 0.094696,
    };
}

export function computeHandCardCenter(
    layout: BattleFieldHandLayoutFrame,
    cardIndex: number,
    viewportWidth: number,
    viewportHeight: number,
): { x: number; y: number } {
    const x = (layout.startXRatio + cardIndex * layout.cardGapRatio) * viewportWidth;
    const y = layout.baselineYHeightRatio * viewportHeight + layout.baselineYWidthOffsetRatio * viewportWidth;
    return { x, y };
}
