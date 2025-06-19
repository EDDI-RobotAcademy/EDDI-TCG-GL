import {DeckCardCountMarkerPosition} from "../entity/DeckCardCountMarkerPosition";

export interface DeckCardCountMarkerPositionRepository {
    findPositionByPositionId(positionId: number): DeckCardCountMarkerPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}