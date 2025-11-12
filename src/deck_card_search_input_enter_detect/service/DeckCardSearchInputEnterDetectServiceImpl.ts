import * as THREE from "three";

import {getCardById} from "../../card/utility";
import {DeckCardSearchStateInDeckEditMode} from "../entity/DeckCardSearchStateInDeckEditMode";
import {DeckCardSearchState} from "../entity/DeckCardSearchState";
import {DeckCardSearchInputEnterDetectService} from "./DeckCardSearchInputEnterDetectService";
import {DeckCardSearchInputEnterDetectRepositoryImpl} from "../repository/DeckCardSearchInputEnterDetectRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {MyDeckNumberOfCardsPositionRepositoryImpl} from "../../my_deck_number_of_cards_position/repository/MyDeckNumberOfCardsPositionRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {DeckCardCountMarkerPositionRepositoryImpl} from "../../deck_card_count_marker_position/repository/DeckCardCountMarkerPositionRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckOwnedCardsPositionRepositoryImpl} from "../../my_deck_owned_cards_position/repository/MyDeckOwnedCardsPositionRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {CardSelectionBlockerPositionRepositoryImpl} from "../../card_selection_blocker_position/repository/CardSelectionBlockerPositionRepositoryImpl";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingCardsPositionRepositoryImpl} from "../../my_deck_remaining_cards_position/repository/MyDeckRemainingCardsPositionRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash/repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash_position/repository/MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {MyDeckTotalOwnedCardsPositionRepositoryImpl} from "../../my_deck_total_owned_cards_position/repository/MyDeckTotalOwnedCardsPositionRepositoryImpl";
import {MyDeckOwnedCardsClickDetectRepositoryImpl} from "../../deck_owned_cards_click_detect/repository/MyDeckOwnedCardsClickDetectRepositoryImpl";
import {AlertModalContainerRepositoryImpl} from "../../alert_modal_container/repository/AlertModalContainerRepositoryImpl";
import {AlertModalButtonsRepositoryImpl} from "../../alert_modal_buttons/repository/AlertModalButtonsRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeckNameEditButtonClickDetectRepositoryImpl} from "../../deck_name_edit_button_click_detect/repository/DeckNameEditButtonClickDetectRepositoryImpl";
import {BuildDeckButtonHoverDetectRepositoryImpl} from "../../build_deck_button_hover_detect/repository/BuildDeckButtonHoverDetectRepositoryImpl";
import {BuildDeckButtonClickDetectRepositoryImpl} from "../../build_deck_button_click_detect/repository/BuildDeckButtonClickDetectRepositoryImpl";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../../deck_delete_button_click_detect/repository/DeckDeleteButtonClickDetectRepositoryImpl";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../../deck_card_search_cancel_button_click_detect/repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";
import {DeckCardDeleteButtonClickDetectRepositoryImpl} from "../../deck_card_delete_button_click_detect/repository/DeckCardDeleteButtonClickDetectRepositoryImpl";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../../my_deck_block_hover_detect/repository/MyDeckBlockHoverDetectRepositoryImpl";
import {DeckEditDoneButtonHoverDetectRepositoryImpl} from "../../deck_edit_done_button_hover_detect/repository/DeckEditDoneButtonHoverDetectRepositoryImpl";
import {MyDeckAlertModalButtonsClickDetectRepositoryImpl} from "../../my_deck_alert_modal_buttons_click_detect/repository/MyDeckAlertModalButtonsClickDetectRepositoryImpl";

import {AlertModalContainerType} from "../../alert_modal_container/entity/AlertModalContainerType";
import {AlertModalButtonsType} from "../../alert_modal_buttons/entity/AlertModalButtonsType";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class DeckCardSearchInputEnterDetectServiceImpl implements DeckCardSearchInputEnterDetectService {
    private static instance: DeckCardSearchInputEnterDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckCardSearchInputEnterDetectRepository: DeckCardSearchInputEnterDetectRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckElementAdjuster: MyDeckElementAdjuster;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private myDeckNumberOfCardsPositionRepository: MyDeckNumberOfCardsPositionRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private deckCardCountMarkerPositionRepository: DeckCardCountMarkerPositionRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckOwnedCardsPositionRepository: MyDeckOwnedCardsPositionRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private cardSelectionBlockerPositionRepository: CardSelectionBlockerPositionRepositoryImpl;
    private cardCountManager: CardCountManager;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingCardsPositionRepository: MyDeckRemainingCardsPositionRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashPositionRepository: MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckTotalOwnedCardsPositionRepository: MyDeckTotalOwnedCardsPositionRepositoryImpl;
    private myDeckOwnedCardsClickDetectRepository: MyDeckOwnedCardsClickDetectRepositoryImpl;
    private alertModalContainerRepository: AlertModalContainerRepositoryImpl;
    private alertModalButtonsRepository: AlertModalButtonsRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private deckNameEditButtonClickDetectRepository: DeckNameEditButtonClickDetectRepositoryImpl;
    private buildDeckButtonHoverDetectRepository: BuildDeckButtonHoverDetectRepositoryImpl;
    private buildDeckButtonClickDetectRepository: BuildDeckButtonClickDetectRepositoryImpl;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private deckCardDeleteButtonClickDetectRepository: DeckCardDeleteButtonClickDetectRepositoryImpl;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;
    private deckEditDoneButtonHoverDetectRepository: DeckEditDoneButtonHoverDetectRepositoryImpl;
    private myDeckAlertModalButtonDetectRepository: MyDeckAlertModalButtonsClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardSearchInputEnterDetectRepository = DeckCardSearchInputEnterDetectRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfCardsPositionRepository = MyDeckNumberOfCardsPositionRepositoryImpl.getInstance();
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerPositionRepository = DeckCardCountMarkerPositionRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckOwnedCardsPositionRepository = MyDeckOwnedCardsPositionRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.cardSelectionBlockerPositionRepository = CardSelectionBlockerPositionRepositoryImpl.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingCardsPositionRepository = MyDeckRemainingCardsPositionRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashPositionRepository = MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsPositionRepository = MyDeckTotalOwnedCardsPositionRepositoryImpl.getInstance();
        this.myDeckOwnedCardsClickDetectRepository = MyDeckOwnedCardsClickDetectRepositoryImpl.getInstance();
        this.alertModalContainerRepository = AlertModalContainerRepositoryImpl.getInstance(scene);
        this.alertModalButtonsRepository = AlertModalButtonsRepositoryImpl.getInstance(scene);
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deckNameEditButtonClickDetectRepository = DeckNameEditButtonClickDetectRepositoryImpl.getInstance();
        this.buildDeckButtonHoverDetectRepository = BuildDeckButtonHoverDetectRepositoryImpl.getInstance();
        this.buildDeckButtonClickDetectRepository = BuildDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonClickDetectRepository = DeckCardDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.deckEditDoneButtonHoverDetectRepository = DeckEditDoneButtonHoverDetectRepositoryImpl.getInstance();
        this.myDeckAlertModalButtonDetectRepository = MyDeckAlertModalButtonsClickDetectRepositoryImpl.getInstance();
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardSearchInputEnterDetectServiceImpl {
        if (!DeckCardSearchInputEnterDetectServiceImpl.instance) {
            DeckCardSearchInputEnterDetectServiceImpl.instance = new DeckCardSearchInputEnterDetectServiceImpl(camera, scene);
        }
        return DeckCardSearchInputEnterDetectServiceImpl.instance;
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (!this.isEnterKey(event)) return;

        const deckId = this.getCurrentClickDeckId()!;
        const inputText = this.myDeckSearchInputContainerRepository.findInputValue() || "";

        if (this.isDeckEditMode() == true) {
            this.handleDeckEditModeSearch(deckId, inputText);
            return;
        }

        this.handleNormalModeSearch(deckId, inputText);
    }

    private isEnterKey(event: KeyboardEvent): boolean {
        const searchInputContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
        if (!searchInputContainer) return false;

        const inputElement = searchInputContainer.getInputElement();
        const isEnter = this.deckCardSearchInputEnterDetectRepository.isEnterPressed(inputElement, event);

        if (isEnter) {
            this.deckCardSearchInputEnterDetectRepository.setEnterPressedState(true);
        }
        return isEnter;
    }

    private handleDeckEditModeSearch(deckId: number, inputText: string): void {
        if (this.hasSearchInput(inputText)) {
            this.handleEmptySearchInputInDeckEditMode();
            return;
        }

        const matchedCardIdList = this.searchMatchedOwnedCardIdList(inputText);
        const unmatchedCardIdList = this.searchUnmatchedOwnedCardIdList(inputText);

        if (matchedCardIdList.length > 0) {
            this.handleSearchMatchedInDeckEditMode(matchedCardIdList, unmatchedCardIdList);
        } else {
            this.handleUnmatchedSearchInDeckEditMode(deckId);
        }
    }

    private handleNormalModeSearch(deckId: number, inputText: string): void {
        if (this.hasSearchInput(inputText)) {
            this.handleEmptySearchInputInNormalMode(deckId);
            return;
        }

        const matchedCardIdList = this.searchMatchedDeckCardIdList(deckId, inputText);

        if (matchedCardIdList.length > 0) {
            this.handleSearchMatchedInNormalMode(deckId, matchedCardIdList);
        } else {
            this.handleUnmatchedSearchInNormalMode(deckId);
        }
    }

    private hasSearchInput(inputText: string): boolean {
        return inputText.trim().length === 0;
    }

    private handleEmptySearchInputInNormalMode(deckId: number): void {
        this.restoreMyDeckAllElement(deckId);
        this.showEmptyInputPopup();
        this.resetMatchedDeckCardIdList();
        this.setDeckCardSearchState(DeckCardSearchState.DEFAULT);
    }

    private handleEmptySearchInputInDeckEditMode(): void {
        this.restoreAllElementsPositionInDeckEditMode();
        this.saveAllOwnedCardsClickEnabled();
        this.setDeckEditSearchState(DeckCardSearchStateInDeckEditMode.DEFAULT);
        this.deckCardSearchInputEnterDetectRepository.resetMatchedOwnedCardIdList();
        this.showEmptyInputPopup();
    }

    private handleSearchMatchedInNormalMode(deckId: number, matchedCardIdList: number[]): void {
        this.applySearchResultToDeckElements(deckId, matchedCardIdList);
        this.deckCardSearchInputEnterDetectRepository.saveMatchedDeckCardIdList(matchedCardIdList);
        this.setDeckCardSearchState(DeckCardSearchState.MATCHED);
    }

    private handleSearchMatchedInDeckEditMode(matchedCardIdList: number[], unmatchedCardIdList: number[]): void {
        this.applySearchResultToDeckEditElements(matchedCardIdList, unmatchedCardIdList);
        this.saveSearchUnmatchedOwnedCardsClickEnable(unmatchedCardIdList);
        this.deckCardSearchInputEnterDetectRepository.saveMatchedOwnedCardIdList(matchedCardIdList);
        this.setDeckEditSearchState(DeckCardSearchStateInDeckEditMode.MATCHED);
    }

    private handleUnmatchedSearchInNormalMode(deckId: number): void {
        this.restoreMyDeckAllElement(deckId);
        this.showNotFoundPopup();
        this.resetMatchedDeckCardIdList();
        this.setDeckCardSearchState(DeckCardSearchState.UNMATCHED);
        this.setInteractionStatesAfterPopupButtonShownInNormalMode(deckId);
    }

    private handleUnmatchedSearchInDeckEditMode(deckId: number): void {
        this.restoreAllElementsPositionInDeckEditMode();
        this.saveAllOwnedCardsClickEnabled();
        this.showNotFoundPopup();
        this.setInteractionStatesAfterPopupButtonShownInDeckEditMode(deckId);
        this.setDeckEditSearchState(DeckCardSearchStateInDeckEditMode.UNMATCHED);
        this.deckCardSearchInputEnterDetectRepository.resetMatchedOwnedCardIdList();
    }

    private searchMatchedDeckCardIdList(deckId: number, inputText: string): number[] {
        const myDeckCardNameList = this.getMyDeckCardNameListByDeckId(deckId);
        const matchedCardNames = this.findMatchingCardNames(myDeckCardNameList, inputText);
        return this.getSearchMatchedDeckCardIdList(deckId, matchedCardNames);
    }

    private searchMatchedOwnedCardIdList(inputText: string): number[] {
        const ownedCardNameList = this.getOwnedCardNameList();
        const matchedCardNames = this.findMatchingCardNames(ownedCardNameList, inputText);
        return this.getSearchMatchedOwnedCardIdList(matchedCardNames);
    }

    private searchUnmatchedOwnedCardIdList(inputText: string): number[] {
        const ownedCardNameList = this.getOwnedCardNameList();
        const matchedCardNames = this.findMatchingCardNames(ownedCardNameList, inputText);
        return this.getSearchUnmatchedOwnedCardIdList(matchedCardNames);
    }

    private isDeckEditMode(): boolean | null {
        return this.deckEditButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

    private setDeckEditSearchState(state: DeckCardSearchStateInDeckEditMode): void {
        this.deckCardSearchInputEnterDetectRepository.setDeckEditSearchState(state);
    }

    public getDeckEditSearchState(): DeckCardSearchStateInDeckEditMode {
        return this.deckCardSearchInputEnterDetectRepository.findDeckEditSearchState();
    }

    private setDeckCardSearchState(state: DeckCardSearchState) {
        this.deckCardSearchInputEnterDetectRepository.setDeckCardSearchState(state);
    }

    private resetMatchedDeckCardIdList(): void {
        this.deckCardSearchInputEnterDetectRepository.resetMatchedDeckCardIdList();
    }

    // 저장된 매칭된 카드 아이디 리스트
    // To-do: 이름 변경 필요
    public getMatchedOwnedCardIdList(): number[] {
        return this.deckCardSearchInputEnterDetectRepository.findMatchedOwnedCardIdList();
    }

    private getMyDeckCardNameListByDeckId(deckId: number): string[] {
        return this.myDeckCardNameRepository.findCardNameTextListByDeckId(deckId);
    }

    private getOwnedCardNameList(): string[] {
        return this.myDeckOwnedCardsRepository.findOwnedCardNameList();
    }

    // 특정 한 글자만 포함해도 매칭, 공백 무시 가능
    // To-do: 해당 메서드를 어떤 클래스에서 책임져야 하는 지 정해야 함
    private findMatchingCardNames(cardNameList: string[], inputText: string): string[] {
        const normalizedInput = inputText.replace(/\s+/g, '').toLowerCase();

        return cardNameList.filter(cardName =>
            cardName.replace(/\s+/g, '').toLowerCase().includes(normalizedInput)
        );
    }

    private applySearchResultToDeckElements(deckId: number, matchedCardIdList: number[]): void {
        this.hideSearchUnmatchedDeckCardElements(deckId, matchedCardIdList);
        this.adjustMatchedMyDeckCardPosition(deckId, matchedCardIdList);
        this.adjustMatchedMyDeckNumberOfCardsPosition(deckId, matchedCardIdList);
        this.adjustMatchedMyDeckMarkerPosition(deckId, matchedCardIdList);
    }

    private applySearchResultToDeckEditElements(matchedCardIdList: number[], unmatchedCardIdList: number[]): void {
        this.hideSearchUnmatchedDeckEditElements(matchedCardIdList);
        this.adjustMatchedOwnedCardPositions(matchedCardIdList);
        this.adjustMatchedCardBlockerPositions(matchedCardIdList);
        this.adjustMatchedSlashesPosition(matchedCardIdList);
        this.adjustMatchedNumberOfRemainingCardsPosition(matchedCardIdList);
        this.adjustMatchedNumberOfTotalOwnedCardsPosition(matchedCardIdList);
        this.adjustUnmatchedOwnedCardPositions(unmatchedCardIdList);
    }

    private restoreMyDeckAllElement(deckId: number): void {
        this.restoreAllMyDeckCardPositions(deckId);
        this.restoreAllMyDeckNumberOfCardsPositions(deckId);
        this.restoreAllMyDeckMarkerPositions(deckId);
    }

    private restoreAllElementsPositionInDeckEditMode(): void {
        this.restoreAllOwnedCardPositions();
        this.restoreAllCardBlockerPositions();
        this.restoreAllNumberOfRemainingCardsPositions();
        this.restoreAllSlashesPositions();
        this.restoreAllNumberOfTotalOwnedCardsPositions();
    }

    private getSearchUnmatchedOwnedCardIdList(cardNames: string[]): number[] {
        return this.myDeckOwnedCardsRepository.findUnmatchedOwnedCardIdList(cardNames);
    }

    private getSearchMatchedOwnedCardIdList(cardNames: string[]): number[] {
        return this.myDeckOwnedCardsRepository.findSearchMatchedOwnedCardIdList(cardNames);
    }

    private getSearchMatchedDeckCardIdList(deckId: number, cardNames: string[]): number[] {
        return this.myDeckCardRepository.findSearchMatchedDeckCardIdList(deckId, cardNames);
    }

    private saveSearchUnmatchedOwnedCardsClickEnable(unmatchedCardIdList: number[]): void {
        for (const cardId of unmatchedCardIdList) {
            this.myDeckOwnedCardsClickDetectRepository.saveCardClickEnabled(cardId, false);
        }
    }

    private saveAllOwnedCardsClickEnabled(): void {
        const allCardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();
        for (const cardId of allCardIdList) {
            this.myDeckOwnedCardsClickDetectRepository.saveCardClickEnabled(cardId, true);
        }
    }

    // 검색 후 검색어와 매칭되지 않는 카드, 카드 개수, 마커 mesh 객체들은 화면에서 숨김
    // To-do: scene, renderer 구조로 분리하면 mesh scene 에서 제거 후, 다시 렌더링하는 방식으로 수정 필요
    // 스크롤 문제도 해결될 것임
    private hideSearchUnmatchedDeckCardElements(deckId: number, matchedCardIdList: number[]): void {
        const currentDeckCardIdList = this.myDeckCardRepository.findCardIdListByDeckId(deckId);

        for (const cardId of currentDeckCardIdList) {
            if (matchedCardIdList == null) return;

            if (!matchedCardIdList.includes(cardId)) {
                this.myDeckCardRepository.findCardByDeckIdAndCardId(deckId, cardId)?.setVisibility(false);
                this.myDeckNumberOfCardsRepository.findNumberByDeckIdAndCardId(deckId, cardId)?.setVisibility(false);
                this.deckCardCountMarkerRepository.findMarkerByDeckIdAndCardId(deckId, cardId)?.setVisibility(false);
            }
        }
    }

    private hideSearchUnmatchedDeckEditElements(matchedCardIdList: number[]): void {
        const cardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();

        for (const cardId of cardIdList) {
            if (matchedCardIdList == null) return;

            if (!matchedCardIdList.includes(cardId)) {
                this.myDeckOwnedCardsRepository.findCardByCardId(cardId)?.setVisibility(false);
                this.cardSelectionBlockerRepository.findBlockerByCardId(cardId)?.setVisibility(false);
                this.myDeckRemainingCardsRepository.findRemainingCardByCardId(cardId)?.setVisibility(false);
                this.myDeckRemainingOutOfTotalSlashRepository.findSlashByCardId(cardId)?.setVisibility(false);
                this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsByCardId(cardId)?.setVisibility(false);
            }
        }
    }

    private adjustMatchedOwnedCardPositions(matchedCardIdList: number[]): void {
        const matchedCardCount = matchedCardIdList.length;
        const positionList = this.myDeckOwnedCardsPositionRepository.findSearchCardPosition(matchedCardCount);

        for (let i = 0; i < matchedCardCount; i++) {
            const cardId = matchedCardIdList[i];
            const cardPosition = positionList[i]; // 같은 index로 매칭

            if (!cardPosition) return;

            const card = this.myDeckOwnedCardsRepository.findCardByCardId(cardId);
            if (card == null) return;

            const cardMesh = card.getMesh();

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustUnmatchedOwnedCardPositions(unmatchedCardIdList: number[]): void {
        const unmatchedCardCount = (unmatchedCardIdList.length + 1);
        const positionList = this.myDeckOwnedCardsPositionRepository.findSearchCardPosition(unmatchedCardCount);
        const lastPosition = positionList[positionList.length - 1];

        for (const cardId of unmatchedCardIdList) {
            const card = this.myDeckOwnedCardsRepository.findCardByCardId(cardId);
            if (card == null) return;

            const cardMesh = card.getMesh();

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = lastPosition.getX();
            const positionY = lastPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustMatchedCardBlockerPositions(matchedCardIdList: number[]): void {
        const matchedBlockerCount = matchedCardIdList.length;
        const positionList = this.cardSelectionBlockerPositionRepository.findSearchBlockerPosition(matchedBlockerCount);

        for (let i = 0; i < matchedBlockerCount; i++) {
            const cardId = matchedCardIdList[i];
            const cardPosition = positionList[i]; // 같은 index로 매칭

            if (!cardPosition) return;

            const blocker = this.cardSelectionBlockerRepository.findBlockerByCardId(cardId);
            if (blocker == null) return;

            const blockerMesh = blocker.getMesh();

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(blockerMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustMatchedNumberOfRemainingCardsPosition(matchedCardIdList: number[]): void {
        const matchedNumberCount = matchedCardIdList.length;
        const positionList = this.myDeckRemainingCardsPositionRepository.findSearchRemainingCardsPosition(matchedNumberCount);

        for (let i = 0; i < matchedNumberCount; i++) {
            const cardId = matchedCardIdList[i];
            const numberPosition = positionList[i]; // 같은 index로 매칭

            if (!numberPosition) return;

            const numberOfRemainingCards = this.myDeckRemainingCardsRepository.findRemainingCardByCardId(cardId);
            if (numberOfRemainingCards == null) return;

            const numberOfRemainingCardsMesh = numberOfRemainingCards.getMesh();

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberOfRemainingCardsMesh, widthPercent, heightPercent, positionX, positionY);
            this.myDeckRemainingCardsPositionRepository.saveSearchModePosition(cardId, numberPosition);
        }
    }

    private adjustMatchedSlashesPosition(matchedCardIdList: number[]): void {
        const matchedSlashCount = matchedCardIdList.length;
        const positionList = this.myDeckRemainingOutOfTotalSlashPositionRepository.findSearchSlashPosition(matchedSlashCount);

        for (let i = 0; i < matchedSlashCount; i++) {
            const cardId = matchedCardIdList[i];
            const slashPosition = positionList[i]; // 같은 index로 매칭

            if (!slashPosition) return;

            const slash = this.myDeckRemainingOutOfTotalSlashRepository.findSlashByCardId(cardId);
            if (slash == null) return;

            const slashMesh = slash.getMesh();

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = slashPosition.getX();
            const positionY = slashPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(slashMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustMatchedNumberOfTotalOwnedCardsPosition(matchedCardIdList: number[]): void {
        const matchedNumberCount = matchedCardIdList.length;
        const positionList = this.myDeckTotalOwnedCardsPositionRepository.findSearchPosition(matchedNumberCount);

        for (let i = 0; i < matchedNumberCount; i++) {
            const cardId = matchedCardIdList[i];
            const numberPosition = positionList[i]; // 같은 index로 매칭

            if (!numberPosition) return;

            const numberObject = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsByCardId(cardId);
            if (numberObject == null) return;

            const numberMesh = numberObject.getMesh();

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustMatchedMyDeckCardPosition(deckId: number, matchedCardIdList: number[]): void {
        const matchedCardCount = matchedCardIdList.length;
        const positionList = this.myDeckCardPositionRepository.findSearchCardPosition(deckId, matchedCardCount);

        for (let i = 0; i < matchedCardCount; i++) {
            const cardId = matchedCardIdList[i];
            const cardPosition = positionList[i]; // 같은 index로 매칭

            if (!cardPosition) return;

            const card = this.myDeckCardRepository.findCardByDeckIdAndCardId(deckId, cardId);
            if (card == null) return;

            const cardMesh = card.getMesh();

            const widthPercent = 0.096;
            const heightPercent = 1540 / 952;
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustMatchedMyDeckNumberOfCardsPosition(deckId: number, matchedCardIdList: number[]): void {
        const matchedCardCount = matchedCardIdList.length;
        const positionList = this.myDeckNumberOfCardsPositionRepository.findSearchNumberPosition(deckId, matchedCardCount);

        for (let i = 0; i < matchedCardCount; i++) {
            const cardId = matchedCardIdList[i];
            const numberPosition = positionList[i]; // 같은 index로 매칭

            if (!numberPosition) return;

            const numberOfCards = this.myDeckNumberOfCardsRepository.findNumberByDeckIdAndCardId(deckId, cardId);
            if (numberOfCards == null) return;

            const numberOfCardsMesh = numberOfCards.getMesh();

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberOfCardsMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustMatchedMyDeckMarkerPosition(deckId: number, matchedCardIdList: number[]): void {
        const matchedCardCount = matchedCardIdList.length;
        const positionList = this.deckCardCountMarkerPositionRepository.findSearchMarkerPosition(deckId, matchedCardCount);

        for (let i = 0; i < matchedCardCount; i++) {
            const cardId = matchedCardIdList[i];
            const numberPosition = positionList[i]; // 같은 index로 매칭

            if (!numberPosition) return;

            const marker = this.deckCardCountMarkerRepository.findMarkerByDeckIdAndCardId(deckId, cardId);
            if (marker == null) return;

            const markerMesh = marker.getMesh();

            const widthPercent = 0.012;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

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
            card.setVisibility(true);
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
            numberObject.setVisibility(true);
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
            slash.setVisibility(true);
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
            numberObject.setVisibility(true);
        }
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
            card.setVisibility(true);
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
            numberOfCards.setVisibility(true);
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
            marker.setVisibility(true);
        }
    }

    private showNotFoundPopup(): void {
        console.log("[POPUP] 해당 이름의 카드를 찾을 수 없습니다.");
        // 팝업 표시 로직
        this.setTransparentBackgroundVisible(true);
        this.setUnmatchedCardPopupContainerVisibility(true);
        this.setUnmatchedCardPopupButtonVisibility(true);
    }

    private setTransparentBackgroundVisible(isVisible: boolean): void {
        const background = this.transparentBackgroundRepository.findTransparentBackground();
        if (background) {
            background.setVisibility(isVisible);
        }
    }

    private setUnmatchedCardPopupContainerVisibility(isVisible: boolean): void {
        const unmatchedCardPopupContainer = this.alertModalContainerRepository.findContainerByType(AlertModalContainerType.UNMATCHED_CARD);
        if (unmatchedCardPopupContainer !== null) {
            unmatchedCardPopupContainer.setVisibility(isVisible);
        }
    }

    private setUnmatchedCardPopupButtonVisibility(isVisible: boolean): void {
        const unmatchedCardPopupButton = this.alertModalButtonsRepository.findButtonByType(AlertModalButtonsType.UNMATCHED_CARD);

        if (unmatchedCardPopupButton !== null) {
            unmatchedCardPopupButton.setVisibility(isVisible);
        }
    }

    // To-do: 일반 모드와 편집 모드 동시에 사용되는 중복 코드 정리 필요함
    private setInteractionStatesAfterPopupButtonShownInNormalMode(currentClickedDeckId: number): void {
        this.setMyDeckAllAlertModalButtonClickEnabled(true);
        this.setAllMyDeckButtonClickEnabled(false);
        this.setAllDeckNameEditButtonClickEnabled(false);
        this.setDeckNameEditButtonClickEnabled(currentClickedDeckId, false);
        this.setDeckEditButtonClickEnabled(false);
        this.setBuildDeckButtonHoverEnabled(false);
        this.setBuildDeckButtonClickEnabled(false);
        this.setAllDeckDeleteButtonClickEnabled(false);
        this.setMyDeckCardSearchInputEnabled(true);
        this.setSearchCancelButtonClickEnabled(false);
    }

    private setInteractionStatesAfterPopupButtonShownInDeckEditMode(currentClickedDeckId: number): void {
        this.setMyDeckAllAlertModalButtonClickEnabled(true);
        this.setAllMyDeckButtonClickEnabled(false);
        this.setAllDeckNameEditButtonClickEnabled(false);
        this.setDeckNameEditButtonClickEnabled(currentClickedDeckId, false);
        this.setBuildDeckButtonHoverEnabled(false);
        this.setBuildDeckButtonClickEnabled(false);
        this.setAllDeckDeleteButtonClickEnabled(false);
        this.setMyDeckCardSearchInputEnabled(true);
        this.setSearchCancelButtonClickEnabled(false);
        this.setMyDeckBlockHoverEnabled(false);
        this.setDeckEditDoneButtonHoverEnabled(false);
    }

    private setAllDeckNameEditButtonClickEnabled(isEnabled: boolean): void {
        this.deckNameEditButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private setDeckNameEditButtonClickEnabled(deckId: number, isEnabled: boolean): void {
        this.deckNameEditButtonClickDetectRepository.saveButtonClickEnabled(deckId, isEnabled);
    }

    private setAllMyDeckButtonClickEnabled(isEnabled: boolean): void {
        this.myDeckButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private setDeckEditButtonClickEnabled(isEnabled: boolean): void {
        this.deckEditButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setBuildDeckButtonHoverEnabled(isEnabled: boolean): void {
        this.buildDeckButtonHoverDetectRepository.setButtonHoverEnabled(isEnabled);
    }

    private setBuildDeckButtonClickEnabled(isEnabled: boolean): void {
        this.buildDeckButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setAllDeckDeleteButtonClickEnabled(isEnabled: boolean): void {
        this.deckDeleteButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private setMyDeckCardSearchInputEnabled(isEnabled: boolean): void {
        const searchContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
        if (searchContainer) {
            searchContainer.setInputDisabled(isEnabled); // 사용 가능: false, 사용 불가능: true
        }
    }

    private setSearchCancelButtonClickEnabled(isEnabled: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setMyDeckBlockHoverEnabled(isEnabled: boolean): void {
        this.myDeckBlockHoverDetectRepository.setBlockHoverEnabled(isEnabled);
    }

    private setDeckEditDoneButtonHoverEnabled(isEnabled: boolean): void {
        this.deckEditDoneButtonHoverDetectRepository.setButtonHoverEnabled(isEnabled);
    }

    private setMyDeckAllAlertModalButtonClickEnabled(isEnabled: boolean): void {
        this.myDeckAlertModalButtonDetectRepository.setAllButtonClickEnabled(isEnabled);
        this.myDeckAlertModalButtonDetectRepository.setButtonClickEnabled(AlertModalButtonsType.UNMATCHED_CARD, isEnabled);
    }

    private showEmptyInputPopup(): void {
        console.log("[POPUP] 텍스트를 입력하세요.");
        // 팝업 표시 로직
    }

}
