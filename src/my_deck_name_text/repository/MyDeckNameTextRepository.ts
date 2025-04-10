import * as THREE from 'three';
import {MyDeckNameText} from "../entity/MyDeckNameText";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckNameTextRepository {
    createMyDeckNameText(deckId: number, deckName: string, position: Vector2d): Promise<MyDeckNameText>;
    findById(id: number): MyDeckNameText | null;
    findAll(): MyDeckNameText[];
    deleteById(id: number): void;
    deleteAll(): void;
}