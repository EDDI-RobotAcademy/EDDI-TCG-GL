import * as THREE from 'three';
import {DeckCardAddButton} from "../entity/DeckCardAddButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckCardAddButtonRepository {
    createDeckCardAddButton(deckId: number, cardId: number, position: Vector2d): Promise<DeckCardAddButton>;
    findButtonByButtonId(buttonId: number): DeckCardAddButton | null;
    findButtonListByDeckId(deckId: number): DeckCardAddButton[] | null;
    deleteButtonByDeckIdAndButtonId(deckId: number, buttonId: number): void;
    deleteAllButton(): void;
}