import {
    YourLostZonePopupFrame,
    createDefaultYourLostZonePopupFrame,
} from "../../your_lost_zone/frame/YourLostZonePopupFrame";

// Opponent tomb popup uses the same type + default config as Your Lost Zone's popup.
// Re-exported so the opponent_tomb slice is self-contained and can diverge later.
export type OpponentTombPopupFrame = YourLostZonePopupFrame;

export function createDefaultOpponentTombPopupFrame(): OpponentTombPopupFrame {
    return createDefaultYourLostZonePopupFrame();
}
