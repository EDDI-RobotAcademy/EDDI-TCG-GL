import {MyDeckBlockPosition} from "../entity/MyDeckBlockPosition";

export interface MyDeckBlockPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckBlockPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}