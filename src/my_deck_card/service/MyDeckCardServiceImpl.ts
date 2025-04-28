import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckCardService} from "./MyDeckCardService";

import {MyDeckCard} from "../../my_deck_card/entity/MyDeckCard";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";

import {MyDeckCardRepository} from "../../my_deck_card/repository/MyDeckCardRepository";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckCardPosition} from "../../my_deck_card_position/entity/MyDeckCardPosition";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";

import {CardStateManager} from "../../my_deck_card_manager/CardStateManager";
import {CardPageManager} from "../../my_deck_card_manager/CardPageManager";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckCardServiceImpl implements MyDeckCardService {
    private static instance: MyDeckCardServiceImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;

    private cardStateManager: CardStateManager;
    private cardPageManager: CardPageManager;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(myDeckCardRepository: MyDeckCardRepository) {
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();

        this.cardStateManager = CardStateManager.getInstance();
        this.cardPageManager = CardPageManager.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): MyDeckCardServiceImpl {
        if (!MyDeckCardServiceImpl.instance) {
            const repository = MyDeckCardRepositoryImpl.getInstance();
            MyDeckCardServiceImpl.instance = new MyDeckCardServiceImpl(repository);
        }
        return MyDeckCardServiceImpl.instance;
    }

    public async createMyDeckCardWithPosition(deckId: number, cardIdList: number[]): Promise<THREE.Group | null> {
        const cardGroup = new THREE.Group();
        try {
            await Promise.all(
                cardIdList.map(async (cardId, index) => {
                    const position = this.myDeckCardPosition(deckId, index);
                    console.log(`[DEBUG] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                    const myDeckCard = await this.createMyDeckCard(deckId, cardId, position.position);
                    cardGroup.add(myDeckCard.getMesh());
                })
            );
        } catch (error) {
            console.error(`[Error] Failed to create MyDeckCard: ${error}`);
            return null;
        }
        return cardGroup;
    }

    public adjustMyDeckCardPosition(): void {
        const currentDeckButtonId = this.getCurrentClickDeckButton();
        if (currentDeckButtonId === null) {
            console.error("No deck button clicked");
            return;
        }

        const deckIdList = this.getAllDeckIdList();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        for (const deckId of deckIdList) {
            const cardUniqueIdList = this.getCardUniqueIdListByDeckId(deckId);
            console.log(`[DEBUG] (adjust) Processing deckId: ${deckId}`);

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
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
                    this.applyClippingPlanesToMesh(cardMesh, clippingPlanes);
                }
            }
        }
    }

    private async createMyDeckCard(deckId: number, cardId: number, position: Vector2d): Promise<MyDeckCard> {
        return await this.myDeckCardRepository.createMyDeckCard(deckId, cardId, position);
    }

    private myDeckCardPosition(deckId: number, cardIndex: number): MyDeckCardPosition {
        return this.myDeckCardPositionRepository.addMyDeckCardPosition(deckId, cardIndex);
    }

    public getAllDeckIdList(): number[] {
        return this.myDeckCardRepository.findDeckIdList();
    }

    public getCardUniqueIdListByDeckId(deckId: number): number[] {
        return this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
    }

    private getCardByCardUniqueId(cardUniqueId: number): THREE.Mesh | null {
        const card = this.myDeckCardRepository.findCardByCardUniqueId(cardUniqueId);
        if (!card) {
            console.warn(`[WARN] Card with Unique ID ${cardUniqueId} not found`);
            return null;
        }
        const cardMesh = card.getMesh();
        return cardMesh;
    }

    private getPositionByCardUniqueId(cardUniqueId: number): MyDeckCardPosition | null {
        return this.myDeckCardPositionRepository.findPositionByPositionId(cardUniqueId);
    }

    // 이름 변경 필요
    public initializeCardVisibility(deckId: number): void {
        this.cardStateManager.initializeCardVisibility(deckId);
    }

    // 이름 변경 필요
    public setAllCardVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.cardStateManager.setAllCardVisibility(deckId, isVisible);
    }

    public getCardListByDeckId(deckId: number): THREE.Mesh[] {
        const cardList = this.myDeckCardRepository.findCardListByDeckId(deckId);
        if (!cardList) {
            return [];
        }
        return cardList.map((card) => card.getMesh());
    }

    public getCurrentClickDeckButton(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    public resetCardVisibility(): void {
        this.cardStateManager.resetVisibility();
    }

    public saveCardGroup(deckId: number): void {
        this.myDeckCardRepository.saveCardGroupByDeckId(deckId);
    }

    public getCardGroupByDeckId(deckId: number): THREE.Group {
        return this.myDeckCardRepository.findCardGroupByDeckId(deckId);
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 1);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
