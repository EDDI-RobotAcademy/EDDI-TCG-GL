import { CardJob } from "../../card/job";
import { CardKind } from "../../card/kind";

// Pure data entity for an E+F+R-rendered hand card.
// Populated by looking up getCardById(cardId) in the scenario wiring, so the Renderer stays
// decoupled from the CSV/every_card_info data source.
//
// energyCount: currently-attached energy for a UNIT card. When 0, the Renderer skips both
// the energy icon and the number text — per user directive, "show 0" is not a valid state.
export interface HandCard {
    readonly cardId: number;
    readonly cardKind: CardKind;
    readonly unitJob: CardJob;
    readonly raceId: number;
    readonly hpId: number | null;
    readonly attackPowerId: number;
    readonly kindId: number;
    readonly energyCount: number;
}
