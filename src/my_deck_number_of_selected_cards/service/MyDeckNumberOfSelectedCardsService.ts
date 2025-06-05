import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckNumberOfSelectedCardsService {
    createMyDeckNumberOfSelectedCardsWithPosition(deckId: number, cardId: number, cardCount: number): Promise<THREE.Group | null>;
}