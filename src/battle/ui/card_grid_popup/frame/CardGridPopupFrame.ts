// Centered popup that appears when the lost-zone panel is clicked. Legacy layout spans
// x in [0.2, 0.8] × y in [0.2, 0.8] (screen-space, y from top) — i.e., a 60%×60% rect.
// Cards are laid out in a grid inside the popup.
export interface CardGridPopupFrame {
    readonly leftRatio: number;
    readonly rightRatio: number;
    readonly topRatio: number;
    readonly bottomRatio: number;

    readonly backgroundColor: number;
    readonly backgroundOpacity: number;
    readonly renderOrder: number;

    // Card-grid config inside the popup.
    readonly cardColumns: number;
    readonly rowsPerPage: number;
    readonly cardAspect: number;       // card height / card width
    readonly cardGapXRatio: number;    // horizontal gap as a fraction of card width
    readonly cardGapYRatio: number;    // vertical gap as a fraction of card height
    readonly innerPaddingRatio: number; // padding inside the popup as a fraction of popup width

    // Prev/next pagination buttons rendered between rows 1 and 2 (at the popup's centerY).
    readonly pageButton: {
        readonly widthRatio: number;               // fraction of viewport width
        readonly heightRatio: number;              // fraction of viewport height
        readonly xOffsetFromCenterRatio: number;   // fraction of popup width — distance from centerX to each button center
        readonly prevImage: string;
        readonly nextImage: string;
    };
}

export function createDefaultCardGridPopupFrame(): CardGridPopupFrame {
    return {
        leftRatio: 0.2,
        rightRatio: 0.8,
        topRatio: 0.2,
        bottomRatio: 0.8,
        backgroundColor: 0x0c0c18,
        backgroundOpacity: 0.92,
        renderOrder: 600,
        cardColumns: 5,
        rowsPerPage: 2,
        cardAspect: 1.6,
        // Matches hand-row spacing: hand uses cardGapRatio 0.094696 × innerWidth as step,
        // card width 0.06494 × innerWidth → gap-as-fraction-of-card-width = (0.094696 -
        // 0.06494) / 0.06494 ≈ 0.458. Keeping the popup identical avoids visual jarring
        // between cards on the field/hand and cards in the lost-zone popup.
        cardGapXRatio: 0.458,
        cardGapYRatio: 0.5,
        innerPaddingRatio: 0.04,
        pageButton: {
            // Matches the hand's gold page buttons (~0.036 × 0.052 of viewport) for visual
            // consistency. Positioned at ±40% of popup width from the popup's centerX — pushes
            // prev/next toward the popup's left/right edges so they don't crowd the middle.
            widthRatio: 0.036,
            heightRatio: 0.052,
            xOffsetFromCenterRatio: 0.44,
            prevImage: 'resource/battle_field/your_hand/prev_gold_button.png',
            nextImage: 'resource/battle_field/your_hand/next_gold_button.png',
        },
    };
}

export interface CardGridPopupBounds {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
    readonly centerX: number;
    readonly centerY: number;
    readonly width: number;
    readonly height: number;
}

export function computeCardGridPopupBounds(
    frame: CardGridPopupFrame,
    viewportWidth: number,
    viewportHeight: number,
): CardGridPopupBounds {
    const minX = (frame.leftRatio - 0.5) * viewportWidth;
    const maxX = (frame.rightRatio - 0.5) * viewportWidth;
    const minY = (0.5 - frame.bottomRatio) * viewportHeight;
    const maxY = (0.5 - frame.topRatio) * viewportHeight;
    return {
        minX,
        maxX,
        minY,
        maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
        width: maxX - minX,
        height: maxY - minY,
    };
}
