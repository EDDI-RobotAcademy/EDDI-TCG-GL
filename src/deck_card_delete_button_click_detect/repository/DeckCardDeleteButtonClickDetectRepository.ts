import {DeckCardDeleteButton} from "../../deck_card_delete_button/entity/DeckCardDeleteButton";
import * as THREE from "three";

export interface DeckCardDeleteButtonClickDetectRepository {
    isButtonClicked(clickPoint: { x: number; y: number },
                    buttonList: DeckCardDeleteButton[],
                    camera: THREE.Camera): any | null;
}