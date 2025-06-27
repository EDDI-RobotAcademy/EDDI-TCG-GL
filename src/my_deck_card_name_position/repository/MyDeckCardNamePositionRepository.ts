import {MyDeckCardNamePosition} from "../entity/MyDeckCardNamePosition";

export interface MyDeckCardNamePositionRepository {
    findPositionByPositionId(positionId: number): MyDeckCardNamePosition | null;
    findPositionIdListByDeckId(deckId: number): number[];
    deleteById(deckId: number, positionId: number): void;
    deleteAll(): void;
    count(): number;
}