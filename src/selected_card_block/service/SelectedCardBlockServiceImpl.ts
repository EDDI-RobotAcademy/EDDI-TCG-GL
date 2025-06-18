import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {SelectedCardBlockService} from "./SelectedCardBlockService";
import {SelectedCardBlock} from "../../selected_card_block/entity/SelectedCardBlock";
import {SelectedCardBlockRepositoryImpl} from "../../selected_card_block/repository/SelectedCardBlockRepositoryImpl";
import {SelectedCardBlockPosition} from "../../selected_card_block_position/entity/SelectedCardBlockPosition";
import {SelectedCardBlockPositionRepositoryImpl} from "../../selected_card_block_position/repository/SelectedCardBlockPositionRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class SelectedCardBlockServiceImpl implements SelectedCardBlockService {
    private static instance: SelectedCardBlockServiceImpl;
    private selectedCardBlockRepository: SelectedCardBlockRepositoryImpl;
    private selectedCardBlockPositionRepository: SelectedCardBlockPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.selectedCardBlockRepository = SelectedCardBlockRepositoryImpl.getInstance();
        this.selectedCardBlockPositionRepository = SelectedCardBlockPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): SelectedCardBlockServiceImpl {
        if (!SelectedCardBlockServiceImpl.instance) {
            SelectedCardBlockServiceImpl.instance = new SelectedCardBlockServiceImpl();
        }
        return SelectedCardBlockServiceImpl.instance;
    }

    public async createSelectedCardBlockWithPosition(cardId: number): Promise<THREE.Group | null> {
        const cardGroup = new THREE.Group();

        try {
            // 덱에서 카드 삭제 후 위치 조정하면 기존 mesh position 다시 저장해야 함.
            const existingPosition = this.getPositionByCardId(cardId);
            const existingBlockMesh = this.getBlockMeshByCardId(cardId);

            if (existingPosition && existingBlockMesh) {
                const positionX = existingPosition.getX() * window.innerWidth;
                const positionY = existingPosition.getY() * window.innerHeight;

                existingBlockMesh.position.set(positionX, positionY, 0);
                cardGroup.add(existingBlockMesh);
            } else {
                const newPosition = this.makeSelectedCardBlockPosition(cardId);
                console.log(`[DEBUG] Block Position X=${newPosition.position.getX()}, Y=${newPosition.position.getY()}`);

                const selectedCardBlock = await this.createSelectedCardBlock(cardId, newPosition.position);
                cardGroup.add(selectedCardBlock.getMesh());
            }
//             const newPosition = this.makeSelectedCardBlockPosition(cardId);
//             console.log(`[DEBUG] Block Position X=${newPosition.position.getX()}, Y=${newPosition.position.getY()}`);
//
//             const selectedCardBlock = await this.createSelectedCardBlock(cardId, newPosition.position);
//             cardGroup.add(selectedCardBlock.getMesh());

        } catch (error) {
            console.error(`[Error] Failed to create MyDeckCardScene: ${error}`);
            return null;
        }
        return cardGroup;
    }

    public adjustSelectedCardBlockPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const blockIdList = this.getAllBlockIdList();
        for (const blockId of blockIdList) {
            const blockMesh = this.getBlockMeshByBlockId(blockId);
            if (!blockMesh) {
                console.warn(`[WARN] Block Mesh with block ID ${blockId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByBlockId(blockId);
            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found for block id: ${blockId}`);
                continue;
            }
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            const blockWidth = 0.235 * window.innerWidth;
            const blockHeight = 0.145 * window.innerHeight;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Block ${blockId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            blockMesh.geometry.dispose();
            blockMesh.geometry = new THREE.PlaneGeometry(blockWidth, blockHeight);
            blockMesh.position.set(newPositionX, newPositionY, 0);

            const sideScrollArea = this.getSideScrollArea();
            if (sideScrollArea) {
                sideScrollArea.width = 0.255 * windowWidth;
                sideScrollArea.height = 0.735 * windowHeight;
                sideScrollArea.position.set(0.3895 * window.innerWidth, 0.04 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
                this.applyClippingPlanesToMesh(blockMesh, clippingPlanes);
            }
        }
    }

    private async createSelectedCardBlock(cardId: number, position: Vector2d): Promise<SelectedCardBlock> {
        return await this.selectedCardBlockRepository.createSelectedCardBlock(cardId, position);
    }

    private makeSelectedCardBlockPosition(cardId: number): SelectedCardBlockPosition {
        return this.selectedCardBlockPositionRepository.addSelectedCardBlockPosition(cardId);
    }

    public getBlockMeshByBlockId(blockId: number): THREE.Mesh | null {
        const block = this.selectedCardBlockRepository.findBlockByBlockId(blockId);
        if (!block) {
            console.warn(`[WARN] Block (ID: ${blockId}) not found`);
            return null;
        }
        const blockMesh = block.getMesh();
        return blockMesh;
    }

    public getBlockMeshByCardId(cardId: number): THREE.Mesh | null {
        const block = this.selectedCardBlockRepository.findBlockByCardId(cardId);
        if (!block) {
            console.warn(`[WARN] Block (ID: ${cardId}) not found`);
            return null;
        }
        return block.getMesh();
    }

    public getAllBlockIdList(): number[] {
        return this.selectedCardBlockRepository.findBlockIdList();
    }

    public getPositionByBlockId(blockId: number): SelectedCardBlockPosition | undefined {
        return this.selectedCardBlockPositionRepository.findPositionById(blockId);
    }

    public getAllBlockCardId(): number[] {
        return this.selectedCardBlockRepository.findBlockCardIdList();
    }

    public getAllBlockMesh(): SelectedCardBlock[] {
        return this.selectedCardBlockRepository.findAllBlocks();
    }

    private getPositionByCardId(cardId: number): SelectedCardBlockPosition | null {
        return this.selectedCardBlockPositionRepository.findPositionByCardId(cardId);
    }

    public getAllBlockGroups(): THREE.Group {
        return this.selectedCardBlockRepository.findAllBlockGroups();
    }

    public resetBlockGroups(): void {
        this.selectedCardBlockRepository.resetBlockGroups();
    }

    private getSideScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(1, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
