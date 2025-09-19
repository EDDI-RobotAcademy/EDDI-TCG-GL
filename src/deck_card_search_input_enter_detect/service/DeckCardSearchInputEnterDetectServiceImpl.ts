import * as THREE from "three";

import {getCardById} from "../../card/utility";

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
            this.showEmptyInputPopup();
            return;
        }

        const ownedCardNameList = this.getMyDeckOwnedCardNameList();
        const matchedCardNames = this.findMatchingCardNames(ownedCardNameList, inputText);

        if (matchedCardNames.length > 0) {
            this.hideUnmatchedElementsInDeckEditMode(matchedCardNames);
            this.adjustMatchedElementsInDeckEditMode(matchedCardNames);
        } else {
            this.restoreAllElementsPositionInDeckEditMode();
            this.showNotFoundPopup();
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
    }

    private adjustMatchedElementsInDeckEditMode(names: string[]): void {
        this.adjustMatchedOwnedCardPositions(names);
        this.adjustMatchedCardBlockerPositions(names);
    }

    private restoreAllElementsPositionInDeckEditMode(): void {
        this.restoreAllOwnedCardPositions();
        this.restoreAllCardBlockerPositions();
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
