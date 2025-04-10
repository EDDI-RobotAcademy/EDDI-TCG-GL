import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface ButtonConfig {
    id: number;
    position: Vector2d;
}

export class BuildDeckButtonConfigList {
    public buttonConfigs: ButtonConfig[] = [
        {
            id: 0,
            position: new Vector2d(- 0.3598, 0.23)
        },
        {
            id: 1,
            position: new Vector2d(- 0.3598, 0.23)
        },

    ];
}
