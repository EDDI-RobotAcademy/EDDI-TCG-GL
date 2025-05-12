import * as THREE from "three";
import {DeckEditButton} from "../../deck_edit_button/entity/DeckEditButton";

export interface DeckEditButtonClickDetectRepository {
    isDeckEditButtonClicked(clickPoint: { x: number; y: number },
        button: DeckEditButton,
        camera: THREE.Camera): any | null;
}