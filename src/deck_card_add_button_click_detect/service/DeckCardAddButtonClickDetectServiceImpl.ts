import * as THREE from "three";

import {getCardById} from "../../card/utility";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckCardAddButtonClickDetectService} from "./DeckCardAddButtonClickDetectService";
import {DeckCardAddButtonClickDetectRepositoryImpl} from "../repository/DeckCardAddButtonClickDetectRepositoryImpl";

import {DeckCardAddButton} from "../../deck_card_add_button/entity/DeckCardAddButton";
import {DeckCardAddButtonRepositoryImpl} from "../../deck_card_add_button/repository/DeckCardAddButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

export class DeckCardAddButtonClickDetectServiceImpl implements DeckCardAddButtonClickDetectService {
    private static instance: DeckCardAddButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckCardAddButtonClickDetectRepository: DeckCardAddButtonClickDetectRepositoryImpl;
    private deckCardAddButtonRepository: DeckCardAddButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private cardCountManager: CardCountManager;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardAddButtonClickDetectRepository = DeckCardAddButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardAddButtonRepository = DeckCardAddButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardAddButtonClickDetectServiceImpl {
        if (!DeckCardAddButtonClickDetectServiceImpl.instance) {
            DeckCardAddButtonClickDetectServiceImpl.instance = new DeckCardAddButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckCardAddButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckCardAddButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckCardAddButtonClickDetectRepository.isButtonClickEnabled();
    }

    async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeckCardAddButton | null> {
        const { x, y } = clickPoint;
        const currentClickedDeckId = this.getCurrentClickDeckId();
        if (currentClickedDeckId == null) return null;

        const allButtonList = this.getAllDeckCardAddButtonList(currentClickedDeckId);
        if (allButtonList == null) return null;

        const clickedButton = this.deckCardAddButtonClickDetectRepository.isButtonClicked(
            { x, y },
            allButtonList,
            this.camera
        );

        if (clickedButton) {
            const buttonUniqueId = clickedButton.id;
            console.log(`Clicked Deck Card Add Button Unique ID: ${buttonUniqueId}`);

            this.saveCurrentClickedButtonId(buttonUniqueId);

            const cardId = this.getCardIdByButtonId(buttonUniqueId);
            if (cardId == null) return null;
            this.saveClickedCardCount(cardId);

            return clickedButton;
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckCardAddButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleButtonClick(clickPoint);
        }
        return null;
    }

    private saveCurrentClickedButtonId(buttonId: number): void {
        this.deckCardAddButtonClickDetectRepository.saveCurrentClickedButtonId(buttonId);
    }

    public getCurrentClickedButtonId(): number | null {
        return this.deckCardAddButtonClickDetectRepository.getCurrentClickedButtonId() ?? null;
    }

    private getAllDeckCardAddButtonList(deckId: number): DeckCardAddButton[] | null {
        return this.deckCardAddButtonRepository.findButtonListByDeckId(deckId);
    }

    private getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private getCardIdByButtonId(buttonId: number): number | null {
        return this.deckCardAddButtonRepository.findCardIdByButtonId(buttonId);
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

        const currentClickedDeckId = this.getCurrentClickDeckId();
        if (currentClickedDeckId == null) return;

        const currentSelectedCardCount = this.cardCountManager.findCardCountByDeck(currentClickedDeckId, cardId);
        const currentSelectedCardCountByGrade = this.cardCountManager.findCardCountByGrade(currentClickedDeckId, grade);

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
        this.cardCountManager.incrementCardCountByDeck(currentClickedDeckId, cardId);
        this.cardCountManager.incrementCardCountByGrade(currentClickedDeckId, grade);
    }

}
