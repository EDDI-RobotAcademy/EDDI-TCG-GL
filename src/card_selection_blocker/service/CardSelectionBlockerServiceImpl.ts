import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {CardSelectionBlockerService} from "./CardSelectionBlockerService";

import {CardSelectionBlocker} from "../entity/CardSelectionBlocker";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {CardSelectionBlockerPosition} from "../../card_selection_blocker_position/entity/CardSelectionBlockerPosition";

import {CardSelectionBlockerRepositoryImpl} from "../repository/CardSelectionBlockerRepositoryImpl";
import {CardSelectionBlockerPositionRepositoryImpl} from "../../card_selection_blocker_position/repository/CardSelectionBlockerPositionRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";

import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class CardSelectionBlockerServiceImpl implements CardSelectionBlockerService {
    private static instance: CardSelectionBlockerServiceImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private cardSelectionBlockerPositionRepository: CardSelectionBlockerPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance();
        this.cardSelectionBlockerPositionRepository = CardSelectionBlockerPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): CardSelectionBlockerServiceImpl {
        if (!CardSelectionBlockerServiceImpl.instance) {
            CardSelectionBlockerServiceImpl.instance = new CardSelectionBlockerServiceImpl();
        }
        return CardSelectionBlockerServiceImpl.instance;
    }

    public async createCardSelectionBlockerWithPosition(cardIdList: number[]): Promise<THREE.Group | null> {
        const blockerGroup = new THREE.Group();

        try {
            await Promise.all(
                cardIdList.map(async (cardId, index) => {
                    const position = this.cardSelectionBlockerPosition(cardId, index);
                    console.log(`[DEBUG] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                    const cardSelectionBlocker = await this.createCardSelectionBlocker(cardId, position.position);
                    blockerGroup.add(cardSelectionBlocker.getMesh());
                })
            );
        } catch (error) {
            console.error(`[Error] Failed to create Card Selection Blocker: ${error}`);
            return null;
        }
        return blockerGroup;
    }

    public adjustCardSelectionBlockerPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const blockerIdList = this.getBlockerIdList();
        for (const blockerId of blockerIdList) {
            console.log(`[DEBUG] (adjust) Blocker ID: ${blockerId}`);
            const blockerMesh = this.getBlockerByBlockerId(blockerId);
            if (!blockerMesh) {
                console.warn(`[WARN] blockerMesh with blocker ID ${blockerId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByBlockerId(blockerId);
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found for blocker id: ${blockerId}`);
                continue;
            }

            const blockerWidth = 0.096 * window.innerWidth;
            const blockerHeight = blockerWidth * (1540 / 952);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Blocker ${blockerId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            blockerMesh.geometry.dispose();
            blockerMesh.geometry = new THREE.PlaneGeometry(blockerWidth, blockerHeight);
            blockerMesh.position.set(newPositionX, newPositionY, 0);

            const scrollArea = this.getScrollArea();
            if (scrollArea) {
                scrollArea.width = 0.54 * windowWidth;
                scrollArea.height = 0.745 * windowHeight;
                scrollArea.position.set(0 * window.innerWidth, -0.125 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                this.applyClippingPlanesToMesh(blockerMesh, clippingPlanes);
            }

        }
    }

    private async createCardSelectionBlocker(cardId: number, position: Vector2d): Promise<CardSelectionBlocker> {
        return await this.cardSelectionBlockerRepository.createCardSelectionBlocker(cardId, position);
    }

    private cardSelectionBlockerPosition(cardId: number, cardIndex: number): CardSelectionBlockerPosition {
        return this.cardSelectionBlockerPositionRepository.addCardSelectionBlockerPosition(cardId, cardIndex);
    }

    public getBlockerIdList(): number[] {
        return this.cardSelectionBlockerRepository.findAllBlockerIdList();
    }

    private getBlockerByBlockerId(blockerId: number): THREE.Mesh | null {
        const blocker = this.cardSelectionBlockerRepository.findBlockerByBlockerId(blockerId);
        if (blocker == null) {
            console.warn(`[WARN] Blocker with Unique ID ${blockerId} not found`);
            return null;
        }
        const blockerMesh = blocker.getMesh();
        return blockerMesh;
    }

    private getPositionByBlockerId(blockerId: number): CardSelectionBlockerPosition | null {
        return this.cardSelectionBlockerPositionRepository.findPositionByPositionId(blockerId);
    }

    public getBlockerList(): CardSelectionBlocker[] {
        return this.cardSelectionBlockerRepository.findAllBlockers() ?? [];
    }

    public getBlockerGroup(): THREE.Group {
        return this.cardSelectionBlockerRepository.findBlockerGroup();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 1);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public applyClippingMaskToBlocker(): void {
        const blockerGroup = this.getBlockerGroup();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
            blockerGroup.children.forEach((blockerObject) => {
                if (blockerObject instanceof THREE.Mesh) {
                    this.applyClippingPlanesToMesh(blockerObject, clippingPlanes);
                } else {
                    console.warn("[WARN] Skipping non-mesh object in blockerGroup:", blockerObject);
                }
            });
        }
    }

}
