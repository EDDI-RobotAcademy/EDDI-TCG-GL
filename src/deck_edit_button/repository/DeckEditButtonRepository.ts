import * as THREE from 'three';
import {DeckEditButton} from "../entity/DeckEditButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckEditButtonRepository {
    createDeckEditButton(type: number, position: Vector2d): Promise<DeckEditButton>;
    findButtonById(buttonUniqueId: number): DeckEditButton | null;
    deleteButtonById(buttonUniqueId: number): void;
}