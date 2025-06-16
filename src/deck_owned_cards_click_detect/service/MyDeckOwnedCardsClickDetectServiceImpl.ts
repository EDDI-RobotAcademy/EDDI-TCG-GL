import {MyDeckOwnedCardsClickDetectService} from "./MyDeckOwnedCardsClickDetectService";

import {MyDeckOwnedCards} from "../../my_deck_owned_cards/entity/MyDeckOwnedCards";
import {getCardById} from "../../card/utility";

import {MyDeckOwnedCardsClickDetectRepositoryImpl} from "../repository/MyDeckOwnedCardsClickDetectRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

import * as THREE from "three";

export class MyDeckOwnedCardsClickDetectServiceImpl implements MyDeckOwnedCardsClickDetectService {
    private static instance: MyDeckOwnedCardsClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private myDeckOwnedCardsClickDetectRepository: MyDeckOwnedCardsClickDetectRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private cardCountManager: CardCountManager;

    private cardClickEnabled: boolean = false;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckOwnedCardsClickDetectRepository = MyDeckOwnedCardsClickDetectRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyDeckOwnedCardsClickDetectServiceImpl {
        if (!MyDeckOwnedCardsClickDetectServiceImpl.instance) {
            MyDeckOwnedCardsClickDetectServiceImpl.instance = new MyDeckOwnedCardsClickDetectServiceImpl(camera, scene);
        }
        return MyDeckOwnedCardsClickDetectServiceImpl.instance;
    }

    public setCardClickEnabled(isEnabled: boolean): void {
        this.cardClickEnabled = isEnabled;
    }

    public isCardClickEnabled(): boolean {
        return this.cardClickEnabled;
    }

    async handleCardClick(clickPoint: { x: number; y: number }): Promise<MyDeckOwnedCards | null> {
        const { x, y } = clickPoint;
        const allCards = this.getAllOwnedCardsList();
        const clickedCard = this.myDeckOwnedCardsClickDetectRepository.isMyDeckOwnedCardsClicked(
            { x, y },
            allCards,
            this.camera
        );

        if (clickedCard) {
            const cardUniqueId = clickedCard.id;
            const cardId = this.getCardIdByCardUniqueId(cardUniqueId);

            if (cardId == null) return null;

            console.log(`Clicked My Deck Owned Card Unique ID: ${cardUniqueId}, Card ID: ${cardId}`);

            this.saveCurrentClickedCardId(cardId);
            this.saveClickedCardCount(cardId);

            return clickedCard;
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyDeckOwnedCards | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleCardClick(clickPoint);
        }
        return null;
    }

    private saveCurrentClickedCardId(cardId: number): void {
        this.myDeckOwnedCardsClickDetectRepository.saveCurrentClickedCardId(cardId);
    }

    public getCurrentClickedCardId(): number | null {
        return this.myDeckOwnedCardsClickDetectRepository.getCurrentClickedCardId() ?? null;
    }

    private getAllOwnedCardsList(): MyDeckOwnedCards[] {
        return this.myDeckOwnedCardsRepository.findAllCards();
    }

    private getCardIdByCardUniqueId(cardUniqueId: number): number | null {
        return this.myDeckOwnedCardsRepository.findCardIdByCardUniqueId(cardUniqueId);
    }

    private getCurrentClickDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private saveClickedCardCount(cardId: number): void {
        const card = getCardById(cardId);
        if (!card) {
            console.warn(`[WARN] Card with ID ${cardId} not found`);
            return;
        }
        const grade = Number(card.등급);

        const maxSelectableCardCountByGrade = this.cardCountManager.getMaxClickCountByGrade(grade);
        const ownedCardCount = this.myDeckTotalOwnedCardsRepository.findCardCountByCardId(cardId);
        const remainingCardCount = this.cardCountManager.findRemainingCardCountByCardId(cardId);
        if (remainingCardCount == null) {
            console.warn(`[WARN] Remaining Card Count not found for cardId: ${cardId}`);
            return;
        }

        const currentClickedDeckButtonId = this.getCurrentClickDeckButtonId();
        if (currentClickedDeckButtonId == null) return;

        const currentSelectedCardCount = this.cardCountManager.findCardCountByDeck(currentClickedDeckButtonId, cardId);
        const currentSelectedCardCountByGrade = this.cardCountManager.findCardCountByGrade(currentClickedDeckButtonId, grade);

        // 등급별 제한 검사
        if (currentSelectedCardCountByGrade >= maxSelectableCardCountByGrade) {
            console.warn(`[DEBUG] Grade limit exceeded (grade: ${grade}, max count: ${maxSelectableCardCountByGrade})`);
            return;
        }

        // 사용자가 소지한 카드 개수 제한 검사
        if (ownedCardCount !== null && currentSelectedCardCount >= ownedCardCount) {
            console.warn(`[DEBUG] User Owned Card Not Enough: ${cardId} (Owned Card Count: ${ownedCardCount})`);
            return;
        }

        this.cardCountManager.decrementRemainingCardCount(cardId);
        this.cardCountManager.incrementCardCountByDeck(currentClickedDeckButtonId, cardId);
        this.cardCountManager.incrementCardCountByGrade(currentClickedDeckButtonId, grade);
    }

}
