import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeckDeleteButtonService} from "./DeckDeleteButtonService";
import {DeckDeleteButton} from "../entity/DeckDeleteButton";
import {DeckDeleteButtonRepositoryImpl} from "../repository/DeckDeleteButtonRepositoryImpl";

import {DeckDeleteButtonPositionRepositoryImpl} from "../../deck_delete_button_position/repository/DeckDeleteButtonPositionRepositoryImpl";
import {DeckDeleteButtonPosition} from "../../deck_delete_button_position/entity/DeckDeleteButtonPosition";

import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class DeckDeleteButtonServiceImpl implements DeckDeleteButtonService {
    private static instance: DeckDeleteButtonServiceImpl;
    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private deckDeleteButtonPositionRepository: DeckDeleteButtonPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance();
        this.deckDeleteButtonPositionRepository = DeckDeleteButtonPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): DeckDeleteButtonServiceImpl {
        if (!DeckDeleteButtonServiceImpl.instance) {
            DeckDeleteButtonServiceImpl.instance = new DeckDeleteButtonServiceImpl();
        }
        return DeckDeleteButtonServiceImpl.instance;
    }

    public async createDeckDeleteButtonWithPosition(deckId: number): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();

        try {
            const existingPosition = this.getPositionByDeckId(deckId);
            const existingButtonMesh = this.getButtonMeshByDeckId(deckId);

            if (existingPosition && existingButtonMesh) {
                const positionX = existingPosition.getX() * window.innerWidth;
                const positionY = existingPosition.getY() * window.innerHeight;

                existingButtonMesh.position.set(positionX, positionY, 0);
                buttonGroup.add(existingButtonMesh);

            } else {
                const position = this.deckDeleteButtonPosition(deckId);
                console.log(`[DEBUG] Add Deck Delete Button Deck ID ${deckId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                const button = await this.createDeckDeleteButton(deckId, position.position);
                buttonGroup.add(button.getMesh());
            }

        } catch (error) {
            console.error(`[Error] Failed to create Deck Delete Button: ${error}`);
            return null;
        }

        return buttonGroup;
    }

    public adjustDeckDeleteButtonPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const allButton = this.getAllButton();
        for (const button of allButton) {
            const buttonMesh = button.getMesh();
            const buttonId = button.id;

            // 확인용 나중에 지워야 함
            const deckId = this.getDeckIdByButtonId(buttonId);
            if (!deckId) {
                console.error(`[DEBUG] (adjust) Not Found Deck ID: ${deckId}`);
                continue;
            }

            const initialPosition = this.getPositionByPositionId(buttonId);
            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No Button Position found for Deck ID: ${deckId}, Position ID: ${buttonId}`);
                continue;
            }
            console.log(`[DEBUG] (adjust) Button InitialPosition: ${initialPosition}`);

            const buttonWidth = 0.034 * window.innerWidth;
            const buttonHeight = buttonWidth * 0.9;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Button Deck ID: ${deckId}, Button ID: ${buttonId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
            buttonMesh.position.set(newPositionX, newPositionY, 0);

            const scrollArea = this.getScrollArea();
            if (scrollArea) {
                scrollArea.width = 0.24 * windowWidth;
                scrollArea.height = 0.61 * windowHeight;
                scrollArea.position.set(-0.36 * window.innerWidth, -0.1167 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                this.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
            }
        }
    }

    private async createDeckDeleteButton(deckId: number, position: Vector2d): Promise<DeckDeleteButton> {
        return await this.deckDeleteButtonRepository.createDeckDeleteButton(deckId, position);
    }

    private deckDeleteButtonPosition(deckId: number): DeckDeleteButtonPosition {
        return this.deckDeleteButtonPositionRepository.addDeckDeleteButtonPosition(deckId);
    }

    public getButtonMeshByDeckId(deckId: number): THREE.Mesh | null {
        const button = this.deckDeleteButtonRepository.findButtonByDeckId(deckId);
        if (!button) {
            console.warn(`[WARN] button (with Deck ID: ${deckId}) not found`);
            return null;
        }
        return button.getMesh();
    }

    private getPositionByDeckId(deckId: number): DeckDeleteButtonPosition | null {
        return this.deckDeleteButtonPositionRepository.findPositionByDeckId(deckId) || null;
    }

    private getPositionByPositionId(positionId: number): DeckDeleteButtonPosition | null {
        return this.deckDeleteButtonPositionRepository.findPositionByPositionId(positionId) || null;
    }

    private getDeckIdByButtonId(buttonId: number): number | null {
        return this.deckDeleteButtonRepository.findDeckIdByButtonUniqueId(buttonId) || null;
    }

    public getAllButton(): DeckDeleteButton[] {
        return this.deckDeleteButtonRepository.findAll();
    }

    public getButtonDeckIdList(): number[] {
        return this.deckDeleteButtonRepository.findButtonDeckIdList();
    }

    public getButtonGroup(): THREE.Group {
        return this.deckDeleteButtonRepository.findAllButtonGroups();
    }

    public resetButtonGroup(): void {
        this.deckDeleteButtonRepository.resetButtonGroups();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public initializeDeckDeleteButtonVisibility(): void {
        const deckIdList = this.getButtonDeckIdList();
        const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
        const firstDeckId = sortedDeckIdList[0];
        const button = this.deckDeleteButtonRepository.findButtonByDeckId(firstDeckId);

        if (button !== null) {
            button.setVisibility(true);
        }
    }

    public applyClippingMaskToDeckDeleteButtons(): void {
        const buttonGroup = this.getButtonGroup();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
            buttonGroup.children.forEach((buttonObject) => {
                if (buttonObject instanceof THREE.Mesh) {
                    this.applyClippingPlanesToMesh(buttonObject, clippingPlanes);
                } else {
                    console.warn("[WARN] Skipping non-mesh object in buttonGroup:", buttonObject);
                }
            });
        }
    }

}
