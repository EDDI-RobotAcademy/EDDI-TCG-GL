import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckCardService} from "./MyDeckCardService";
import {MyDeckCard} from "../../my_deck_card/entity/MyDeckCard";
import {MyDeckCardRepository} from "../../my_deck_card/repository/MyDeckCardRepository";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckCardPosition} from "../../my_deck_card_position/entity/MyDeckCardPosition";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {CardStateManager} from "../../my_deck_card_manager/CardStateManager";
import {CardPageManager} from "../../my_deck_card_manager/CardPageManager";

export class MyDeckCardServiceImpl implements MyDeckCardService {
    private static instance: MyDeckCardServiceImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private cardStateManager: CardStateManager;
    private cardPageManager: CardPageManager;

    private constructor(myDeckCardRepository: MyDeckCardRepository) {
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.cardStateManager = CardStateManager.getInstance();
        this.cardPageManager = CardPageManager.getInstance();
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

                const cardWidth = 0.115 * window.innerWidth;
                const cardHeight = cardWidth * 1.6176;

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

}
