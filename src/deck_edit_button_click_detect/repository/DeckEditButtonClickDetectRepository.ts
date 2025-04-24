import * as THREE from "three";
import {DeckEditButton} from "../../deck_edit_button/entity/DeckEditButton";

export interface DeckEditButtonClickDetectRepository {
    isButtonClicked(clickPoint: { x: number; y: number },
        buttonList: DeckEditButton[],
        camera: THREE.Camera): DeckEditButton | null;
}