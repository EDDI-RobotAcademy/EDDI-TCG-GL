// Small clickable panel at the bottom-left — when clicked, opens the lost-zone popup.
// Ratios match the legacy Python `YourLostZone.create_your_lost_zone_panel` layout:
//   x in [0.022, 0.122] of window.innerWidth
//   y in [0.756, 0.959] of window.innerHeight  (measured from TOP in screen space)
export interface YourLostZonePanelFrame {
    readonly leftRatio: number;
    readonly rightRatio: number;
    readonly topRatio: number;     // screen-space y from top
    readonly bottomRatio: number;  // screen-space y from top
    readonly color: number;
    readonly opacity: number;
    readonly renderOrder: number;
}

export function createDefaultYourLostZonePanelFrame(): YourLostZonePanelFrame {
    return {
        leftRatio: 0.022,
        rightRatio: 0.122,
        // Shifted down ~0.014 from the original legacy values (0.756 / 0.959) so the panel
        // sits a touch lower, and the top nudged up ~0.010 to give it a bit more height.
        topRatio: 0.760,
        bottomRatio: 0.973,
        // Fully transparent — the zone is only a click target, no visible shading needed.
        // Click detection is done via `computeYourLostZonePanelBounds` in the pilot, not via
        // raycasting the mesh, so the invisible rectangle still works as a button.
        color: 0x000000,
        opacity: 0.0,
        renderOrder: 40,
    };
}

export interface YourLostZonePanelBounds {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
}

// Screen ratios → world-space bounds. The OrthographicCamera spans [-w/2, +w/2] × [-h/2, +h/2]
// with +y UP, so a top-down ratio of 0 maps to +h/2 and 1.0 maps to -h/2.
export function computeYourLostZonePanelBounds(
    frame: YourLostZonePanelFrame,
    viewportWidth: number,
    viewportHeight: number,
): YourLostZonePanelBounds {
    return {
        minX: (frame.leftRatio - 0.5) * viewportWidth,
        maxX: (frame.rightRatio - 0.5) * viewportWidth,
        minY: (0.5 - frame.bottomRatio) * viewportHeight,  // bottom-ratio → lower world y
        maxY: (0.5 - frame.topRatio) * viewportHeight,     // top-ratio → higher world y
    };
}
