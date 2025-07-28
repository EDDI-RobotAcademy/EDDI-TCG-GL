import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

import {MyDeckNumberOfSelectedCardsCloneService} from "./MyDeckNumberOfSelectedCardsCloneService";
import {MyDeckNumberOfSelectedCardsClone} from "../entity/MyDeckNumberOfSelectedCardsClone";
import {MyDeckNumberOfSelectedCardsCloneRepositoryImpl} from "../repository/MyDeckNumberOfSelectedCardsCloneRepositoryImpl";
import {MyDeckNumberOfSelectedCardsClonePositionRepositoryImpl} from "../../my_deck_number_of_selected_cards_clone_position/repository/MyDeckNumberOfSelectedCardsClonePositionRepositoryImpl";
import {MyDeckNumberOfSelectedCardsClonePosition} from "../../my_deck_number_of_selected_cards_clone_position/entity/MyDeckNumberOfSelectedCardsClonePosition";

import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckNumberOfSelectedCardsCloneServiceImpl implements MyDeckNumberOfSelectedCardsCloneService {
    private static instance: MyDeckNumberOfSelectedCardsCloneServiceImpl;
    private myDeckNumberOfSelectedCardsCloneRepository: MyDeckNumberOfSelectedCardsCloneRepositoryImpl;
    private myDeckNumberOfSelectedCardsClonePositionRepository: MyDeckNumberOfSelectedCardsClonePositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(scene: THREE.Scene) {
        this.myDeckNumberOfSelectedCardsCloneRepository = MyDeckNumberOfSelectedCardsCloneRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsClonePositionRepository = MyDeckNumberOfSelectedCardsClonePositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(scene: THREE.Scene): MyDeckNumberOfSelectedCardsCloneServiceImpl {
        if (!MyDeckNumberOfSelectedCardsCloneServiceImpl.instance) {
            MyDeckNumberOfSelectedCardsCloneServiceImpl.instance = new MyDeckNumberOfSelectedCardsCloneServiceImpl(scene);
        }
        return MyDeckNumberOfSelectedCardsCloneServiceImpl.instance;
    }

    public async createCloneWithPosition(deckId: number, cardId: number, cardCount: number): Promise<void> {
        try {
            const existingPosition = this.getPositionByCardId(cardId);
            if (existingPosition == null) {
                const newPosition = this.createClonePosition(cardId);
                console.log(`[Clone] CardId ${cardId}: Position X=${newPosition.position.getX()}, Y=${newPosition.position.getY()}`);

                await this.createClone(deckId, cardId, cardCount, newPosition.position);

            } else {
                const existingCloneMesh = this.getCloneMeshByCardId(cardId);
                if (existingCloneMesh == null) {
                    await this.createClone(deckId, cardId, cardCount, existingPosition.position);

                } else {
                    const positionX = existingPosition.getX() * window.innerWidth;
                    const positionY = existingPosition.getY() * window.innerHeight;
                    existingCloneMesh.position.set(positionX, positionY, 0);
                }
            }
        } catch (error) {
            console.error(`[Error] Failed to create Clone(My Deck Number of Cards): ${error}`);
        }
    }

    public adjustClonePosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const cardIdList = this.getCardIdList();
        if (cardIdList == null) return;

        for (const cardId of cardIdList) {
            const cloneMesh = this.getCloneMeshByCardId(cardId);
            if (!cloneMesh) {
                console.warn(`[WARN] Not Found Clone Mesh (Card ID: ${cardId})`);
                continue;
            }

            const initialPosition = this.getPositionByCardId(cardId);
            console.log(`(adjust) InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`(adjust) Not Found Clone Position (card ID: ${cardId})`);
                continue;
            }

            const cloneWidth = 0.013 * windowWidth;
            const cloneHeight = cloneWidth;

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

    private async createClone(deckId: number, cardId: number, cardCount: number, position: Vector2d): Promise<void> {
        const newClone = await this.myDeckNumberOfSelectedCardsCloneRepository.createClone(cardCount, position);
        this.myDeckNumberOfSelectedCardsCloneRepository.saveCloneInfo(deckId, cardId, cardCount, newClone);
    }

    private createClonePosition(cardId: number): MyDeckNumberOfSelectedCardsClonePosition {
        return this.myDeckNumberOfSelectedCardsClonePositionRepository.addClonePosition(cardId);
    }

    public getCardIdList(): number[] | null {
        return this.myDeckNumberOfSelectedCardsCloneRepository.findCardIdList();
    }

    private getCloneMeshByCardId(cardId: number): THREE.Mesh | null {
        const cloneMesh = this.myDeckNumberOfSelectedCardsCloneRepository.findCloneByCardId(cardId);
        if (!cloneMesh) {
            console.warn(`[WARN] Not Found Clone(Card ID: ${cardId})`);
            return null;
        }
        return cloneMesh.getMesh();
    }

    private getPositionByCardId(cardId: number): MyDeckNumberOfSelectedCardsClonePosition | null {
        const clonePosition = this.myDeckNumberOfSelectedCardsClonePositionRepository.findPositionByCardId(cardId);
        if (!clonePosition) {
            console.warn(`[WARN] Not Found Clone Position(My Deck Number Of Cards)`);
        }
        return clonePosition;
    }

    public saveCloneGroup(): void {
        this.myDeckNumberOfSelectedCardsCloneRepository.saveCloneGroup();
    }

    public getCloneGroup(): THREE.Group {
        return this.myDeckNumberOfSelectedCardsCloneRepository.findCloneGroup();
    }

    public resetCloneGroup(): void {
        this.myDeckNumberOfSelectedCardsCloneRepository.resetCloneGroup();
    }

    public getCloneList(deckId: number): MyDeckNumberOfSelectedCardsClone[] | null {
        const cloneList = this.myDeckNumberOfSelectedCardsCloneRepository.findCloneList();
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
