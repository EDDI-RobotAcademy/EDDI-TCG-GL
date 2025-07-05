import * as THREE from "three";
import {DeckCardAddButton} from "../../deck_card_add_button/entity/DeckCardAddButton";

export interface DeckCardAddButtonClickDetectRepository {
    isButtonClicked(clickPoint: { x: number; y: number },
                    buttonList: DeckCardAddButton[],
                    camera: THREE.Camera): any | null;
}