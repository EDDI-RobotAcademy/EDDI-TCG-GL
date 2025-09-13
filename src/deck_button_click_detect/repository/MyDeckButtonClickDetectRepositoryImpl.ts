import * as THREE from "three";

import {MyDeckButtonClickDetectRepository} from "./MyDeckButtonClickDetectRepository";
import {MyDeckButton} from "../../my_deck_button/entity/MyDeckButton";

export class MyDeckButtonClickDetectRepositoryImpl implements MyDeckButtonClickDetectRepository {
    private static instance: MyDeckButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickDeckId: number | null = null; // deck ID 저장
    private currentClickDeckButtonId: number | null = null; // deck Button Id 저장
    private allButtonClickEnabled: boolean = true;
    private buttonClickStateMap: Map<number, boolean> = new Map(); // 클릭 상태 관리 key 값이 deckID가 아니라 "deck Button ID"

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

            const prevClickedDeckButtonId = this.getCurrentClickDeckButtonId();
            if (prevClickedDeckButtonId !== null) {
                console.log(`%c [버튼 클릭 이벤트 아직 미실행] 이전에 클릭한 덱 버튼의 ID: ${prevClickedDeckButtonId}`, 'color: #ff5733; font-weight: bold;');
            }

            if (clickedDeckButton) {
                console.log('%c [버튼 클릭 이벤트 아직 미실행] detect clicked deck Button!', 'color: #ff5733; font-weight: bold;')

                const buttonClickState = this.getButtonClickState(clickedDeckButton.id);
                console.log(`%c [버튼 클릭 이벤트 아직 미실행] 현재 감지된 덱 버튼의 ID: ${clickedDeckButton.id}, 버튼의 클릭 상태: ${buttonClickState}`, 'color: #ff5733; font-weight: bold;');

                if (prevClickedDeckButtonId !== null && prevClickedDeckButtonId !== clickedDeckButton.id) {
                    this.saveButtonClickState(prevClickedDeckButtonId, false);
                }

                if (buttonClickState == true) return null;

                this.saveButtonClickState(clickedDeckButton.id, true);
                this.saveCurrentClickDeckButtonId(clickedDeckButton.id);

                return clickedDeckButton;
            }
        }

        return null;
    }

    public saveCurrentClickDeckId(id: number): void {
        this.currentClickDeckId = id;
    }

    public getCurrentClickDeckId(): number | null {
        return this.currentClickDeckId;
    }

    public resetCurrentClickDeckId(): void {
        this.currentClickDeckId = null;
    }

    public saveCurrentClickDeckButtonId(deckButtonId: number): void {
        this.currentClickDeckButtonId = deckButtonId;
    }

    public getCurrentClickDeckButtonId(): number | null {
        return this.currentClickDeckButtonId;
    }

    // 모든 덱 버튼 한 번에 제어
    public setAllButtonClickEnabled(isEnabled: boolean): void {
        this.allButtonClickEnabled = isEnabled;
    }

    public isAllButtonClickEnabled(): boolean {
        return this.allButtonClickEnabled;
    }

    public saveButtonClickState(deckButtonId: number, state: boolean): void {
        this.buttonClickStateMap.set(deckButtonId, state);
    }

    public getButtonClickState(deckButtonId: number): boolean | undefined {
        return this.buttonClickStateMap.get(deckButtonId);
    }

}