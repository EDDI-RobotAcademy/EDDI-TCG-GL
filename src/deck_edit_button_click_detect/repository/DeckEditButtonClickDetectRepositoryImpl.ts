import * as THREE from "three";

import {DeckEditButtonClickDetectRepository} from "./DeckEditButtonClickDetectRepository";
import {DeckEditButton} from "../../deck_edit_button/entity/DeckEditButton";

export class DeckEditButtonClickDetectRepositoryImpl implements DeckEditButtonClickDetectRepository {
    private static instance: DeckEditButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private buttonClickState: boolean = false;
    private buttonClickEnabled: boolean = true;

    public static getInstance(): DeckEditButtonClickDetectRepositoryImpl {
        if (!DeckEditButtonClickDetectRepositoryImpl.instance) {
            DeckEditButtonClickDetectRepositoryImpl.instance = new DeckEditButtonClickDetectRepositoryImpl();
        }
        return DeckEditButtonClickDetectRepositoryImpl.instance;
    }

    public isDeckEditButtonClicked(clickPoint: { x: number; y: number },
        button: DeckEditButton,
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