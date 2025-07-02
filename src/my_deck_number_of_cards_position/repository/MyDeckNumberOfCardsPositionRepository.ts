import {MyDeckNumberOfCardsPosition} from "../entity/MyDeckNumberOfCardsPosition";

export interface MyDeckNumberOfCardsPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckNumberOfCardsPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deletePositionAndReorder(deckId: number, positionId: number): void;
    deleteAll(): void;
    count(): number;
}