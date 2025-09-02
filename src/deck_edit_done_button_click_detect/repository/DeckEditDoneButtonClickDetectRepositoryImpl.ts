import * as THREE from "three";

import {DeckEditDoneButtonClickDetectRepository} from "./DeckEditDoneButtonClickDetectRepository";
import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";

export class DeckEditDoneButtonClickDetectRepositoryImpl implements DeckEditDoneButtonClickDetectRepository {
    private static instance: DeckEditDoneButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private buttonClickState: boolean = false;
    private buttonClickEnabled: boolean = false;

    public static getInstance(): DeckEditDoneButtonClickDetectRepositoryImpl {
        if (!DeckEditDoneButtonClickDetectRepositoryImpl.instance) {
            DeckEditDoneButtonClickDetectRepositoryImpl.instance = new DeckEditDoneButtonClickDetectRepositoryImpl();
        }
        return DeckEditDoneButtonClickDetectRepositoryImpl.instance;
    }

    public isDeckEditDoneButtonClicked(clickPoint: { x: number; y: number },
        button: DeckEditDoneButton,
        camera: THREE.Camera): any | null {
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

    public saveCurrentButtonClickState(state: boolean): void {
        this.buttonClickState = state;
    }

    public getCurrentButtonClickState(): boolean | null {
        return this.buttonClickState;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

}