import * as THREE from "three";

import {DeckNameEditPopupButtonsClickDetectRepository} from "./DeckNameEditPopupButtonsClickDetectRepository";
import {DeckNameEditPopupButtons} from "../../deck_name_edit_pop_up_buttons/entity/DeckNameEditPopupButtons";

export class DeckNameEditPopupButtonsClickDetectRepositoryImpl implements DeckNameEditPopupButtonsClickDetectRepository {
    private static instance: DeckNameEditPopupButtonsClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private buttonClickEnabled: boolean = false;

    public static getInstance(): DeckNameEditPopupButtonsClickDetectRepositoryImpl {
        if (!DeckNameEditPopupButtonsClickDetectRepositoryImpl.instance) {
            DeckNameEditPopupButtonsClickDetectRepositoryImpl.instance = new DeckNameEditPopupButtonsClickDetectRepositoryImpl();
        }
        return DeckNameEditPopupButtonsClickDetectRepositoryImpl.instance;
    }

    public isDeckNameEditPopupButtonsClicked(clickPoint: { x: number; y: number },
                          deckNameEditPopupButtonsList: DeckNameEditPopupButtons[],
                          camera: THREE.Camera): any | null {
        const { x, y } = clickPoint;

        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const meshes = deckNameEditPopupButtonsList.map(deckNameEditPopupButton => deckNameEditPopupButton.getMesh());
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const clickedDeckNameEditPopupButton = deckNameEditPopupButtonsList.find(
                deckNameEditPopupButton => deckNameEditPopupButton.getMesh() === intersectedMesh
            );

            if (clickedDeckNameEditPopupButton) {
                console.log('Detect clicked Deck Name Edit Popup Button!')
                return clickedDeckNameEditPopupButton;
            }
        }

        return null;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

}