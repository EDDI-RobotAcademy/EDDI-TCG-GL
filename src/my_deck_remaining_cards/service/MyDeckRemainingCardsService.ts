import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckRemainingCardsService {
    createMyDeckRemainingCardsWithPosition(cardId: number, cardCount: number): Promise<THREE.Group | null>;
}