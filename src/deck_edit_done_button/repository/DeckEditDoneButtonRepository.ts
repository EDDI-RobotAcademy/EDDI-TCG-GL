import * as THREE from 'three';
import {DeckEditDoneButton} from "../entity/DeckEditDoneButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckEditDoneButtonRepository {
    createDeckEditDoneButton(deckId: number, position: Vector2d): Promise<DeckEditDoneButton>;
    findButtonById(buttonUniqueId: number): DeckEditDoneButton | null;
    deleteButtonById(buttonUniqueId: number): void;
}