import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface ButtonConfig {
    id: number;
    position: Vector2d;
}

export class DeckNameEditPopupButtonsConfigList {
    public buttonConfigs: ButtonConfig[] = [
        {
            id: 0,
            position: new Vector2d(-126 / 1920, -128 / 1080)
        },
        {
            id: 1,
            position: new Vector2d(126 / 1920, -128 / 1080)
        },
    ];
}
