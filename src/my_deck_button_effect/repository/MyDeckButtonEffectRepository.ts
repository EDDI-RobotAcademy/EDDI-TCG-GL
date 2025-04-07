import * as THREE from 'three';
import {MyDeckButtonEffect} from "../entity/MyDeckButtonEffect";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckButtonEffectRepository {
    createMyDeckButtonEffect(deckId: number, position: Vector2d): Promise<MyDeckButtonEffect>;
    findById(id: number): MyDeckButtonEffect | null;
    findAll(): MyDeckButtonEffect[];
    deleteById(id: number): void;
    deleteAll(): void;
}