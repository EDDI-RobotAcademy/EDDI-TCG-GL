import {MyDeckNumberOfSelectedCardsClonePosition} from "../entity/MyDeckNumberOfSelectedCardsClonePosition";

export interface MyDeckNumberOfSelectedCardsClonePositionRepository {
    findPositionByCardId(cardId: number): MyDeckNumberOfSelectedCardsClonePosition | null;
    deleteByCardId(cardId: number): void;
    deleteAll(): void;
    count(): number;
}