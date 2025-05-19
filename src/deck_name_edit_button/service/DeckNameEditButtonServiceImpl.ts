import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeckNameEditButtonService} from "./DeckNameEditButtonService";
import {DeckNameEditButton} from "../entity/DeckNameEditButton";
import {DeckNameEditButtonRepositoryImpl} from "../repository/DeckNameEditButtonRepositoryImpl";

import {DeckNameEditButtonPositionRepositoryImpl} from "../../deck_name_edit_button_position/repository/DeckNameEditButtonPositionRepositoryImpl";
import {DeckNameEditButtonPosition} from "../../deck_name_edit_button_position/entity/DeckNameEditButtonPosition";

import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class DeckNameEditButtonServiceImpl implements DeckNameEditButtonService {
    private static instance: DeckNameEditButtonServiceImpl;
    private deckNameEditButtonRepository: DeckNameEditButtonRepositoryImpl;
    private deckNameEditButtonPositionRepository: DeckNameEditButtonPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance();
        this.deckNameEditButtonPositionRepository = DeckNameEditButtonPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): DeckNameEditButtonServiceImpl {
        if (!DeckNameEditButtonServiceImpl.instance) {
            DeckNameEditButtonServiceImpl.instance = new DeckNameEditButtonServiceImpl();
        }
        return DeckNameEditButtonServiceImpl.instance;
    }

    public async createDeckNameEditButtonWithPosition(deckId: number): Promise<THREE.Group | null> {
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
                const position = this.deckNameEditButtonPosition(deckId);
                console.log(`[DEBUG] Add Deck Name Edit Button Deck ID ${deckId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                const button = await this.createDeckNameEditButton(deckId, position.position);
                buttonGroup.add(button.getMesh());
            }

        } catch (error) {
            console.error(`[Error] Failed to create Button: ${error}`);
            return null;
        }

        return buttonGroup;
    }

    public adjustDeckNameEditButtonPosition(): void {
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
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
                this.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
            }
        }
    }

    private async createDeckNameEditButton(deckId: number, position: Vector2d): Promise<DeckNameEditButton> {
        return await this.deckNameEditButtonRepository.createDeckNameEditButton(deckId, position);
    }

    private deckNameEditButtonPosition(deckId: number): DeckNameEditButtonPosition {
        return this.deckNameEditButtonPositionRepository.addDeckNameEditButtonPosition(deckId);
    }

    public getButtonMeshByDeckId(deckId: number): THREE.Mesh | null {
        const button = this.deckNameEditButtonRepository.findButtonByDeckId(deckId);
        if (!button) {
            console.warn(`[WARN] button (with Deck ID: ${deckId}) not found`);
            return null;
        }
        return button.getMesh();
    }

    private getPositionByDeckId(deckId: number): DeckNameEditButtonPosition | null {
        return this.deckNameEditButtonPositionRepository.findPositionByDeckId(deckId) || null;
    }

    private getPositionByPositionId(positionId: number): DeckNameEditButtonPosition | null {
        return this.deckNameEditButtonPositionRepository.findPositionByPositionId(positionId) || null;
    }

    private getDeckIdByButtonId(buttonId: number): number | null {
        return this.deckNameEditButtonRepository.findDeckIdByButtonUniqueId(buttonId) || null;
    }

    public getAllButton(): DeckNameEditButton[] {
        return this.deckNameEditButtonRepository.findAll();
    }

    public getButtonDeckIdList(): number[] {
        return this.deckNameEditButtonRepository.findButtonDeckIdList();
    }

    public getButtonGroup(): THREE.Group {
        return this.deckNameEditButtonRepository.findAllButtonGroups();
    }

    public resetButtonGroup(): void {
        this.deckNameEditButtonRepository.resetButtonGroups();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 0);
    }

    private getClippingPlanes(id: number): THREE.Plane[] {
        return this.clippingMaskManager.getClippingPlanes(id);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public initializeDeckNameEditButtonVisibility(): void {
        const deckIdList = this.getButtonDeckIdList();
        const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
        const firstDeckId = sortedDeckIdList[0];
        const button = this.deckNameEditButtonRepository.findButtonByDeckId(firstDeckId);

        if (button !== null) {
            button.setVisibility(true);
        }
    }

}
