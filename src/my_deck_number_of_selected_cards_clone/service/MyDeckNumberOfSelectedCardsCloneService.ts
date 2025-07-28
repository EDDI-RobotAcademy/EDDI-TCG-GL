import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckNumberOfSelectedCardsCloneService {
    createCloneWithPosition(deckId: number, cardId: number, cardCount: number): Promise<void>;
}