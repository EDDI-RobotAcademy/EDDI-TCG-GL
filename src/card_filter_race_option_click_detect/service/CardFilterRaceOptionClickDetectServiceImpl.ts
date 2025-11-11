import * as THREE from "three";

import {MyDeckCard} from "../../my_deck_card/entity/MyDeckCard";
import {CardRace} from "../../card/race";
import {CardGrade} from "../../card/grade";
import {getCardById} from "../../card/utility";
import {DeckCardSearchStateInDeckEditMode} from "../../deck_card_search_input_enter_detect/entity/DeckCardSearchStateInDeckEditMode";
import {DeckCardSearchState} from "../../deck_card_search_input_enter_detect/entity/DeckCardSearchState";

import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

import {CardFilterRaceOptionClickDetectService} from "./CardFilterRaceOptionClickDetectService";
import {CardFilterRaceOptionClickDetectRepositoryImpl} from "../repository/CardFilterRaceOptionClickDetectRepositoryImpl";

import {CardFilterRaceOptionInactive} from "../../card_filter_race_option_inactive/entity/CardFilterRaceOptionInactive";
import {CardFilterRaceOptionInactiveRepositoryImpl} from "../../card_filter_race_option_inactive/repository/CardFilterRaceOptionInactiveRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {CardFilterRaceOptionActiveRepositoryImpl} from "../../card_filter_race_option_active/repository/CardFilterRaceOptionActiveRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {MyDeckNumberOfCardsPositionRepositoryImpl} from "../../my_deck_number_of_cards_position/repository/MyDeckNumberOfCardsPositionRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {DeckCardCountMarkerPositionRepositoryImpl} from "../../deck_card_count_marker_position/repository/DeckCardCountMarkerPositionRepositoryImpl";
import {CardFilterGradeOptionClickDetectRepositoryImpl} from "../../card_filter_grade_option_click_detect/repository/CardFilterGradeOptionClickDetectRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {MyDeckOwnedCardsClickDetectRepositoryImpl} from "../../deck_owned_cards_click_detect/repository/MyDeckOwnedCardsClickDetectRepositoryImpl";
import {DeckCardSearchInputEnterDetectRepositoryImpl} from "../../deck_card_search_input_enter_detect/repository/DeckCardSearchInputEnterDetectRepositoryImpl";

import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckOwnedCardsPositionRepositoryImpl} from "../../my_deck_owned_cards_position/repository/MyDeckOwnedCardsPositionRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {CardSelectionBlockerPositionRepositoryImpl} from "../../card_selection_blocker_position/repository/CardSelectionBlockerPositionRepositoryImpl";
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingCardsPositionRepositoryImpl} from "../../my_deck_remaining_cards_position/repository/MyDeckRemainingCardsPositionRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash/repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash_position/repository/MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {MyDeckTotalOwnedCardsPositionRepositoryImpl} from "../../my_deck_total_owned_cards_position/repository/MyDeckTotalOwnedCardsPositionRepositoryImpl";

export class CardFilterRaceOptionClickDetectServiceImpl implements CardFilterRaceOptionClickDetectService {
    private static instance: CardFilterRaceOptionClickDetectServiceImpl | null = null;
    private myDeckElementAdjuster: MyDeckElementAdjuster;
    private cardCountManager: CardCountManager;
    private cameraRepository: CameraRepository;
    private cardFilterRaceOptionButtonsClickDetectRepository: CardFilterRaceOptionClickDetectRepositoryImpl;
    private cardFilterRaceOptionInactiveRepository: CardFilterRaceOptionInactiveRepositoryImpl;
    private cardFilterRaceOptionActiveRepository: CardFilterRaceOptionActiveRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private myDeckNumberOfCardsPositionRepository: MyDeckNumberOfCardsPositionRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private deckCardCountMarkerPositionRepository: DeckCardCountMarkerPositionRepositoryImpl;
    private cardFilterGradeOptionClickDetectRepository: CardFilterGradeOptionClickDetectRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckOwnedCardsPositionRepository: MyDeckOwnedCardsPositionRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private cardSelectionBlockerPositionRepository: CardSelectionBlockerPositionRepositoryImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingCardsPositionRepository: MyDeckRemainingCardsPositionRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashPositionRepository: MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckTotalOwnedCardsPositionRepository: MyDeckTotalOwnedCardsPositionRepositoryImpl;
    private myDeckOwnedCardsClickDetectRepository: MyDeckOwnedCardsClickDetectRepositoryImpl;
    private deckCardSearchInputEnterDetectRepository: DeckCardSearchInputEnterDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardFilterRaceOptionButtonsClickDetectRepository = CardFilterRaceOptionClickDetectRepositoryImpl.getInstance();
        this.cardFilterRaceOptionInactiveRepository = CardFilterRaceOptionInactiveRepositoryImpl.getInstance(scene);
        this.cardFilterRaceOptionActiveRepository = CardFilterRaceOptionActiveRepositoryImpl.getInstance(scene);
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfCardsPositionRepository = MyDeckNumberOfCardsPositionRepositoryImpl.getInstance();
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerPositionRepository = DeckCardCountMarkerPositionRepositoryImpl.getInstance();
        this.cardFilterGradeOptionClickDetectRepository = CardFilterGradeOptionClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckOwnedCardsPositionRepository = MyDeckOwnedCardsPositionRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.cardSelectionBlockerPositionRepository = CardSelectionBlockerPositionRepositoryImpl.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingCardsPositionRepository = MyDeckRemainingCardsPositionRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashPositionRepository = MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsPositionRepository = MyDeckTotalOwnedCardsPositionRepositoryImpl.getInstance();
        this.myDeckOwnedCardsClickDetectRepository = MyDeckOwnedCardsClickDetectRepositoryImpl.getInstance();
        this.deckCardSearchInputEnterDetectRepository = DeckCardSearchInputEnterDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): CardFilterRaceOptionClickDetectServiceImpl {
        if (!CardFilterRaceOptionClickDetectServiceImpl.instance) {
            CardFilterRaceOptionClickDetectServiceImpl.instance = new CardFilterRaceOptionClickDetectServiceImpl(camera, scene);
        }
        return CardFilterRaceOptionClickDetectServiceImpl.instance;
    }

    async handleOptionClick(clickPoint: { x: number; y: number }): Promise<CardFilterRaceOptionInactive | null> {
        const { x, y } = clickPoint;
        const optionList = this.getAllCardFilterRaceOptionInactives();
        const clickedOption = this.cardFilterRaceOptionButtonsClickDetectRepository.isOptionClicked(
            { x, y },
            optionList,
            this.camera
        );

        if (clickedOption) {
            const currentClickedOptionType = clickedOption.type;
            console.log(`[DEBUG] Click Card Filter Race Option Type: ${currentClickedOptionType}`);
            this.toggleRaceOptionState(currentClickedOptionType);

            const currentClickedDeckId = this.getCurrentClickDeckId()!;
            const clickedRaceOptionTypes = this.getClickedRaceOptionTypes();
            const clickedGradeOptionTypes = this.getClickedGradeOptionTypes();

            if (this.isDeckEditMode() == true) {
                this.handleFilterRaceOptionToggleInDeckEditMode(clickedRaceOptionTypes, clickedGradeOptionTypes);
            } else {
                this.handleFilterRaceOptionToggle(currentClickedDeckId, clickedRaceOptionTypes, clickedGradeOptionTypes);
            }

            return clickedOption;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<CardFilterRaceOptionInactive | null> {
        if (!this.isAllOptionClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };

            return await this.handleOptionClick(clickPoint);
        }
        return null;
    }

    private handleFilterRaceOptionToggle(
        deckId: number,
        raceOptionTypes: CardRace[] | null,
        gradeOptionTypes: CardGrade[] | null
    ): void {
        const currentDeckCardSearchState = this.getDeckCardSearchStateInNormalMode();
        if (currentDeckCardSearchState == DeckCardSearchState.MATCHED) {
            const cardIdList = this.getSearchMatchedDeckCardIdList();
            if (cardIdList == null) return;

            if (gradeOptionTypes == null && raceOptionTypes == null) {
                this.applySearchResultToDeckElements(deckId, cardIdList);
            } else {
                this.applyOptionFilterResultToDeckElements(
                    deckId,
                    cardIdList,
                    raceOptionTypes as CardRace[] | null,
                    gradeOptionTypes as CardGrade[] | null
                );
            }

        } else {
            const cardIdList = this.getMyDeckCardIdListByDeckId(deckId);
            if (gradeOptionTypes == null && raceOptionTypes == null) {
                this.restoreAllDeckElementsAfterFilterClear(deckId);
            } else {
                this.applyOptionFilterResultToDeckElements(
                    deckId,
                    cardIdList,
                    raceOptionTypes as CardRace[] | null,
                    gradeOptionTypes as CardGrade[] | null
                );
            }
        }
    }

    private handleFilterRaceOptionToggleInDeckEditMode(
        raceOptionTypes: CardRace[] | null,
        gradeOptionTypes: CardGrade[] | null
    ): void {
        if (raceOptionTypes == null && gradeOptionTypes == null) {
            this.restoreAllDeckEditElementsAfterFilterClear();
        } else {
            this.sortFilteredDeckEditElements(
                raceOptionTypes as CardRace[] | null,
                gradeOptionTypes as CardGrade[] | null
            );
        }
    }

    private toggleRaceOptionState(optionType: CardRace) {
        const prevClickedOptionState = this.getCardFilterRaceOptionClickState(optionType);
        if (prevClickedOptionState == true) {
            // 이미 종족 옵션을 클릭한 상태일 때 (예: 이미 클릭한 휴먼 옵션 버튼 재클릭 시 선택 해제)
            this.setRaceOptionState(optionType, true);
        } else {
            // 필터 버튼을 처음 클릭할 때
            this.setRaceOptionState(optionType, false);
        }
    }

    private setRaceOptionState(type: CardRace, isActive: boolean): void {
        this.saveCardFilterRaceOptionClickState(type, !isActive);
        this.setRaceOptionVisibility(type, isActive);
    }

    private setRaceOptionVisibility(type: CardRace, isActive: boolean): void {
        this.setCardFilterRaceOptionInactiveVisibility(type, isActive);
        this.setCardFilterRaceOptionActiveVisibility(type, !isActive);
    }

    // 옵션 선택을 반영한 덱 요소 정렬
    private applyOptionFilterResultToDeckElements(
        deckId: number,
        cardIdList: number[], // 덱의 모든 카드 id 리스트 or 검색된 상태에서의 카드 id 리스트
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): void {
        const filteredCardIdList = this.getFilteredDeckCardIdList(cardIdList, raceType, gradeType);

        this.hideUnfilteredDeckElements(deckId, filteredCardIdList);
        this.adjustFilteredDeckCardPositions(deckId, filteredCardIdList);
        this.adjustFilteredDeckNumberOfCards(deckId, filteredCardIdList);
        this.adjustFilteredDeckMarkerPosition(deckId, filteredCardIdList);
    }

    // 검색 결과만 반영한 덱 요소 정렬(검색 매칭 상태 + 옵션 미선택)
    private applySearchResultToDeckElements(deckId: number, cardIdList: number[]): void {
        this.hideUnfilteredDeckElements(deckId, cardIdList);
        this.adjustFilteredDeckCardPositions(deckId, cardIdList);
        this.adjustFilteredDeckNumberOfCards(deckId, cardIdList);
        this.adjustFilteredDeckMarkerPosition(deckId, cardIdList);
    }

    private sortFilteredDeckEditElements(
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): void {
        const filteredCardIdList = this.getFilteredOwnedCardIdList(raceType, gradeType);
        const unfilteredCardIdList = this.getUnfilteredOwnedCardIdList(raceType, gradeType);

        this.hideUnfilteredDeckEditElements(filteredCardIdList);
        this.adjustFilteredOwnedCardPositions(filteredCardIdList);
        this.adjustUnfilteredOwnedCardPositions(filteredCardIdList, unfilteredCardIdList);
        this.adjustFilteredCardBlockerPositions(filteredCardIdList);
        this.adjustFilteredNumberOfRemainingCardsPosition(filteredCardIdList);
        this.adjustFilteredSlashesPosition(filteredCardIdList);
        this.adjustFilteredNumberOfTotalOwnedCardsPosition(filteredCardIdList);
        this.saveSearchUnmatchedOwnedCardsClickEnable(filteredCardIdList);
    }

    // 모든 옵션 선택이 해제된 경우 덱 카드와 카드 개수 객체의 위치 및 visible 상태 초기화
    private restoreAllDeckElementsAfterFilterClear(currentClickedDeckId: number): void {
        this.showAllMyDeckCards(currentClickedDeckId);
        this.showAllMyDeckNumberOfCards(currentClickedDeckId);
        this.showAllMyDeckMarkers(currentClickedDeckId);
    }

    private restoreAllDeckEditElementsAfterFilterClear(): void {
        this.restoreAllOwnedCardPositions();
        this.restoreAllCardBlockerPositions();
        this.restoreAllNumberOfRemainingCardsPositions();
        this.restoreAllSlashesPositions();
        this.restoreAllNumberOfTotalOwnedCardsPositions();
    }

    private setAllOptionClickEnabled(isEnabled: boolean): void {
        this.cardFilterRaceOptionButtonsClickDetectRepository.setAllOptionClickEnabled(isEnabled);
    }

    private isAllOptionClickEnabled(): boolean {
        return this.cardFilterRaceOptionButtonsClickDetectRepository.isAllOptionClickEnabled();
    }

    private getAllCardFilterRaceOptionInactives(): CardFilterRaceOptionInactive[] {
        return this.cardFilterRaceOptionInactiveRepository.findAllOptions();
    }

    private setCardFilterRaceOptionInactiveVisibility(type: CardRace, isVisible: boolean): void {
        this.cardFilterRaceOptionInactiveRepository.findRaceOptionByType(type)?.setVisibility(isVisible);
    }

    private setCardFilterRaceOptionActiveVisibility(type: CardRace, isVisible: boolean): void {
        this.cardFilterRaceOptionActiveRepository.findRaceOptionByType(type)?.setVisibility(isVisible);
    }

    private saveCardFilterRaceOptionClickState(type: CardRace, state: boolean): void {
        this.cardFilterRaceOptionButtonsClickDetectRepository.saveOptionClickState(type, state);
    }

    private getCardFilterRaceOptionClickState(type: CardRace): boolean | undefined {
        return this.cardFilterRaceOptionButtonsClickDetectRepository.findOptionClickState(type);
    }

    private getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

    public getClickedRaceOptionTypes(): CardRace[] | null {
        return this.cardFilterRaceOptionButtonsClickDetectRepository.findClickedOptionTypes();
    }

    public getClickedGradeOptionTypes(): CardGrade[] | null {
        return this.cardFilterGradeOptionClickDetectRepository.findClickedOptionTypes();
    }

    private isDeckEditMode(): boolean | null {
        return this.deckEditButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private getDeckCardSearchStateInNormalMode(): DeckCardSearchState {
        return this.deckCardSearchInputEnterDetectRepository.findDeckCardSearchState();
    }

    private getDeckCardSearchStateInDeckEditMode(): DeckCardSearchStateInDeckEditMode {
        return this.deckCardSearchInputEnterDetectRepository.findDeckEditSearchState();
    }

    private getMyDeckCardIdListByDeckId(deckId: number): number[] {
        return this.myDeckCardRepository.findCardIdListByDeckId(deckId);
    }

    private getSearchMatchedDeckCardIdList(): number[] | null {
        return this.deckCardSearchInputEnterDetectRepository.findMatchedDeckCardIdList();
    }

    private getFilteredDeckCardIdList(
        cardIdList: number[],
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): number[] | null {
        return this.myDeckCardRepository.filteredDeckCardIdList(cardIdList, raceType, gradeType);
    }

    private getFilteredOwnedCardIdList(
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): number[] | null {
        return this.myDeckOwnedCardsRepository.filteredOwnedCardIdList(raceType, gradeType);
    }

    private getUnfilteredOwnedCardIdList(
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): number[] {
        return this.myDeckOwnedCardsRepository.unfilteredOwnedCardIdList(raceType, gradeType);
    }

    private adjustFilteredDeckCardPositions(deckId: number, cardIdList: number[] | null): void {
        if (cardIdList == null) return;

        const cardCount = cardIdList.length;
        const positionList = this.myDeckCardPositionRepository.findSearchCardPosition(deckId, cardCount);

        for (let i = 0; i < cardCount; i++) {
            const cardId = cardIdList[i];
            const cardPosition = positionList[i]; // 같은 index로 매칭

            if (!cardPosition) return;

            const card = this.myDeckCardRepository.findCardByDeckIdAndCardId(deckId, cardId);
            if (card == null) return;

            card.setVisibility(true);
            const cardMesh = card.getMesh();

            const widthPercent = 0.096;
            const heightPercent = 1540 / 952;
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustFilteredDeckNumberOfCards(deckId: number, cardIdList: number[] | null): void {
        if (cardIdList == null) return;

        const numberCount = cardIdList.length;
        const positionList = this.myDeckNumberOfCardsPositionRepository.findSearchNumberPosition(deckId, numberCount);

        for (let i = 0; i < numberCount; i++) {
            const cardId = cardIdList[i];
            const numberPosition = positionList[i]; // 같은 index로 매칭

            if (!numberPosition) return;

            const numberOfCards = this.myDeckNumberOfCardsRepository.findNumberByDeckIdAndCardId(deckId, cardId);
            if (numberOfCards == null) return;

            numberOfCards.setVisibility(true);

            const numberOfCardsMesh = numberOfCards.getMesh();
            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberOfCardsMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustFilteredDeckMarkerPosition(deckId: number, cardIdList: number[] | null): void {
        if (cardIdList == null) return;

        const markerCount = cardIdList.length;
        const positionList = this.deckCardCountMarkerPositionRepository.findSearchMarkerPosition(deckId, markerCount);

        for (let i = 0; i < markerCount; i++) {
            const cardId = cardIdList[i];
            const numberPosition = positionList[i]; // 같은 index로 매칭

            if (!numberPosition) return;

            const marker = this.deckCardCountMarkerRepository.findMarkerByDeckIdAndCardId(deckId, cardId);
            if (marker == null) return;

            marker.setVisibility(true);

            const markerMesh = marker.getMesh();
            const widthPercent = 0.012;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(markerMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustFilteredOwnedCardPositions(cardIdList: number[] | null): void {
        if (cardIdList == null) return;

        const cardCount = cardIdList.length;
        const positionList = this.myDeckOwnedCardsPositionRepository.findSearchCardPosition(cardCount);

        for (let i = 0; i < cardCount; i++) {
            const cardId = cardIdList[i];
            const cardPosition = positionList[i];

            if (!cardPosition) return;

            const card = this.myDeckOwnedCardsRepository.findCardByCardId(cardId);
            if (card == null) return;

            card.setVisibility(true);

            const cardMesh = card.getMesh();
            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustUnfilteredOwnedCardPositions(
        filteredCardIdList: number[] | null,
        unfilteredCardIdList: number[]
    ): void {
        if (filteredCardIdList == null) return;

        const filteredCardCount = (filteredCardIdList.length + 1); // 이름 변경 필요
        const positionList = this.myDeckOwnedCardsPositionRepository.findSearchCardPosition(filteredCardCount);
        const lastPosition = positionList[positionList.length - 1];

        for (const cardId of unfilteredCardIdList) {
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

    private adjustFilteredCardBlockerPositions(cardIdList: number[] | null): void {
        if (cardIdList == null) return;

        const blockerCount = cardIdList.length;
        const positionList = this.cardSelectionBlockerPositionRepository.findSearchBlockerPosition(blockerCount);

        for (let i = 0; i < blockerCount; i++) {
            const cardId = cardIdList[i];
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

    private adjustFilteredNumberOfRemainingCardsPosition(cardIdList: number[] | null): void {
        if (cardIdList == null) return;

        const numberCount = cardIdList.length;
        const positionList = this.myDeckRemainingCardsPositionRepository.findSearchRemainingCardsPosition(numberCount);

        for (let i = 0; i < numberCount; i++) {
            const cardId = cardIdList[i];
            const numberPosition = positionList[i];

            if (!numberPosition) return;

            const remainingCardCount = this.cardCountManager.findRemainingCardCountByCardId(cardId);
            if (remainingCardCount == null) return;
//             console.log(`
//                 선택 가능한 카드 수량 필터링 결과
//                 cardId: ${cardId},
//                 remaining card count: ${remainingCardCount},
//                 positionX: ${numberPosition.getX()},
//                 positionY: ${numberPosition.getY()}
//             `);

            const cardUniqueId = this.myDeckRemainingCardsRepository.findRemainingCardIdByCardId(cardId);
            if (cardUniqueId == null) return;

            const numberOfRemainingCards = this.myDeckRemainingCardsRepository.findRemainingCardsById(cardUniqueId);
            if (numberOfRemainingCards == null) return;

            numberOfRemainingCards.setVisibility(true);

            const numberOfRemainingCardsMesh = numberOfRemainingCards.getMesh();
            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberOfRemainingCardsMesh, widthPercent, heightPercent, positionX, positionY);
            this.myDeckRemainingCardsPositionRepository.saveDeckEditModeFilteredPosition(cardId, numberPosition);
        }
    }

    private adjustFilteredSlashesPosition(cardIdList: number[] | null): void {
        if (cardIdList == null) return;

        const slashCount = cardIdList.length;
        const positionList = this.myDeckRemainingOutOfTotalSlashPositionRepository.findSearchSlashPosition(slashCount);

        for (let i = 0; i < slashCount; i++) {
            const cardId = cardIdList[i];
            const slashPosition = positionList[i];

            if (!slashPosition) return;

            const slashId = this.myDeckRemainingOutOfTotalSlashRepository.findSlashIdByCardId(cardId);
            if (slashId == null) return;

            const slash = this.myDeckRemainingOutOfTotalSlashRepository.findSlashById(slashId);
            if (slash == null) return;

            slash.setVisibility(true);

            const slashMesh = slash.getMesh();
            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = slashPosition.getX();
            const positionY = slashPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(slashMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustFilteredNumberOfTotalOwnedCardsPosition(cardIdList: number[] | null): void {
        if (cardIdList == null) return;

        const numberCount = cardIdList.length;
        const positionList = this.myDeckTotalOwnedCardsPositionRepository.findSearchPosition(numberCount);

        for (let i = 0; i < numberCount; i++) {
            const cardId = cardIdList[i];
            const numberPosition = positionList[i];

            if (!numberPosition) return;

            const numberId = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsIdByCardId(cardId);
            if (numberId == null) return;

            const numberObject = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsById(numberId);
            if (numberObject == null) return;

            numberObject.setVisibility(true);

            const numberMesh = numberObject.getMesh();
            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private hideUnfilteredDeckElements(
        deckId: number,
        filteredCardIdList: number[] | null
    ): void {
        const allCardIdList = this.myDeckCardRepository.findCardIdListByDeckId(deckId);
        for (const cardId of allCardIdList) {
            if (filteredCardIdList == null) return;

            if (!filteredCardIdList.includes(cardId)) {
                this.myDeckCardRepository.findCardByDeckIdAndCardId(deckId, cardId)?.setVisibility(false);
                this.myDeckNumberOfCardsRepository.findNumberByDeckIdAndCardId(deckId, cardId)?.setVisibility(false);
                this.deckCardCountMarkerRepository.findMarkerByDeckIdAndCardId(deckId, cardId)?.setVisibility(false);
            }
        }
    }

    private hideUnfilteredDeckEditElements(filteredCardIdList: number[] | null): void {
        const allCardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();
        for (const cardId of allCardIdList) {
            if (filteredCardIdList == null) return;

            if (!filteredCardIdList.includes(cardId)) {
                this.myDeckOwnedCardsRepository.findCardByCardId(cardId)?.setVisibility(false);
                this.cardSelectionBlockerRepository.findBlockerByCardId(cardId)?.setVisibility(false);
                this.myDeckRemainingCardsRepository.findRemainingCardByCardId(cardId)?.setVisibility(false);

                const slashId = this.myDeckRemainingOutOfTotalSlashRepository.findSlashIdByCardId(cardId);
                if (slashId == null) return;
                this.myDeckRemainingOutOfTotalSlashRepository.findSlashById(slashId)?.setVisibility(false);

                const numberId = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsIdByCardId(cardId);
                if (numberId == null) return;
                this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsById(numberId)?.setVisibility(false);
            }
        }
    }

    private showAllMyDeckCards(currentClickedDeckId: number): void {
        const allCards = this.myDeckCardRepository.findCardListByDeckId(currentClickedDeckId);
        if (allCards == null) return;

        allCards.forEach(card => card.setVisibility(true));
        this.restoreAllMyDeckCardPositions(currentClickedDeckId);
    }

    private showAllMyDeckNumberOfCards(currentClickedDeckId: number): void {
        const allNumbers = this.myDeckNumberOfCardsRepository.findNumberListByDeckId(currentClickedDeckId);
        if (allNumbers == null) return;

        allNumbers.forEach(numberMesh => numberMesh.setVisibility(true));
        this.restoreAllMyDeckNumberOfCardsPositions(currentClickedDeckId);
    }

    private showAllMyDeckMarkers(currentClickedDeckId: number): void {
        const allMarkers = this.deckCardCountMarkerRepository.findMarkerListByDeckId(currentClickedDeckId);
        if (allMarkers == null) return;

        allMarkers.forEach(marker => marker.setVisibility(true));
        this.restoreAllMyDeckMarkerPositions(currentClickedDeckId);
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

    private saveSearchUnmatchedOwnedCardsClickEnable(filteredCardIdList: number[] | null): void {
        const allCardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();
        for (const cardId of allCardIdList) {
            if (filteredCardIdList == null) return;

            if (!filteredCardIdList.includes(cardId)) {
                this.myDeckOwnedCardsClickDetectRepository.saveCardClickEnabled(cardId, false);
            } else {
                this.myDeckOwnedCardsClickDetectRepository.saveCardClickEnabled(cardId, true);
            }
        }
    }

}