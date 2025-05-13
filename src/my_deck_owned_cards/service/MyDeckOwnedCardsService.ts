import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckOwnedCardsService {
    createMyDeckOwnedCardsWithPosition(cardIdToCountMap: Map<number, number>): Promise<THREE.Group | null>;
}