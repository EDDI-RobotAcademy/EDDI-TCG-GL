import * as THREE from "three";

import {BuildDeckButtonClickDetectRepository} from "./BuildDeckButtonClickDetectRepository";
import {BuildDeckButton} from "../../build_deck_button/entity/BuildDeckButton";

export class BuildDeckButtonClickDetectRepositoryImpl implements BuildDeckButtonClickDetectRepository {
    private static instance: BuildDeckButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private buttonClickEnabled: boolean = true;

    public static getInstance(): BuildDeckButtonClickDetectRepositoryImpl {
        if (!BuildDeckButtonClickDetectRepositoryImpl.instance) {
            BuildDeckButtonClickDetectRepositoryImpl.instance = new BuildDeckButtonClickDetectRepositoryImpl();
        }
        return BuildDeckButtonClickDetectRepositoryImpl.instance;
    }

    public isBuildDeckButtonClicked(clickPoint: { x: number; y: number }, button: BuildDeckButton, camera: THREE.Camera
    ): any | null {
        const { x, y } = clickPoint;
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

    public setButtonClickEnabled(isEnable: boolean): void {
        this.buttonClickEnabled = isEnable;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

}