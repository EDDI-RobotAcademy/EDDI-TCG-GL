import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckRemainingOutOfTotalSlashService} from "./MyDeckRemainingOutOfTotalSlashService";

import {MyDeckRemainingOutOfTotalSlash} from "../entity/MyDeckRemainingOutOfTotalSlash";
import {MyDeckRemainingOutOfTotalSlashPosition} from "../../my_deck_remaining_out_of_total_slash_position/entity/MyDeckRemainingOutOfTotalSlashPosition";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";

import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash_position/repository/MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckRemainingOutOfTotalSlashServiceImpl implements MyDeckRemainingOutOfTotalSlashService {
    private static instance: MyDeckRemainingOutOfTotalSlashServiceImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashPositionRepository: MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashPositionRepository = MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): MyDeckRemainingOutOfTotalSlashServiceImpl {
        if (!MyDeckRemainingOutOfTotalSlashServiceImpl.instance) {
            MyDeckRemainingOutOfTotalSlashServiceImpl.instance = new MyDeckRemainingOutOfTotalSlashServiceImpl();
        }
        return MyDeckRemainingOutOfTotalSlashServiceImpl.instance;
    }

    public async createSlashWithPosition(cardIdToCountMap: Map<number, number>): Promise<THREE.Group | null> {
        const slashGroup = new THREE.Group();
        const cardIdList = Array.from(cardIdToCountMap.keys());

        try {
            await Promise.all(
                cardIdList.map(async (cardId, index) => {
                    const position = this.slashPosition(cardId, index);
                    console.log(`[DEBUG] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                    const slash = await this.createSlash(cardId, position.position);
                    slashGroup.add(slash.getMesh());
                })
            );
        } catch (error) {
            console.error(`[Error] Failed to create Slash: ${error}`);
            return null;
        }
        return slashGroup;
    }

    public adjustSlashPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const slashIdList = this.getSlashIdList();
        for (const slashId of slashIdList) {
            console.log(`[DEBUG] (adjust) Slash ID: ${slashId}`);
            const slashMesh = this.getSlashById(slashId);
            if (!slashMesh) {
                console.warn(`[WARN] Slash Mesh with ID ${slashId} not found`);
                continue;
            }

            const initialPosition = this.getPositionById(slashId);
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found: ${slashId}`);
                continue;
            }

            const slashWidth = 0.013 * window.innerWidth;
            const slashHeight = slashWidth;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Slash ${slashId}:`, `Info:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            slashMesh.geometry.dispose();
            slashMesh.geometry = new THREE.PlaneGeometry(slashWidth, slashHeight);
            slashMesh.position.set(newPositionX, newPositionY, 0);
        }
    }

    private async createSlash(cardId: number, position: Vector2d): Promise<MyDeckRemainingOutOfTotalSlash> {
        return await this.myDeckRemainingOutOfTotalSlashRepository.createSlash(cardId, position);
    }

    private slashPosition(cardId: number, cardIndex: number): MyDeckRemainingOutOfTotalSlashPosition {
        return this.myDeckRemainingOutOfTotalSlashPositionRepository.addSlashPosition(cardId, cardIndex);
    }

    public getSlashIdList(): number[] {
        return this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashIdList();
    }

    private getSlashById(slashId: number): THREE.Mesh | null {
        const slashMesh = this.myDeckRemainingOutOfTotalSlashRepository.findSlashById(slashId);
        if (!slashMesh) {
            console.warn(`[WARN] Slash Mesh with Unique ID ${slashId} not found`);
            return null;
        }
        return slashMesh.getMesh();
    }

    private getPositionById(id: number): MyDeckRemainingOutOfTotalSlashPosition | null {
        return this.myDeckRemainingOutOfTotalSlashPositionRepository.findPositionByPositionId(id);
    }

    public getSlashList(): MyDeckRemainingOutOfTotalSlash[] {
        const slashList = this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashList();
        if (!slashList) {
            return [];
        }
        return slashList;
    }

    public getSlashGroup(): THREE.Group {
        return this.myDeckRemainingOutOfTotalSlashRepository.findSlashGroup();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 1);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
