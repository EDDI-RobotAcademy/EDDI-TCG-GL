import {DeckNameEditPopupButtons} from "../../deck_name_edit_pop_up_buttons/entity/DeckNameEditPopupButtons";

import * as THREE from "three";

export interface DeckNameEditPopupButtonsClickDetectRepository {
    isDeckNameEditPopupButtonsClicked(clickPoint: { x: number; y: number },
                          deckNameEditPopupButtonsList: DeckNameEditPopupButtons[],
                          camera: THREE.Camera): any | null;
}