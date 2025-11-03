import * as THREE from "three";

import {CardFilterButtonClickDetectRepository} from "./CardFilterButtonClickDetectRepository";
import {CardFilterButton} from "../../card_filter_button/entity/CardFilterButton";

export class CardFilterButtonClickDetectRepositoryImpl implements CardFilterButtonClickDetectRepository {
    private static instance: CardFilterButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private buttonClickEnabled: boolean = true;
    private buttonClickState: boolean = false;
    private outsideClickDetected: boolean = false; // 버튼 이외의 다른 영역 클릭

    public static getInstance(): CardFilterButtonClickDetectRepositoryImpl {
        if (!CardFilterButtonClickDetectRepositoryImpl.instance) {
            CardFilterButtonClickDetectRepositoryImpl.instance = new CardFilterButtonClickDetectRepositoryImpl();
        }
        return CardFilterButtonClickDetectRepositoryImpl.instance;
    }

    public isButtonClicked(clickPoint: { x: number; y: number }, button: CardFilterButton, camera: THREE.Camera
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

    public setButtonClickState(isClicked: boolean): void {
        this.buttonClickState = isClicked;
    }

    public findButtonClickState(): boolean {
        return this.buttonClickState;
    }

    public setOutsideButtonClickDetected(isDetected: boolean): void {
        this.outsideClickDetected = isDetected;
    }

    public isOutsideButtonClickDetected(): boolean {
        return this.outsideClickDetected;
    }

}