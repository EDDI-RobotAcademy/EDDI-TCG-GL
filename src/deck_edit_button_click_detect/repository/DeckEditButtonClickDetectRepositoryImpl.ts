import * as THREE from "three";

import {DeckEditButtonClickDetectRepository} from "./DeckEditButtonClickDetectRepository";
import {DeckEditButton} from "../../deck_edit_button/entity/DeckEditButton";

export class DeckEditButtonClickDetectRepositoryImpl implements DeckEditButtonClickDetectRepository {
    private static instance: DeckEditButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();
    private currentClickedButtonId: number | null = null;

    public static getInstance(): DeckEditButtonClickDetectRepositoryImpl {
        if (!DeckEditButtonClickDetectRepositoryImpl.instance) {
            DeckEditButtonClickDetectRepositoryImpl.instance = new DeckEditButtonClickDetectRepositoryImpl();
        }
        return DeckEditButtonClickDetectRepositoryImpl.instance;
    }

    public isButtonClicked(clickPoint: { x: number; y: number }, buttonList: DeckEditButton[], camera: THREE.Camera): DeckEditButton | null {
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
                console.log('Detect Clicked Deck Edit Button!')
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