import * as THREE from 'three';
import {DeckCardDeleteButton} from "../entity/DeckCardDeleteButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckCardDeleteButtonRepository {
    createDeckCardDeleteButton(deckId: number, cardId: number, position: Vector2d): Promise<DeckCardDeleteButton>;
    findButtonByButtonUniqueId(buttonUniqueId: number): DeckCardDeleteButton | null;
    findButtonListByDeckId(deckId: number): DeckCardDeleteButton[] | null;
    deleteButtonByDeckIdAndButtonId(deckId: number, buttonUniqueId: number): void;
    deleteAllButton(): void;
}