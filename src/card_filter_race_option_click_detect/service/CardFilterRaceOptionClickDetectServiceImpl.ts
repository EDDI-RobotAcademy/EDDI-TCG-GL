import * as THREE from "three";

import {MyDeckCard} from "../../my_deck_card/entity/MyDeckCard";
import {CardRace} from "../../card/race";
import {CardGrade} from "../../card/grade";
import {getCardById} from "../../card/utility";

import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";

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

export class CardFilterRaceOptionClickDetectServiceImpl implements CardFilterRaceOptionClickDetectService {
    private static instance: CardFilterRaceOptionClickDetectServiceImpl | null = null;
    private myDeckElementAdjuster: MyDeckElementAdjuster;
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

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
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
            this.handleFilterRaceOptionToggle(currentClickedOptionType);

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

    private handleFilterRaceOptionToggle(optionType: CardRace): void {
        const prevClickedOptionState = this.getCardFilterRaceOptionClickState(optionType);
        if (prevClickedOptionState == true) {
            // 이미 종족 옵션을 클릭한 상태일 때 (예: 이미 클릭한 휴먼 옵션 버튼 재클릭 시 선택 해제)
            this.updateRaceOptionState(optionType, true);
        } else {
            // 필터 버튼을 처음 클릭할 때
            this.updateRaceOptionState(optionType, false);
        }

        // 선택한 옵션에 따라 카드 필터링
        const currentClickedDeckId = this.getCurrentClickDeckId()!
        const clickedGradeOptionTypes = this.getClickedGradeOptionTypes();
        const clickedRaceOptionTypes = this.getClickedRaceOptionTypes();

        // 모든 옵션 선택이 해제되었을 때
        if (clickedGradeOptionTypes == null && clickedRaceOptionTypes == null) {
            this.restoreAllDeckElementsAfterFilterClear(currentClickedDeckId);
        } else {
            this.sortFilteredDeck(
                currentClickedDeckId,
                clickedRaceOptionTypes as CardRace[] | null,
                clickedGradeOptionTypes as CardGrade[] | null
            );
        }
    }

    private updateRaceOptionState(type: CardRace, isActive: boolean): void {
        this.saveCardFilterRaceOptionClickState(type, !isActive);
        this.updateRaceOptionVisibility(type, isActive);
    }

    private updateRaceOptionVisibility(type: CardRace, isActive: boolean): void {
        this.setCardFilterRaceOptionInactiveVisibility(type, isActive);
        this.setCardFilterRaceOptionActiveVisibility(type, !isActive);
    }

    private sortFilteredDeck(
        deckId: number,
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): void {
        const filteredCardIdList = this.filteredDeckCardIdList(deckId, raceType, gradeType);

        this.hideUnFilteredDeckElements(deckId, filteredCardIdList);
        this.adjustFilteredDeckCardPositions(deckId, filteredCardIdList);
        this.adjustFilteredDeckNumberOfCards(deckId, filteredCardIdList);
        this.adjustFilteredDeckMarkerPosition(deckId, filteredCardIdList);

    }

    // 모든 옵션 선택이 해제된 경우 덱 카드와 카드 개수 객체의 위치 및 visible 상태 초기화
    private restoreAllDeckElementsAfterFilterClear(currentClickedDeckId: number): void {
        this.showAllMyDeckCards(currentClickedDeckId);
        this.showAllMyDeckNumberOfCards(currentClickedDeckId);
        this.showAllMyDeckMarkers(currentClickedDeckId);
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

    private getClickedRaceOptionTypes(): CardRace[] | null {
        return this.cardFilterRaceOptionButtonsClickDetectRepository.findClickedOptionTypes();
    }

    private getClickedGradeOptionTypes(): CardGrade[] | null {
        return this.cardFilterGradeOptionClickDetectRepository.findClickedOptionTypes();
    }

    private filteredDeckCardIdList(
        deckId: number,
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): number[] | null {
        const allCurrentDeckCardIdList = this.myDeckCardRepository.findCardIdListByDeckId(deckId);
        const filteredCardIdList: number[] = [];

        // 둘 다 선택되지 않았으면 필터링 없이 전체 카드 유지 (null로 표시)
        const hasRaceFilter = raceType && raceType.length > 0;
        const hasGradeFilter = gradeType && gradeType.length > 0;

        if (!hasRaceFilter && !hasGradeFilter) {
            return null;
        }

        for (const cardId of allCurrentDeckCardIdList) {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }

            const cardRace = Number(card.종족);
            const cardGrade = Number(card.등급);

            // 선택된 필터만 조건으로 적용
            const raceMatches = !hasRaceFilter || raceType!.includes(cardRace);
            const gradeMatches = !hasGradeFilter || gradeType!.includes(cardGrade);

            // 둘 다 선택된 경우엔 AND 조건으로 필터링
            if (raceMatches && gradeMatches) {
                filteredCardIdList.push(cardId);
            }
        }

        return filteredCardIdList;
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

    private hideUnFilteredDeckElements(
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

}