import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckCardDeleteButtonService {
    createDeckCardDeleteButtonWithPosition(deckId: number, cardId: number): Promise<THREE.Group | null>;
}