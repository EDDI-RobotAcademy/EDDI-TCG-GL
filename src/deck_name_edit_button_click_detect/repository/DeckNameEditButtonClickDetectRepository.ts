import * as THREE from "three";
import {DeckNameEditButton} from "../../deck_name_edit_button/entity/DeckNameEditButton";

export interface DeckNameEditButtonClickDetectRepository {
    isButtonClicked(clickPoint: { x: number; y: number },
        buttonList: DeckNameEditButton[],
        camera: THREE.Camera): DeckNameEditButton | null;
}