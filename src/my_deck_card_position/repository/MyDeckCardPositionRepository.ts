import {MyDeckCardPosition} from "../entity/MyDeckCardPosition";

export interface MyDeckCardPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckCardPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deletePositionAndReorder(deckId: number, positionId: number): void;
    deleteAll(): void;
    count(): number;
}