import * as THREE from "three";

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
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardSearchInputEnterDetectServiceImpl {
        if (!DeckCardSearchInputEnterDetectServiceImpl.instance) {
            DeckCardSearchInputEnterDetectServiceImpl.instance = new DeckCardSearchInputEnterDetectServiceImpl(camera, scene);
        }
        return DeckCardSearchInputEnterDetectServiceImpl.instance;
    }

    public onKeyDown(event: KeyboardEvent): void {
        const searchInputContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
        if (searchInputContainer == null) return;

        const deckId = this.getCurrentClickDeckButtonId();
        if (deckId == null) return;

        const inputElement = searchInputContainer.getInputElement();
        const isEnter = this.deckCardSearchInputEnterDetectRepository.isEnterPressed(inputElement, event);
        if (isEnter == false) return;

        const inputText = this.deckCardSearchInputEnterDetectRepository.getInputValue(inputElement);

        if (inputText.length === 0) {
            this.restoreAllCardPositions(deckId);
            this.restoreAllNumberOfCardsPositions(deckId);
            this.restoreAllMarkerPositions(deckId);
            this.showEmptyInputPopup();
            return;
        }

        const matchedCardNames = this.findMatchingCardNames(deckId, inputText);
        if (matchedCardNames.length > 0) {
            // 매칭되지 않는 카드, 카드 개수, 마커 mesh 객체들은 화면에서 숨김
            // 이 상태에서 position 을 그대로 두면 스크롤 기능 때문에 밑에까지 스크롤이 실행됨
            // To-do: scene, renderer 구조로 분리하면 mesh scene 에서 제거 후, 다시 렌더링 하면 됨. 위의 문제도 없어질 것임.
            this.updateCardVisibilityBySearch(deckId, matchedCardNames);
            this.updateNumberOfCardsVisibilityBySearch(deckId, matchedCardNames);
            this.updateCountMarkerVisibilityBySearch(deckId, matchedCardNames);

            // 검색된 카드, 카드 개수, 마커 mesh 객체들의 position 재정렬
            this.adjustMatchedCardPositions(deckId, matchedCardNames);
            this.adjustMatchedNumberOfCardsPosition(deckId, matchedCardNames);
            this.adjustMatchedMarkerPosition(deckId, matchedCardNames);

        } else {
            this.restoreAllCardPositions(deckId);
            this.restoreAllNumberOfCardsPositions(deckId);
            this.restoreAllMarkerPositions(deckId);
            this.showNotFoundPopup();
        }

    }

    private getCurrentClickDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private getCardNameList(deckId: number): string[] {
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

    // 특정 한 글자만 포함해도 매칭, 공백 무시 가능
    private findMatchingCardNames(deckId: number, name: string): string[] {
        const cardNames = this.getCardNameList(deckId);
        const normalizedInput = name.replace(/\s+/g, '').toLowerCase();

        return cardNames.filter(cardName =>
            cardName.replace(/\s+/g, '').toLowerCase().includes(normalizedInput)
        );
    }

    // 검색 후 검색어와 매칭되지 않은 나머지 카드들을 화면에서 숨김
    private updateCardVisibilityBySearch(deckId: number, names: string[]): void {
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

    private updateNumberOfCardsVisibilityBySearch(deckId: number, names: string[]): void {
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

    private updateCountMarkerVisibilityBySearch(deckId: number, names: string[]): void {
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

    private adjustMatchedCardPositions(deckId: number, names: string[]): void {
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

    private adjustMatchedNumberOfCardsPosition(deckId: number, names: string[]): void {
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

    private adjustMatchedMarkerPosition(deckId: number, names: string[]): void {
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

    private restoreAllCardPositions(deckId: number): void {
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

    private restoreAllNumberOfCardsPositions(deckId: number): void {
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

    private restoreAllMarkerPositions(deckId: number): void {
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
