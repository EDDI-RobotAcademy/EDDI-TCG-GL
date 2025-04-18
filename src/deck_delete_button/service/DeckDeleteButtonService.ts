import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckDeleteButtonService {
    createDeckDeleteButtonWithPosition(deckId: number): Promise<THREE.Group | null>;
}