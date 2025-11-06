import * as THREE from "three";

import {CardGrade} from "../../card/grade";
import {CardRace} from "../../card/race";
import {getCardById} from "../../card/utility";
import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";

import {CardFilterGradeOptionClickDetectService} from "./CardFilterGradeOptionClickDetectService";
import {CardFilterGradeOptionClickDetectRepositoryImpl} from "../repository/CardFilterGradeOptionClickDetectRepositoryImpl";

import {CardFilterGradeOptionInactive} from "../../card_filter_grade_option_inactive/entity/CardFilterGradeOptionInactive";
import {CardFilterGradeOptionInactiveRepositoryImpl} from "../../card_filter_grade_option_inactive/repository/CardFilterGradeOptionInactiveRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {CardFilterGradeOptionActiveRepositoryImpl} from "../../card_filter_grade_option_active/repository/CardFilterGradeOptionActiveRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {MyDeckNumberOfCardsPositionRepositoryImpl} from "../../my_deck_number_of_cards_position/repository/MyDeckNumberOfCardsPositionRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {DeckCardCountMarkerPositionRepositoryImpl} from "../../deck_card_count_marker_position/repository/DeckCardCountMarkerPositionRepositoryImpl";
import {CardFilterRaceOptionClickDetectRepositoryImpl} from "../../card_filter_race_option_click_detect/repository/CardFilterRaceOptionClickDetectRepositoryImpl";

export class CardFilterGradeOptionClickDetectServiceImpl implements CardFilterGradeOptionClickDetectService {
    private static instance: CardFilterGradeOptionClickDetectServiceImpl | null = null;
    private myDeckElementAdjuster: MyDeckElementAdjuster;
    private cameraRepository: CameraRepository;
    private cardFilterGradeOptionClickDetectRepository: CardFilterGradeOptionClickDetectRepositoryImpl;
    private cardFilterGradeOptionInactiveRepository: CardFilterGradeOptionInactiveRepositoryImpl;
    private cardFilterGradeOptionActiveRepository: CardFilterGradeOptionActiveRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private myDeckNumberOfCardsPositionRepository: MyDeckNumberOfCardsPositionRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private deckCardCountMarkerPositionRepository: DeckCardCountMarkerPositionRepositoryImpl;
    private cardFilterRaceOptionClickDetectRepository: CardFilterRaceOptionClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardFilterGradeOptionClickDetectRepository = CardFilterGradeOptionClickDetectRepositoryImpl.getInstance();
        this.cardFilterGradeOptionInactiveRepository = CardFilterGradeOptionInactiveRepositoryImpl.getInstance(scene);
        this.cardFilterGradeOptionActiveRepository = CardFilterGradeOptionActiveRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfCardsPositionRepository = MyDeckNumberOfCardsPositionRepositoryImpl.getInstance();
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerPositionRepository = DeckCardCountMarkerPositionRepositoryImpl.getInstance();
        this.cardFilterRaceOptionClickDetectRepository = CardFilterRaceOptionClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): CardFilterGradeOptionClickDetectServiceImpl {
        if (!CardFilterGradeOptionClickDetectServiceImpl.instance) {
            CardFilterGradeOptionClickDetectServiceImpl.instance = new CardFilterGradeOptionClickDetectServiceImpl(camera, scene);
        }
        return CardFilterGradeOptionClickDetectServiceImpl.instance;
    }

    async handleOptionClick(clickPoint: { x: number; y: number }): Promise<CardFilterGradeOptionInactive | null> {
        const { x, y } = clickPoint;
        const optionList = this.getAllCardFilterGradeOptionInactives();
        const clickedOption = this.cardFilterGradeOptionClickDetectRepository.isOptionClicked(
            { x, y },
            optionList,
            this.camera
        );

        if (clickedOption) {
            const currentClickedOptionType = clickedOption.type;
            console.log(`[DEBUG] Click Card Filter Grade Option Type: ${currentClickedOptionType}`);
            this.handleFilterGradeOptionToggle(currentClickedOptionType);

            return clickedOption;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<CardFilterGradeOptionInactive | null> {
        if (!this.isAllGradeOptionClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };

            return await this.handleOptionClick(clickPoint);
        }
        return null;
    }

    private handleFilterGradeOptionToggle(optionType: CardGrade): void {
        const prevClickedOptionState = this.getCardFilterGradeOptionClickState(optionType);
        if (prevClickedOptionState == true) {
            // 이전에 클릭했을 때
            this.updateGradeOptionState(optionType, true);
        } else {
            // 이전에 클릭하지 않았을 때
            this.updateGradeOptionState(optionType, false);
        }

        const currentClickedDeckId = this.getCurrentClickDeckId()!
        const clickedGradeOptionTypes = this.getClickedGradeOptionTypes();
        const clickedRaceOptionTypes = this.getClickedRaceOptionTypes();

        if (clickedGradeOptionTypes == null && clickedRaceOptionTypes == null) {
            this.restoreAllDeckElementsAfterFilterClear(currentClickedDeckId);
        } else {
            this.sortFilteredMyDeckElements(
                currentClickedDeckId,
                clickedRaceOptionTypes as CardRace[] | null,
                clickedGradeOptionTypes as CardGrade[] | null
            );
        }
    }

    private updateGradeOptionState(type: CardGrade, isActive: boolean): void {
        this.saveCardFilterGradeOptionClickState(type, !isActive);
        this.updateGradeOptionVisibility(type, isActive);
    }

    private updateGradeOptionVisibility(type: CardGrade, isActive: boolean): void {
        this.setCardFilterGradeOptionInactiveVisibility(type, isActive);
        this.setCardFilterGradeOptionActiveVisibility(type, !isActive);
    }

    private sortFilteredMyDeckElements(
        deckId: number,
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): void {
        const filteredCardIdList = this.filteredDeckCardIdList(deckId, raceType, gradeType);

        this.hideUnfilteredDeckElements(deckId, filteredCardIdList);
        this.adjustFilteredDeckCardPositions(deckId, filteredCardIdList);
        this.adjustFilteredDeckNumberOfCards(deckId, filteredCardIdList);
        this.adjustFilteredDeckMarkerPosition(deckId, filteredCardIdList);
    }

    private restoreAllDeckElementsAfterFilterClear(currentClickedDeckId: number): void {
        this.showAllMyDeckCards(currentClickedDeckId);
        this.showAllMyDeckNumberOfCards(currentClickedDeckId);
        this.showAllMyDeckMarkers(currentClickedDeckId);
    }

    private getAllCardFilterGradeOptionInactives(): CardFilterGradeOptionInactive[] {
        return this.cardFilterGradeOptionInactiveRepository.findAllGradeOptions();
    }

    private setAllGradeOptionClickEnabled(isEnabled: boolean): void {
        this.cardFilterGradeOptionClickDetectRepository.setAllOptionClickEnabled(isEnabled);
    }

    private isAllGradeOptionClickEnabled(): boolean {
        return this.cardFilterGradeOptionClickDetectRepository.isAllOptionClickEnabled();
    }

    private saveCardFilterGradeOptionClickState(type: CardGrade, state: boolean): void {
        this.cardFilterGradeOptionClickDetectRepository.saveOptionClickState(type, state);
    }

    private getCardFilterGradeOptionClickState(type: CardGrade): boolean | undefined {
        return this.cardFilterGradeOptionClickDetectRepository.findOptionClickState(type);
    }

    private getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

    private getClickedGradeOptionTypes(): CardGrade[] | null {
        return this.cardFilterGradeOptionClickDetectRepository.findClickedOptionTypes();
    }

    private getClickedRaceOptionTypes(): CardRace[] | null {
        return this.cardFilterRaceOptionClickDetectRepository.findClickedOptionTypes();
    }

    private setCardFilterGradeOptionInactiveVisibility(type: CardGrade, isVisible: boolean): void {
        this.cardFilterGradeOptionInactiveRepository.findGradeOptionByType(type)?.setVisibility(isVisible);
    }

    private setCardFilterGradeOptionActiveVisibility(type: CardGrade, isVisible: boolean): void {
        this.cardFilterGradeOptionActiveRepository.findGradeOptionByType(type)?.setVisibility(isVisible);
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

    private hideUnfilteredDeckElements(deckId: number, filteredCardIdList: number[] | null): void {
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