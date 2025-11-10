import {CardGrade} from "../../card/grade";
import {CardRace} from "../../card/race";

import {MyDeckButtonClickDetectService} from "./MyDeckButtonClickDetectService";

import {MyDeckButton} from "../../my_deck_button/entity/MyDeckButton";
import {MyDeckButtonEffect} from "../../my_deck_button_effect/entity/MyDeckButtonEffect";
import {DeckCardSearchStateInDeckEditMode} from "../../deck_card_search_input_enter_detect/entity/DeckCardSearchStateInDeckEditMode";

import {MyDeckButtonRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonRepositoryImpl";
import {MyDeckButtonEffectRepositoryImpl} from "../../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {DeckNameEditButtonRepositoryImpl} from "../../deck_name_edit_button/repository/DeckNameEditButtonRepositoryImpl";
import {DeckDeleteButtonRepositoryImpl} from "../../deck_delete_button/repository/DeckDeleteButtonRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {MyDeckNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_number_of_selected_cards/repository/MyDeckNumberOfSelectedCardsRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../../deck_delete_button_click_detect/repository/DeckDeleteButtonClickDetectRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash/repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {MyDeckNumberOfSelectedCardsPositionRepositoryImpl} from "../../my_deck_number_of_selected_cards_position/repository/MyDeckNumberOfSelectedCardsPositionRepositoryImpl";
import {MyDeckBlockPositionRepositoryImpl} from "../../my_deck_block_position/repository/MyDeckBlockPositionRepositoryImpl";
import {MyDeckCardNamePositionRepositoryImpl} from "../../my_deck_card_name_position/repository/MyDeckCardNamePositionRepositoryImpl";
import {DeckEditButtonRepositoryImpl} from "../../deck_edit_button/repository/DeckEditButtonRepositoryImpl";
import {DeckEditDoneButtonRepositoryImpl} from "../../deck_edit_done_button/repository/DeckEditDoneButtonRepositoryImpl";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../../my_deck_block_hover_detect/repository/MyDeckBlockHoverDetectRepositoryImpl";
import {DeckCardDeleteButtonRepositoryImpl} from "../../deck_card_delete_button/repository/DeckCardDeleteButtonRepositoryImpl";
import {DeckCardDeleteButtonPositionRepositoryImpl} from "../../deck_card_delete_button_position/repository/DeckCardDeleteButtonPositionRepositoryImpl";
import {DeckCardAddButtonRepositoryImpl} from "../../deck_card_add_button/repository/DeckCardAddButtonRepositoryImpl";
import {DeckCardAddButtonPositionRepositoryImpl} from "../../deck_card_add_button_position/repository/DeckCardAddButtonPositionRepositoryImpl";
import {DeckEditDoneButtonHoverDetectRepositoryImpl} from "../../deck_edit_done_button_hover_detect/repository/DeckEditDoneButtonHoverDetectRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckNumberOfCardsPositionRepositoryImpl} from "../../my_deck_number_of_cards_position/repository/MyDeckNumberOfCardsPositionRepositoryImpl";
import {DeckCardCountMarkerPositionRepositoryImpl} from "../../deck_card_count_marker_position/repository/DeckCardCountMarkerPositionRepositoryImpl";
import {TotalNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_total_number_of_selected_cards/repository/TotalNumberOfSelectedCardsRepositoryImpl";
import {MyDeckChosenOutOfTotalSlashRepositoryImpl} from "../../my_deck_chosen_out_of_total_slash/repository/MyDeckChosenOutOfTotalSlashRepositoryImpl";
import {RequiredNumberOfCardsRepositoryImpl} from "../../required_number_of_cards_in_the_deck/repository/RequiredNumberOfCardsRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../../my_deck_card_search_cancel_button/repository/MyDeckCardSearchCancelButtonRepositoryImpl";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../../deck_card_search_cancel_button_click_detect/repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";
import {DeckCardSearchInputEnterDetectRepositoryImpl} from "../../deck_card_search_input_enter_detect/repository/DeckCardSearchInputEnterDetectRepositoryImpl";
import {DeckNameEditButtonClickDetectRepositoryImpl} from "../../deck_name_edit_button_click_detect/repository/DeckNameEditButtonClickDetectRepositoryImpl";
import {MyDeckRemainingCardsPositionRepositoryImpl} from "../../my_deck_remaining_cards_position/repository/MyDeckRemainingCardsPositionRepositoryImpl";
import {MyDeckOwnedCardsPositionRepositoryImpl} from "../../my_deck_owned_cards_position/repository/MyDeckOwnedCardsPositionRepositoryImpl";
import {CardSelectionBlockerPositionRepositoryImpl} from "../../card_selection_blocker_position/repository/CardSelectionBlockerPositionRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash_position/repository/MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl";
import {MyDeckTotalOwnedCardsPositionRepositoryImpl} from "../../my_deck_total_owned_cards_position/repository/MyDeckTotalOwnedCardsPositionRepositoryImpl";
import {DeckEditDoneButtonClickDetectRepositoryImpl} from "../../deck_edit_done_button_click_detect/repository/DeckEditDoneButtonClickDetectRepositoryImpl";
import {CardFilterGradeOptionActiveRepositoryImpl} from "../../card_filter_grade_option_active/repository/CardFilterGradeOptionActiveRepositoryImpl";
import {CardFilterRaceOptionActiveRepositoryImpl} from "../../card_filter_race_option_active/repository/CardFilterRaceOptionActiveRepositoryImpl";
import {CardFilterGradeOptionClickDetectRepositoryImpl} from "../../card_filter_grade_option_click_detect/repository/CardFilterGradeOptionClickDetectRepositoryImpl";
import {CardFilterRaceOptionClickDetectRepositoryImpl} from "../../card_filter_race_option_click_detect/repository/CardFilterRaceOptionClickDetectRepositoryImpl";

import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";
import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import * as THREE from "three";

export class MyDeckButtonClickDetectServiceImpl implements MyDeckButtonClickDetectService {
    private static instance: MyDeckButtonClickDetectServiceImpl | null = null;
    private cardCountManager: CardCountManager;
    private myDeckElementAdjuster: MyDeckElementAdjuster;
    private cameraRepository: CameraRepository;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private deckNameEditButtonRepository: DeckNameEditButtonRepositoryImpl;
    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private myDeckNumberOfSelectedCardsRepository: MyDeckNumberOfSelectedCardsRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private myDeckNumberOfSelectedCardsPositionRepository: MyDeckNumberOfSelectedCardsPositionRepositoryImpl;
    private myDeckBlockPositionRepository: MyDeckBlockPositionRepositoryImpl;
    private myDeckCardNamePositionRepository: MyDeckCardNamePositionRepositoryImpl;
    private deckEditButtonRepository: DeckEditButtonRepositoryImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;
    private deckCardDeleteButtonRepository: DeckCardDeleteButtonRepositoryImpl;
    private deckCardDeleteButtonPositionRepository: DeckCardDeleteButtonPositionRepositoryImpl;
    private deckCardAddButtonRepository: DeckCardAddButtonRepositoryImpl;
    private deckCardAddButtonPositionRepository: DeckCardAddButtonPositionRepositoryImpl;
    private deckEditDoneButtonHoverDetectRepository: DeckEditDoneButtonHoverDetectRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckNumberOfCardsPositionRepository: MyDeckNumberOfCardsPositionRepositoryImpl;
    private deckCardCountMarkerPositionRepository: DeckCardCountMarkerPositionRepositoryImpl;
    private totalNumberOfSelectedCardsRepository: TotalNumberOfSelectedCardsRepositoryImpl;
    private myDeckChosenOutOfTotalSlashRepository: MyDeckChosenOutOfTotalSlashRepositoryImpl;
    private requiredNumberOfCardsRepository: RequiredNumberOfCardsRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private deckCardSearchInputEnterDetectRepository: DeckCardSearchInputEnterDetectRepositoryImpl;
    private deckNameEditButtonClickDetectRepository: DeckNameEditButtonClickDetectRepositoryImpl;
    private myDeckRemainingCardsPositionRepository: MyDeckRemainingCardsPositionRepositoryImpl;
    private myDeckOwnedCardsPositionRepository: MyDeckOwnedCardsPositionRepositoryImpl;
    private cardSelectionBlockerPositionRepository: CardSelectionBlockerPositionRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashPositionRepository: MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl;
    private myDeckTotalOwnedCardsPositionRepository: MyDeckTotalOwnedCardsPositionRepositoryImpl;
    private deckEditDoneButtonClickDetectRepository: DeckEditDoneButtonClickDetectRepositoryImpl;
    private cardFilterGradeOptionActiveRepository: CardFilterGradeOptionActiveRepositoryImpl;
    private cardFilterRaceOptionActiveRepository: CardFilterRaceOptionActiveRepositoryImpl;
    private cardFilterGradeOptionClickDetectRepository: CardFilterGradeOptionClickDetectRepositoryImpl;
    private cardFilterRaceOptionClickDetectRepository: CardFilterRaceOptionClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cardCountManager = CardCountManager.getInstance();
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance(scene);
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance(scene);
        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.myDeckNumberOfSelectedCardsPositionRepository = MyDeckNumberOfSelectedCardsPositionRepositoryImpl.getInstance();
        this.myDeckBlockPositionRepository = MyDeckBlockPositionRepositoryImpl.getInstance();
        this.myDeckCardNamePositionRepository = MyDeckCardNamePositionRepositoryImpl.getInstance();
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonRepository = DeckCardDeleteButtonRepositoryImpl.getInstance(scene);
        this.deckCardDeleteButtonPositionRepository = DeckCardDeleteButtonPositionRepositoryImpl.getInstance();
        this.deckCardAddButtonRepository = DeckCardAddButtonRepositoryImpl.getInstance(scene);
        this.deckCardAddButtonPositionRepository = DeckCardAddButtonPositionRepositoryImpl.getInstance();
        this.deckEditDoneButtonHoverDetectRepository = DeckEditDoneButtonHoverDetectRepositoryImpl.getInstance();
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsPositionRepository = MyDeckNumberOfCardsPositionRepositoryImpl.getInstance();
        this.deckCardCountMarkerPositionRepository = DeckCardCountMarkerPositionRepositoryImpl.getInstance();
        this.totalNumberOfSelectedCardsRepository = TotalNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckChosenOutOfTotalSlashRepository = MyDeckChosenOutOfTotalSlashRepositoryImpl.getInstance();
        this.requiredNumberOfCardsRepository = RequiredNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardSearchInputEnterDetectRepository = DeckCardSearchInputEnterDetectRepositoryImpl.getInstance();
        this.deckNameEditButtonClickDetectRepository = DeckNameEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckRemainingCardsPositionRepository = MyDeckRemainingCardsPositionRepositoryImpl.getInstance();
        this.myDeckOwnedCardsPositionRepository = MyDeckOwnedCardsPositionRepositoryImpl.getInstance();
        this.cardSelectionBlockerPositionRepository = CardSelectionBlockerPositionRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashPositionRepository = MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsPositionRepository = MyDeckTotalOwnedCardsPositionRepositoryImpl.getInstance();
        this.deckEditDoneButtonClickDetectRepository = DeckEditDoneButtonClickDetectRepositoryImpl.getInstance();
        this.cardFilterGradeOptionActiveRepository = CardFilterGradeOptionActiveRepositoryImpl.getInstance(scene);
        this.cardFilterRaceOptionActiveRepository = CardFilterRaceOptionActiveRepositoryImpl.getInstance(scene);
        this.cardFilterGradeOptionClickDetectRepository = CardFilterGradeOptionClickDetectRepositoryImpl.getInstance();
        this.cardFilterRaceOptionClickDetectRepository = CardFilterRaceOptionClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyDeckButtonClickDetectServiceImpl {
        if (!MyDeckButtonClickDetectServiceImpl.instance) {
            MyDeckButtonClickDetectServiceImpl.instance = new MyDeckButtonClickDetectServiceImpl(camera, scene);
        }
        return MyDeckButtonClickDetectServiceImpl.instance;
    }

    private setAllButtonClickEnabled(isEnabled: boolean): void {
        this.myDeckButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private isAllButtonClickEnabled(): boolean {
        return this.myDeckButtonClickDetectRepository.isAllButtonClickEnabled();
    }

    async handleLeftClick(clickPoint: { x: number; y: number }): Promise<MyDeckButton | null> {
        const { x, y } = clickPoint;
        const deckIdList = this.getDeckIdList();
        const allButton = this.myDeckButtonRepository.findAll();
        const clickedDeckButton = this.myDeckButtonClickDetectRepository.isMyDeckButtonClicked(
            { x, y },
            allButton,
            this.camera
        );

        if (clickedDeckButton) {
            this.resetSearchInputState();

            const previousClickedDeckId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
            if (previousClickedDeckId !== null) {
                this.handleDeckSwitch(previousClickedDeckId);
            }

            const buttonId = clickedDeckButton.id;
            const currentClickedDeckId = this.getDeckIdByButtonId(buttonId);
            console.log(`%c [버튼 클릭 이벤트 실행] 현재 클릭된 덱 버튼의 ID: ${buttonId}, 덱 ID: ${currentClickedDeckId}`, 'color: #ff5733; font-weight: bold;');
            this.saveCurrentClickDeckId(currentClickedDeckId);

            if (currentClickedDeckId !== null) {
                this.activateDeck(currentClickedDeckId);
            }

            return clickedDeckButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyDeckButton | null> {
        if (!this.isAllButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleLeftClick(clickPoint);
            if (result) {
                return result;
            }
        }
        return null;
    }

    public async onMouseUp(event: MouseEvent): Promise<MyDeckButton | null> {
        if (!this.isAllButtonClickEnabled()) return null;

        // 다른 덱 버튼을 클릭할 때 이전에 클릭한 덱 버튼의 덱 삭제 버튼, 덱 이름 편집 버튼 클릭 비활성화
        const clickEnableDeckDeleteButtonDeckIdList = this.deckDeleteButtonClickDetectRepository.findEnabledButtonIds();
        for (const deleteButtonDeckId of clickEnableDeckDeleteButtonDeckIdList) {
            this.deckDeleteButtonClickDetectRepository.saveButtonClickEnabled(deleteButtonDeckId, false);
        }

        const clickEnableDeckNameEditButtonDeckIdList = this.deckNameEditButtonClickDetectRepository.findEnabledButtonIds();
        for (const buttonDeckId of clickEnableDeckNameEditButtonDeckIdList) {
            this.deckNameEditButtonClickDetectRepository.saveButtonClickEnabled(buttonDeckId, false);
        }

        if (event.button === 0) {
            const deckId = this.getCurrentClickDeckId();
            if (deckId == null) return null;

            // 덱 버튼 클릭 후 마우스를 뗀 순간 덱 삭제 버튼, 덱 이름 편집 버튼이 클릭 가능하도록 설정
            this.deckDeleteButtonClickDetectRepository.saveButtonClickEnabled(deckId, true);
            this.deckNameEditButtonClickDetectRepository.saveButtonClickEnabled(deckId, true);
        }
        return null;
    }

    // 검색 입력 초기화
    private resetSearchInputState(): void {
        const input = this.myDeckSearchInputContainerRepository.findInputValue();
        if (input && input.length > 0) {
            this.myDeckSearchInputContainerRepository.clearUserInput();
        }
        this.setSearchCancelButtonVisibility(false);
        this.setSearchCancelButtonClickEnabled(false);
    }

    // 덱에서 다른 덱으로 전환
    private handleDeckSwitch(deckId: number): void {
        this.setPreviousDeckObjectVisibleState(deckId);
        this.restoreDeckLayout(deckId);

        this.resetFilterGradeOptionState();
        this.resetFilterRaceOptionState();

        if (this.getDeckEditButtonClickState() == true) {
            this.handleDeckEditModeExit(deckId);

            if (this.getCurrentDeckEditSearchState() == DeckCardSearchStateInDeckEditMode.MATCHED) {
                this.restoreDeckEditLayout();
            }
        }
    }

    // 덱 편집 모드 중 다른 덱 클릭
    private handleDeckEditModeExit(deckId: number): void {
        this.restoreOriginalDeckState(deckId);

        this.cardCountManager.restoreRemainingCardCount();
        this.cardCountManager.restoreSelectedCardCount();
        this.cardCountManager.restoreCardCountByGrade();

        this.hideDeckEditUI();
        this.setDeckEditDoneButtonClickEnabled(false);
        this.setDeckEditDoneButtonHoverEnabled(false);
    }

    // 새로운 덱 표시
    private activateDeck(deckId: number): void {
        this.resetDeckObjectScrollPosition(deckId);
        this.setCurrentDeckObjectVisibleState(deckId);
    }

    private resetDeckObjectScrollPosition(deckId: number): void {
        const scrollTargets = [
            this.getBlockGroup(deckId),
            this.getCardNameGroup(deckId),
            this.getCardGroup(deckId),
            this.getNumberOfCardsGroup(deckId),
            this.getNumberOfSelectedCardsGroup(deckId),
            this.getDeckCardCountMarkerGroup(deckId),
        ];

        if (scrollTargets.every(target => !target)) return;
        scrollTargets.forEach(target => {
            target.position.y = 0;
        });
    }

    private setPreviousDeckObjectVisibleState(deckId: number): void {
        this.setButtonVisibility(deckId, true);
        this.setEffectVisibility(deckId, false);
        this.setCardVisibilityByDeckId(deckId, false);
        this.setBlockVisibilityByDeckId(deckId, false);
        this.setCardNameVisibilityByDeckId(deckId, false);
        this.setDeckNameEditButtonVisibility(deckId, false);
        this.setDeckDeleteButtonVisibility(deckId, false);
        this.setNumberOfCardsVisibilityByDeckId(deckId, false);
        this.setNumberOfSelectedCardsVisibilityByDeckId(deckId, false);
        this.setDeckCardCountMarkerVisibilityByDeckId(deckId, false);
        this.setTotalNumberOfSelectedCardsVisibility(deckId, false);
    }

    private setCurrentDeckObjectVisibleState(deckId: number): void {
        this.setButtonVisibility(deckId, false);
        this.setEffectVisibility(deckId, true);
        this.setCardVisibilityByDeckId(deckId, true);
        this.setBlockVisibilityByDeckId(deckId, true);
        this.setCardNameVisibilityByDeckId(deckId, true);
        this.setNumberOfCardsVisibilityByDeckId(deckId, true);
        this.setNumberOfSelectedCardsVisibilityByDeckId(deckId, true);
        this.setDeckCardCountMarkerVisibilityByDeckId(deckId, true);
        this.setDeckNameEditButtonVisibility(deckId, true);
        this.setDeckDeleteButtonVisibility(deckId, true);
    }

    private restoreDeckLayout(deckId: number): void {
        this.restoreAllMyDeckCardPositions(deckId);
        this.restoreAllMyDeckNumberOfCardsPositions(deckId);
        this.restoreAllMyDeckMarkerPositions(deckId);
    }

    private restoreDeckEditLayout(): void {
        this.restoreAllOwnedCardPositions();
        this.restoreAllCardBlockerPositions();
        this.restoreAllNumberOfRemainingCardsPositions();
        this.restoreAllSlashesPositions();
        this.restoreAllNumberOfTotalOwnedCardsPositions();
    }

    private hideDeckEditUI(): void {
        this.setOwnedCardsVisibility(false);
        this.setCardSelectionBlockerVisibility(false);
        this.setNumberOfTotalOwnedCardsVisibility(false);
        this.setNumberOfRemainingCardsVisibility(false);
        this.setRemainingOutOfTotalSlashVisibility(false);
        this.setDeckEditButtonVisibility(true);
        this.setDeckEditDoneButtonVisibility(false);
        this.setChosenOutOfTotalSlashVisibility(false);
        this.setRequiredNumberOfCardsVisibility(false);
    }

    public saveCurrentClickDeckId(buttonDeckId: number): void {
        this.myDeckButtonClickDetectRepository.saveCurrentClickDeckId(buttonDeckId);
    }

    private getCurrentDeckEditSearchState(): DeckCardSearchStateInDeckEditMode {
        return this.deckCardSearchInputEnterDetectRepository.findDeckEditSearchState();
    }

    public getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId() ?? null;
    }

    public getDeckIdByButtonId(buttonId: number): number {
        return this.myDeckButtonRepository.findDeckIdByButtonId(buttonId) ?? -1;
    }

    public getDeckIdList(): number[] {
        return this.myDeckButtonRepository.findButtonDeckIdList();
    }

    public getButtonVisibility(deckId: number): boolean | undefined {
        return this.myDeckButtonRepository.findButtonByDeckId(deckId)?.getVisibility();
    }

    private getDeckEditButtonClickState(): boolean | null {
        return this.deckEditButtonClickDetectRepository.getCurrentButtonClickState();
    }

    public setButtonVisibility(deckId: number, isVisible: boolean): void {
        this.myDeckButtonRepository.findButtonByDeckId(deckId)?.setVisibility(isVisible);
    }

    public getEffectVisibility(deckId: number): boolean | undefined {
        return this.myDeckButtonEffectRepository.findEffectByDeckId(deckId)?.getVisibility();
    }

    public setEffectVisibility(deckId: number, isVisible: boolean): void {
        this.myDeckButtonEffectRepository.findEffectByDeckId(deckId)?.setVisibility(isVisible);
    }

    private getDeckButtonById(buttonId: number): MyDeckButton | null {
        return this.myDeckButtonRepository.findById(buttonId);
    }

    private getDeckButtonEffectById(buttonId: number): MyDeckButtonEffect | null {
        return this.myDeckButtonEffectRepository.findById(buttonId);
    }

    private getClickedGradeOptionTypes(): CardGrade[] | null {
        return this.cardFilterGradeOptionClickDetectRepository.findClickedOptionTypes();
    }

    private getClickedRaceOptionTypes(): CardRace[] | null {
        return this.cardFilterRaceOptionClickDetectRepository.findClickedOptionTypes();
    }

    private setCardVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckCardRepository.findCardListByDeckId(deckId)?.forEach(card =>
            card.setVisibility(isVisible)
        );
    }

    private setBlockVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckBlockRepository.findBlockListByDeckId(deckId)?.forEach(block =>
            block.setVisibility(isVisible)
        );
    }

    private setCardNameVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckCardNameRepository.findCardNameListByDeckId(deckId)?.forEach(cardName =>
            cardName.setVisibility(isVisible)
        );
    }

    private setNumberOfCardsVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckNumberOfCardsRepository.findNumberListByDeckId(deckId)?.forEach(number =>
            number.setVisibility(isVisible)
        );
    }

    private setNumberOfSelectedCardsVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckNumberOfSelectedCardsRepository.findNumberListByDeckId(deckId)?.forEach(number =>
            number.setVisibility(isVisible)
        );
    }

    private setDeckCardCountMarkerVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.deckCardCountMarkerRepository.findMarkerListByDeckId(deckId)?.forEach(marker =>
            marker.setVisibility(isVisible)
        );
    }

    private setDeckEditButtonVisibility(isVisible: boolean): void {
        this.deckEditButtonRepository.findButtonById(0)?.setVisibility(isVisible);
    }

    private setDeckEditDoneButtonVisibility(isVisible: boolean): void {
        const allButton = this.deckEditDoneButtonRepository.findAll();
        allButton.forEach(button => button.setVisibility(isVisible));
    }

    private setTotalNumberOfSelectedCardsVisibility(deckId: number, isVisible: boolean): void {
        this.totalNumberOfSelectedCardsRepository.findNumberByDeckId(deckId)?.setVisibility(isVisible);
    }

    private getBlockGroup(deckId: number): THREE.Group {
        return this.myDeckBlockRepository.findBlockGroupByDeckId(deckId);
    }

    private getCardNameGroup(deckId: number): THREE.Group {
        return this.myDeckCardNameRepository.findCardNameGroupByDeckId(deckId);
    }

    private getCardGroup(deckId: number): THREE.Group {
        return this.myDeckCardRepository.findCardGroupByDeckId(deckId);
    }

    private getNumberOfCardsGroup(deckId: number): THREE.Group {
        return this.myDeckNumberOfCardsRepository.findNumberGroupByDeckId(deckId);
    }

    private getNumberOfSelectedCardsGroup(deckId: number): THREE.Group {
        return this.myDeckNumberOfSelectedCardsRepository.findNumberGroupByDeckId(deckId);
    }

    private getDeckCardCountMarkerGroup(deckId: number): THREE.Group {
        return this.deckCardCountMarkerRepository.findMarkerGroupByDeckId(deckId);
    }

    private setDeckNameEditButtonVisibility(deckId: number, isVisible: boolean): void {
        const button = this.deckNameEditButtonRepository.findButtonByDeckId(deckId);
        if (button !== null) {
            button.setVisibility(isVisible);
        }
    }

    private setDeckDeleteButtonVisibility(deckId: number, isVisible: boolean): void {
        const button = this.deckDeleteButtonRepository.findButtonByDeckId(deckId);
        if (button !== null) {
            button.setVisibility(isVisible);
        }
    }

    private setOwnedCardsVisibility(isVisible: boolean): void {
        this.myDeckOwnedCardsRepository.findAllCards()?.forEach(card =>
            card.setVisibility(isVisible)
        );
    }

    private setCardSelectionBlockerVisibility(isVisible: boolean): void {
        this.cardSelectionBlockerRepository.findAllBlockers()?.forEach(blocker =>
            blocker.setVisibility(isVisible)
        );
    }

    private setNumberOfTotalOwnedCardsVisibility(isVisible: boolean): void {
        this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsList()?.forEach(numberMesh =>
            numberMesh.setVisibility(isVisible)
        );
    }

    private setNumberOfRemainingCardsVisibility(isVisible: boolean): void {
        this.myDeckRemainingCardsRepository.findAllRemainingCardsList()?.forEach(numberMesh =>
            numberMesh.setVisibility(isVisible)
        );
    }

    private setRemainingOutOfTotalSlashVisibility(isVisible: boolean): void {
        this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashList()?.forEach(slash =>
            slash.setVisibility(isVisible)
        );
    }

    private setChosenOutOfTotalSlashVisibility(isVisible: boolean): void {
        this.myDeckChosenOutOfTotalSlashRepository.findSlash()?.setVisibility(isVisible);
    }

    private setRequiredNumberOfCardsVisibility(isVisible: boolean): void {
        this.requiredNumberOfCardsRepository.findNumber()?.setVisibility(isVisible);
    }

    private setSearchCancelButtonVisibility(isVisible: boolean): void {
        this.myDeckCardSearchCancelButtonRepository.findButton()?.setVisibility(isVisible);
    }

    private setSearchCancelButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private setDeckEditDoneButtonClickEnabled(isEnabled: boolean): void {
        this.deckEditDoneButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setDeckEditDoneButtonHoverEnabled(isEnabled: boolean): void {
        this.deckEditDoneButtonHoverDetectRepository.setButtonHoverEnabled(isEnabled);
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

    private restoreOriginalDeckState(deckId: number): void {
        this.myDeckNumberOfSelectedCardsRepository.restoreOriginalDeckState(deckId);
        this.myDeckNumberOfSelectedCardsPositionRepository.restoreOriginalPositionState(deckId);
        this.myDeckBlockRepository.restoreOriginalDeckState(deckId);
        this.myDeckBlockPositionRepository.restoreOriginalPositionState(deckId);
        this.myDeckCardNameRepository.restoreOriginalDeckState(deckId);
        this.myDeckCardNamePositionRepository.restoreOriginalPositionState(deckId);
        this.deckCardDeleteButtonRepository.restoreOriginalDeckState(deckId);
        this.deckCardDeleteButtonPositionRepository.restoreOriginalPositionState(deckId);
        this.deckCardAddButtonRepository.restoreOriginalDeckState(deckId);
        this.deckCardAddButtonPositionRepository.restoreOriginalPositionState(deckId);
        this.myDeckCardRepository.restoreOriginalDeckState(deckId);
        this.myDeckCardPositionRepository.restoreOriginalPositionState(deckId);
        this.myDeckNumberOfCardsRepository.restoreOriginalDeckState(deckId);
        this.myDeckNumberOfCardsPositionRepository.restoreOriginalPositionState(deckId);
        this.deckCardCountMarkerRepository.restoreOriginalDeckState(deckId);
        this.deckCardCountMarkerPositionRepository.restoreOriginalPositionState(deckId);
        this.totalNumberOfSelectedCardsRepository.restoreOriginalDeckState(deckId);
        this.myDeckRemainingCardsRepository.restoreOriginalRemainingCardsState();
        this.myDeckRemainingCardsPositionRepository.restoreOriginalPositionState();
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
