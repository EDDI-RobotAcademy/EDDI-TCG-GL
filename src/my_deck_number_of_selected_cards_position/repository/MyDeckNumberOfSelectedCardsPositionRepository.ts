import {MyDeckNumberOfSelectedCardsPosition} from "../entity/MyDeckNumberOfSelectedCardsPosition";

export interface MyDeckNumberOfSelectedCardsPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckNumberOfSelectedCardsPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}