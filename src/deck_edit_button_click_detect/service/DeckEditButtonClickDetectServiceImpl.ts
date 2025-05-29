import * as THREE from "three";

import {DeckEditButton} from "../../deck_edit_button/entity/DeckEditButton";
import {MyDeckOwnedCards} from "../../my_deck_owned_cards/entity/MyDeckOwnedCards";
import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";
import {MyDeckTotalOwnedCards} from "../../my_deck_total_owned_cards/entity/MyDeckTotalOwnedCards";

import {DeckEditButtonClickDetectService} from "./DeckEditButtonClickDetectService";
import {DeckEditButtonClickDetectRepositoryImpl} from "../repository/DeckEditButtonClickDetectRepositoryImpl";
import {DeckEditButtonRepositoryImpl} from "../../deck_edit_button/repository/DeckEditButtonRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {DeckEditDoneButtonRepositoryImpl} from "../../deck_edit_done_button/repository/DeckEditDoneButtonRepositoryImpl";
import {MyDeckCardMapRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardMapRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {CardStateManager} from "../../my_deck_card_manager/CardStateManager";

export class DeckEditButtonClickDetectServiceImpl implements DeckEditButtonClickDetectService {
    private static instance: DeckEditButtonClickDetectServiceImpl | null = null;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private deckEditButtonRepository: DeckEditButtonRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;
    private myDeckCardMapRepository: MyDeckCardMapRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private cardStateManager: CardStateManager;
    private cameraRepository: CameraRepository;
    private buttonClickEnabled: boolean = true;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance();
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();

        this.cardStateManager = CardStateManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckEditButtonClickDetectServiceImpl {
        if (!DeckEditButtonClickDetectServiceImpl.instance) {
            DeckEditButtonClickDetectServiceImpl.instance = new DeckEditButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckEditButtonClickDetectServiceImpl.instance;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

    public async handleClick(clickPoint: { x: number; y: number }): Promise<DeckEditButton | null> {
        const { x, y } = clickPoint;
        const button = this.getDeckEditButton();
        if (button !== null) {
            const clickedButton = this.deckEditButtonClickDetectRepository.isDeckEditButtonClicked(
                { x, y },
                button,
                this.camera);

            if (clickedButton) {
                this.saveCurrentButtonClickState(true);
                console.log(`[DEBUG] Clicked Deck Edit Button`);

//                 this.hideAllCardBlocker();
                const currentClickedDeckButtonId = this.getCurrentClickedDeckButtonId();
                if (currentClickedDeckButtonId !== null) {
                    console.log(`Deck Button Id?: ${currentClickedDeckButtonId}`);
                    this.setMyDeckCardVisibilityByDeckId(currentClickedDeckButtonId, false);
                    this.setMyDeckNumberOfCards(currentClickedDeckButtonId, false);
                    this.showCardBlockersForFullyUsedCards(currentClickedDeckButtonId);
                }

                this.setDeckEditButtonVisibility(false);
                this.setDeckEditDoneButtonVisibility(true);
                this.setOwnedCardsVisibility(true);
                this.setTotalOwnedCardsVisibility(true);
                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckEditButton | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleClick(clickPoint);
        }
        return null;
    }

    private getDeckEditButton(): DeckEditButton | null {
        return this.deckEditButtonRepository.findButtonById(0);
    }

    private getDeckEditDoneButton(): DeckEditDoneButton | null {
        return this.deckEditDoneButtonRepository.findButtonById(0);
    }

    private setDeckEditButtonVisibility(isVisible: boolean): void {
        this.getDeckEditButton()?.setVisibility(isVisible);
    }

    private setDeckEditDoneButtonVisibility(isVisible: boolean): void {
        this.getDeckEditDoneButton()?.setVisibility(isVisible);
    }

    private saveCurrentButtonClickState(state: boolean): void {
        this.deckEditButtonClickDetectRepository.saveCurrentButtonClickState(state);
    }

    private getAllOwnedCards(): MyDeckOwnedCards[] {
        return this.myDeckOwnedCardsRepository.findAllCards();
    }

    private getAllTotalOwnedCards(): MyDeckTotalOwnedCards[] {
        return this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsList();
    }

    private setMyDeckNumberOfCards(deckId: number, isVisible: boolean): void {
        const numberList = this.myDeckNumberOfCardsRepository.findNumberListByDeckId(deckId);
        numberList?.forEach((number) => number.setVisibility(isVisible));
    }

    private setOwnedCardsVisibility(isVisible: boolean): void {
        const allCards = this.getAllOwnedCards();
        allCards.forEach((card) => card.setVisibility(isVisible));
    }

    private setTotalOwnedCardsVisibility(isVisible: boolean): void {
        this.getAllTotalOwnedCards().forEach((totalOwnedCards) => totalOwnedCards.setVisibility(isVisible));
    }

    private setMyDeckCardVisibility(deckId: number, cardId: number, isVisible: boolean): void {
        this.cardStateManager.setCardVisibility(deckId, cardId, isVisible);
    }

    private setMyDeckCardVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        const cardUniqueIdList = this.getMyDeckCardUniqueIdListByDeckId(deckId);
        cardUniqueIdList.forEach((cardUniqueId) => {
            this.setMyDeckCardVisibility(deckId, cardUniqueId, isVisible);
        });
    }

    private getMyDeckCardUniqueIdListByDeckId(deckId: number): number[] {
        return this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
    }

    private getCurrentClickedDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    // 카드 개수 객체(카드 아래 개수 표시) 만들면 해당 repository 에서 가져오는 걸로 수정해야 함
    private getMyDeckCardCountByDeckIdAndCardId(deckId: number, cardId: number): number {
        return this.myDeckCardMapRepository.findCardCountByDeckIdAndCardId(deckId, cardId);
    }

    private getOwnedCardCountByCardUniqueId(cardUniqueId: number): number | null {
        return this.myDeckOwnedCardsRepository.getCardCountByCardUniqueId(cardUniqueId);
    }

    private getCardUniqueIdListByDeckId(deckId: number): number[] {
        return this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
    }

    private getCardIdByCardUniqueId(cardUniqueId: number): number | null {
        return this.myDeckOwnedCardsRepository.findCardIdByCardUniqueId(cardUniqueId);
    }

    // 덱에 이미 최대한으로 사용된 카드들에 대해 선택을 막는 blocker 를 표시
    private showCardBlockersForFullyUsedCards(deckId: number): void {
        const cardUniqueIdList = this.getCardUniqueIdListByDeckId(deckId);
        cardUniqueIdList.forEach((cardUniqueId) => {
            const ownedCardCount = this.getOwnedCardCountByCardUniqueId(cardUniqueId);
            const cardId = this.getCardIdByCardUniqueId(cardUniqueId);

            if (ownedCardCount == null || cardId == null) return;

            const cardCount = this.getMyDeckCardCountByDeckIdAndCardId(deckId, cardId);

            if (ownedCardCount === cardCount) {
                this.setCardBlockerVisibility(cardId, true);
            }
        });
    }

    private setCardBlockerVisibility(cardId: number, isVisible: boolean): void {
        const blocker = this.cardSelectionBlockerRepository.findBlockerByCardId(cardId);
        if (blocker !== null) {
            blocker.setVisibility(isVisible);
        }
    }

    private hideAllCardBlocker(): void {
        const allBlockers = this.cardSelectionBlockerRepository.findAllBlockers();
        allBlockers.forEach((blocker) => blocker.setVisibility(false));
    }

}
