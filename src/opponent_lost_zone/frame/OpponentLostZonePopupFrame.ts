import {
    YourLostZonePopupFrame,
    createDefaultYourLostZonePopupFrame,
} from "../../your_lost_zone/frame/YourLostZonePopupFrame";

// Opponent's lost-zone popup — currently identical shape + default config to the player's,
// so we re-export the same type and factory. Kept as its own module so the opponent slice
// can diverge later (different layout, back-facing card orientation, etc.) without touching
// the player's slice.
export type OpponentLostZonePopupFrame = YourLostZonePopupFrame;

export function createDefaultOpponentLostZonePopupFrame(): OpponentLostZonePopupFrame {
    return createDefaultYourLostZonePopupFrame();
}
