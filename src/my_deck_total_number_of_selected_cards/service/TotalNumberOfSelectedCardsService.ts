import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface TotalNumberOfSelectedCardsService {
    createTotalNumberOfSelectedCards(deckId: number, count: number): Promise<THREE.Group | null>;
}