import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeckCardDeleteButtonService} from "./DeckCardDeleteButtonService";

import {DeckCardDeleteButton} from "../entity/DeckCardDeleteButton";
import {DeckCardDeleteButtonPosition} from "../../deck_card_delete_button_position/entity/DeckCardDeleteButtonPosition";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";

import {DeckCardDeleteButtonRepositoryImpl} from "../repository/DeckCardDeleteButtonRepositoryImpl";
import {DeckCardDeleteButtonPositionRepositoryImpl} from "../../deck_card_delete_button_position/repository/DeckCardDeleteButtonPositionRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";

import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class DeckCardDeleteButtonServiceImpl implements DeckCardDeleteButtonService {
    private static instance: DeckCardDeleteButtonServiceImpl;
    private deckCardDeleteButtonRepository: DeckCardDeleteButtonRepositoryImpl;
    private deckCardDeleteButtonPositionRepository: DeckCardDeleteButtonPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(scene: THREE.Scene) {
        this.deckCardDeleteButtonRepository = DeckCardDeleteButtonRepositoryImpl.getInstance(scene);
        this.deckCardDeleteButtonPositionRepository = DeckCardDeleteButtonPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(scene: THREE.Scene): DeckCardDeleteButtonServiceImpl {
        if (!DeckCardDeleteButtonServiceImpl.instance) {
            DeckCardDeleteButtonServiceImpl.instance = new DeckCardDeleteButtonServiceImpl(scene);
        }
        return DeckCardDeleteButtonServiceImpl.instance;
    }

    public async createDeckCardDeleteButtonWithPosition(deckId: number, cardId: number): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const buttonId = this.getButtonIdByDeckIdAndCardId(deckId, cardId);
            if (buttonId == null) {
                const position = this.createDeckCardDeleteButtonPosition(deckId, cardId);
                console.log(`[Block] Card ID ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                const deckCardDeleteButton = await this.createDeckCardDeleteButton(deckId, cardId, position.position);
                buttonGroup.add(deckCardDeleteButton.getMesh());

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
            console.error(`[Error] Failed to create Deck Card Delete Button: ${error}`);
            return null;
        }
        return buttonGroup;
    }

    public adjustDeckCardDeleteButtonPosition(): void {
        const currentDeckButtonId = this.getCurrentClickDeckButton();
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
                console.log(`[DEBUG] (adjust) Deck Card Delete Button ${buttonId}:`, {
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
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                    this.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
                }

            }
        }
    }

    private async createDeckCardDeleteButton(deckId: number, cardId: number, position: Vector2d): Promise<DeckCardDeleteButton> {
        return await this.deckCardDeleteButtonRepository.createDeckCardDeleteButton(deckId, cardId, position);
    }

    private createDeckCardDeleteButtonPosition(deckId: number, cardId: number): DeckCardDeleteButtonPosition {
        return this.deckCardDeleteButtonPositionRepository.addDeckCardDeleteButtonPosition(deckId, cardId);
    }

    private getButtonIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const buttonId = this.deckCardDeleteButtonRepository.findButtonIdByDeckIdAndCardId(deckId, cardId);
        if (!buttonId) {
            console.warn(`[WARN] Deck Card Delete Button(ID: ${buttonId}) not found`);
            return null;
        }
        return buttonId;
    }

    private getPositionByButtonId(buttonId: number): DeckCardDeleteButtonPosition | null {
        return this.deckCardDeleteButtonPositionRepository.findPositionByPositionId(buttonId);
    }

    private getButtonMeshByDeckIdAndCardId(deckId: number, cardId: number): THREE.Mesh | null {
        const button = this.deckCardDeleteButtonRepository.findButtonByDeckIdAndCardId(deckId, cardId);
        if (!button) {
            console.warn(`[WARN] Deck Card Delete Button (with Deck ID: ${deckId}, Card ID: ${cardId}) not found`);
            return null;
        }
        return button.getMesh();
    }

    public getCurrentClickDeckButton(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    public getAllDeckIdList(): number[] {
        return this.deckCardDeleteButtonRepository.findDeckIdList();
    }

    public getButtonIdListByDeckId(deckId: number): number[] {
        return this.deckCardDeleteButtonRepository.findButtonIdListByDeckId(deckId);
    }

    private getButtonByButtonId(buttonId: number): THREE.Mesh | null {
        const button = this.deckCardDeleteButtonRepository.findButtonByButtonUniqueId(buttonId);
        if (!button) {
            console.warn(`[WARN] Button with ID ${buttonId} not found`);
            return null;
        }
        const buttonMesh = button.getMesh();
        return buttonMesh;
    }

    public getButtonListByDeckId(deckId: number): DeckCardDeleteButton[] {
        const buttonList = this.deckCardDeleteButtonRepository.findButtonListByDeckId(deckId);
        if (!buttonList) {
            return [];
        }
        return buttonList;
    }

    public saveButtonGroup(deckId: number): void {
        this.deckCardDeleteButtonRepository.saveButtonGroupByDeckId(deckId);
    }

    public getButtonGroupByDeckId(deckId: number): THREE.Group {
        return this.deckCardDeleteButtonRepository.findButtonGroupByDeckId(deckId);
    }

    public resetButtonGroup(): void {
        this.deckCardDeleteButtonRepository.resetButtonGroup();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 2);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
