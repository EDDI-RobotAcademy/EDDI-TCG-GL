import * as THREE from "three";

import {BuildDeckButtonHoverDetectRepository} from "./BuildDeckButtonHoverDetectRepository";
import {BuildDeckButton} from "../../build_deck_button/entity/BuildDeckButton";

export class BuildDeckButtonHoverDetectRepositoryImpl implements BuildDeckButtonHoverDetectRepository {
    private static instance: BuildDeckButtonHoverDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentHoverButtonId: number | null = null;
    private buttonHoverEnabled: boolean = true;

    public static getInstance(): BuildDeckButtonHoverDetectRepositoryImpl {
        if (!BuildDeckButtonHoverDetectRepositoryImpl.instance) {
            BuildDeckButtonHoverDetectRepositoryImpl.instance = new BuildDeckButtonHoverDetectRepositoryImpl();
        }
        return BuildDeckButtonHoverDetectRepositoryImpl.instance;
    }

    public isBuildDeckButtonHover(hoverPoint: { x: number; y: number }, button: BuildDeckButton, camera: THREE.Camera): any | null {
        const { x, y } = hoverPoint;
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

    public setButtonHoverEnabled(isEnable: boolean): void {
        this.buttonHoverEnabled = isEnable;
    }

    public isButtonHoverEnabled(): boolean {
        return this.buttonHoverEnabled;
    }

}