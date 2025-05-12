import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface ButtonConfig {
    id: number;
    position: Vector2d;
}

export class DeckEditButtonConfigList {
    public buttonConfigs: ButtonConfig[] = [
        {
            id: 1,
            position: new Vector2d(0.3805, - 0.403)
        },
        {
            id: 2,
            position: new Vector2d(0.3805, - 0.403)
        },

    ];
}
