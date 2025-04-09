import {MyDeckCardPosition} from "../entity/MyDeckCardPosition";

export interface MyDeckCardPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckCardPosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}