import {
    YourLostZonePopupFrame,
    createDefaultYourLostZonePopupFrame,
} from "../../your_lost_zone/frame/YourLostZonePopupFrame";

// Popup for the tomb uses the same type + default configuration as Your Lost Zone's popup
// — identical card grid, pagination buttons, and geometry. The alias is kept so the tomb
// slice can diverge later (e.g. different border art, "grave" themed background) without
// touching the lost-zone slice.
export type YourTombPopupFrame = YourLostZonePopupFrame;

export function createDefaultYourTombPopupFrame(): YourTombPopupFrame {
    return createDefaultYourLostZonePopupFrame();
}
