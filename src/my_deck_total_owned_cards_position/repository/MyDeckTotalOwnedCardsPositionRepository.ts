import {MyDeckTotalOwnedCardsPosition} from "../entity/MyDeckTotalOwnedCardsPosition";

export interface MyDeckTotalOwnedCardsPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckTotalOwnedCardsPosition | null;
    findPositionIdList(): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}