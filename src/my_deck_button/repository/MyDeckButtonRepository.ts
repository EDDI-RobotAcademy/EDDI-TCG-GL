import * as THREE from 'three';
import {MyDeckButton} from "../entity/MyDeckButton";
import {MyDeckButtonType} from "../entity/MyDeckButtonType";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckButtonRepository {
    createMyDeckButton(deckId: number, position: Vector2d): Promise<MyDeckButton>;
    findById(buttonId: number): MyDeckButton | null;
    findAll(): MyDeckButton[];
    deleteById(id: number): void;
    deleteAll(): void;
}