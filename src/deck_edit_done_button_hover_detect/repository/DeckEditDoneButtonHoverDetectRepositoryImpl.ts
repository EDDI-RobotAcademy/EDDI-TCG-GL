import * as THREE from "three";

import {DeckEditDoneButtonHoverDetectRepository} from "./DeckEditDoneButtonHoverDetectRepository";
import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";

export class DeckEditDoneButtonHoverDetectRepositoryImpl implements DeckEditDoneButtonHoverDetectRepository {
    private static instance: DeckEditDoneButtonHoverDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private buttonHoverEnabled: boolean = false;

    public static getInstance(): DeckEditDoneButtonHoverDetectRepositoryImpl {
        if (!DeckEditDoneButtonHoverDetectRepositoryImpl.instance) {
            DeckEditDoneButtonHoverDetectRepositoryImpl.instance = new DeckEditDoneButtonHoverDetectRepositoryImpl();
        }
        return DeckEditDoneButtonHoverDetectRepositoryImpl.instance;
    }

    public isDeckEditDoneButtonHover(hoverPoint: { x: number; y: number }, button: DeckEditDoneButton, camera: THREE.Camera): any | null {
        const { x, y } = hoverPoint;
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

    public setButtonHoverEnabled(isEnable: boolean): void {
        this.buttonHoverEnabled = isEnable;
    }

    public isButtonHoverEnabled(): boolean {
        return this.buttonHoverEnabled;
    }

}