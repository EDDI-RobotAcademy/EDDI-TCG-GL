import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeckEditButtonService} from "./DeckEditButtonService";
import {DeckEditButton} from "../entity/DeckEditButton";
import {DeckEditButtonRepositoryImpl} from "../repository/DeckEditButtonRepositoryImpl";

import {DeckEditButtonPositionRepositoryImpl} from "../../deck_edit_button_position/repository/DeckEditButtonPositionRepositoryImpl";
import {DeckEditButtonPosition} from "../../deck_edit_button_position/entity/DeckEditButtonPosition";

import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class DeckEditButtonServiceImpl implements DeckEditButtonService {
    private static instance: DeckEditButtonServiceImpl;
    private deckEditButtonRepository: DeckEditButtonRepositoryImpl;
    private deckEditButtonPositionRepository: DeckEditButtonPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.deckEditButtonPositionRepository = DeckEditButtonPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): DeckEditButtonServiceImpl {
        if (!DeckEditButtonServiceImpl.instance) {
            DeckEditButtonServiceImpl.instance = new DeckEditButtonServiceImpl();
        }
        return DeckEditButtonServiceImpl.instance;
    }

    public async createDeckEditButtonWithPosition(deckId: number): Promise<THREE.Group | null> {
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
                const position = this.deckEditButtonPosition(deckId);
                console.log(`[DEBUG] Add Deck Edit Button Deck ID ${deckId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                const button = await this.createDeckEditButton(deckId, position.position);
                buttonGroup.add(button.getMesh());
            }

        } catch (error) {
            console.error(`[Error] Failed to create Button: ${error}`);
            return null;
        }

        return buttonGroup;
    }

    public adjustDeckEditButtonPosition(): void {
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

            const buttonWidth = 0.047 * window.innerWidth;
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

    private async createDeckEditButton(deckId: number, position: Vector2d): Promise<DeckEditButton> {
        return await this.deckEditButtonRepository.createDeckEditButton(deckId, position);
    }

    private deckEditButtonPosition(deckId: number): DeckEditButtonPosition {
        return this.deckEditButtonPositionRepository.addDeckEditButtonPosition(deckId);
    }

    public getButtonMeshByDeckId(deckId: number): THREE.Mesh | null {
        const button = this.deckEditButtonRepository.findButtonByDeckId(deckId);
        if (!button) {
            console.warn(`[WARN] button (with Deck ID: ${deckId}) not found`);
            return null;
        }
        return button.getMesh();
    }

    private getPositionByDeckId(deckId: number): DeckEditButtonPosition | null {
        return this.deckEditButtonPositionRepository.findPositionByDeckId(deckId) || null;
    }

    private getPositionByPositionId(positionId: number): DeckEditButtonPosition | null {
        return this.deckEditButtonPositionRepository.findPositionByPositionId(positionId) || null;
    }

    private getDeckIdByButtonId(buttonId: number): number | null {
        return this.deckEditButtonRepository.findDeckIdByButtonUniqueId(buttonId) || null;
    }

    public getAllButton(): DeckEditButton[] {
        return this.deckEditButtonRepository.findAll();
    }

    public getButtonDeckIdList(): number[] {
        return this.deckEditButtonRepository.findButtonDeckIdList();
    }

    public getButtonGroup(): THREE.Group {
        return this.deckEditButtonRepository.findAllButtonGroups();
    }

    public resetButtonGroup(): void {
        this.deckEditButtonRepository.resetButtonGroups();
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

}
