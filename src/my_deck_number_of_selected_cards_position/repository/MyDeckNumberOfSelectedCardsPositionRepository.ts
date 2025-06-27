import {MyDeckNumberOfSelectedCardsPosition} from "../entity/MyDeckNumberOfSelectedCardsPosition";

export interface MyDeckNumberOfSelectedCardsPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckNumberOfSelectedCardsPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(deckId: number, positionId: number): void;
    deleteAll(): void;
    count(): number;
}