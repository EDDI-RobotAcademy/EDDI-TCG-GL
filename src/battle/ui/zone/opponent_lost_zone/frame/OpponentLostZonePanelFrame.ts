// Opponent's lost-zone click panel — the 180° rotation (around screen center) of the
// player's Your Lost Zone panel.
//
// Your Lost Zone ratios:
//   left 0.022, right 0.122, top 0.760, bottom 0.973
// Rotating 180° around (0.5, 0.5) maps (x, y) → (1-x, 1-y), so each old edge becomes
// the OPPOSITE edge:
//   new left   = 1 - old_right  = 0.878
//   new right  = 1 - old_left   = 0.978
//   new top    = 1 - old_bottom = 0.027
//   new bottom = 1 - old_top    = 0.240
export interface OpponentLostZonePanelFrame {
    readonly leftRatio: number;
    readonly rightRatio: number;
    readonly topRatio: number;
    readonly bottomRatio: number;
    readonly color: number;
    readonly opacity: number;
    readonly renderOrder: number;
}

export function createDefaultOpponentLostZonePanelFrame(): OpponentLostZonePanelFrame {
    return {
        // Nudged right ~0.008 from the pure 180° rotation (0.878 / 0.978) so the panel sits
        // a bit closer to the right edge while keeping the same width.
        leftRatio: 0.884,
        rightRatio: 0.984,
        topRatio: 0.027,
        bottomRatio: 0.240,
        // Fully transparent — click detection uses `computeOpponentLostZonePanelBounds` in
        // the pilot, not raycasting the mesh, so the invisible rectangle still acts as a
        // hit zone. Position verification was done with opacity 0.6 during development.
        color: 0x000000,
        opacity: 0.0,
        renderOrder: 40,
    };
}

export interface OpponentLostZonePanelBounds {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
}

// Screen ratios → world bounds (+y up, centered origin). Identical math to the Your
// Lost Zone helper — the whole panel is just a 180°-rotated mirror.
export function computeOpponentLostZonePanelBounds(
    frame: OpponentLostZonePanelFrame,
    viewportWidth: number,
    viewportHeight: number,
): OpponentLostZonePanelBounds {
    return {
        minX: (frame.leftRatio - 0.5) * viewportWidth,
        maxX: (frame.rightRatio - 0.5) * viewportWidth,
        minY: (0.5 - frame.bottomRatio) * viewportHeight,
        maxY: (0.5 - frame.topRatio) * viewportHeight,
    };
}