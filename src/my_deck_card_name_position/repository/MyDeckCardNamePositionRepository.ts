import {MyDeckCardNamePosition} from "../entity/MyDeckCardNamePosition";

export interface MyDeckCardNamePositionRepository {
    findPositionByPositionId(positionId: number): MyDeckCardNamePosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(positionId: number): void;
    deleteAll(): void;
    count(): number;
}