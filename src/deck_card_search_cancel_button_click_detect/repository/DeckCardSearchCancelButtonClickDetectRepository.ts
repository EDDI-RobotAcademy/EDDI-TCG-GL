import * as THREE from "three";
import {MyDeckCardSearchCancelButton} from "../../my_deck_card_search_cancel_button/entity/MyDeckCardSearchCancelButton";

export interface DeckCardSearchCancelButtonClickDetectRepository {
    isButtonClicked(clickPoint: { x: number; y: number },
        button: MyDeckCardSearchCancelButton,
        camera: THREE.Camera): any | null;
}