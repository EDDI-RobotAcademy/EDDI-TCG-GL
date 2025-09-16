import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeckNameEditInfoText} from "../entity/DeckNameEditInfoText";
import {DeckNameEditInfoTextType} from "../entity/DeckNameEditInfoTextType";

export interface DeckNameEditInfoTextService {
    createDeckNameEditInfoText(
        typeId: DeckNameEditInfoTextType,
        color: string,
        infoText: string,
        position: Vector2d
    ): Promise<THREE.Group | null>;
    getAllDeckNameEditInfoText(): DeckNameEditInfoText[];
}