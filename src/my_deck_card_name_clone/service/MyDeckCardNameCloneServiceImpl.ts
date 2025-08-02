import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

import {MyDeckCardNameCloneService} from "./MyDeckCardNameCloneService";
import {MyDeckCardNameClone} from "../entity/MyDeckCardNameClone";
import {MyDeckCardNameCloneRepositoryImpl} from "../repository/MyDeckCardNameCloneRepositoryImpl";
import {MyDeckCardNameClonePositionRepositoryImpl} from "../../my_deck_card_name_clone_position/repository/MyDeckCardNameClonePositionRepositoryImpl";
import {MyDeckCardNameClonePosition} from "../../my_deck_card_name_clone_position/entity/MyDeckCardNameClonePosition";

import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckCardNameCloneServiceImpl implements MyDeckCardNameCloneService {
    private static instance: MyDeckCardNameCloneServiceImpl;
    private myDeckCardNameCloneRepository: MyDeckCardNameCloneRepositoryImpl;
    private myDeckCardNameClonePositionRepository: MyDeckCardNameClonePositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(scene: THREE.Scene) {
        this.myDeckCardNameCloneRepository = MyDeckCardNameCloneRepositoryImpl.getInstance(scene);
        this.myDeckCardNameClonePositionRepository = MyDeckCardNameClonePositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(scene: THREE.Scene): MyDeckCardNameCloneServiceImpl {
        if (!MyDeckCardNameCloneServiceImpl.instance) {
            MyDeckCardNameCloneServiceImpl.instance = new MyDeckCardNameCloneServiceImpl(scene);
        }
        return MyDeckCardNameCloneServiceImpl.instance;
    }

    public async createCloneWithPosition(deckId: number, cardId: number): Promise<void> {
        try {
            const existingPosition = this.getPositionByCardId(cardId);
            if (existingPosition == null) {
                const newPosition = this.createClonePosition(cardId);
                console.log(`[Clone] CardId ${cardId}: Position X=${newPosition.position.getX()}, Y=${newPosition.position.getY()}`);

                await this.createClone(deckId, cardId, newPosition.position);

            } else {
                const existingCloneMesh = this.getCloneMeshByCardId(cardId);
                if (existingCloneMesh == null) {
                    await this.createClone(deckId, cardId, existingPosition.position);

                } else {
                    const positionX = existingPosition.getX() * window.innerWidth;
                    const positionY = existingPosition.getY() * window.innerHeight;
                    existingCloneMesh.position.set(positionX, positionY, 0);
                }
            }
        } catch (error) {
            console.error(`[Error] Failed to create Clone(My Deck Card Name): ${error}`);
        }
    }

    public adjustClonePosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const cardIdList = this.getCardIdList();
        if (cardIdList == null) return;

        for (const cardId of cardIdList) {
            const clone = this.getCloneByCardId(cardId);
            if (clone == null) {
                console.warn(`[WARN] Not Found Clone (Card ID: ${cardId})`);
                continue;
            }

            const cloneMesh = clone.getMesh();
            const initialPosition = this.getPositionByCardId(cardId);
            console.log(`(adjust) InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`(adjust) Not Found Clone Position (card ID: ${cardId})`);
                continue;
            }

            const cloneWidth = clone.width;
            const cloneHeight = clone.height;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`(adjust) Clone Card ID: ${cardId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            cloneMesh.geometry.dispose();
            cloneMesh.geometry = new THREE.PlaneGeometry(cloneWidth, cloneHeight);
            cloneMesh.position.set(newPositionX, newPositionY, 0);

            const scrollArea = this.getScrollArea();
            if (scrollArea) {
                scrollArea.width = 0.202 * windowWidth;
                scrollArea.height = 0.61 * windowHeight;
                scrollArea.position.set(0.38 * window.innerWidth, -0.024 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                this.applyClippingPlanesToMesh(cloneMesh, clippingPlanes);
            }
        }
    }

    private async createClone(deckId: number, cardId: number, position: Vector2d): Promise<void> {
        const newClone = await this.myDeckCardNameCloneRepository.createClone(cardId, position);
        this.myDeckCardNameCloneRepository.saveCloneInfo(deckId, cardId, newClone);
    }

    private createClonePosition(cardId: number): MyDeckCardNameClonePosition {
        return this.myDeckCardNameClonePositionRepository.addClonePosition(cardId);
    }

    public getCardIdList(): number[] | null {
        return this.myDeckCardNameCloneRepository.findCardIdList();
    }

    private getCloneMeshByCardId(cardId: number): THREE.Mesh | null {
        const cloneMesh = this.myDeckCardNameCloneRepository.findCloneByCardId(cardId);
        if (!cloneMesh) {
            console.warn(`[WARN] Not Found My Deck Card Name Clone(Card ID: ${cardId})`);
            return null;
        }
        return cloneMesh.getMesh();
    }

    private getCloneByCardId(cardId: number): MyDeckCardNameClone | null {
        const cloneMesh = this.myDeckCardNameCloneRepository.findCloneByCardId(cardId);
        if (!cloneMesh) {
            console.warn(`[WARN] Not Found My Deck Card Name Clone(Card ID: ${cardId})`);
            return null;
        }
        return cloneMesh;
    }

    private getPositionByCardId(cardId: number): MyDeckCardNameClonePosition | null {
        const clonePosition = this.myDeckCardNameClonePositionRepository.findPositionByCardId(cardId);
        if (!clonePosition) {
            console.warn(`[WARN] Not Found My Deck Card Name Clone Position`);
        }
        return clonePosition;
    }

    public saveCloneGroup(): void {
        this.myDeckCardNameCloneRepository.saveCloneGroup();
    }

    public getCloneGroup(): THREE.Group {
        return this.myDeckCardNameCloneRepository.findCloneGroup();
    }

    public resetCloneGroup(): void {
        this.myDeckCardNameCloneRepository.resetCloneGroup();
    }

    public getCloneList(deckId: number): MyDeckCardNameClone[] | null {
        const cloneList = this.myDeckCardNameCloneRepository.findCloneList();
        if (cloneList == null) {
            return null;
        }
        return cloneList;
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 2);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public applyClippingMaskToClone(): void {
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
            const cloneGroup = this.getCloneGroup();
            cloneGroup.children.forEach((cloneObject) => {
                if (cloneObject instanceof THREE.Mesh) {
                    this.applyClippingPlanesToMesh(cloneObject, clippingPlanes);
                } else {
                    console.warn("[WARN] Skipping non-mesh object in cloneGroup:", cloneObject);
                }
            });
        }
    }

}
