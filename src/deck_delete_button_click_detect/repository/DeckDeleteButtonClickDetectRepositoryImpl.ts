import * as THREE from "three";

import {DeckDeleteButtonClickDetectRepository} from "./DeckDeleteButtonClickDetectRepository";
import {DeckDeleteButton} from "../../deck_delete_button/entity/DeckDeleteButton";

export class DeckDeleteButtonClickDetectRepositoryImpl implements DeckDeleteButtonClickDetectRepository {
    private static instance: DeckDeleteButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickedButtonId: number | null = null;
    private buttonClickEnabledMap: Map<number, boolean> = new Map(); //deck Id: false or true

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

    public saveCurrentClickedButtonId(deckId: number): void {
        this.currentClickedButtonId = deckId;
    }

    public findCurrentClickedButtonId(): number | null {
        return this.currentClickedButtonId;
    }

    public resetCurrentClickedButtonId(): void {
        this.currentClickedButtonId = null;
    }

    public saveButtonClickEnabled(deckId: number, isEnabled: boolean): void {
        this.buttonClickEnabledMap.set(deckId, isEnabled);
    }

    public isButtonClickEnabled(deckId: number): boolean | undefined {
        return this.buttonClickEnabledMap.get(deckId);
    }

    public findEnabledButtonIds(): number[] {
        const enabledIds: number[] = [];
        for (const [deckId, isEnabled] of this.buttonClickEnabledMap.entries()) {
            if (isEnabled == true) {
                enabledIds.push(deckId);
            }
        }
        return enabledIds;
    }

}