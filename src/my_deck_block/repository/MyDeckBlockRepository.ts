import * as THREE from 'three';
import {MyDeckBlock} from "../entity/MyDeckBlock";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckBlockRepository {
    createMyDeckBlock(deckId: number, cardId: number, position: Vector2d): Promise<MyDeckBlock>;
    findBlockByBlockUniqueId(blockUniqueId: number): MyDeckBlock | null;
    findBlockListByDeckId(deckId: number): MyDeckBlock[] | null;
    deleteBlock(deckId: number, blockId: number): void;
    deleteAllBlock(): void;
}