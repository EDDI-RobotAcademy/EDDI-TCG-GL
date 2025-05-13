import {MyDeckOwnedCardsPosition} from "../entity/MyDeckOwnedCardsPosition";

export interface MyDeckOwnedCardsPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckOwnedCardsPosition | null;
    findPositionIdList(): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}