import * as THREE from 'three';
import {DeckEditButton} from "../entity/DeckEditButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckEditButtonRepository {
    createDeckEditButton(deckId: number, position: Vector2d): Promise<DeckEditButton>;
    findButtonByButtonUniqueId(buttonUniqueId: number): DeckEditButton | null;
    deleteButtonByButtonUniqueId(buttonUniqueId: number): void;
}