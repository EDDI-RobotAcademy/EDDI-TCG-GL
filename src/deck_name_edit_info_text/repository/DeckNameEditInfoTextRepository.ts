import * as THREE from 'three';
import {DeckNameEditInfoText} from "../entity/DeckNameEditInfoText";
import {Vector2d} from "../../common/math/Vector2d";
import {DeckNameEditInfoTextType} from "../entity/DeckNameEditInfoTextType";

export interface DeckNameEditInfoTextRepository {
    createDeckNameEditInfoText(typeId: DeckNameEditInfoTextType, color: string, infoText: string, position: Vector2d): Promise<DeckNameEditInfoText>;
    findInfoTextById(uniqueId: number): DeckNameEditInfoText | null;
    findAllInfoText(): DeckNameEditInfoText[];
    deleteInfoTextById(uniqueId: number): void;
    deleteAllInfoText(): void;
}