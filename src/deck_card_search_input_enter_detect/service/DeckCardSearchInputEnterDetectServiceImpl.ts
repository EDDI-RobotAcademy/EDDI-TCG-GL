import * as THREE from "three";

import {getCardById} from "../../card/utility";
import {DeckCardSearchStateInDeckEditMode} from "../entity/DeckCardSearchStateInDeckEditMode";
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
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardSearchInputEnterDetectServiceImpl {
        if (!DeckCardSearchInputEnterDetectServiceImpl.instance) {
            DeckCardSearchInputEnterDetectServiceImpl.instance = new DeckCardSearchInputEnterDetectServiceImpl(camera, scene);
        }
        return DeckCardSearchInputEnterDetectServiceImpl.instance;
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (!this.isEnterKey(event)) return;

        if (this.isDeckEditMode() == true) {
            this.handleDeckEditModeSearch();
            return;
        }

        this.handleNormalModeSearch();
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

    private handleDeckEditModeSearch(): void {
        const deckId = this.getCurrentClickDeckId()!;
        const inputText = this.myDeckSearchInputContainerRepository.findInputValue() || "";

        if (inputText.length === 0) {
            this.restoreAllElementsPositionInDeckEditMode();
            this.saveAllOwnedCardsClickEnabled();
            this.showEmptyInputPopup();
            this.setDeckEditSearchState(DeckCardSearchStateInDeckEditMode.DEFAULT);
            return;
        }

        const ownedCardNameList = this.getMyDeckOwnedCardNameList();
        const matchedCardNames = this.findMatchingCardNames(ownedCardNameList, inputText);

        if (matchedCardNames.length > 0) {
            this.hideUnmatchedElementsInDeckEditMode(matchedCardNames);
            this.adjustMatchedElementsInDeckEditMode(matchedCardNames);
            this.adjustUnmatchedOwnedCardPositions(matchedCardNames);
            this.saveSearchUnmatchedOwnedCardsClickEnable(matchedCardNames);
            this.setDeckEditSearchState(DeckCardSearchStateInDeckEditMode.MATCHED);
        } else {
            this.restoreAllElementsPositionInDeckEditMode();
            this.saveAllOwnedCardsClickEnabled();
            this.showNotFoundPopup();
            this.setDeckEditSearchState(DeckCardSearchStateInDeckEditMode.UNMATCHED);
        }
    }

    private handleNormalModeSearch(): void {
        const deckId = this.getCurrentClickDeckId()!;
        const inputText = this.myDeckSearchInputContainerRepository.findInputValue() || "";

        if (inputText.length === 0) {
            this.restoreMyDeckAllElement(deckId);
            this.showEmptyInputPopup();
            return;
        }

        const myDeckCardNameList = this.getMyDeckCardNameListByDeckId(deckId);
        const matchedCardNames = this.findMatchingCardNames(myDeckCardNameList, inputText);

        if (matchedCardNames.length > 0) {
            this.hideUnmatchedMyDeckAllElements(deckId, matchedCardNames);
            this.adjustMatchedMyDeckAllElementPosition(deckId, matchedCardNames);
            return;
        } else {
            this.restoreMyDeckAllElement(deckId);
            this.showNotFoundPopup();
        }
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

    private getMyDeckCardNameListByDeckId(deckId: number): string[] {
        const nameIdList = this.myDeckCardNameRepository.findCardNameIdListByDeckId(deckId);
        const cardNames: string[] = [];

        for (const nameId of nameIdList) {
            const cardName = this.myDeckCardNameRepository.findCardNameTextByCardNameId(nameId);
            if (cardName) {
                cardNames.push(cardName);
            }
        }
        return cardNames;
    }

    private getMyDeckOwnedCardNameList(): string[] {
        const cardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();
        const cardNames: string[] = [];

        for (const cardId of cardIdList) {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }

            const cardName = card.카드명;
            if (cardName) {
                cardNames.push(cardName);
            }
        }
        return cardNames;
    }

    // 특정 한 글자만 포함해도 매칭, 공백 무시 가능
    private findMatchingCardNames(cardNameList: string[], inputText: string): string[] {
        const normalizedInput = inputText.replace(/\s+/g, '').toLowerCase();

        return cardNameList.filter(cardName =>
            cardName.replace(/\s+/g, '').toLowerCase().includes(normalizedInput)
        );
    }

    // 매칭되지 않는 카드, 카드 개수, 마커 mesh 객체들은 화면에서 숨김
    // To-do: scene, renderer 구조로 분리하면 mesh scene 에서 제거 후, 다시 렌더링하는 방식으로 수정 필요
    // 스크롤 문제도 해결될 것임
    private hideUnmatchedMyDeckAllElements(deckId: number, names: string[]): void {
        this.hideSearchUnmatchedMyDeckCard(deckId, names);
        this.hideSearchUnmatchedMyDeckNumberOfCards(deckId, names);
        this.hideSearchUnmatchedMyDeckCountMarker(deckId, names);
    }

    // 검색된 카드, 카드 개수, 마커 mesh 객체들의 position 재정렬
    private adjustMatchedMyDeckAllElementPosition(deckId: number, names: string[]): void {
        this.adjustMatchedMyDeckCardPositions(deckId, names);
        this.adjustMatchedMyDeckNumberOfCardsPosition(deckId, names);
        this.adjustMatchedMyDeckMarkerPosition(deckId, names);
    }

    private restoreMyDeckAllElement(deckId: number): void {
        this.restoreAllMyDeckCardPositions(deckId);
        this.restoreAllMyDeckNumberOfCardsPositions(deckId);
        this.restoreAllMyDeckMarkerPositions(deckId);
    }

    private hideUnmatchedElementsInDeckEditMode(names: string[]): void {
        this.hideSearchUnmatchedOwnedCards(names);
        this.hideSearchUnmatchedCardBlockers(names);
        this.hideSearchUnmatchedNumberOfRemainingCards(names);
        this.hideSearchUnmatchedSlashes(names);
        this.hideSearchUnmatchedNumberOfTotalOwnedCards(names);
    }

    private adjustMatchedElementsInDeckEditMode(names: string[]): void {
        this.adjustMatchedOwnedCardPositions(names);
        this.adjustMatchedCardBlockerPositions(names);
        this.adjustMatchedNumberOfRemainingCardsPosition(names);
        this.adjustMatchedSlashesPosition(names);
        this.adjustMatchedNumberOfTotalOwnedCardsPosition(names);
    }

    private restoreAllElementsPositionInDeckEditMode(): void {
        this.restoreAllOwnedCardPositions();
        this.restoreAllCardBlockerPositions();
        this.restoreAllNumberOfRemainingCardsPositions();
        this.restoreAllSlashesPositions();
        this.restoreAllNumberOfTotalOwnedCardsPositions();
    }

    private findUnmatchedOwnedCardIdList(names: string[]): number[] {
        const cardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();

        // names 배열에 포함된 카드명에 해당하는 cardId는 제외
        const nameSet = new Set(names.map(name => name.toLowerCase()));
        const unmatchedCardIdList = cardIdList.filter(cardId => {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }
            return !nameSet.has(card.카드명.toLowerCase());
        });

        return unmatchedCardIdList;
    }

    private findMatchedOwnedCardIdList(names: string[]): number[] {
        const cardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();

        // names 배열에 포함된 카드명에 해당하는 cardId만 필터링
        const nameSet = new Set(names.map(name => name.toLowerCase()));
        const matchedCardIdList = cardIdList.filter(cardId => {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }
            return nameSet.has(card.카드명.toLowerCase());
        });

        return matchedCardIdList;
    }

    private saveSearchUnmatchedOwnedCardsClickEnable(names: string[]): void {
        const unmatchedCardIdList = this.findUnmatchedOwnedCardIdList(names);
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

    private hideSearchUnmatchedOwnedCards(names: string[]): void {
        const filteredCardIdList = this.findUnmatchedOwnedCardIdList(names);

        for (const filteredCardId of filteredCardIdList) {
            this.myDeckOwnedCardsRepository.findCardByCardId(filteredCardId)?.setVisibility(false);
        }
    }

    private hideSearchUnmatchedCardBlockers(names: string[]): void {
        const filteredCardIdList = this.findUnmatchedOwnedCardIdList(names);

        for (const filteredCardId of filteredCardIdList) {
            this.cardSelectionBlockerRepository.findBlockerByCardId(filteredCardId)?.setVisibility(false);
        }
    }

    private hideSearchUnmatchedNumberOfRemainingCards(names: string[]): void {
        const filteredCardIdList = this.findUnmatchedOwnedCardIdList(names);

        for (const filteredCardId of filteredCardIdList) {
            this.myDeckRemainingCardsRepository.findRemainingCardByCardId(filteredCardId)?.setVisibility(false);
        }
    }

    private hideSearchUnmatchedSlashes(names: string[]): void {
        const filteredCardIdList = this.findUnmatchedOwnedCardIdList(names);

        for (const filteredCardId of filteredCardIdList) {
            const slashId = this.myDeckRemainingOutOfTotalSlashRepository.findSlashIdByCardId(filteredCardId);
            if (slashId == null) return;

            this.myDeckRemainingOutOfTotalSlashRepository.findSlashById(slashId)?.setVisibility(false);
        }
    }

    private hideSearchUnmatchedNumberOfTotalOwnedCards(names: string[]): void {
        const filteredCardIdList = this.findUnmatchedOwnedCardIdList(names);

        for (const filteredCardId of filteredCardIdList) {
            const numberId = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsIdByCardId(filteredCardId);
            if (numberId == null) return;

            this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsById(numberId)?.setVisibility(false);
        }
    }

    // 검색 후 검색어와 매칭되지 않은 나머지 카드들을 화면에서 숨김
    private hideSearchUnmatchedMyDeckCard(deckId: number, names: string[]): void {
        // 현재 덱에 등록된 모든 카드의 uniqueId 가져오기
        const cardUniqueIdList = this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);

        for (const cardUniqueId of cardUniqueIdList) {
            const cardId = this.myDeckCardRepository.findCardIdByCardUniqueId(cardUniqueId);
            if (cardId == null) return;

            // name 리스트 중에서 cardId와 일치하는 게 있는지 확인
            const isMatched = names.some(name => {
                const searchCardId = this.myDeckCardNameRepository.findCardIdByDeckIdAndCardNameText(deckId, name);
                return searchCardId === cardId;
            });

            if (!isMatched) {
                const card = this.myDeckCardRepository.findCardByDeckIdAndCardId(deckId, cardId);
                if (card) card.setVisibility(false);
            }
        }
    }

    private hideSearchUnmatchedMyDeckNumberOfCards(deckId: number, names: string[]): void {
        const numberIdList = this.myDeckNumberOfCardsRepository.findNumberIdListByDeckId(deckId);

        for (const numberId of numberIdList) {
            const cardId = this.myDeckNumberOfCardsRepository.findCardIdByNumberId(numberId);
            if (cardId == null) return;

            const isMatched = names.some(name => {
                const searchCardId = this.myDeckCardNameRepository.findCardIdByDeckIdAndCardNameText(deckId, name);
                return searchCardId === cardId;
            });

            if (!isMatched) {
                const number = this.myDeckNumberOfCardsRepository.findNumberByDeckIdAndCardId(deckId, cardId);
                if (number) number.setVisibility(false);
            }
        }
    }

    private hideSearchUnmatchedMyDeckCountMarker(deckId: number, names: string[]): void {
        const markerIdList = this.deckCardCountMarkerRepository.findMarkerIdListByDeckId(deckId);

        for (const markerId of markerIdList) {
            const cardId = this.deckCardCountMarkerRepository.findCardIdByMarkerId(markerId);
            if (cardId == null) return;

            const isMatched = names.some(name => {
                const searchCardId = this.myDeckCardNameRepository.findCardIdByDeckIdAndCardNameText(deckId, name);
                return searchCardId === cardId;
            });

            if (!isMatched) {
                const marker = this.deckCardCountMarkerRepository.findMarkerByDeckIdAndCardId(deckId, cardId);
                if (marker) marker.setVisibility(false);
            }
        }
    }

    private adjustMatchedOwnedCardPositions(names: string[]): void {
        const namesLength = names.length;
        const positionList = this.myDeckOwnedCardsPositionRepository.findSearchCardPosition(namesLength);
        const matchedOwnedCardIdList = this.findMatchedOwnedCardIdList(names);

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const cardPosition = positionList[i]; // 같은 index로 매칭

            if (!cardPosition) return;

            const matchedOwnedCardId = matchedOwnedCardIdList[i];
            if (matchedOwnedCardId == null) return;

            const card = this.myDeckOwnedCardsRepository.findCardByCardId(matchedOwnedCardId);
            if (card == null) return;

            const cardMesh = card.getMesh();

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustUnmatchedOwnedCardPositions(names: string[]): void {
        const namesLength = (names.length + 1);
        const positionList = this.myDeckOwnedCardsPositionRepository.findSearchCardPosition(namesLength);
        const lastPosition = positionList[positionList.length - 1];
        const unmatchedOwnedCardIdList = this.findUnmatchedOwnedCardIdList(names);

        for (const cardId of unmatchedOwnedCardIdList) {
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

    private adjustMatchedCardBlockerPositions(names: string[]): void {
        const namesLength = names.length;
        const positionList = this.cardSelectionBlockerPositionRepository.findSearchBlockerPosition(namesLength);
        const matchedCardIdList = this.findMatchedOwnedCardIdList(names);

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const cardPosition = positionList[i]; // 같은 index로 매칭

            if (!cardPosition) return;

            const matchedCardId = matchedCardIdList[i];
            if (matchedCardId == null) return;

            const blocker = this.cardSelectionBlockerRepository.findBlockerByCardId(matchedCardId);
            if (blocker == null) return;

            const blockerMesh = blocker.getMesh();

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(blockerMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustMatchedNumberOfRemainingCardsPosition(names: string[]): void {
        const namesLength = names.length;
        const positionList = this.myDeckRemainingCardsPositionRepository.findSearchRemainingCardsPosition(namesLength);
        const matchedCardIdList = this.findMatchedOwnedCardIdList(names);

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const numberPosition = positionList[i]; // 같은 index로 매칭

            if (!numberPosition) return;

            const matchedCardId = matchedCardIdList[i];
            if (matchedCardId == null) return;

            const numberOfRemainingCards = this.myDeckRemainingCardsRepository.findRemainingCardByCardId(matchedCardId);
            if (numberOfRemainingCards == null) return;

            const numberOfRemainingCardsMesh = numberOfRemainingCards.getMesh();

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberOfRemainingCardsMesh, widthPercent, heightPercent, positionX, positionY);
            this.myDeckRemainingCardsPositionRepository.saveSearchModePosition(matchedCardId, numberPosition);
        }
    }

    private adjustMatchedSlashesPosition(names: string[]): void {
        const namesLength = names.length;
        const positionList = this.myDeckRemainingOutOfTotalSlashPositionRepository.findSearchSlashPosition(namesLength);
        const matchedCardIdList = this.findMatchedOwnedCardIdList(names);

        for (let i = 0; i < names.length; i++) {
            const slashPosition = positionList[i]; // 같은 index로 매칭
            if (!slashPosition) return;

            const matchedCardId = matchedCardIdList[i];
            if (matchedCardId == null) return;

            const slashId = this.myDeckRemainingOutOfTotalSlashRepository.findSlashIdByCardId(matchedCardId);
            if (slashId == null) return;

            const slash = this.myDeckRemainingOutOfTotalSlashRepository.findSlashById(slashId);
            if (slash == null) return;

            const slashMesh = slash.getMesh();

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = slashPosition.getX();
            const positionY = slashPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(slashMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustMatchedNumberOfTotalOwnedCardsPosition(names: string[]): void {
        const namesLength = names.length;
        const positionList = this.myDeckTotalOwnedCardsPositionRepository.findSearchPosition(namesLength);
        const matchedCardIdList = this.findMatchedOwnedCardIdList(names);

        for (let i = 0; i < names.length; i++) {
            const numberPosition = positionList[i]; // 같은 index로 매칭
            if (!numberPosition) return;

            const matchedCardId = matchedCardIdList[i];
            if (matchedCardId == null) return;

            const numberId = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsIdByCardId(matchedCardId);
            if (numberId == null) return;

            const numberObject = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsById(numberId);
            if (numberObject == null) return;

            const numberMesh = numberObject.getMesh();

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustMatchedMyDeckCardPositions(deckId: number, names: string[]): void {
        const namesLength = names.length;
        const positionList = this.myDeckCardPositionRepository.findSearchCardPosition(deckId, namesLength);

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const cardPosition = positionList[i]; // 같은 index로 매칭

            if (!cardPosition) return;

            const cardId = this.myDeckCardNameRepository.findCardIdByDeckIdAndCardNameText(deckId, name);
            if (cardId == null) return;

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

    private adjustMatchedMyDeckNumberOfCardsPosition(deckId: number, names: string[]): void {
        const namesLength = names.length;
        const positionList = this.myDeckNumberOfCardsPositionRepository.findSearchNumberPosition(deckId, namesLength);

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const numberPosition = positionList[i]; // 같은 index로 매칭

            if (!numberPosition) return;

            const cardId = this.myDeckCardNameRepository.findCardIdByDeckIdAndCardNameText(deckId, name);
            if (cardId == null) return;

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

    private adjustMatchedMyDeckMarkerPosition(deckId: number, names: string[]): void {
        const namesLength = names.length;
        const positionList = this.deckCardCountMarkerPositionRepository.findSearchMarkerPosition(deckId, namesLength);

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const numberPosition = positionList[i]; // 같은 index로 매칭

            if (!numberPosition) return;

            const cardId = this.myDeckCardNameRepository.findCardIdByDeckIdAndCardNameText(deckId, name);
            if (cardId == null) return;

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
    }

    private showEmptyInputPopup(): void {
        console.log("[POPUP] 텍스트를 입력하세요.");
        // 팝업 표시 로직
    }

}
