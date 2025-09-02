import * as THREE from "three";
import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";

export interface DeckEditDoneButtonClickDetectRepository {
    isDeckEditDoneButtonClicked(clickPoint: { x: number; y: number },
        button: DeckEditDoneButton,
        camera: THREE.Camera): any | null;
}