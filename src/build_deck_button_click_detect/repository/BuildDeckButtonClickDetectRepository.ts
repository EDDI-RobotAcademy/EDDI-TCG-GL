import * as THREE from "three";
import {BuildDeckButton} from "../../build_deck_button/entity/BuildDeckButton";

export interface BuildDeckButtonClickDetectRepository {
    isBuildDeckButtonClicked(clickPoint: { x: number; y: number },
        button: BuildDeckButton,
        camera: THREE.Camera): any | null;
}