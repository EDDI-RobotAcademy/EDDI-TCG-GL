import * as THREE from "three";

import {MyDeckButtonClickDetectRepository} from "./MyDeckButtonClickDetectRepository";
import {MyDeckButton} from "../../my_deck_button/entity/MyDeckButton";

export class MyDeckButtonClickDetectRepositoryImpl implements MyDeckButtonClickDetectRepository {
    private static instance: MyDeckButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickDeckButtonId: number | null = null;
    private buttonClickEnabled: boolean = true;
    private buttonClickStateMap: Map<number, boolean> = new Map();

    public static getInstance(): MyDeckButtonClickDetectRepositoryImpl {
        if (!MyDeckButtonClickDetectRepositoryImpl.instance) {
            MyDeckButtonClickDetectRepositoryImpl.instance = new MyDeckButtonClickDetectRepositoryImpl();
        }
        return MyDeckButtonClickDetectRepositoryImpl.instance;
    }

    isMyDeckButtonClicked(clickPoint: { x: number; y: number },
                          deckButtonList: MyDeckButton[],
                          camera: THREE.Camera): any | null {
        const { x, y } = clickPoint;

        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const meshes = deckButtonList.map(deckButton => deckButton.getMesh());
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const clickedDeckButton = deckButtonList.find(
                deckButton => deckButton.getMesh() === intersectedMesh
            );

            if (clickedDeckButton) {
                console.log('detect clicked deck Button!')
                return clickedDeckButton;
            }
        }

        return null;
    }

    public saveCurrentClickDeckButtonId(id: number): void {
        this.currentClickDeckButtonId = id;
    }

    public getCurrentClickDeckButtonId(): number | null {
        return this.currentClickDeckButtonId;
    }

    public resetCurrentClickDeckButtonId(): void {
        this.currentClickDeckButtonId = null;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

    public saveButtonClickState(deckId: number, state: boolean): void {
        this.buttonClickStateMap.set(deckId, state);
    }

    public getButtonClickState(deckId: number): boolean | undefined {
        return this.buttonClickStateMap.get(deckId);
    }

}