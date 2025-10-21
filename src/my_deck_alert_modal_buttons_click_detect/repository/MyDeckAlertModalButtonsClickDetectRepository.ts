import {AlertModalButtons} from "../../alert_modal_buttons/entity/AlertModalButtons";

import * as THREE from "three";

export interface MyDeckAlertModalButtonsClickDetectRepository {
    isAlertModalButtonsClicked(clickPoint: { x: number; y: number },
        buttonList: AlertModalButtons[],
        camera: THREE.Camera): any | null;
}