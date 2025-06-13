import * as THREE from "three";
import {MyDeckBlock} from "../../my_deck_block/entity/MyDeckBlock";

export interface MyDeckBlockHoverDetectRepository {
    isBlockHover(hoverPoint: { x: number; y: number },
                 blockList: MyDeckBlock[],
                 camera: THREE.Camera): any | null;
}