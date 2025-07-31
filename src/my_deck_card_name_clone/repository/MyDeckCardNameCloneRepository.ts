import * as THREE from 'three';
import {MyDeckCardNameClone} from "../entity/MyDeckCardNameClone";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckCardNameCloneRepository {
    createClone(cardId: number, position: Vector2d): Promise<MyDeckCardNameClone>;
    findCloneByCardId(cardId: number): MyDeckCardNameClone | null;
    deleteCloneByCardId(cardId: number): void;
    deleteAll(): void;
}