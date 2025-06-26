import {DeckCardDeleteButtonPosition} from "../entity/DeckCardDeleteButtonPosition";

export interface DeckCardDeleteButtonPositionRepository {
    findPositionByPositionId(positionId: number): DeckCardDeleteButtonPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(deckId: number, positionId: number): void;
    deleteAll(): void;
    count(): number;
}