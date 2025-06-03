import {MyDeckRemainingCardsPosition} from "../entity/MyDeckRemainingCardsPosition";

export interface MyDeckRemainingCardsPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckRemainingCardsPosition | null;
    findPositionIdList(): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}