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
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingCardsPositionRepositoryImpl} from "../../my_deck_remaining_cards_position/repository/MyDeckRemainingCardsPositionRepositoryImpl";
import {MyDeckNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_number_of_selected_cards/repository/MyDeckNumberOfSelectedCardsRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {TotalNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_total_number_of_selected_cards/repository/TotalNumberOfSelectedCardsRepositoryImpl";
import {MyDeckCardMapRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardMapRepositoryImpl";

import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

export class DeckCardAddButtonClickDetectServiceImpl implements DeckCardAddButtonClickDetectService {
    private static instance: DeckCardAddButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckCardAddButtonClickDetectRepository: DeckCardAddButtonClickDetectRepositoryImpl;
    private deckCardAddButtonRepository: DeckCardAddButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingCardsPositionRepository: MyDeckRemainingCardsPositionRepositoryImpl;
    private myDeckNumberOfSelectedCardsRepository: MyDeckNumberOfSelectedCardsRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private totalNumberOfSelectedCardsRepository: TotalNumberOfSelectedCardsRepositoryImpl;
    private myDeckCardMapRepository: MyDeckCardMapRepositoryImpl;
    private cardCountManager: CardCountManager;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardAddButtonClickDetectRepository = DeckCardAddButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardAddButtonRepository = DeckCardAddButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingCardsPositionRepository = MyDeckRemainingCardsPositionRepositoryImpl.getInstance();
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.totalNumberOfSelectedCardsRepository = TotalNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
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

            const cardId = this.getCardIdByDeckIdAndButtonId(currentClickedDeckId, buttonUniqueId);
            if (cardId == null) return null;
            this.saveClickedCardCount(currentClickedDeckId, cardId);

            this.deleteTotalNumberOfSelectedCards(currentClickedDeckId);
            this.deleteNumberOfRemainingCards(cardId);
            this.deleteNumberOfSelectedCards(currentClickedDeckId, cardId);

            const currentRemainingCardCount = this.cardCountManager.findRemainingCardCountByCardId(cardId);
            if (currentRemainingCardCount == 0) {
                this.setCardBlockerVisibility(cardId, true);
            }

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

    private getCardIdByDeckIdAndButtonId(deckId: number, buttonId: number): number | null {
        const buttonList = this.deckCardAddButtonRepository.findButtonListByDeckId(deckId);
        const buttonMesh = buttonList?.find(button => button.id === buttonId);
        if (!buttonMesh) return null;

        return this.deckCardAddButtonRepository.findCardIdByButtonMesh(buttonMesh);
    }

    private setCardBlockerVisibility(cardId: number, isVisible: boolean): void {
        this.cardSelectionBlockerRepository.findBlockerByCardId(cardId)?.setVisibility(isVisible);
    }

    private saveClickedCardCount(deckId: number, cardId: number): void {
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

        const currentSelectedCardCount = this.cardCountManager.findSelectedCardCountByDeck(deckId, cardId);
        const currentSelectedCardCountByGrade = this.cardCountManager.findCardCountByGrade(deckId, grade);

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
        this.cardCountManager.incrementSelectedCardCountByDeck(deckId, cardId);
        this.cardCountManager.incrementCardCountByGrade(deckId, grade);
    }

    private deleteNumberOfRemainingCards(cardId: number): void {
        this.myDeckRemainingCardsRepository.deleteRemainingCardsByCardId(cardId);
    }

    private deleteNumberOfSelectedCards(deckId: number, cardId: number): void {
        const buttonId = this.myDeckNumberOfSelectedCardsRepository.findNumberIdByDeckIdAndCardId(deckId, cardId);
        if (buttonId == null) return;

        this.myDeckNumberOfSelectedCardsRepository.deleteNumberOfSelectedCardsMesh(deckId, buttonId);
        this.myDeckNumberOfSelectedCardsRepository.deleteNumberOfSelectedCards(deckId, buttonId);
    }

    private deleteTotalNumberOfSelectedCards(deckId: number): void {
        this.totalNumberOfSelectedCardsRepository.deleteNumberByDeckId(deckId);
    }

}
