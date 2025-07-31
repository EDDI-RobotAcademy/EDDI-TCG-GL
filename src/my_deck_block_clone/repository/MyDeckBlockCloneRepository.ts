import * as THREE from 'three';
import {MyDeckBlockClone} from "../entity/MyDeckBlockClone";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckBlockCloneRepository {
    createClone(cardId: number, position: Vector2d): Promise<MyDeckBlockClone>;
    findCloneByCardId(cardId: number): MyDeckBlockClone | null;
    deleteCloneByCardId(cardId: number): void;
    deleteAll(): void;
}