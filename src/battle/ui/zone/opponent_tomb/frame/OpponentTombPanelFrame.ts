// Opponent tombstone panel. After rotating the 180°-screen-center mirror around the
// shape's OWN centroid, the tomb reads as a NORMAL tombstone (rectangle body with an arc
// pointing UP) — same semantic structure as YourTombPanelFrame, just positioned at the
// top-right of the screen instead of the bottom-left.
//
// Ratio derivation (in screen y-down):
//   Before rotation (screen-centre mirror of Your Tomb): rect y ∈ [0.03725, 0.14165],
//   arc apex y = 0.21198 (pointing DOWN).
//   Shape bbox y range: [0.03725, 0.21198]; centroid y ≈ 0.12462.
//   Rotating 180° around centroid maps y → 2·0.12462 − y = 0.24924 − y:
//     old rectTop    0.03725 → rectBottom (largest y, rect bottom edge)    0.21198
//     old rectBottom 0.14165 → rectTop    (arc springline, smaller y)     0.10758
//     old arcApex    0.21198 → arcApex    (now UP, smallest y)            0.03725
//
// Final shape: rectangle in screen y ∈ [0.10758, 0.21198] with an UPWARD arc apexing at
// screen y 0.03725 — matches YourTombPanelFrame's structure verbatim.
export interface OpponentTombPanelFrame {
    readonly rectLeftRatio: number;
    readonly rectRightRatio: number;
    readonly rectTopRatio: number;      // screen y at arc springline (smaller)
    readonly rectBottomRatio: number;   // screen y at rect bottom (larger)
    readonly arcApexYRatio: number;     // screen y at UPWARD arc apex (smallest)
    readonly color: number;
    readonly opacity: number;
    readonly renderOrder: number;
}

export function createDefaultOpponentTombPanelFrame(): OpponentTombPanelFrame {
    return {
        // Nudged ~0.0075 right from the pure 180° rotation (0.77662 / 0.86111) — half
        // of the previous +0.015 shift, pulled back toward the centre. Width preserved.
        rectLeftRatio:   0.78412,
        rectRightRatio:  0.86861,
        rectTopRatio:    0.10758,
        rectBottomRatio: 0.21198,
        arcApexYRatio:   0.03725,
        // Fully transparent — click detection uses `isPointInsideOpponentTomb` in the
        // pilot, not raycasting, so the invisible shape still acts as a hit zone.
        // Position verification was done with opacity 0.6 during development.
        color: 0x000000,
        opacity: 0.0,
        renderOrder: 40,
    };
}

// World-space geometry (same shape as YourTombGeometry — arc ABOVE rect now).
export interface OpponentTombGeometry {
    readonly rectMinX: number;
    readonly rectMaxX: number;
    readonly rectMinY: number;   // world y at rect bottom (smaller world y)
    readonly rectMaxY: number;   // world y at arc springline (rect top) (larger world y)
    readonly arcCenterX: number;
    readonly arcSemiA: number;
    readonly arcSemiB: number;
    readonly arcApexY: number;   // world y at arc apex (largest world y — above rect)
}

export function computeOpponentTombGeometry(
    frame: OpponentTombPanelFrame,
    viewportWidth: number,
    viewportHeight: number,
): OpponentTombGeometry {
    const rectMinX = (frame.rectLeftRatio  - 0.5) * viewportWidth;
    const rectMaxX = (frame.rectRightRatio - 0.5) * viewportWidth;
    const rectMinY = (0.5 - frame.rectBottomRatio) * viewportHeight;   // world bottom
    const rectMaxY = (0.5 - frame.rectTopRatio)    * viewportHeight;   // world top / springline
    const arcApexY = (0.5 - frame.arcApexYRatio)   * viewportHeight;   // world highest
    return {
        rectMinX,
        rectMaxX,
        rectMinY,
        rectMaxY,
        arcCenterX: (rectMinX + rectMaxX) / 2,
        arcSemiA:   (rectMaxX - rectMinX) / 2,
        arcSemiB:   arcApexY - rectMaxY,
        arcApexY,
    };
}

// Point-in-tomb. True if inside rect OR inside the UPPER half-ellipse.
export function isPointInsideOpponentTomb(
    px: number,
    py: number,
    frame: OpponentTombPanelFrame,
    viewportWidth: number,
    viewportHeight: number,
): boolean {
    const g = computeOpponentTombGeometry(frame, viewportWidth, viewportHeight);
    if (px >= g.rectMinX && px <= g.rectMaxX && py >= g.rectMinY && py <= g.rectMaxY) {
        return true;
    }
    // Arch region — above rect (py > rectMaxY) and up to apex (py <= arcApexY).
    if (py > g.rectMaxY && py <= g.arcApexY) {
        const dx = (px - g.arcCenterX) / g.arcSemiA;
        const dy = (py - g.rectMaxY)   / g.arcSemiB;
        if (dx * dx + dy * dy <= 1) return true;
    }
    return false;
}
