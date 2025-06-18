import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {BlockAddButtonService} from "./BlockAddButtonService";
import {BlockAddButton} from "../entity/BlockAddButton";
import {BlockAddButtonRepositoryImpl} from "../repository/BlockAddButtonRepositoryImpl";

import {BlockAddButtonPositionRepositoryImpl} from "../../block_add_button_position/repository/BlockAddButtonPositionRepositoryImpl";
import {BlockAddButtonPosition} from "../../block_add_button_position/entity/BlockAddButtonPosition";
import {SelectedCardBlockPositionRepositoryImpl} from "../../selected_card_block_position/repository/SelectedCardBlockPositionRepositoryImpl";
import {SelectedCardBlockPosition} from "../../selected_card_block_position/entity/SelectedCardBlockPosition";

import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class BlockAddButtonServiceImpl implements BlockAddButtonService {
    private static instance: BlockAddButtonServiceImpl;
    private blockAddButtonRepository: BlockAddButtonRepositoryImpl;
    private blockAddButtonPositionRepository: BlockAddButtonPositionRepositoryImpl;
    private selectedCardBlockPositionRepository: SelectedCardBlockPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.blockAddButtonRepository = BlockAddButtonRepositoryImpl.getInstance();
        this.blockAddButtonPositionRepository = BlockAddButtonPositionRepositoryImpl.getInstance();
        this.selectedCardBlockPositionRepository = SelectedCardBlockPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): BlockAddButtonServiceImpl {
        if (!BlockAddButtonServiceImpl.instance) {
            BlockAddButtonServiceImpl.instance = new BlockAddButtonServiceImpl();
        }
        return BlockAddButtonServiceImpl.instance;
    }

    public async createBlockAddButtonWithPosition(cardId: number): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();

        try {
            const existingPosition = this.getPositionByCardId(cardId);
            const existingButtonMesh = this.getButtonMeshByCardId(cardId);

            if (existingPosition && existingButtonMesh) {
                const positionX = existingPosition.getX() * window.innerWidth;
                const positionY = existingPosition.getY() * window.innerHeight;

                existingButtonMesh.position.set(positionX, positionY, 0);
                buttonGroup.add(existingButtonMesh);
            } else {
                const position = this.blockAddButtonPosition(cardId);
                console.log(`[DEBUG] Add Button CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                const button = await this.createBlockAddButton(cardId, position.position);
                buttonGroup.add(button.getMesh());
            }
        } catch (error) {
            console.error(`[Error] Failed to create Button: ${error}`);
            return null;
        }
        return buttonGroup;
    }

    public adjustBlockAddButtonPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const cardIdList = this.getCardIdsFromButtons();
        for (const cardId of cardIdList) {
            const buttonMesh = this.getButtonMeshByCardId(cardId);
            if (!buttonMesh) {
                console.warn(`[WARN] Button Mesh with card ID ${cardId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByCardId(cardId);
            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No Button Position found for card id: ${cardId}`);
                continue;
            }
            console.log(`[DEBUG] (adjust) Button InitialPosition: ${initialPosition}`);

            const buttonWidth = 0.045 * window.innerWidth;
            const buttonHeight = 0.07 * window.innerHeight;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Button ${cardId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
            buttonMesh.position.set(newPositionX, newPositionY, 0);

            const sideScrollArea = this.getSideScrollArea();
            if (sideScrollArea) {
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
                this.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
            }
        }
    }

    private async createBlockAddButton(cardId: number, position: Vector2d): Promise<BlockAddButton> {
        return await this.blockAddButtonRepository.createBlockAddButton(cardId, position);
    }

    private blockAddButtonPosition(cardId: number): BlockAddButtonPosition {
        const positionY = this.getSelectedCardBlockPositionY(cardId);
        if (positionY !== null) {
            return this.blockAddButtonPositionRepository.addBlockAddButtonPosition(cardId, positionY);
        }
        throw new Error(`No valid position found for cardId: ${cardId}`);
    }

    private getSelectedCardBlockPositionY(clickedCardId: number): number | null {
        const blockPosition = this.selectedCardBlockPositionRepository.findPositionByCardId(clickedCardId);
        if(!blockPosition) {
            console.warn(`[WARN] block Position (ID: ${clickedCardId}) not found`);
            return null;
        }
        const positionY = blockPosition.getY();
        return positionY;
    }

    private getCardIdsFromButtons(): number[] {
        return this.blockAddButtonRepository.findCardIdList();
    }

    public getButtonMeshByCardId(cardId: number): THREE.Mesh | null {
        const button = this.blockAddButtonRepository.findButtonByCardId(cardId);
        if (!button) {
            console.warn(`[WARN] button (with card ID: ${cardId}) not found`);
            return null;
        }
        return button.getMesh();
    }

    private getPositionByCardId(cardId: number): BlockAddButtonPosition | null {
        return this.blockAddButtonPositionRepository.findPositionByCardId(cardId) || null;
    }

    public getAllButtonMesh(): BlockAddButton[] {
        return this.blockAddButtonRepository.findAllButtons();
    }

    public getButtonCardIdList(): number[] {
        return this.blockAddButtonRepository.findCardIdList();
    }

    public getButtonGroup(): THREE.Group {
        return this.blockAddButtonRepository.findButtonGroup();
    }

    public resetButtonGroup(): void {
        this.blockAddButtonRepository.resetButtonGroup();
    }

    private getSideScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(1, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
