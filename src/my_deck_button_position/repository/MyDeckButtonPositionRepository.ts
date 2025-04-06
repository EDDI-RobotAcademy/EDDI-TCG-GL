import { MyDeckButtonPosition } from "../entity/MyDeckButtonPosition";

export interface MyDeckButtonPositionRepository {
    save(deckId: number, position: MyDeckButtonPosition): void;
    findById(positionId: number): MyDeckButtonPosition | undefined;
    findAll(): MyDeckButtonPosition[];
    findPositionByDeckId(deckId: number): MyDeckButtonPosition | null;
    deleteById(positionId: number): void;
    deleteAll(): void;
    count(): number;
}