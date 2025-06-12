import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckTotalOwnedCardsService} from "./MyDeckTotalOwnedCardsService";

import {MyDeckTotalOwnedCards} from "../entity/MyDeckTotalOwnedCards";
import {MyDeckTotalOwnedCardsPosition} from "../../my_deck_total_owned_cards_position/entity/MyDeckTotalOwnedCardsPosition";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {getCardById} from "../../card/utility";

import {MyDeckTotalOwnedCardsRepositoryImpl} from "../repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {MyDeckTotalOwnedCardsPositionRepositoryImpl} from "../../my_deck_total_owned_cards_position/repository/MyDeckTotalOwnedCardsPositionRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

export class MyDeckTotalOwnedCardsServiceImpl implements MyDeckTotalOwnedCardsService {
    private static instance: MyDeckTotalOwnedCardsServiceImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckTotalOwnedCardsPositionRepository: MyDeckTotalOwnedCardsPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;
    private cardCountManager: CardCountManager;

    private constructor() {
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsPositionRepository = MyDeckTotalOwnedCardsPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
    }

    public static getInstance(): MyDeckTotalOwnedCardsServiceImpl {
        if (!MyDeckTotalOwnedCardsServiceImpl.instance) {
            MyDeckTotalOwnedCardsServiceImpl.instance = new MyDeckTotalOwnedCardsServiceImpl();
        }
        return MyDeckTotalOwnedCardsServiceImpl.instance;
    }

    public async createMyDeckTotalOwnedCardsWithPosition(cardIdToCountMap: Map<number, number>): Promise<THREE.Group | null> {
        const totalOwnedCardsGroup = new THREE.Group();
        const cardIdList = Array.from(cardIdToCountMap.keys());

        try {
            await Promise.all(
                cardIdList.map(async (cardId, index) => {
                    const position = this.myDeckTotalOwnedCardsPosition(cardId, index);
                    console.log(`[DEBUG] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                    const cardCount = cardIdToCountMap.get(cardId);
                    if (cardCount === undefined) {
                        console.warn(`[WARN] Card count not found for cardId: ${cardId}`);
                        return;
                    }
                    console.log(`[DEBUG] Card id: ${cardId}, Card count: ${cardCount}`);

                    const myDeckTotalOwnedCards = await this.createMyDeckTotalOwnedCards(cardId, cardCount, position.position);
                    totalOwnedCardsGroup.add(myDeckTotalOwnedCards.getMesh());
                })
            );
        } catch (error) {
            console.error(`[Error] Failed to create My Deck Total Owned Cards: ${error}`);
            return null;
        }
        return totalOwnedCardsGroup;
    }

    public adjustMyDeckTotalOwnedCardsPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const totalOwnedCardsIdList = this.getTotalOwnedCardsIdList();
        for (const totalOwnedCardsId of totalOwnedCardsIdList) {
            console.log(`[DEBUG] (adjust) Total Owned Cards ID: ${totalOwnedCardsId}`);
            const totalOwnedCardsMesh = this.getTotalOwnedCardsById(totalOwnedCardsId);
            if (!totalOwnedCardsMesh) {
                console.warn(`[WARN] totalOwnedCardsMesh with Total Owned Cards ID ${totalOwnedCardsId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByTotalOwnedCardsId(totalOwnedCardsId);
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found for card id: ${totalOwnedCardsId}`);
                continue;
            }

            const totalOwnedCardsWidth = 0.013 * window.innerWidth;
            const totalOwnedCardsHeight = totalOwnedCardsWidth;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
                console.log(`[DEBUG] (adjust) Total Owned Cards ${totalOwnedCardsId}:`, {
                    initialPosition: initialPosition,
                    newPositionX,
                    newPositionY,
                });

                totalOwnedCardsMesh.geometry.dispose();
                totalOwnedCardsMesh.geometry = new THREE.PlaneGeometry(totalOwnedCardsWidth, totalOwnedCardsHeight);
                totalOwnedCardsMesh.position.set(newPositionX, newPositionY, 0);

                const scrollArea = this.getScrollArea();
                if (scrollArea) {
                    scrollArea.width = 0.54 * windowWidth;
                    scrollArea.height = 0.745 * windowHeight;
                    scrollArea.position.set(0 * window.innerWidth, -0.125 * window.innerHeight);
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                    this.applyClippingPlanesToMesh(totalOwnedCardsMesh, clippingPlanes);
                }
            }
    }

    private async createMyDeckTotalOwnedCards(cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckTotalOwnedCards> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }
        const grade = Number(card.등급);

        const mesh = await this.myDeckTotalOwnedCardsRepository.createMyDeckTotalOwnedCards(cardId, cardCount, position);
        this.cardCountManager.saveGradCardCount(grade, cardCount);

        return mesh;
    }

    private myDeckTotalOwnedCardsPosition(cardId: number, cardIndex: number): MyDeckTotalOwnedCardsPosition {
        return this.myDeckTotalOwnedCardsPositionRepository.addMyDeckTotalOwnedCardsPosition(cardId, cardIndex);
    }

    public getTotalOwnedCardsIdList(): number[] {
        return this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsIdList();
    }

    private getTotalOwnedCardsById(totalOwnedCardsId: number): THREE.Mesh | null {
        const totalOwnedCards = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsById(totalOwnedCardsId);
        if (!totalOwnedCards) {
            console.warn(`[WARN] Total Owned Cards with Unique ID ${totalOwnedCardsId} not found`);
            return null;
        }
        return totalOwnedCards.getMesh();
    }

    private getPositionByTotalOwnedCardsId(totalOwnedCardsId: number): MyDeckTotalOwnedCardsPosition | null {
        return this.myDeckTotalOwnedCardsPositionRepository.findPositionByPositionId(totalOwnedCardsId);
    }

    public getTotalOwnedCardsList(): MyDeckTotalOwnedCards[] {
        const totalOwnedCardsList = this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsList();
        if (!totalOwnedCardsList) {
            return [];
        }
        return totalOwnedCardsList;
    }

    public getTotalOwnedCardsGroup(): THREE.Group {
        return this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsGroup();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 1);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
