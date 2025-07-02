import {DeckCardCountMarkerPosition} from "../entity/DeckCardCountMarkerPosition";

export interface DeckCardCountMarkerPositionRepository {
    findPositionByPositionId(positionId: number): DeckCardCountMarkerPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deletePositionAndReorder(deckId: number, positionId: number): void;
    deleteAll(): void;
    count(): number;
}