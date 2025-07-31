import {MyDeckBlockClonePosition} from "../entity/MyDeckBlockClonePosition";

export interface MyDeckBlockClonePositionRepository {
    findPositionByCardId(cardId: number): MyDeckBlockClonePosition | null;
    deleteByCardId(cardId: number): void;
    deleteAll(): void;
    count(): number;
}