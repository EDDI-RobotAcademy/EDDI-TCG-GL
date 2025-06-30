import * as THREE from "three";

import {DeckEditButton} from "../../deck_edit_button/entity/DeckEditButton";
import {MyDeckOwnedCards} from "../../my_deck_owned_cards/entity/MyDeckOwnedCards";
import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";
import {MyDeckTotalOwnedCards} from "../../my_deck_total_owned_cards/entity/MyDeckTotalOwnedCards";
import {MyDeckRemainingCards} from "../../my_deck_remaining_cards/entity/MyDeckRemainingCards";
import {MyDeckRemainingOutOfTotalSlash} from "../../my_deck_remaining_out_of_total_slash/entity/MyDeckRemainingOutOfTotalSlash";
import {TotalNumberOfSelectedCards} from "../../my_deck_total_number_of_selected_cards/entity/TotalNumberOfSelectedCards";
import {MyDeckChosenOutOfTotalSlash} from "../../my_deck_chosen_out_of_total_slash/entity/MyDeckChosenOutOfTotalSlash";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
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
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash/repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {TotalNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_total_number_of_selected_cards/repository/TotalNumberOfSelectedCardsRepositoryImpl";
import {MyDeckChosenOutOfTotalSlashRepositoryImpl} from "../../my_deck_chosen_out_of_total_slash/repository/MyDeckChosenOutOfTotalSlashRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {MyDeckOwnedCardsClickDetectRepositoryImpl} from "../../deck_owned_cards_click_detect/repository/MyDeckOwnedCardsClickDetectRepositoryImpl";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../../my_deck_block_hover_detect/repository/MyDeckBlockHoverDetectRepositoryImpl";
import {DeckCardDeleteButtonClickDetectRepositoryImpl} from "../../deck_card_delete_button_click_detect/repository/DeckCardDeleteButtonClickDetectRepositoryImpl";

export class DeckEditButtonClickDetectServiceImpl implements DeckEditButtonClickDetectService {
    private static instance: DeckEditButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
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
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private totalNumberOfSelectedCardsRepository: TotalNumberOfSelectedCardsRepositoryImpl;
    private myDeckChosenOutOfTotalSlashRepository: MyDeckChosenOutOfTotalSlashRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private myDeckOwnedCardsClickDetectRepository: MyDeckOwnedCardsClickDetectRepositoryImpl;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;
    private deckCardDeleteButtonClickDetectRepository: DeckCardDeleteButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.totalNumberOfSelectedCardsRepository = TotalNumberOfSelectedCardsRepositoryImpl.getInstance();
        this.myDeckChosenOutOfTotalSlashRepository = MyDeckChosenOutOfTotalSlashRepositoryImpl.getInstance();
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.myDeckOwnedCardsClickDetectRepository = MyDeckOwnedCardsClickDetectRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonClickDetectRepository = DeckCardDeleteButtonClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckEditButtonClickDetectServiceImpl {
        if (!DeckEditButtonClickDetectServiceImpl.instance) {
            DeckEditButtonClickDetectServiceImpl.instance = new DeckEditButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckEditButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckEditButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckEditButtonClickDetectRepository.isButtonClickEnabled();
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
                this.resetScrollTargetPositions();

//                 this.hideAllCardBlocker();
                const currentClickedDeckButtonId = this.getCurrentClickedDeckButtonId();
                if (currentClickedDeckButtonId !== null) {
                    console.log(`Deck Button Id?: ${currentClickedDeckButtonId}`);
                    this.setMyDeckCardVisibilityByDeckId(currentClickedDeckButtonId, false);
                    this.setMyDeckNumberOfCards(currentClickedDeckButtonId, false);
                    this.showCardBlockersForFullyUsedCards(currentClickedDeckButtonId);
                    this.setTotalNumberOfSelectedCardsVisibility(currentClickedDeckButtonId, true);
                    this.setDeckCardCountMarkerVisibilityByDeckId(currentClickedDeckButtonId, false);
                }

                this.setDeckEditButtonVisibility(false);
                this.setDeckEditDoneButtonVisibility(true);
                this.setOwnedCardsVisibility(true);
                this.setTotalOwnedCardsVisibility(true);
                this.setRemainingCardsVisibility(true);
                this.setRemainingOutOfTotalSlashVisibility(true);
                this.setChosenOutOfTotalSlashVisibility(true);
                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckEditButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleClick(clickPoint);
            if (result) {
                this.setInteractionStatesAfterClick();
                return result;
            }
        }
        return null;
    }

    private setInteractionStatesAfterClick(): void {
        this.myDeckOwnedCardsClickDetectRepository.setCardClickEnabled(true);
        this.myDeckBlockHoverDetectRepository.setBlockHoverEnabled(true);
        this.deckCardDeleteButtonClickDetectRepository.setButtonClickEnabled(true);
    }

    private getDeckEditButton(): DeckEditButton | null {
        return this.deckEditButtonRepository.findButtonById(0);
    }

    private getDeckEditDoneButton(): DeckEditDoneButton | null {
        return this.deckEditDoneButtonRepository.findButtonById(0);
    }

    private saveCurrentButtonClickState(state: boolean): void {
        this.deckEditButtonClickDetectRepository.saveCurrentButtonClickState(state);
    }

    public getCurrentButtonClickState(): boolean | null {
        return this.deckEditButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private getAllOwnedCards(): MyDeckOwnedCards[] {
        return this.myDeckOwnedCardsRepository.findAllCards();
    }

    private getAllTotalOwnedCards(): MyDeckTotalOwnedCards[] {
        return this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsList();
    }

    private getAllRemainingCards(): MyDeckRemainingCards[] {
        return this.myDeckRemainingCardsRepository.findAllRemainingCardsList();
    }

    private getAllRemainingOutOfTotalSlash(): MyDeckRemainingOutOfTotalSlash[] {
        return this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashList();
    }

    private getTotalNumberOfSelectedCardsByDeckId(deckId: number): TotalNumberOfSelectedCards | null {
        return this.totalNumberOfSelectedCardsRepository.findNumberByDeckId(deckId);
    }

    private getCurrentClickedDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private getRemainingCardCount(remainingCardsId: number): number {
        return this.myDeckRemainingCardsRepository.findRemainingCardCountById(remainingCardsId);
    }

    private getOwnedCardCountByCardUniqueId(cardUniqueId: number): number | null {
        return this.myDeckOwnedCardsRepository.getCardCountByCardUniqueId(cardUniqueId);
    }

    private getCardIdByCardUniqueId(cardUniqueId: number): number | null {
        return this.myDeckOwnedCardsRepository.findCardIdByCardUniqueId(cardUniqueId);
    }

    private setDeckEditButtonVisibility(isVisible: boolean): void {
        this.getDeckEditButton()?.setVisibility(isVisible);
    }

    private setDeckEditDoneButtonVisibility(isVisible: boolean): void {
        this.getDeckEditDoneButton()?.setVisibility(isVisible);
    }

    private setChosenOutOfTotalSlashVisibility(isVisible: boolean): void {
        const slash = this.myDeckChosenOutOfTotalSlashRepository.findSlash();
        if (slash !== null) {
            slash.setVisibility(isVisible);
        } else {
            console.log(`Not Found Chosen Out Of Total Slash`);
        }
    }

    private setMyDeckNumberOfCards(deckId: number, isVisible: boolean): void {
        const numberList = this.myDeckNumberOfCardsRepository.findNumberListByDeckId(deckId);
        numberList?.forEach((number) => number.setVisibility(isVisible));
    }

    private setTotalNumberOfSelectedCardsVisibility(deckId: number, isVisible: boolean): void {
        const totalNumber = this.getTotalNumberOfSelectedCardsByDeckId(deckId);
        if (totalNumber !== null) {
            totalNumber.setVisibility(isVisible);
        } else {
            console.log(`Not Found Total Number Of Selected Cards (Deck ID: ${deckId})`);
        }
    }

    private setOwnedCardsVisibility(isVisible: boolean): void {
        const allCards = this.getAllOwnedCards();
        allCards.forEach((card) => card.setVisibility(isVisible));
    }

    private setTotalOwnedCardsVisibility(isVisible: boolean): void {
        this.getAllTotalOwnedCards().forEach((totalOwnedCards) => totalOwnedCards.setVisibility(isVisible));
    }

    private setRemainingCardsVisibility(isVisible: boolean): void {
        this.getAllRemainingCards().forEach((remainingCards) => remainingCards.setVisibility(isVisible));
    }

    private setRemainingOutOfTotalSlashVisibility(isVisible: boolean): void {
        this.getAllRemainingOutOfTotalSlash().forEach((slash) => slash.setVisibility(isVisible));
    }

    private setMyDeckCardVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckCardRepository.findCardListByDeckId(deckId)?.forEach(card =>
            card.setVisibility(isVisible)
        );
    }

    private setDeckCardCountMarkerVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.deckCardCountMarkerRepository.findMarkerListByDeckId(deckId)?.forEach(marker =>
            marker.setVisibility(isVisible)
        );
    }

    // 덱에 이미 최대한으로 사용된 카드들에 대해 선택을 막는 blocker 를 표시
    private showCardBlockersForFullyUsedCards(deckId: number): void {
        const cardUniqueIdList = this.cardSelectionBlockerRepository.findAllBlockerIdList();
        cardUniqueIdList.forEach((cardUniqueId) => {
            const cardId = this.getCardIdByCardUniqueId(cardUniqueId);
            if (cardId == null) return;
            const remainingCardCount = this.getRemainingCardCount(cardUniqueId);

            if (remainingCardCount == 0) {
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

    private getOwnedCardGroup(): THREE.Group {
        return this.myDeckOwnedCardsRepository.findCardGroup();
    }

    private getCardSelectionBlockerGroup(): THREE.Group {
        return this.cardSelectionBlockerRepository.findBlockerGroup();
    }

    private getTotalOwnedCardsGroup(): THREE.Group {
        return this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsGroup();
    }

    private getRemainingCardsGroup(): THREE.Group {
        return this.myDeckRemainingCardsRepository.findRemainingCardsGroup();
    }

    private getRemainingOutOfTotalSlashGroup(): THREE.Group {
        return this.myDeckRemainingOutOfTotalSlashRepository.findSlashGroup();
    }

    private resetScrollTargetPositions(): void {
        const scrollTargets = [
            this.getOwnedCardGroup(),
            this.getCardSelectionBlockerGroup(),
            this.getTotalOwnedCardsGroup(),
            this.getRemainingCardsGroup(),
            this.getRemainingOutOfTotalSlashGroup(),
        ];

        if (scrollTargets.every(target => !target)) return;
        scrollTargets.forEach(target => {
            target.position.y = 0;
        });
    }

}
