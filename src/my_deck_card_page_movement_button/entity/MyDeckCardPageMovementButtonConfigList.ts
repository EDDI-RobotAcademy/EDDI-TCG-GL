import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface ButtonConfig {
    id: number;
    position: Vector2d;
}

export class MyDeckCardPageMovementButtonConfigList {
    public buttonConfigs: ButtonConfig[] = [
        {
            id: 0,
            position: new Vector2d(-0.21, -0.045)
        },
        {
            id: 1,
            position: new Vector2d(0.476, -0.045)
        },
    ];
}
