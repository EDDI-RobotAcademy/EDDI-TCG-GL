import * as THREE from 'three';
import {DeckDeleteButton} from "../entity/DeckDeleteButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckDeleteButtonRepository {
    createDeckDeleteButton(deckId: number, position: Vector2d): Promise<DeckDeleteButton>;
    findButtonByButtonUniqueId(buttonUniqueId: number): DeckDeleteButton | null;
    deleteButtonByButtonUniqueId(buttonUniqueId: number): void;
}