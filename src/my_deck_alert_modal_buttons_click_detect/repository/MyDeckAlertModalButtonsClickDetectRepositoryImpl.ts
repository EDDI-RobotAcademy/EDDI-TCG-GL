import * as THREE from "three";

import {MyDeckAlertModalButtonsClickDetectRepository} from "./MyDeckAlertModalButtonsClickDetectRepository";
import {AlertModalButtons} from "../../alert_modal_buttons/entity/AlertModalButtons";
import {AlertModalButtonsType} from "../../alert_modal_buttons/entity/AlertModalButtonsType";

export class MyDeckAlertModalButtonsClickDetectRepositoryImpl implements MyDeckAlertModalButtonsClickDetectRepository {
    private static instance: MyDeckAlertModalButtonsClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickedButton: AlertModalButtons | null = null;
    private buttonClickEnabled: boolean = false;
    private buttonClickEnabledMap: Map<AlertModalButtonsType, boolean> = new Map();

    public static getInstance(): MyDeckAlertModalButtonsClickDetectRepositoryImpl {
        if (!MyDeckAlertModalButtonsClickDetectRepositoryImpl.instance) {
            MyDeckAlertModalButtonsClickDetectRepositoryImpl.instance = new MyDeckAlertModalButtonsClickDetectRepositoryImpl();
        }
        return MyDeckAlertModalButtonsClickDetectRepositoryImpl.instance;
    }

    public isAlertModalButtonsClicked(
        clickPoint: { x: number; y: number },
        buttonList: AlertModalButtons[],
        camera: THREE.Camera
    ): AlertModalButtons | null {
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
            const clickedButton = buttonList.find(button => button.getMesh() === intersectedMesh);

            if (clickedButton) {
                console.log('Detect clicked Alert Modal Buttons!')
                return clickedButton;
            }
        }

        return null;
    }

    public saveCurrentClickedButton(button: AlertModalButtons): void {
        this.currentClickedButton = button;
    }

    public getCurrentClickedButton(): AlertModalButtons | null {
        return this.currentClickedButton;
    }

    public resetCurrentClickedButton(): void {
        this.currentClickedButton = null;
    }

    public setAllButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isAllButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

    public setButtonClickEnabled(type: AlertModalButtonsType, isEnabled: boolean): void {
        this.buttonClickEnabledMap.set(type, isEnabled);
    }

    public isButtonClickEnabled(type: AlertModalButtonsType): boolean | undefined {
        return this.buttonClickEnabledMap.get(type);
    }

}