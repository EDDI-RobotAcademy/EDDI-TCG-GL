import * as THREE from "three";
import {BuildDeckButton} from "../../build_deck_button/entity/BuildDeckButton";

export interface BuildDeckButtonHoverDetectRepository {
    isBuildDeckButtonHover(hoverPoint: { x: number; y: number },
        button: BuildDeckButton,
        camera: THREE.Camera): any | null;
}