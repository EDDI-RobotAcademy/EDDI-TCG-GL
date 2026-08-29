// Tombstone-shaped click panel on the player's side.
//
// Shape is a rectangle with a rounded arch on top (like a classic gravestone). The arch is
// a half-ellipse rather than a true semicircle — the click data shows the apex rises
// 7 % of viewport height above the rectangle while the rectangle is only 8.5 % of viewport
// wide, so the arc is TALLER than a semicircle would be.
//
// Designer click data (screen-space ratios, y DOWN):
//   bottom-left  (240, 867)  → (0.13889, 0.95275)
//   bottom-right (386, 867)  → (0.22338, 0.95275)
//   arc-left     (240, 772)  → (0.13889, 0.84835)   (rect top-left, arc springline)
//   arc-apex     (312, 708)  → (0.18056, 0.77802)
//   arc-right    (386, 772)  → (0.22338, 0.84835)   (rect top-right, arc springline)
//
// Derived:
//   rectLeftRatio   = 0.13889
//   rectRightRatio  = 0.22338
//   rectTopRatio    = 0.84835   (where the arc springs from)
//   rectBottomRatio = 0.95275
//   arcApexYRatio   = 0.77802
//   arcCenterXRatio = 0.18113   (midpoint of rectLeft/Right ≈ designer's 0.18056 apex x)

export interface YourTombPanelFrame {
    readonly rectLeftRatio: number;
    readonly rectRightRatio: number;
    readonly rectTopRatio: number;      // screen y from top where arc springs from
    readonly rectBottomRatio: number;   // screen y from top at rectangle bottom
    readonly arcApexYRatio: number;     // screen y from top at apex of the arc
    readonly color: number;
    readonly opacity: number;
    readonly renderOrder: number;
}

export function createDefaultYourTombPanelFrame(): YourTombPanelFrame {
    return {
        rectLeftRatio:   0.13889,
        rectRightRatio:  0.22338,
        // Nudged ~0.010 below the designer's raw click data (0.84835 / 0.95275 / 0.77802) —
        // a small step down from the previous 0.008 shift, keeping rect and arch heights.
        rectTopRatio:    0.85835,
        rectBottomRatio: 0.96275,
        arcApexYRatio:   0.78802,
        // Fully transparent — click detection uses `isPointInsideYourTomb` in the pilot,
        // not raycasting the mesh, so the invisible shape still acts as a hit zone.
        // Position verification was done with opacity 0.6 during development.
        color: 0x000000,
        opacity: 0.0,
        renderOrder: 40,
    };
}

// World-space geometry derived from a frame + viewport. Used by both the renderer (to build
// the Shape) and the pilot (to hit-test clicks).
export interface YourTombGeometry {
    readonly rectMinX: number;
    readonly rectMaxX: number;
    readonly rectMinY: number;   // world y (up)
    readonly rectMaxY: number;   // world y (up) — top of rectangle, where the arc starts
    readonly arcCenterX: number;
    readonly arcSemiA: number;   // horizontal semi-axis = (maxX - minX) / 2
    readonly arcSemiB: number;   // vertical semi-axis = arc apex height above rectTop
    readonly arcApexY: number;   // world y (up) at the top of the arc
}

export function computeYourTombGeometry(
    frame: YourTombPanelFrame,
    viewportWidth: number,
    viewportHeight: number,
): YourTombGeometry {
    const rectMinX = (frame.rectLeftRatio  - 0.5) * viewportWidth;
    const rectMaxX = (frame.rectRightRatio - 0.5) * viewportWidth;
    const rectMinY = (0.5 - frame.rectBottomRatio) * viewportHeight;   // world bottom
    const rectMaxY = (0.5 - frame.rectTopRatio)    * viewportHeight;   // arc springline
    const arcApexY = (0.5 - frame.arcApexYRatio)   * viewportHeight;   // higher than rectMaxY
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

// Point-in-tomb hit-test. True if (px, py) is inside the rectangle OR inside the upper
// half-ellipse (the arch).
export function isPointInsideYourTomb(
    px: number,
    py: number,
    frame: YourTombPanelFrame,
    viewportWidth: number,
    viewportHeight: number,
): boolean {
    const g = computeYourTombGeometry(frame, viewportWidth, viewportHeight);
    // Rectangle region: [minX,maxX] × [minY,maxY].
    if (px >= g.rectMinX && px <= g.rectMaxX && py >= g.rectMinY && py <= g.rectMaxY) {
        return true;
    }
    // Arch region: upper half of ellipse centred at (arcCenterX, rectMaxY).
    // Only valid for py > rectMaxY AND py <= arcApexY.
    if (py > g.rectMaxY && py <= g.arcApexY) {
        const dx = (px - g.arcCenterX) / g.arcSemiA;
        const dy = (py - g.rectMaxY)   / g.arcSemiB;
        if (dx * dx + dy * dy <= 1) return true;
    }
    return false;
}
