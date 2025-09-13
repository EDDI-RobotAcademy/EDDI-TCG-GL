import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeckCardAddButtonService} from "./DeckCardAddButtonService";

import {DeckCardAddButton} from "../entity/DeckCardAddButton";
import {DeckCardAddButtonPosition} from "../../deck_card_add_button_position/entity/DeckCardAddButtonPosition";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";

import {DeckCardAddButtonRepositoryImpl} from "../repository/DeckCardAddButtonRepositoryImpl";
import {DeckCardAddButtonPositionRepositoryImpl} from "../../deck_card_add_button_position/repository/DeckCardAddButtonPositionRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";

import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class DeckCardAddButtonServiceImpl implements DeckCardAddButtonService {
    private static instance: DeckCardAddButtonServiceImpl;
    private deckCardAddButtonRepository: DeckCardAddButtonRepositoryImpl;
    private deckCardAddButtonPositionRepository: DeckCardAddButtonPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(scene: THREE.Scene) {
        this.deckCardAddButtonRepository = DeckCardAddButtonRepositoryImpl.getInstance(scene);
        this.deckCardAddButtonPositionRepository = DeckCardAddButtonPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(scene: THREE.Scene): DeckCardAddButtonServiceImpl {
        if (!DeckCardAddButtonServiceImpl.instance) {
            DeckCardAddButtonServiceImpl.instance = new DeckCardAddButtonServiceImpl(scene);
        }
        return DeckCardAddButtonServiceImpl.instance;
    }

    public async createDeckCardAddButtonWithPosition(deckId: number, cardId: number): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const buttonId = this.getButtonIdByDeckIdAndCardId(deckId, cardId);
            if (buttonId == null) {
                const position = this.createDeckCardAddButtonPosition(deckId, cardId);
                console.log(`[Add Button] Card ID ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                const deckCardAddButton = await this.createDeckCardAddButton(deckId, cardId, position.position);
                buttonGroup.add(deckCardAddButton.getMesh());

            } else {
                const existingPosition = this.getPositionByButtonId(buttonId);
                const existingButtonMesh = this.getButtonMeshByDeckIdAndCardId(deckId, cardId);

                if (existingPosition && existingButtonMesh) {
                    const positionX = existingPosition.getX() * window.innerWidth;
                    const positionY = existingPosition.getY() * window.innerHeight;

                    existingButtonMesh.position.set(positionX, positionY, 0);
                    buttonGroup.add(existingButtonMesh);
                }
            }
        } catch (error) {
            console.error(`[Error] Failed to create Deck Card Add Button: ${error}`);
            return null;
        }
        return buttonGroup;
    }

    public adjustDeckCardAddButtonPosition(): void {
        const currentDeckButtonId = this.getCurrentClickDeckId();
        if (currentDeckButtonId === null) {
            console.error("No deck button clicked");
            return;
        }

        const deckIdList = this.getAllDeckIdList();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        for (const deckId of deckIdList) {
            const buttonIdList = this.getButtonIdListByDeckId(deckId);
            console.log(`[DEBUG] (adjust) Processing deckId: ${deckId}`);

            for (const buttonId of buttonIdList) {
                console.log(`[DEBUG] (adjust) Button ID: ${buttonId}`);
                const buttonMesh = this.getButtonByButtonId(buttonId);
                if (!buttonMesh) {
                    console.warn(`[WARN] Button Mesh with Button ID ${buttonId} not found`);
                    continue;
                }

                const initialPosition = this.getPositionByButtonId(buttonId);
                console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

                if (!initialPosition) {
                    console.error(`[DEBUG] (adjust) No position found for button id: ${buttonId}`);
                    continue;
                }

                const buttonWidth = 0.0295 * window.innerWidth;
                const buttonHeight = buttonWidth;

                const newPositionX = initialPosition.getX() * windowWidth;
                const newPositionY = initialPosition.getY() * windowHeight;
                console.log(`[DEBUG] (adjust) Deck Card Add Button ${buttonId}:`, {
                    initialPosition: initialPosition,
                    newPositionX,
                    newPositionY,
                });

                buttonMesh.geometry.dispose();
                buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
                buttonMesh.position.set(newPositionX, newPositionY, 0);

                const scrollArea = this.getScrollArea();
                if (scrollArea) {
                    scrollArea.width = 0.202 * windowWidth;
                    scrollArea.height = 0.61 * windowHeight;
                    scrollArea.position.set(0.38 * window.innerWidth, -0.024 * window.innerHeight);
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                    this.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
                }

            }
        }
    }

    private async createDeckCardAddButton(deckId: number, cardId: number, position: Vector2d): Promise<DeckCardAddButton> {
        return await this.deckCardAddButtonRepository.createDeckCardAddButton(deckId, cardId, position);
    }

    private createDeckCardAddButtonPosition(deckId: number, cardId: number): DeckCardAddButtonPosition {
        return this.deckCardAddButtonPositionRepository.addDeckCardAddButtonPosition(deckId, cardId);
    }

    private getButtonIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const buttonId = this.deckCardAddButtonRepository.findButtonIdByDeckIdAndCardId(deckId, cardId);
        if (buttonId == null) {
            console.warn(`[WARN] Deck Card Add Button(ID: ${buttonId}) not found`);
            return null;
        }
        return buttonId;
    }

    private getPositionByButtonId(buttonId: number): DeckCardAddButtonPosition | null {
        return this.deckCardAddButtonPositionRepository.findPositionByPositionId(buttonId);
    }

    private getButtonMeshByDeckIdAndCardId(deckId: number, cardId: number): THREE.Mesh | null {
        const button = this.deckCardAddButtonRepository.findButtonByDeckIdAndCardId(deckId, cardId);
        if (!button) {
            console.warn(`[WARN] Deck Card Add Button (with Deck ID: ${deckId}, Card ID: ${cardId}) not found`);
            return null;
        }
        return button.getMesh();
    }

    public getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

    public getAllDeckIdList(): number[] {
        return this.deckCardAddButtonRepository.findDeckIdList();
    }

    public getButtonIdListByDeckId(deckId: number): number[] {
        return this.deckCardAddButtonRepository.findButtonIdListByDeckId(deckId);
    }

    private getButtonByButtonId(buttonId: number): THREE.Mesh | null {
        const button = this.deckCardAddButtonRepository.findButtonByButtonId(buttonId);
        if (!button) {
            console.warn(`[WARN] Button with ID ${buttonId} not found`);
            return null;
        }
        const buttonMesh = button.getMesh();
        return buttonMesh;
    }

    public getButtonListByDeckId(deckId: number): DeckCardAddButton[] {
        const buttonList = this.deckCardAddButtonRepository.findButtonListByDeckId(deckId);
        if (!buttonList) {
            return [];
        }
        return buttonList;
    }

    public saveButtonGroup(deckId: number): void {
        this.deckCardAddButtonRepository.saveButtonGroupByDeckId(deckId);
    }

    public getButtonGroupByDeckId(deckId: number): THREE.Group {
        return this.deckCardAddButtonRepository.findButtonGroupByDeckId(deckId);
    }

    public resetButtonGroup(): void {
        this.deckCardAddButtonRepository.resetButtonGroup();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 2);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public applyClippingMaskToButton(): void {
        const deckIdList = this.getAllDeckIdList();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
            deckIdList.forEach((deckId) => {
                const buttonGroup = this.getButtonGroupByDeckId(deckId);
                buttonGroup.children.forEach((buttonObject) => {
                    if (buttonObject instanceof THREE.Mesh) {
                        this.applyClippingPlanesToMesh(buttonObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in buttonGroup:", buttonObject);
                    }
                });
            });
        }
    }

}
