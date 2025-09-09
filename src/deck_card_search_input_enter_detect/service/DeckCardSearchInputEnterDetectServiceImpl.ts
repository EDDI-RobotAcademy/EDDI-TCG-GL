import * as THREE from "three";

import {DeckCardSearchInputEnterDetectService} from "./DeckCardSearchInputEnterDetectService";
import {DeckCardSearchInputEnterDetectRepositoryImpl} from "../repository/DeckCardSearchInputEnterDetectRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";

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

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardSearchInputEnterDetectRepository = DeckCardSearchInputEnterDetectRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
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
            this.showEmptyInputPopup();
            return;
        }

        const matchedCardNames = this.findMatchingCardNames(deckId, inputText);
        if (matchedCardNames.length > 0) {
            this.filterVisibleCards(deckId, matchedCardNames);
            this.adjustMatchedCardPositions(deckId, matchedCardNames);

        } else {
            this.restoreAllCardPositions(deckId);
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

    // 입력값으로 시작하는 카드 이름을 찾아 반환
    private findMatchingCardNames(deckId: number, name: string): string[] {
        const cardNames = this.getCardNameList(deckId);
        const normalizedInput = name.replace(/\s+/g, '').toLowerCase();

        return cardNames.filter(cardName =>
            cardName.replace(/\s+/g, '').toLowerCase().startsWith(normalizedInput)
        );
    }

    private filterVisibleCards(deckId: number, names: string[]): void {
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

    private showNotFoundPopup(): void {
        console.log("[POPUP] 해당 이름의 카드를 찾을 수 없습니다.");
        // 팝업 표시 로직
    }

    private showEmptyInputPopup(): void {
        console.log("[POPUP] 텍스트를 입력하세요.");
        // 팝업 표시 로직
    }

}
