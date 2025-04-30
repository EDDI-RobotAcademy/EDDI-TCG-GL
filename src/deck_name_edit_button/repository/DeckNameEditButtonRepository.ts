import * as THREE from 'three';
import {DeckNameEditButton} from "../entity/DeckNameEditButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckNameEditButtonRepository {
    createDeckNameEditButton(deckId: number, position: Vector2d): Promise<DeckNameEditButton>;
    findButtonByButtonUniqueId(buttonUniqueId: number): DeckNameEditButton | null;
    deleteButtonByButtonUniqueId(buttonUniqueId: number): void;
}