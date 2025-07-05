import * as THREE from "three";

import {DeckCardAddButtonClickDetectRepository} from "./DeckCardAddButtonClickDetectRepository";
import {DeckCardAddButton} from "../../deck_card_add_button/entity/DeckCardAddButton";

export class DeckCardAddButtonClickDetectRepositoryImpl implements DeckCardAddButtonClickDetectRepository {
    private static instance: DeckCardAddButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickedButtonId: number | null = null;
    private buttonClickEnabled: boolean = false;

    public static getInstance(): DeckCardAddButtonClickDetectRepositoryImpl {
        if (!DeckCardAddButtonClickDetectRepositoryImpl.instance) {
            DeckCardAddButtonClickDetectRepositoryImpl.instance = new DeckCardAddButtonClickDetectRepositoryImpl();
        }
        return DeckCardAddButtonClickDetectRepositoryImpl.instance;
    }

    public isButtonClicked(clickPoint: { x: number; y: number }, buttonList: DeckCardAddButton[], camera: THREE.Camera): any | null {
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