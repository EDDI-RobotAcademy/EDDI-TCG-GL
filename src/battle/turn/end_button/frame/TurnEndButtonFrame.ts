// "End Your turn" click zone — a flat-side HEXAGON on the right edge of the screen that
// hands turn control over to the opponent when clicked.
//
// Six vertices, screen-space (y grows DOWN), listed in screen-clockwise order starting
// from the left-middle point. In world space (y up) this is counter-clockwise — which is
// what THREE.Shape wants for standard winding.
//
//   2─────3           top-left ─── top-right
//  /       \         /                     \
// 1         4    left-mid                  right-mid
//  \       /         \                     /
//   6─────5           bottom-left ─ bottom-right
//
// Designer clicks captured:
//   1  (1546, 450)  → (0.89468, 0.49451)
//   2  (1582, 386)  → (0.91551, 0.42418)
//   3  (1676, 386)  → (0.96991, 0.42418)
//   4  (1712, 450)  → (0.99074, 0.49451)
//   5  (1676, 516)  → (0.96991, 0.56703)
//   6  (1582, 516)  → (0.91551, 0.56703)
export interface HexVertex {
    readonly x: number;
    readonly y: number;
}

export interface TurnEndButtonNeonFrame {
    readonly baseColor: number;
    readonly glowColor: number;
    readonly thickness: number;       // world-px width of the glow band
    readonly marginPx: number;        // extra plane margin outside the hex bbox for glow falloff
    readonly zOffset: number;         // neon draws slightly above the invisible fill
    readonly timeIncrement: number;   // per-animation-frame increment for u_time pulse
    readonly renderOrder: number;
}

export interface TurnEndButtonFrame {
    readonly vertexRatios: readonly HexVertex[];   // 6 points, screen-space y-down
    readonly color: number;
    readonly opacity: number;
    readonly renderOrder: number;
    readonly neon: TurnEndButtonNeonFrame;
}

export function createDefaultTurnEndButtonFrame(): TurnEndButtonFrame {
    return {
        vertexRatios: [
            { x: 0.89468, y: 0.49451 },  // 1 — left mid
            { x: 0.91551, y: 0.42418 },  // 2 — top left
            { x: 0.96991, y: 0.42418 },  // 3 — top right
            { x: 0.99074, y: 0.49451 },  // 4 — right mid
            { x: 0.96991, y: 0.56703 },  // 5 — bottom right
            { x: 0.91551, y: 0.56703 },  // 6 — bottom left
        ],
        // Fully transparent — invisible hex plane exists only as a hit-test reference and
        // visual outline anchor. The neon border below is the user-visible button.
        color: 0x000000,
        opacity: 0.0,
        renderOrder: 40,
        neon: {
            // Ally-neon palette — the same blue/cyan used when a player card is selected
            // (see createAllyNeonBorderFrame). Calm, non-aggressive, signals "your
            // interactable button" rather than "danger". Border is hidden by default
            // (u_hover = 0) and only shows on mouse hover.
            // Medium-saturation blue — not washed toward cyan, not dark navy either. Clean
            // light-blue at peak for a delicate sheen rather than a heavy stamp.
            baseColor: 0x2055D8,   // medium royal blue
            glowColor: 0x6AB0FF,   // light sky blue at pulse peak
            // Much thinner outline — the hex is small, a 4-px rim is more than enough to
            // read as a clean border.
            // THIN rim. The wide-spread LOOK comes from the multi-layer halo in the shader
            // (5×/12×/20× multipliers), not from the base thickness.
            thickness: 2,
            // Plane margin must exceed the widest halo layer (20× thickness = 40 px) so the
            // spread falloff decays fully inside the plane without being clipped.
            marginPx: 44,
            zOffset: 0.1,
            timeIncrement: 0.015,  // matches ally neon — gentle breathing pulse
            renderOrder: 41,
        },
    };
}

// Convert screen ratios → world-space vertices. Screen y-down becomes world y-up, so
// (0.5 - y) * height, and x uses (x - 0.5) * width. Returned in the same winding order
// as the input, which in world space is counter-clockwise.
export function computeTurnEndButtonVertices(
    frame: TurnEndButtonFrame,
    viewportWidth: number,
    viewportHeight: number,
): HexVertex[] {
    return frame.vertexRatios.map((v) => ({
        x: (v.x - 0.5) * viewportWidth,
        y: (0.5 - v.y) * viewportHeight,
    }));
}

// Point-in-hexagon test via standard ray-casting. Works for any simple polygon; we use it
// because a rectangular bounds check would let clicks just outside the hex corners through.
export function isPointInsideTurnEndButton(
    px: number,
    py: number,
    frame: TurnEndButtonFrame,
    viewportWidth: number,
    viewportHeight: number,
): boolean {
    const vs = computeTurnEndButtonVertices(frame, viewportWidth, viewportHeight);
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i].x, yi = vs[i].y;
        const xj = vs[j].x, yj = vs[j].y;
        const crosses = (yi > py) !== (yj > py);
        if (crosses && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}
