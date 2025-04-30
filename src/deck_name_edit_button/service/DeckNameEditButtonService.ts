import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckNameEditButtonService {
    createDeckNameEditButtonWithPosition(deckId: number): Promise<THREE.Group | null>;
}