import * as THREE from 'three';
import {CardSelectionBlocker} from "../entity/CardSelectionBlocker";
import {Vector2d} from "../../common/math/Vector2d";

export interface CardSelectionBlockerRepository {
    createCardSelectionBlocker(cardId: number, position: Vector2d): Promise<CardSelectionBlocker>;
    findBlockerByBlockerId(blockerId: number): CardSelectionBlocker | null;
    findAllBlockers(): CardSelectionBlocker[];
}