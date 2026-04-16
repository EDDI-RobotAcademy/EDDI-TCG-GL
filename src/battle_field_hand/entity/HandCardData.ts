import { CardKind } from "../../card/kind";
import { CardJob } from "../../card/job";

// Pure-data view of one hand card. Resolved upfront from getCardById(cardId) so
// the renderer never touches the card DB or texture manager directly.
//
// Field semantics mirror the Korean-keyed Card interface:
//   cardTextureId  ← card.카드번호   (main card image)
//   raceId         ← Number(card.종족)
//   hpId           ← card.체력        (may be null for some non-unit cards)
//   attackPowerId  ← card.공격력      (weapon / staff / dagger texture id)
//   kindId         ← Number(card.종류) (card_kinds image id, for non-UNIT cards)
//   cardKind       ← parseInt(card.종류) as CardKind
//   unitJob        ← parseInt(card.병종) as CardJob
export interface HandCardData {
    readonly cardTextureId: number;
    readonly raceId: number;
    readonly hpId: number | null;
    readonly attackPowerId: number;
    readonly kindId: number;
    readonly cardKind: CardKind;
    readonly unitJob: CardJob;
}
