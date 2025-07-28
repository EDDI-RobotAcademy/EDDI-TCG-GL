import * as THREE from 'three';
import {MyDeckNumberOfSelectedCardsClone} from "../entity/MyDeckNumberOfSelectedCardsClone";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckNumberOfSelectedCardsCloneRepository {
    createClone(cardCount: number, position: Vector2d): Promise<MyDeckNumberOfSelectedCardsClone>;
    findCloneByCardId(cardId: number): MyDeckNumberOfSelectedCardsClone | null;
    deleteCloneByCardId(cardId: number): void;
    deleteAll(): void;
}