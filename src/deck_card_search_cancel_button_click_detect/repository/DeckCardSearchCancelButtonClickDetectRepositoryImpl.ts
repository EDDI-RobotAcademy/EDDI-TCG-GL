import * as THREE from "three";

import {DeckCardSearchCancelButtonClickDetectRepository} from "./DeckCardSearchCancelButtonClickDetectRepository";
import {MyDeckCardSearchCancelButton} from "../../my_deck_card_search_cancel_button/entity/MyDeckCardSearchCancelButton";

export class DeckCardSearchCancelButtonClickDetectRepositoryImpl implements DeckCardSearchCancelButtonClickDetectRepository {
    private static instance: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private buttonClickEnabled: boolean = false;

    public static getInstance(): DeckCardSearchCancelButtonClickDetectRepositoryImpl {
        if (!DeckCardSearchCancelButtonClickDetectRepositoryImpl.instance) {
            DeckCardSearchCancelButtonClickDetectRepositoryImpl.instance = new DeckCardSearchCancelButtonClickDetectRepositoryImpl();
        }
        return DeckCardSearchCancelButtonClickDetectRepositoryImpl.instance;
    }

    public isButtonClicked(clickPoint: { x: number; y: number }, button: MyDeckCardSearchCancelButton, camera: THREE.Camera
    ): any | null {
        const { x, y } = clickPoint;
        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const mesh = button.getMesh();
        const intersects = this.raycaster.intersectObject(mesh);

        if (intersects.length > 0) {
            return button;

        } else {
            return null;
        }

    }

    public setButtonClickEnabled(isEnable: boolean): void {
        this.buttonClickEnabled = isEnable;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

}