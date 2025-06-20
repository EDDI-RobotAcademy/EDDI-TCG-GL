import * as THREE from "three";

import {DeckCardDeleteButtonClickDetectRepository} from "./DeckCardDeleteButtonClickDetectRepository";
import {DeckCardDeleteButton} from "../../deck_card_delete_button/entity/DeckCardDeleteButton";

export class DeckCardDeleteButtonClickDetectRepositoryImpl implements DeckCardDeleteButtonClickDetectRepository {
    private static instance: DeckCardDeleteButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickedButtonId: number | null = null;
    private buttonClickEnabled: boolean = false;

    public static getInstance(): DeckCardDeleteButtonClickDetectRepositoryImpl {
        if (!DeckCardDeleteButtonClickDetectRepositoryImpl.instance) {
            DeckCardDeleteButtonClickDetectRepositoryImpl.instance = new DeckCardDeleteButtonClickDetectRepositoryImpl();
        }
        return DeckCardDeleteButtonClickDetectRepositoryImpl.instance;
    }

    public isButtonClicked(clickPoint: { x: number; y: number }, buttonList: DeckCardDeleteButton[], camera: THREE.Camera): any | null {
        const { x, y } = clickPoint;
        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const meshes = buttonList.map(button => button.getMesh());
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const clickedButton = buttonList.find(
                button => button.getMesh() === intersectedMesh
            );

            if (clickedButton) {
                return clickedButton;
            }
        }
        return null;
    }

    public saveCurrentClickedButtonId(id: number): void {
        this.currentClickedButtonId = id;
    }

    public getCurrentClickedButtonId(): number | null {
        return this.currentClickedButtonId;
    }

    public resetCurrentClickButtonId(): void {
        this.currentClickedButtonId = null;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

}