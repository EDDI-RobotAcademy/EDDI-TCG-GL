import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckNumberOfCardsService {
    createMyDeckNumberOfCardsWithPosition(deckId: number, cardId: number, cardCount: number): Promise<THREE.Group | null>;
}