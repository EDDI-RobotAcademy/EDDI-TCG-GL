import {MyDeckBlockPosition} from "../entity/MyDeckBlockPosition";

export interface MyDeckBlockPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckBlockPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(deckId: number, positionId: number): void;
    deleteAll(): void;
    count(): number;
}