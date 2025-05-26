import {MyDeckNumberOfCardsPosition} from "../entity/MyDeckNumberOfCardsPosition";

export interface MyDeckNumberOfCardsPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckNumberOfCardsPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}