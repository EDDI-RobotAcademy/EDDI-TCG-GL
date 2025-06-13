import {DeckCardDeleteButtonPosition} from "../entity/DeckCardDeleteButtonPosition";

export interface DeckCardDeleteButtonPositionRepository {
    findPositionByPositionId(positionId: number): DeckCardDeleteButtonPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}