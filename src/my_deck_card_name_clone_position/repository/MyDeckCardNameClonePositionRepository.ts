import {MyDeckCardNameClonePosition} from "../entity/MyDeckCardNameClonePosition";

export interface MyDeckCardNameClonePositionRepository {
    findPositionByCardId(cardId: number): MyDeckCardNameClonePosition | null;
    deleteByCardId(cardId: number): void;
    deleteAll(): void;
    count(): number;
}