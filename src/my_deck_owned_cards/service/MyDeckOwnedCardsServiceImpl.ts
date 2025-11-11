import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {CardRace} from "../../card/race";
import {CardGrade} from "../../card/grade";

import {MyDeckOwnedCardsService} from "./MyDeckOwnedCardsService";

import {MyDeckOwnedCards} from "../../my_deck_owned_cards/entity/MyDeckOwnedCards";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {MyDeckOwnedCardsPosition} from "../../my_deck_owned_cards_position/entity/MyDeckOwnedCardsPosition";

import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckOwnedCardsPositionRepositoryImpl} from "../../my_deck_owned_cards_position/repository/MyDeckOwnedCardsPositionRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";

import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckOwnedCardsServiceImpl implements MyDeckOwnedCardsService {
    private static instance: MyDeckOwnedCardsServiceImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckOwnedCardsPositionRepository: MyDeckOwnedCardsPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckOwnedCardsPositionRepository = MyDeckOwnedCardsPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): MyDeckOwnedCardsServiceImpl {
        if (!MyDeckOwnedCardsServiceImpl.instance) {
            MyDeckOwnedCardsServiceImpl.instance = new MyDeckOwnedCardsServiceImpl();
        }
        return MyDeckOwnedCardsServiceImpl.instance;
    }

    public async createMyDeckOwnedCardsWithPosition(cardId: number): Promise<THREE.Group | null> {
        const cardGroup = new THREE.Group();
        try {
            const position = this.createMyDeckOwnedCardsPosition(cardId);
            console.log(`[DEBUG] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

            const myDeckOwnedCard = await this.createMyDeckOwnedCards(cardId, position.position);
            cardGroup.add(myDeckOwnedCard.getMesh());

        } catch (error) {
            console.error(`[Error] Failed to create My Deck Owned Cards: ${error}`);
            return null;
        }
        return cardGroup;
    }

    public adjustMyDeckOwnedCardsPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const cardUniqueIdList = this.getCardUniqueIdList();
        for (const cardUniqueId of cardUniqueIdList) {
            console.log(`[DEBUG] (adjust) Card Unique ID: ${cardUniqueId}`);
            const cardMesh = this.getCardByCardUniqueId(cardUniqueId);
            if (!cardMesh) {
                console.warn(`[WARN] cardMesh with card Unique ID ${cardUniqueId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByCardUniqueId(cardUniqueId);
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found for card id: ${cardUniqueId}`);
                continue;
            }

            const cardWidth = 0.096 * window.innerWidth;
            const cardHeight = cardWidth * (1540 / 952);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
                console.log(`[DEBUG] (adjust) Card ${cardUniqueId}:`, {
                    initialPosition: initialPosition,
                    newPositionX,
                    newPositionY,
                });

                cardMesh.geometry.dispose();
                cardMesh.geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
                cardMesh.position.set(newPositionX, newPositionY, 0);

                const scrollArea = this.getScrollArea();
                if (scrollArea) {
                    scrollArea.width = 0.54 * windowWidth;
                    scrollArea.height = 0.745 * windowHeight;
                    scrollArea.position.set(0 * window.innerWidth, -0.125 * window.innerHeight);
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                     this.applyClippingPlanesToMesh(cardMesh, clippingPlanes);
                }

            }
    }

    private async createMyDeckOwnedCards(cardId: number, position: Vector2d): Promise<MyDeckOwnedCards> {
        return await this.myDeckOwnedCardsRepository.createMyDeckOwnedCards(cardId, position);
    }

    private createMyDeckOwnedCardsPosition(cardId: number): MyDeckOwnedCardsPosition {
        return this.myDeckOwnedCardsPositionRepository.addMyDeckOwnedCardsPosition(cardId);
    }

    public getCardUniqueIdList(): number[] {
        return this.myDeckOwnedCardsRepository.findAllCardUniqueIdList();
    }

    private getCardByCardUniqueId(cardUniqueId: number): THREE.Mesh | null {
        const card = this.myDeckOwnedCardsRepository.findCardByCardUniqueId(cardUniqueId);
        if (!card) {
            console.warn(`[WARN] Card with Unique ID ${cardUniqueId} not found`);
            return null;
        }
        const cardMesh = card.getMesh();
        return cardMesh;
    }

    private getPositionByCardUniqueId(cardUniqueId: number): MyDeckOwnedCardsPosition | null {
        return this.myDeckOwnedCardsPositionRepository.findPositionByPositionId(cardUniqueId);
    }

    public getCardList(): MyDeckOwnedCards[] {
        const cardList = this.myDeckOwnedCardsRepository.findAllCards();
        if (!cardList) {
            return [];
        }
        return cardList;

    }

    public saveCardGroup(): void {
        this.myDeckOwnedCardsRepository.saveCardGroup();
    }

    public getCardGroup(): THREE.Group {
        return this.myDeckOwnedCardsRepository.findCardGroup();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 1);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public applyClippingMaskToDeckOwnedCards(): void {
        const cardGroup = this.getCardGroup();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
            cardGroup.children.forEach((cardObject) => {
                if (cardObject instanceof THREE.Mesh) {
                    this.applyClippingPlanesToMesh(cardObject, clippingPlanes);
                } else {
                    console.warn("[WARN] Skipping non-mesh object in cardGroup:", cardObject);
                }
            });
        }
    }

    public getFilteredOwnedCardIdList(
        cardIdList: number[],
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): number[] | null {
        return this.myDeckOwnedCardsRepository.filteredOwnedCardIdList(cardIdList, raceType, gradeType);
    }

    public getAllCardIdList(): number[] {
        return this.myDeckOwnedCardsRepository.findAllCardIdList();
    }

}
