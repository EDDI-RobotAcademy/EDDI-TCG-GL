import * as THREE from "three";
import {CardGrade} from "../../card/grade";
import {CardRace} from "../../card/race";

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
import {DeckCardAddButtonClickDetectRepositoryImpl} from "../../deck_card_add_button_click_detect/repository/DeckCardAddButtonClickDetectRepositoryImpl";
import {RequiredNumberOfCardsRepositoryImpl} from "../../required_number_of_cards_in_the_deck/repository/RequiredNumberOfCardsRepositoryImpl";
import {MyDeckNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_number_of_selected_cards/repository/MyDeckNumberOfSelectedCardsRepositoryImpl";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {MyDeckNumberOfSelectedCardsPositionRepositoryImpl} from "../../my_deck_number_of_selected_cards_position/repository/MyDeckNumberOfSelectedCardsPositionRepositoryImpl";
import {MyDeckBlockPositionRepositoryImpl} from "../../my_deck_block_position/repository/MyDeckBlockPositionRepositoryImpl";
import {MyDeckCardNamePositionRepositoryImpl} from "../../my_deck_card_name_position/repository/MyDeckCardNamePositionRepositoryImpl";
import {DeckCardDeleteButtonRepositoryImpl} from "../../deck_card_delete_button/repository/DeckCardDeleteButtonRepositoryImpl";
import {DeckCardDeleteButtonPositionRepositoryImpl} from "../../deck_card_delete_button_position/repository/DeckCardDeleteButtonPositionRepositoryImpl";
import {DeckCardAddButtonRepositoryImpl} from "../../deck_card_add_button/repository/DeckCardAddButtonRepositoryImpl";
import {DeckCardAddButtonPositionRepositoryImpl} from "../../deck_card_add_button_position/repository/DeckCardAddButtonPositionRepositoryImpl";
import {DeckEditDoneButtonHoverDetectRepositoryImpl} from "../../deck_edit_done_button_hover_detect/repository/DeckEditDoneButtonHoverDetectRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckNumberOfCardsPositionRepositoryImpl} from "../../my_deck_number_of_cards_position/repository/MyDeckNumberOfCardsPositionRepositoryImpl";
import {DeckCardCountMarkerPositionRepositoryImpl} from "../../deck_card_count_marker_position/repository/DeckCardCountMarkerPositionRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../../my_deck_card_search_cancel_button/repository/MyDeckCardSearchCancelButtonRepositoryImpl";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../../deck_card_search_cancel_button_click_detect/repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";
import {MyDeckRemainingCardsPositionRepositoryImpl} from "../../my_deck_remaining_cards_position/repository/MyDeckRemainingCardsPositionRepositoryImpl";
import {CardFilterGradeOptionClickDetectRepositoryImpl} from "../../card_filter_grade_option_click_detect/repository/CardFilterGradeOptionClickDetectRepositoryImpl";
import {CardFilterRaceOptionClickDetectRepositoryImpl} from "../../card_filter_race_option_click_detect/repository/CardFilterRaceOptionClickDetectRepositoryImpl";
import {CardFilterGradeOptionInactiveRepositoryImpl} from "../../card_filter_grade_option_inactive/repository/CardFilterGradeOptionInactiveRepositoryImpl";
import {CardFilterGradeOptionActiveRepositoryImpl} from "../../card_filter_grade_option_active/repository/CardFilterGradeOptionActiveRepositoryImpl";
import {CardFilterRaceOptionInactiveRepositoryImpl} from "../../card_filter_race_option_inactive/repository/CardFilterRaceOptionInactiveRepositoryImpl";
import {CardFilterRaceOptionActiveRepositoryImpl} from "../../card_filter_race_option_active/repository/CardFilterRaceOptionActiveRepositoryImpl";
import {MyDeckOwnedCardsPositionRepositoryImpl} from "../../my_deck_owned_cards_position/repository/MyDeckOwnedCardsPositionRepositoryImpl";
import {CardSelectionBlockerPositionRepositoryImpl} from "../../card_selection_blocker_position/repository/CardSelectionBlockerPositionRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash_position/repository/MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl";
import {MyDeckTotalOwnedCardsPositionRepositoryImpl} from "../../my_deck_total_owned_cards_position/repository/MyDeckTotalOwnedCardsPositionRepositoryImpl";

import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";
import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";

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
    private deckCardAddButtonClickDetectRepository: DeckCardAddButtonClickDetectRepositoryImpl;
    private requiredNumberOfCardsRepository: RequiredNumberOfCardsRepositoryImpl;
    private myDeckNumberOfSelectedCardsRepository: MyDeckNumberOfSelectedCardsRepositoryImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private myDeckNumberOfSelectedCardsPositionRepository: MyDeckNumberOfSelectedCardsPositionRepositoryImpl;
    private myDeckBlockPositionRepository: MyDeckBlockPositionRepositoryImpl;
    private myDeckCardNamePositionRepository: MyDeckCardNamePositionRepositoryImpl;
    private deckCardDeleteButtonRepository: DeckCardDeleteButtonRepositoryImpl;
    private deckCardDeleteButtonPositionRepository: DeckCardDeleteButtonPositionRepositoryImpl;
    private deckCardAddButtonRepository: DeckCardAddButtonRepositoryImpl;
    private deckCardAddButtonPositionRepository: DeckCardAddButtonPositionRepositoryImpl;
    private deckEditDoneButtonHoverDetectRepository: DeckEditDoneButtonHoverDetectRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckNumberOfCardsPositionRepository: MyDeckNumberOfCardsPositionRepositoryImpl;
    private deckCardCountMarkerPositionRepository: DeckCardCountMarkerPositionRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private myDeckRemainingCardsPositionRepository: MyDeckRemainingCardsPositionRepositoryImpl;
    private cardFilterGradeOptionClickDetectRepository: CardFilterGradeOptionClickDetectRepositoryImpl;
    private cardFilterRaceOptionClickDetectRepository: CardFilterRaceOptionClickDetectRepositoryImpl;
    private cardFilterGradeOptionInactiveRepository: CardFilterGradeOptionInactiveRepositoryImpl;
    private cardFilterGradeOptionActiveRepository: CardFilterGradeOptionActiveRepositoryImpl;
    private cardFilterRaceOptionInactiveRepository: CardFilterRaceOptionInactiveRepositoryImpl;
    private cardFilterRaceOptionActiveRepository: CardFilterRaceOptionActiveRepositoryImpl;
    private myDeckOwnedCardsPositionRepository: MyDeckOwnedCardsPositionRepositoryImpl;
    private cardSelectionBlockerPositionRepository: CardSelectionBlockerPositionRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashPositionRepository: MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl;
    private myDeckTotalOwnedCardsPositionRepository: MyDeckTotalOwnedCardsPositionRepositoryImpl;
    private cardCountManager: CardCountManager;
    private myDeckElementAdjuster: MyDeckElementAdjuster;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.totalNumberOfSelectedCardsRepository = TotalNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckChosenOutOfTotalSlashRepository = MyDeckChosenOutOfTotalSlashRepositoryImpl.getInstance();
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.myDeckOwnedCardsClickDetectRepository = MyDeckOwnedCardsClickDetectRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonClickDetectRepository = DeckCardDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardAddButtonClickDetectRepository = DeckCardAddButtonClickDetectRepositoryImpl.getInstance();
        this.requiredNumberOfCardsRepository = RequiredNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsPositionRepository = MyDeckNumberOfSelectedCardsPositionRepositoryImpl.getInstance();
        this.myDeckBlockPositionRepository = MyDeckBlockPositionRepositoryImpl.getInstance();
        this.myDeckCardNamePositionRepository = MyDeckCardNamePositionRepositoryImpl.getInstance();
        this.deckCardDeleteButtonRepository = DeckCardDeleteButtonRepositoryImpl.getInstance(scene);
        this.deckCardDeleteButtonPositionRepository = DeckCardDeleteButtonPositionRepositoryImpl.getInstance();
        this.deckCardAddButtonRepository = DeckCardAddButtonRepositoryImpl.getInstance(scene);
        this.deckCardAddButtonPositionRepository = DeckCardAddButtonPositionRepositoryImpl.getInstance();
        this.deckEditDoneButtonHoverDetectRepository = DeckEditDoneButtonHoverDetectRepositoryImpl.getInstance();
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsPositionRepository = MyDeckNumberOfCardsPositionRepositoryImpl.getInstance();
        this.deckCardCountMarkerPositionRepository = DeckCardCountMarkerPositionRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckRemainingCardsPositionRepository = MyDeckRemainingCardsPositionRepositoryImpl.getInstance();
        this.cardFilterGradeOptionClickDetectRepository = CardFilterGradeOptionClickDetectRepositoryImpl.getInstance();
        this.cardFilterRaceOptionClickDetectRepository = CardFilterRaceOptionClickDetectRepositoryImpl.getInstance();
        this.cardFilterGradeOptionInactiveRepository = CardFilterGradeOptionInactiveRepositoryImpl.getInstance(scene);
        this.cardFilterGradeOptionActiveRepository = CardFilterGradeOptionActiveRepositoryImpl.getInstance(scene);
        this.cardFilterRaceOptionInactiveRepository = CardFilterRaceOptionInactiveRepositoryImpl.getInstance(scene);
        this.cardFilterRaceOptionActiveRepository = CardFilterRaceOptionActiveRepositoryImpl.getInstance(scene);
        this.myDeckOwnedCardsPositionRepository = MyDeckOwnedCardsPositionRepositoryImpl.getInstance();
        this.cardSelectionBlockerPositionRepository = CardSelectionBlockerPositionRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashPositionRepository = MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsPositionRepository = MyDeckTotalOwnedCardsPositionRepositoryImpl.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
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
                const searchInputText = this.myDeckSearchInputContainerRepository.findInputValue();
                if (searchInputText !== null && searchInputText.length > 0) {
                    this.myDeckSearchInputContainerRepository.clearUserInput();
                }

                this.setSearchCancelButtonVisibility(false);
                this.setSearchCancelButtonClickEnabled(false);

                this.saveCurrentButtonClickState(true);
                console.log(`[DEBUG] Clicked Deck Edit Button`);
                console.log(`%c Clicked Deck Edit Button`, 'color: #ffbb00; font-weight: bold;');

                this.resetFilterGradeOptionState();
                this.resetFilterRaceOptionState();

                const currentClickedDeckId = this.getCurrentClickedDeckId();
                if (currentClickedDeckId !== null) {
                    console.log(`Deck Id?: ${currentClickedDeckId}`);
                    this.restoreAllMyDeckCardPositions(currentClickedDeckId);
                    this.restoreAllMyDeckNumberOfCardsPositions(currentClickedDeckId);
                    this.restoreAllMyDeckMarkerPositions(currentClickedDeckId);

                    this.setMyDeckCardVisibilityByDeckId(currentClickedDeckId, false);
                    this.setMyDeckNumberOfCards(currentClickedDeckId, false);
                    this.setTotalNumberOfSelectedCardsVisibility(currentClickedDeckId, true);
                    this.setDeckCardCountMarkerVisibilityByDeckId(currentClickedDeckId, false);
                    this.saveClonedOriginalDeckState(currentClickedDeckId);
                }

                this.setDeckEditButtonVisibility(false);
                this.setDeckEditDoneButtonVisibility(true);
                this.setChosenOutOfTotalSlashVisibility(true);
                this.setRequiredNumberOfCardsVisibility(true);

                this.setOwnedCardsVisibility(true);
                this.initializeBlockerVisibility();
                this.setNumberOfRemainingCardsVisibility(true);
                this.setNumberOfTotalOwnedCardsVisibility(true);
                this.setRemainingOutOfTotalSlashVisibility(true);

                this.restoreDeckEditObjects(); // To-do: 수정 필요

                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckEditButton | null> {
        if (!this.isButtonClickEnabled()) return null;
        if (this.getDeckEditButtonVisibility() == false) return null;

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
        this.myDeckOwnedCardsClickDetectRepository.setAllCardClickEnabled(true);
        this.saveMyDeckOwnedCardsClickEnable();
        this.myDeckBlockHoverDetectRepository.setBlockHoverEnabled(true);
        this.deckEditDoneButtonHoverDetectRepository.setButtonHoverEnabled(true);
    }

    private saveMyDeckOwnedCardsClickEnable(): void {
        const allCardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();
        for (const cardId of allCardIdList) {
            this.myDeckOwnedCardsClickDetectRepository.saveCardClickEnabled(cardId, true);
        }
    }

    private resetFilterGradeOptionState(): void {
        const clickedGradeOptionTypes = this.getClickedGradeOptionTypes();
        if (clickedGradeOptionTypes !== null) {
            for (const gradeOptionType of clickedGradeOptionTypes) {
                this.cardFilterGradeOptionClickDetectRepository.saveOptionClickState(gradeOptionType, false);
                this.cardFilterGradeOptionActiveRepository.findGradeOptionByType(gradeOptionType)?.setVisibility(false);
            }
        }
    }

    private resetFilterRaceOptionState(): void {
        const clickedRaceOptionTypes = this.getClickedRaceOptionTypes();
        if (clickedRaceOptionTypes !== null) {
            for (const raceOptionType of clickedRaceOptionTypes) {
                this.cardFilterRaceOptionClickDetectRepository.saveOptionClickState(raceOptionType, false);
                this.cardFilterRaceOptionActiveRepository.findRaceOptionByType(raceOptionType)?.setVisibility(false);
            }
        }
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

    private getTotalNumberOfSelectedCardsByDeckId(deckId: number): TotalNumberOfSelectedCards | null {
        return this.totalNumberOfSelectedCardsRepository.findNumberByDeckId(deckId);
    }

    private getCurrentClickedDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

    private getCardIdByCardUniqueId(cardUniqueId: number): number | null {
        return this.myDeckOwnedCardsRepository.findCardIdByCardUniqueId(cardUniqueId);
    }

    private getDeckEditButtonVisibility(): boolean | undefined {
        const button = this.getDeckEditButton();
        if (button !== null) {
            return button.getVisibility();
        }
    }

    private getClickedGradeOptionTypes(): CardGrade[] | null {
        return this.cardFilterGradeOptionClickDetectRepository.findClickedOptionTypes();
    }

    private getClickedRaceOptionTypes(): CardRace[] | null {
        return this.cardFilterRaceOptionClickDetectRepository.findClickedOptionTypes();
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

    private setRequiredNumberOfCardsVisibility(isVisible: boolean): void {
        const requiredNumber = this.requiredNumberOfCardsRepository.findNumber();
        if (requiredNumber !== null) {
            requiredNumber.setVisibility(isVisible);
        } else {
            console.log(`Not Found Required Number Of Cards`);
        }
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

    private setCardBlockerVisibility(cardId: number, isVisible: boolean): void {
        const blocker = this.cardSelectionBlockerRepository.findBlockerByCardId(cardId);
        if (blocker !== null) {
            blocker.setVisibility(isVisible);
        }
    }

    private setOwnedCardsVisibility(isVisible: boolean): void {
        this.myDeckOwnedCardsRepository.findAllCards()?.forEach(card =>
            card.setVisibility(isVisible)
        );
    }

    private setNumberOfRemainingCardsVisibility(isVisible: boolean): void {
        this.myDeckRemainingCardsRepository.findAllRemainingCardsList()?.forEach(numberMesh =>
            numberMesh.setVisibility(isVisible)
        );
    }

    private setNumberOfTotalOwnedCardsVisibility(isVisible: boolean): void {
        this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsList()?.forEach(numberMesh =>
            numberMesh.setVisibility(isVisible)
        );
    }

    private setRemainingOutOfTotalSlashVisibility(isVisible: boolean): void {
        this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashList()?.forEach(slash =>
            slash.setVisibility(isVisible)
        );
    }

    private setSearchCancelButtonVisibility(isVisible: boolean): void {
        this.myDeckCardSearchCancelButtonRepository.findButton()?.setVisibility(isVisible);
    }

    private setSearchCancelButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private initializeBlockerVisibility(): void {
        const cardIdList = this.cardSelectionBlockerRepository.findAllCardIdList();
        if (cardIdList == null) return;

        for (const cardId of cardIdList) {
            const blocker = this.cardSelectionBlockerRepository.findBlockerByCardId(cardId);
            if (blocker == null) return;

            const remainingCardCount = this.cardCountManager.findRemainingCardCountByCardId(cardId);
            if (remainingCardCount !== null && remainingCardCount == 0) {
                blocker.setVisibility(true);
            }
        }
    }

    private hideAllCardBlocker(): void {
        const allBlockers = this.cardSelectionBlockerRepository.findAllBlockers();
        allBlockers.forEach((blocker) => blocker.setVisibility(false));
    }

    private saveClonedOriginalDeckState(currentClickedDeckId: number): void {
        this.myDeckNumberOfSelectedCardsRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.myDeckNumberOfSelectedCardsPositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.myDeckBlockRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.myDeckBlockPositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.myDeckCardNameRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.myDeckCardNamePositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.deckCardDeleteButtonRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.deckCardDeleteButtonPositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.deckCardAddButtonRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.deckCardAddButtonPositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.myDeckCardRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.myDeckCardPositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.myDeckNumberOfCardsRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.myDeckNumberOfCardsPositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.deckCardCountMarkerRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.deckCardCountMarkerPositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.totalNumberOfSelectedCardsRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.cardCountManager.cloneRemainingCardCount();
        this.cardCountManager.cloneSelectedCardCount();
        this.cardCountManager.cloneCardCountByGrade();
        this.myDeckRemainingCardsRepository.saveClonedOriginalRemainingCardsState();
        this.myDeckRemainingCardsPositionRepository.saveClonedOriginalPositionState();
    }

    private restoreAllMyDeckCardPositions(deckId: number): void {
        const cardUniqueIdList = this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
        for (const cardUniqueId of cardUniqueIdList) {
            const cardId = this.myDeckCardRepository.findCardIdByCardUniqueId(cardUniqueId);
            if (cardId == null) return;

            const card = this.myDeckCardRepository.findCardByDeckIdAndCardId(deckId, cardId);
            if (card == null) return;
            const cardMesh = card.getMesh();

            const cardPosition = this.myDeckCardPositionRepository.findPositionByDeckIdAndCardId(deckId, cardId);
            if (cardPosition == null) return;

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private restoreAllMyDeckNumberOfCardsPositions(deckId: number): void {
        const numberIdList = this.myDeckNumberOfCardsRepository.findNumberIdListByDeckId(deckId);
        for (const numberId of numberIdList) {
            const cardId = this.myDeckNumberOfCardsRepository.findCardIdByNumberId(numberId);
            if (cardId == null) return;

            const numberOfCards = this.myDeckNumberOfCardsRepository.findNumberByDeckIdAndCardId(deckId, cardId);
            if (numberOfCards == null) return;
            const numberOfCardsMesh = numberOfCards.getMesh();

            const numberPosition = this.myDeckNumberOfCardsPositionRepository.findPositionByDeckIdAndCardId(deckId, cardId);
            if (numberPosition == null) return;

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberOfCardsMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private restoreAllMyDeckMarkerPositions(deckId: number): void {
        const markerIdList = this.deckCardCountMarkerRepository.findMarkerIdListByDeckId(deckId);
        for (const markerId of markerIdList) {
            const cardId = this.deckCardCountMarkerRepository.findCardIdByMarkerId(markerId);
            if (cardId == null) return;

            const marker = this.deckCardCountMarkerRepository.findMarkerByDeckIdAndCardId(deckId, cardId);
            if (marker == null) return;
            const markerMesh = marker.getMesh();

            const markerPosition = this.deckCardCountMarkerPositionRepository.findPositionByDeckIdAndCardId(deckId, cardId);
            if (markerPosition == null) return;

            const widthPercent = 0.012;
            const heightPercent = 1;
            const positionX = markerPosition.getX();
            const positionY = markerPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(markerMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private restoreDeckEditObjects(): void {
        this.restoreAllOwnedCardPositions();
        this.restoreAllCardBlockerPositions();
        this.restoreAllNumberOfRemainingCardsPositions();
        this.restoreAllSlashesPositions();
        this.restoreAllNumberOfTotalOwnedCardsPositions();
    }

    private restoreAllOwnedCardPositions(): void {
        const cardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();
        for (const cardId of cardIdList) {
            const card = this.myDeckOwnedCardsRepository.findCardByCardId(cardId);
            if (card == null) return;
            const cardMesh = card.getMesh();

            const cardPosition = this.myDeckOwnedCardsPositionRepository.findPositionByCardId(cardId);
            if (cardPosition == null) return;

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private restoreAllCardBlockerPositions(): void {
        const cardIdList = this.cardSelectionBlockerRepository.findAllCardIdList();
        for (const cardId of cardIdList) {
            const blocker = this.cardSelectionBlockerRepository.findBlockerByCardId(cardId);
            if (blocker == null) return;
            const blockerMesh = blocker.getMesh();

            const blockerPosition = this.cardSelectionBlockerPositionRepository.findPositionByCardId(cardId);
            if (blockerPosition == null) return;

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = blockerPosition.getX();
            const positionY = blockerPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(blockerMesh, widthPercent, heightPercent, positionX, positionY);

            const remainingCardCount = this.cardCountManager.findRemainingCardCountByCardId(cardId);
            if (remainingCardCount !== null && remainingCardCount == 0) {
                blocker.setVisibility(true);
            } else {
                blocker.setVisibility(false);
            }
        }
    }

    private restoreAllNumberOfRemainingCardsPositions(): void {
        const cardIdList = this.myDeckRemainingCardsRepository.findAllCardIdList();
        for (const cardId of cardIdList) {
            const numberObject = this.myDeckRemainingCardsRepository.findRemainingCardByCardId(cardId);
            if (numberObject == null) return;
            const numberMesh = numberObject.getMesh();

            const numberPosition = this.myDeckRemainingCardsPositionRepository.findPositionByCardId(cardId);
            if (numberPosition == null) return;

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private restoreAllSlashesPositions(): void {
        const slashIdList = this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashIdList();
        for (const slashId of slashIdList) {
            const slash = this.myDeckRemainingOutOfTotalSlashRepository.findSlashById(slashId);
            if (slash == null) return;
            const slashMesh = slash.getMesh();

            const slashPosition = this.myDeckRemainingOutOfTotalSlashPositionRepository.findPositionByPositionId(slashId);
            if (slashPosition == null) return;

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = slashPosition.getX();
            const positionY = slashPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(slashMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private restoreAllNumberOfTotalOwnedCardsPositions(): void {
        const numberIdList = this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsIdList();
        for (const numberId of numberIdList) {
            const numberObject = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsById(numberId);
            if (numberObject == null) return;
            const numberMesh = numberObject.getMesh();

            const numberPosition = this.myDeckTotalOwnedCardsPositionRepository.findPositionByPositionId(numberId);
            if (numberPosition == null) return;

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

}
