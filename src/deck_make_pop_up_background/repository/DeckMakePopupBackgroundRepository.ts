import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {DeckMakePopupBackground} from "../entity/DeckMakePopupBackground";

export interface DeckMakePopupBackgroundRepository {
    createDeckMakePopupBackground(): Promise<DeckMakePopupBackground>;
    findDeckMakePopupBackground(): DeckMakePopupBackground | null;
    deleteDeckMakePopupBackground(): void;
}