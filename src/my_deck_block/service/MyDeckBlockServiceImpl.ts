import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckBlockService} from "./MyDeckBlockService";
import {MyDeckBlock} from "../../my_deck_block/entity/MyDeckBlock";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckBlockPositionRepositoryImpl} from "../../my_deck_block_position/repository/MyDeckBlockPositionRepositoryImpl";
import {MyDeckBlockPosition} from "../../my_deck_block_position/entity/MyDeckBlockPosition";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckBlockServiceImpl implements MyDeckBlockService {
    private static instance: MyDeckBlockServiceImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckBlockPositionRepository: MyDeckBlockPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(scene: THREE.Scene) {
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckBlockPositionRepository = MyDeckBlockPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(scene: THREE.Scene): MyDeckBlockServiceImpl {
        if (!MyDeckBlockServiceImpl.instance) {
            MyDeckBlockServiceImpl.instance = new MyDeckBlockServiceImpl(scene);
        }
        return MyDeckBlockServiceImpl.instance;
    }

    public async createMyDeckBlockWithPosition(deckId: number, cardId: number): Promise<THREE.Group | null> {
        const blockGroup = new THREE.Group();
        try {
            const blockId = this.getBlockIdByDeckIdAndCardId(deckId, cardId);
            if (blockId == null){
                const position = this.createMyDeckBlockPosition(deckId, cardId);
                console.log(`[Block] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                const myDeckBlock = await this.createMyDeckBlock(deckId, cardId, position.position);
                blockGroup.add(myDeckBlock.getMesh());

            } else {
                const existingPosition = this.getPositionByBlockUniqueId(blockId);
                const existingBlockMesh = this.getBlockMeshByDeckIdAndCardId(deckId, cardId);

                if (existingPosition && existingBlockMesh) {
                    const positionX = existingPosition.getX() * window.innerWidth;
                    const positionY = existingPosition.getY() * window.innerHeight;

                    existingBlockMesh.position.set(positionX, positionY, 0);
                    blockGroup.add(existingBlockMesh);
                }
            }

        } catch (error) {
            console.error(`[Error] Failed to create My Deck Block: ${error}`);
            return null;
        }
        return blockGroup;
    }

    public adjustMyDeckBlockPosition(): void {
        const currentDeckButtonId = this.getCurrentClickDeckButton();
        if (currentDeckButtonId === null) {
            console.error("No deck button clicked");
            return;
        }

        const deckIdList = this.getAllDeckIdList();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        for (const deckId of deckIdList) {
            const blockUniqueIdList = this.getBlockUniqueIdListByDeckId(deckId);
            console.log(`[DEBUG] (adjust) Processing deckId: ${deckId}`);

            for (const blockUniqueId of blockUniqueIdList) {
                console.log(`[DEBUG] (adjust) Block Unique ID: ${blockUniqueId}`);
                const blockMesh = this.getBlockByBlockUniqueId(blockUniqueId);
                if (!blockMesh) {
                    console.warn(`[WARN] blockMesh with Block Unique ID ${blockUniqueId} not found`);
                    continue;
                }

                const initialPosition = this.getPositionByBlockUniqueId(blockUniqueId);
                console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

                if (!initialPosition) {
                    console.error(`[DEBUG] (adjust) No position found for block id: ${blockUniqueId}`);
                    continue;
                }

                const blockWidth = 0.166 * window.innerWidth;
                const blockHeight = blockWidth * (250/1130);

                const newPositionX = initialPosition.getX() * windowWidth;
                const newPositionY = initialPosition.getY() * windowHeight;
                console.log(`[DEBUG] (adjust) Block ${blockUniqueId}:`, {
                    initialPosition: initialPosition,
                    newPositionX,
                    newPositionY,
                });

                blockMesh.geometry.dispose();
                blockMesh.geometry = new THREE.PlaneGeometry(blockWidth, blockHeight);
                blockMesh.position.set(newPositionX, newPositionY, 0);

                const scrollArea = this.getScrollArea();
                if (scrollArea) {
                    scrollArea.width = 0.202 * windowWidth;
                    scrollArea.height = 0.61 * windowHeight;
                    scrollArea.position.set(0.38 * window.innerWidth, -0.024 * window.innerHeight);
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                    this.applyClippingPlanesToMesh(blockMesh, clippingPlanes);
                }

            }
        }
    }

    private async createMyDeckBlock(deckId: number, cardId: number, position: Vector2d): Promise<MyDeckBlock> {
        return await this.myDeckBlockRepository.createMyDeckBlock(deckId, cardId, position);
    }

    private createMyDeckBlockPosition(deckId: number, cardId: number): MyDeckBlockPosition {
        return this.myDeckBlockPositionRepository.addMyDeckBlockPosition(deckId, cardId);
    }

    public getCurrentClickDeckButton(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    public getAllDeckIdList(): number[] {
        return this.myDeckBlockRepository.findDeckIdList();
    }

    public getBlockUniqueIdListByDeckId(deckId: number): number[] {
        return this.myDeckBlockRepository.findBlockUniqueIdListByDeckId(deckId);
    }

    private getBlockByBlockUniqueId(blockUniqueId: number): THREE.Mesh | null {
        const block = this.myDeckBlockRepository.findBlockByBlockUniqueId(blockUniqueId);
        if (!block) {
            console.warn(`[WARN] Block with Unique ID ${blockUniqueId} not found`);
            return null;
        }
        const blockMesh = block.getMesh();
        return blockMesh;
    }

    private getPositionByBlockUniqueId(blockUniqueId: number): MyDeckBlockPosition | null {
        return this.myDeckBlockPositionRepository.findPositionByPositionId(blockUniqueId);
    }

    private getBlockMeshByDeckIdAndCardId(deckId: number, cardId: number): THREE.Mesh | null {
        const block = this.myDeckBlockRepository.findBlockByDeckIdAndCardId(deckId, cardId);
        if (!block) {
            console.warn(`[WARN] Block with Deck ID: ${deckId}, Card ID ${cardId} not found`);
            return null;
        }
        return block.getMesh();
    }

    private getBlockIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const blockId = this.myDeckBlockRepository.findBlockIdByDeckIdAndCardId(deckId, cardId);
        if (!blockId) {
            console.warn(`[WARN] Block ID ${blockId} not found`);
            return null;
        }
        return blockId;
    }

//     public getBlockListByDeckId(deckId: number): THREE.Mesh[] {
//         const blockList = this.myDeckBlockRepository.findBlockListByDeckId(deckId);
//         if (!blockList) {
//             return [];
//         }
//         return blockList.map((block) => block.getMesh());
//     }

    public saveBlockGroup(deckId: number): void {
        this.myDeckBlockRepository.saveBlockGroupByDeckId(deckId);
    }

    public getBlockGroupByDeckId(deckId: number): THREE.Group {
        return this.myDeckBlockRepository.findBlockGroupByDeckId(deckId);
    }

    public getBlockListByDeckId(deckId: number): MyDeckBlock[] {
        const blockList = this.myDeckBlockRepository.findBlockListByDeckId(deckId);
        if (!blockList) {
            return [];
        }
        return blockList;
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 2);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public resetBlockGroup(): void {
        this.myDeckBlockRepository.resetBlockGroup();
    }

    public initializeBlockVisibility(): void {
        const deckIdList = this.getAllDeckIdList();
        const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
        const firstDeckId = sortedDeckIdList[0];

        deckIdList.forEach((deckId, index) => {
            const blockList = this.getBlockListByDeckId(deckId);
            if (deckId === firstDeckId) {
                blockList.forEach((block) => block.setVisibility(true));
            } else {
                blockList.forEach((block) => block.setVisibility(false));
            }
        });
    }

    public applyClippingMaskToBlock(): void {
        const deckIdList = this.getAllDeckIdList();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
            deckIdList.forEach((deckId) => {
                const blockGroup = this.getBlockGroupByDeckId(deckId);
                blockGroup.children.forEach((blockObject) => {
                    if (blockObject instanceof THREE.Mesh) {
                        this.applyClippingPlanesToMesh(blockObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in blockGroup:", blockObject);
                    }
                });
            });
        }
    }

}
