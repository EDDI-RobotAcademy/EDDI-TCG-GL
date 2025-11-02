import * as THREE from "three";
import {CardFilterButton} from "../../card_filter_button/entity/CardFilterButton";

export interface CardFilterButtonClickDetectRepository {
    isButtonClicked(clickPoint: { x: number; y: number },
        button: CardFilterButton,
        camera: THREE.Camera): any | null;
}