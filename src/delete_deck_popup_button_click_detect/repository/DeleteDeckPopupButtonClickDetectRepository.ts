import {DeleteDeckPopupButton} from "../../delete_deck_popup_button/entity/DeleteDeckPopupButton";

import * as THREE from "three";

export interface DeleteDeckPopupButtonClickDetectRepository {
    isButtonClicked(clickPoint: { x: number; y: number },
        buttonList: DeleteDeckPopupButton[],
        camera: THREE.Camera): any | null;
    }