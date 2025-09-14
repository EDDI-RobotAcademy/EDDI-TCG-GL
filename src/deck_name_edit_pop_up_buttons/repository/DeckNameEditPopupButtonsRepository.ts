import * as THREE from 'three';
import {DeckNameEditPopupButtons} from "../entity/DeckNameEditPopupButtons";
import {DeckNameEditPopupButtonsType} from "../entity/DeckNameEditPopupButtonsType";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckNameEditPopupButtonsRepository {
    createPopupButtons(type: DeckNameEditPopupButtonsType, position: Vector2d): Promise<DeckNameEditPopupButtons>;
    findButtonById(id: number): DeckNameEditPopupButtons | null;
    findAllButtons(): DeckNameEditPopupButtons[];
    deleteButtonById(id: number): void;
    deleteAllButtons(): void;
    findAllButtonIds(): number[];
}