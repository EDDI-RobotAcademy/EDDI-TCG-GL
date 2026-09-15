// Opponent field-energy shaded area. Mirrors the player's Field Energy HUD
// (createDefaultFieldEnergyHudFrame: topPercent 82.4%, leftPercent 90.4%,
// widthPercent 7.2%) around the screen centre 180°.
//
// Ratio derivation (viewport y-down, screen ratios 0..1):
//   Player HUD bounds:
//     top edge    = 0.824 * vh
//     left edge   = 0.904 * vw
//     width       = 0.072 * vw
//     height      = width * imageAspectHW   (button image is 622×638 ≈ 1:1.026)
//     right edge  = 0.976 * vw
//     bottom edge = 0.824 * vh + 0.072 * 1.0257 * vw   (dynamic: depends on vw & vh)
//
//   Mirror around screen centre:
//     opp right edge  = 1 - 0.904 = 0.096 * vw
//     opp left edge   = 1 - 0.976 = 0.024 * vw
//     opp bottom edge = 1 - 0.824 = 0.176 * vh        (static)
//     opp top edge    = 0.176 * vh - height_px        (dynamic)
//
// So the stable anchor on the opponent side is its BOTTOM-EDGE (0.176 vh) and its
// horizontal CENTRE (= (0.024 + 0.096)/2 = 0.060 vw). The renderer derives the mesh
// size from widthRatio + imageAspectHW at resize time.
export interface OpponentFieldEnergyAreaFrame {
    readonly centerXRatio: number;      // viewport-width fraction, 0.060
    readonly bottomEdgeYRatio: number;  // viewport-height fraction, 0.176
    readonly widthRatio: number;        // viewport-width fraction, 0.072
    readonly imageAspectHW: number;     // image height/width, 638/622
    readonly color: number;
    readonly opacity: number;
    readonly renderOrder: number;
}

export function createDefaultOpponentFieldEnergyAreaFrame(): OpponentFieldEnergyAreaFrame {
    return {
        centerXRatio:     0.060,
        bottomEdgeYRatio: 0.176,
        widthRatio:       0.072,
        imageAspectHW:    638 / 622,
        // Position verified — shading hidden. The mesh stays in the scene as an invisible
        // hit zone / bounds anchor for hit-testing (isPointInsideOpponentFieldEnergyArea)
        // and for effect targeting (DeadLandsEffect resolves its target centre from
        // computeOpponentFieldEnergyBounds, not the mesh itself).
        color:       0x000000,
        opacity:     0.0,
        renderOrder: 40,
    };
}

// World-space bounds for the mesh (y-up, origin at screen centre).
export interface OpponentFieldEnergyBounds {
    readonly centerX: number;
    readonly centerY: number;
    readonly width: number;
    readonly height: number;
}

export function computeOpponentFieldEnergyBounds(
    frame: OpponentFieldEnergyAreaFrame,
    viewportWidth: number,
    viewportHeight: number,
): OpponentFieldEnergyBounds {
    const width = frame.widthRatio * viewportWidth;
    const height = width * frame.imageAspectHW;

    // Horizontal centre = (centerXRatio - 0.5) * vw. Screen centre in world is x=0,
    // so centerXRatio 0.060 → world x = -0.440 * vw (top-left region).
    const centerX = (frame.centerXRatio - 0.5) * viewportWidth;

    // Bottom edge (world y, y-up): vh/2 - bottomEdgeYRatio * vh.
    // Mesh centre Y = bottom_world + height/2.
    const bottomWorld = viewportHeight / 2 - frame.bottomEdgeYRatio * viewportHeight;
    const centerY = bottomWorld + height / 2;

    return { centerX, centerY, width, height };
}

// Point-in-rectangle hit test, for the drain drop zone later on.
export function isPointInsideOpponentFieldEnergyArea(
    px: number,
    py: number,
    frame: OpponentFieldEnergyAreaFrame,
    viewportWidth: number,
    viewportHeight: number,
): boolean {
    const b = computeOpponentFieldEnergyBounds(frame, viewportWidth, viewportHeight);
    return (
        px >= b.centerX - b.width  / 2 && px <= b.centerX + b.width  / 2 &&
        py >= b.centerY - b.height / 2 && py <= b.centerY + b.height / 2
    );
}
