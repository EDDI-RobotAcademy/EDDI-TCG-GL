import * as THREE from "three";

import {DeckNameEditButtonClickDetectRepository} from "./DeckNameEditButtonClickDetectRepository";
import {DeckNameEditButton} from "../../deck_name_edit_button/entity/DeckNameEditButton";

export class DeckNameEditButtonClickDetectRepositoryImpl implements DeckNameEditButtonClickDetectRepository {
    private static instance: DeckNameEditButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();
    private currentClickedButtonId: number | null = null;

    public static getInstance(): DeckNameEditButtonClickDetectRepositoryImpl {
        if (!DeckNameEditButtonClickDetectRepositoryImpl.instance) {
            DeckNameEditButtonClickDetectRepositoryImpl.instance = new DeckNameEditButtonClickDetectRepositoryImpl();
        }
        return DeckNameEditButtonClickDetectRepositoryImpl.instance;
    }

    public isButtonClicked(clickPoint: { x: number; y: number }, buttonList: DeckNameEditButton[], camera: THREE.Camera): DeckNameEditButton | null {
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
                console.log('Detect Clicked Deck Name Edit Button!')
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