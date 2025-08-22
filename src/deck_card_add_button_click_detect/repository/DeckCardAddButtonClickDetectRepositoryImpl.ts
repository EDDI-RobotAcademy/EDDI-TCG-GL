import * as THREE from "three";

import {DeckCardAddButtonClickDetectRepository} from "./DeckCardAddButtonClickDetectRepository";
import {DeckCardAddButton} from "../../deck_card_add_button/entity/DeckCardAddButton";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class DeckCardAddButtonClickDetectRepositoryImpl implements DeckCardAddButtonClickDetectRepository {
    private static instance: DeckCardAddButtonClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private currentClickedButtonId: number | null = null;
    private buttonClickEnabled: boolean = false;

    private constructor() {
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): DeckCardAddButtonClickDetectRepositoryImpl {
        if (!DeckCardAddButtonClickDetectRepositoryImpl.instance) {
            DeckCardAddButtonClickDetectRepositoryImpl.instance = new DeckCardAddButtonClickDetectRepositoryImpl();
        }
        return DeckCardAddButtonClickDetectRepositoryImpl.instance;
    }

    public isButtonClicked(clickPoint: { x: number; y: number }, buttonList: DeckCardAddButton[], camera: THREE.Camera): any | null {
        const { x, y } = clickPoint;
        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const meshes = buttonList.map(button => button.getMesh());
        const scrollArea = this.getScrollArea();

        if (scrollArea == null) return null;

        scrollArea.width = 0.202 * window.innerWidth;
        scrollArea.height = 0.61 * window.innerHeight;
        scrollArea.position.set(0.38 * window.innerWidth, -0.024 * window.innerHeight);

        const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
        const candidateMeshes = meshes.filter(buttonMesh =>
            this.clippingMaskManager.isMeshVisible(buttonMesh, clippingPlanes)
        );

        if (candidateMeshes.length === 0) return null;

        const intersects = this.raycaster.intersectObjects(candidateMeshes, false);
        if (intersects.length === 0) {
            return null;
        }

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const clickedButton = buttonList.find(
                button => button.getMesh() === intersectedMesh
            );

            if (clickedButton) {
                return clickedButton;
            }
        }
        return null;
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 2);
    }

    public saveCurrentClickedButtonId(id: number): void {
        this.currentClickedButtonId = id;
    }

    public getCurrentClickedButtonId(): number | null {
        return this.currentClickedButtonId;
    }

    public resetCurrentClickButtonId(): void {
        this.currentClickedButtonId = null;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

}