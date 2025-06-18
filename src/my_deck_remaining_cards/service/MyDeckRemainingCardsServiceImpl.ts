import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckRemainingCardsService} from "./MyDeckRemainingCardsService";

import {MyDeckRemainingCards} from "../entity/MyDeckRemainingCards";
import {MyDeckRemainingCardsPosition} from "../../my_deck_remaining_cards_position/entity/MyDeckRemainingCardsPosition";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";

import {MyDeckRemainingCardsRepositoryImpl} from "../repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingCardsPositionRepositoryImpl} from "../../my_deck_remaining_cards_position/repository/MyDeckRemainingCardsPositionRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

export class MyDeckRemainingCardsServiceImpl implements MyDeckRemainingCardsService {
    private static instance: MyDeckRemainingCardsServiceImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingCardsPositionRepository: MyDeckRemainingCardsPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;
    private cardCountManager: CardCountManager;

    private constructor() {
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance();
        this.myDeckRemainingCardsPositionRepository = MyDeckRemainingCardsPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
    }

    public static getInstance(): MyDeckRemainingCardsServiceImpl {
        if (!MyDeckRemainingCardsServiceImpl.instance) {
            MyDeckRemainingCardsServiceImpl.instance = new MyDeckRemainingCardsServiceImpl();
        }
        return MyDeckRemainingCardsServiceImpl.instance;
    }

    public async createMyDeckRemainingCardsWithPosition(cardId: number, cardCount: number): Promise<THREE.Group | null> {
        const remainingCardsGroup = new THREE.Group();

        try {
            const existingPosition = this.getPositionByCardId(cardId);
            const existingRemainingCardsMesh = this.getRemainingCardsMeshByCardId(cardId);

            if (existingPosition !== null && existingRemainingCardsMesh == null) {
                const myDeckRemainingCards = await this.createMyDeckRemainingCards(cardId, cardCount, existingPosition.position);
                remainingCardsGroup.add(myDeckRemainingCards.getMesh());

            } else if (existingPosition == null && existingRemainingCardsMesh == null) {
                const newPosition = this.myDeckRemainingCardsPosition(cardId);
                console.log(`[DEBUG] CardId ${cardId}: Position X=${newPosition.position.getX()}, Y=${newPosition.position.getY()}`);

                const myDeckRemainingCards = await this.createMyDeckRemainingCards(cardId, cardCount, newPosition.position);
                remainingCardsGroup.add(myDeckRemainingCards.getMesh());
            }

        } catch (error) {
            console.error(`[Error] Failed to create My Deck Remaining Cards: ${error}`);
            return null;
        }
        return remainingCardsGroup;
    }

    public adjustMyDeckRemainingCardsPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const remainingCardsIdList = this.getRemainingCardsIdList();
        for (const remainingCardsId of remainingCardsIdList) {
            console.log(`[DEBUG] (adjust) Remaining Cards ID: ${remainingCardsId}`);
            const remainingCardsMesh = this.getRemainingCardsById(remainingCardsId);
            if (!remainingCardsMesh) {
                console.warn(`[WARN] remainingCardsMesh with Remaining Cards ID ${remainingCardsId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByRemainingCardsId(remainingCardsId);
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found for remaining cards id: ${remainingCardsId}`);
                continue;
            }

            const remainingCardsWidth = 0.013 * window.innerWidth;
            const remainingCardsHeight = remainingCardsWidth;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Remaining Cards ${remainingCardsId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            remainingCardsMesh.geometry.dispose();
            remainingCardsMesh.geometry = new THREE.PlaneGeometry(remainingCardsWidth, remainingCardsHeight);
            remainingCardsMesh.position.set(newPositionX, newPositionY, 0);

            const scrollArea = this.getScrollArea();
            if (scrollArea) {
                scrollArea.width = 0.54 * windowWidth;
                scrollArea.height = 0.745 * windowHeight;
                scrollArea.position.set(0 * window.innerWidth, -0.125 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                this.applyClippingPlanesToMesh(remainingCardsMesh, clippingPlanes);
            }
        }
    }

    private async createMyDeckRemainingCards(cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckRemainingCards> {
        const mesh = await this.myDeckRemainingCardsRepository.createMyDeckRemainingCards(cardId, cardCount, position);
        this.cardCountManager.saveRemainingCardCount(cardId, cardCount);
        return mesh;
    }

    private myDeckRemainingCardsPosition(cardId: number): MyDeckRemainingCardsPosition {
        return this.myDeckRemainingCardsPositionRepository.addMyDeckRemainingCardsPosition(cardId);
    }

    public getRemainingCardsIdList(): number[] {
        return this.myDeckRemainingCardsRepository.findAllRemainingCardsIdList();
    }

    private getRemainingCardsById(remainingCardsId: number): THREE.Mesh | null {
        const remainingCards = this.myDeckRemainingCardsRepository.findRemainingCardsById(remainingCardsId);
        if (!remainingCards) {
            console.warn(`[WARN] Remaining Cards with Unique ID ${remainingCardsId} not found`);
            return null;
        }
        return remainingCards.getMesh();
    }

    private getPositionByRemainingCardsId(remainingCardsId: number): MyDeckRemainingCardsPosition | null {
        return this.myDeckRemainingCardsPositionRepository.findPositionByPositionId(remainingCardsId);
    }

    private getPositionByCardId(cardId: number): MyDeckRemainingCardsPosition | null {
        return this.myDeckRemainingCardsPositionRepository.findPositionByCardId(cardId);
    }

    private getRemainingCardsIdByCardId(cardId: number): number | null {
        return this.myDeckRemainingCardsRepository.findRemainingCardIdByCardId(cardId);
    }

    private getRemainingCardsMeshByCardId(cardId: number): THREE.Mesh | null {
        const remainingCardIds = this.getRemainingCardsIdByCardId(cardId);
        if (remainingCardIds == null) {
            console.warn(`[WARN] Remaining Cards ID with Unique ID ${remainingCardIds} not found`);
            return null;
        }

        const remainingCards = this.getRemainingCardsById(remainingCardIds);
        if (remainingCards == null) {
            console.warn(`[WARN] Remaining Cards not found`);
            return null;
        }

        return remainingCards;
    }

    private getAllPositionList(): MyDeckRemainingCardsPosition[] {
        return this.myDeckRemainingCardsPositionRepository.findAllPositionList();
    }

    public getRemainingCardsList(): MyDeckRemainingCards[] {
        const remainingCardsList = this.myDeckRemainingCardsRepository.findAllRemainingCardsList();
        if (!remainingCardsList) {
            return [];
        }
        return remainingCardsList;
    }

    public getRemainingCardsGroup(): THREE.Group {
        return this.myDeckRemainingCardsRepository.findRemainingCardsGroup();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 1);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public applyClippingMaskToRemainingCards(): void {
        const numberGroup = this.getRemainingCardsGroup();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
            numberGroup.children.forEach((numberObject) => {
                if (numberObject instanceof THREE.Mesh) {
                    this.applyClippingPlanesToMesh(numberObject, clippingPlanes);
                } else {
                    console.warn("[WARN] Skipping non-mesh object in numberGroup:", numberObject);
                }
            });
        }
    }

}
