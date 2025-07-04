import {DeckCardAddButtonPosition} from "../entity/DeckCardAddButtonPosition";

export interface DeckCardAddButtonPositionRepository {
    findPositionByPositionId(positionId: number): DeckCardAddButtonPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(deckId: number, positionId: number): void;
    deleteAll(): void;
    count(): number;
}