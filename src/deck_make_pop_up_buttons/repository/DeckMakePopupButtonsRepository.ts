import * as THREE from 'three';
import {DeckMakePopupButtons} from "../entity/DeckMakePopupButtons";
import {DeckMakePopupButtonsType} from "../entity/DeckMakePopupButtonsType";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckMakePopupButtonsRepository {
    createDeckMakePopupButtons(type: DeckMakePopupButtonsType, position: Vector2d): Promise<DeckMakePopupButtons>;
    getAllDeckMakePopupButtons(): Map<number, DeckMakePopupButtons>;
    findById(id: number): DeckMakePopupButtons | null;
    findAll(): DeckMakePopupButtons[];
    deleteById(id: number): void;
    deleteAll(): void;
    findAllButtonIds(): number[];
}