import * as THREE from "three";

import {DeckDeleteButtonClickDetectRepository} from "./DeckDeleteButtonClickDetectRepository";
import {DeckDeleteButton} from "../../deck_delete_button/entity/DeckDeleteButton";

export class DeckDeleteButtonClickDetectRepositoryImpl implements DeckDeleteButtonClickDetectRepository {
    private static instance: DeckDeleteButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();
    private currentClickedButtonId: number | null = null;

    public static getInstance(): DeckDeleteButtonClickDetectRepositoryImpl {
        if (!DeckDeleteButtonClickDetectRepositoryImpl.instance) {
            DeckDeleteButtonClickDetectRepositoryImpl.instance = new DeckDeleteButtonClickDetectRepositoryImpl();
        }
        return DeckDeleteButtonClickDetectRepositoryImpl.instance;
    }

    public isButtonClicked(clickPoint: { x: number; y: number }, buttonList: DeckDeleteButton[], camera: THREE.Camera): DeckDeleteButton | null {
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
                console.log('Detect Clicked Deck Delete Button!')
                return clickedButton;
            }
        }
        return null;
    }

    public saveCurrentClickedButtonId(id: number): void {
        this.currentClickedButtonId = id;
    }

    public findCurrentClickedButtonId(): number | null {
        return this.currentClickedButtonId;
    }

    public resetCurrentClickedButtonId(): void {
        this.currentClickedButtonId = null;
    }

}