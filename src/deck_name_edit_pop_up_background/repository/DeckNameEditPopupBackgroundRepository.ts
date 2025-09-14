import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {DeckNameEditPopupBackground} from "../entity/DeckNameEditPopupBackground";

export interface DeckNameEditPopupBackgroundRepository {
    createPopupBackground(): Promise<DeckNameEditPopupBackground>;
    findPopupBackground(): DeckNameEditPopupBackground | null;
    deletePopupBackground(): void;
}