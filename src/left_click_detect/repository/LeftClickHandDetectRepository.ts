import {BattleFieldCardScene} from "../../battle/card/scene/entity/BattleFieldCardScene";
import * as THREE from "three";

export interface LeftClickHandDetectRepository {
    isYourHandAreaClicked(clickPoint: { x: number; y: number },
                          cardSceneList: BattleFieldCardScene[],
                          camera: THREE.Camera): any | null;
}