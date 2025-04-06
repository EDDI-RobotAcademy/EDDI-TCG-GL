import {MyDeckNameTextPosition} from "../entity/MyDeckNameTextPosition";

export interface MyDeckNameTextPositionRepository {
    save(deckId: number, position: MyDeckNameTextPosition): void;
    findById(positionId: number): MyDeckNameTextPosition | undefined;
    findAll(): MyDeckNameTextPosition[];
    deleteById(positionId: number): void;
    deleteAll(): void;
    count(): number;
}