import * as THREE from 'three';
import {SideScrollAreaType} from "./SideScrollAreaType";

export interface ScrollAreaConfig {
    type: SideScrollAreaType;
    id: number;
    name: string;
    width: number;
    height: number;
    position: THREE.Vector2;
}

export class SideScrollAreaConfigList {
    public myDeckScrollAreaConfigs: ScrollAreaConfig[] = [
        {
            type: 3,
            id: 0,
            name: 'myDeckButtonScrollArea',
            width: 0.203,
            height: 0.46,
            position: new THREE.Vector2(-0.381, -0.035)
        },
        {
            type: 3,
            id: 1,
            name: 'myDeckCardScrollArea',
            width: 0.54,
            height: 0.745,
            position: new THREE.Vector2(0, -0.125)
        },
         {
             type: 3,
             id: 2,
             name: 'myDeckBlockScrollArea',
             width: 0.202,
             height: 0.61,
             position: new THREE.Vector2(0.38, -0.024)
         },
    ];
}
