import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface ButtonConfig {
    id: number;
    position: Vector2d;
}

export class GlobalNavigationBarConfigList {
    public buttonConfigs: ButtonConfig[] = [
        {
            id: 1,
            position: new Vector2d(-0.24, 0.4273)
        },
        {
            id: 2,
            position: new Vector2d(-0.14, 0.4273)
        },
         {
             id: 3,
             position: new Vector2d(-0.041, 0.4273)
         },
         {
             id: 4,
             position: new Vector2d(0.0535, 0.4273)
         },
         {
             id: 5,
             position: new Vector2d(0.15, 0.4273)
         },
         {
             id: 6,
             position: new Vector2d(0.244, 0.4273)
         }
    ];
}
