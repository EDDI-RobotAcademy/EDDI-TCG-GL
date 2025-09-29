import * as THREE from "three";

import {DeleteDeckPopupButtonClickDetectRepository} from "./DeleteDeckPopupButtonClickDetectRepository";
import {DeleteDeckPopupButton} from "../../delete_deck_popup_button/entity/DeleteDeckPopupButton";
import {DeleteDeckPopupButtonType} from "../../delete_deck_popup_button/entity/DeleteDeckPopupButtonType";

export class DeleteDeckPopupButtonClickDetectRepositoryImpl implements DeleteDeckPopupButtonClickDetectRepository {
    private static instance: DeleteDeckPopupButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickedButtonId: number | null = null;
    private buttonClickEnabled: boolean = false;
    private currentClickedButtonType: number | null = null;

    public static getInstance(): DeleteDeckPopupButtonClickDetectRepositoryImpl {
        if (!DeleteDeckPopupButtonClickDetectRepositoryImpl.instance) {
            DeleteDeckPopupButtonClickDetectRepositoryImpl.instance = new DeleteDeckPopupButtonClickDetectRepositoryImpl();
        }
        return DeleteDeckPopupButtonClickDetectRepositoryImpl.instance;
    }

    public isButtonClicked(clickPoint: { x: number; y: number },
                    buttonList: DeleteDeckPopupButton[],
                    camera: THREE.Camera): any | null {
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
                console.log('Detect clicked Delete Deck Popup Button!')
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

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

    public saveCurrentClickedButtonType(type: DeleteDeckPopupButtonType): void {
        this.currentClickedButtonType = type;
    }

    public findCurrentClickedButtonType(): number | null {
        return this.currentClickedButtonType;
    }

}