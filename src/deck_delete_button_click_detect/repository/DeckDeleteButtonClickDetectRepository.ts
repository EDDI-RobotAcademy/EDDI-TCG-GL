import * as THREE from "three";
import {DeckDeleteButton} from "../../deck_delete_button/entity/DeckDeleteButton";

export interface DeckDeleteButtonClickDetectRepository {
    isButtonClicked(clickPoint: { x: number; y: number },
        buttonList: DeckDeleteButton[],
        camera: THREE.Camera): DeckDeleteButton | null;
}