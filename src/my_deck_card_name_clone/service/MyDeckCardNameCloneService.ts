import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckCardNameCloneService {
    createCloneWithPosition(deckId: number, cardId: number): Promise<void>;
}