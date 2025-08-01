import * as THREE from "three";
import {getCardById} from "../../card/utility";

import {DeckCardDeleteButtonClickDetectService} from "./DeckCardDeleteButtonClickDetectService";
import {DeckCardDeleteButtonClickDetectRepositoryImpl} from "../repository/DeckCardDeleteButtonClickDetectRepositoryImpl";

import {DeckCardDeleteButton} from "../../deck_card_delete_button/entity/DeckCardDeleteButton";
import {DeckCardDeleteButtonRepositoryImpl} from "../../deck_card_delete_button/repository/DeckCardDeleteButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {DeckCardDeleteButtonPositionRepositoryImpl} from "../../deck_card_delete_button_position/repository/DeckCardDeleteButtonPositionRepositoryImpl";
import {MyDeckCardMapRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardMapRepositoryImpl";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckBlockPositionRepositoryImpl} from "../../my_deck_block_position/repository/MyDeckBlockPositionRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {MyDeckCardNamePositionRepositoryImpl} from "../../my_deck_card_name_position/repository/MyDeckCardNamePositionRepositoryImpl";
import {MyDeckNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_number_of_selected_cards/repository/MyDeckNumberOfSelectedCardsRepositoryImpl";
import {MyDeckNumberOfSelectedCardsPositionRepositoryImpl} from "../../my_deck_number_of_selected_cards_position/repository/MyDeckNumberOfSelectedCardsPositionRepositoryImpl";
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {DeckCardAddButtonRepositoryImpl} from "../../deck_card_add_button/repository/DeckCardAddButtonRepositoryImpl";
import {DeckCardAddButtonPositionRepositoryImpl} from "../../deck_card_add_button_position/repository/DeckCardAddButtonPositionRepositoryImpl";
import {MyDeckNumberOfSelectedCardsCloneRepositoryImpl} from "../../my_deck_number_of_selected_cards_clone/repository/MyDeckNumberOfSelectedCardsCloneRepositoryImpl";
import {MyDeckNumberOfSelectedCardsClonePositionRepositoryImpl} from "../../my_deck_number_of_selected_cards_clone_position/repository/MyDeckNumberOfSelectedCardsClonePositionRepositoryImpl";
import {MyDeckBlockCloneRepositoryImpl} from "../../my_deck_block_clone/repository/MyDeckBlockCloneRepositoryImpl";
import {MyDeckBlockClonePositionRepositoryImpl} from "../../my_deck_block_clone_position/repository/MyDeckBlockClonePositionRepositoryImpl";
import {MyDeckCardNameCloneRepositoryImpl} from "../../my_deck_card_name_clone/repository/MyDeckCardNameCloneRepositoryImpl";
import {MyDeckCardNameClonePositionRepositoryImpl} from "../../my_deck_card_name_clone_position/repository/MyDeckCardNameClonePositionRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";
import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";

export class DeckCardDeleteButtonClickDetectServiceImpl implements DeckCardDeleteButtonClickDetectService {
    private static instance: DeckCardDeleteButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckCardDeleteButtonClickDetectRepository: DeckCardDeleteButtonClickDetectRepositoryImpl;
    private deckCardDeleteButtonRepository: DeckCardDeleteButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private deckCardDeleteButtonPositionRepository: DeckCardDeleteButtonPositionRepositoryImpl;
    private myDeckCardMapRepository: MyDeckCardMapRepositoryImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckBlockPositionRepository: MyDeckBlockPositionRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private myDeckCardNamePositionRepository: MyDeckCardNamePositionRepositoryImpl;
    private myDeckNumberOfSelectedCardsRepository: MyDeckNumberOfSelectedCardsRepositoryImpl;
    private myDeckNumberOfSelectedCardsPositionRepository: MyDeckNumberOfSelectedCardsPositionRepositoryImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private deckCardAddButtonRepository: DeckCardAddButtonRepositoryImpl;
    private deckCardAddButtonPositionRepository: DeckCardAddButtonPositionRepositoryImpl;
    private myDeckNumberOfSelectedCardsCloneRepository: MyDeckNumberOfSelectedCardsCloneRepositoryImpl;
    private myDeckNumberOfSelectedCardsClonePositionRepository: MyDeckNumberOfSelectedCardsClonePositionRepositoryImpl;
    private myDeckBlockCloneRepository: MyDeckBlockCloneRepositoryImpl;
    private myDeckBlockClonePositionRepository: MyDeckBlockClonePositionRepositoryImpl;
    private myDeckCardNameCloneRepository: MyDeckCardNameCloneRepositoryImpl;
    private myDeckCardNameClonePositionRepository: MyDeckCardNameClonePositionRepositoryImpl;

    private cardCountManager: CardCountManager;
    private myDeckElementAdjuster: MyDeckElementAdjuster;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardDeleteButtonClickDetectRepository = DeckCardDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonRepository = DeckCardDeleteButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonPositionRepository = DeckCardDeleteButtonPositionRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckBlockPositionRepository = MyDeckBlockPositionRepositoryImpl.getInstance();
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);
        this.myDeckCardNamePositionRepository = MyDeckCardNamePositionRepositoryImpl.getInstance();
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsPositionRepository = MyDeckNumberOfSelectedCardsPositionRepositoryImpl.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.deckCardAddButtonRepository = DeckCardAddButtonRepositoryImpl.getInstance(scene);
        this.deckCardAddButtonPositionRepository = DeckCardAddButtonPositionRepositoryImpl.getInstance();
        this.myDeckNumberOfSelectedCardsCloneRepository = MyDeckNumberOfSelectedCardsCloneRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsClonePositionRepository = MyDeckNumberOfSelectedCardsClonePositionRepositoryImpl.getInstance();
        this.myDeckBlockCloneRepository = MyDeckBlockCloneRepositoryImpl.getInstance(scene);
        this.myDeckBlockClonePositionRepository = MyDeckBlockClonePositionRepositoryImpl.getInstance();
        this.myDeckCardNameCloneRepository = MyDeckCardNameCloneRepositoryImpl.getInstance(scene);
        this.myDeckCardNameClonePositionRepository = MyDeckCardNameClonePositionRepositoryImpl.getInstance();

        this.cardCountManager = CardCountManager.getInstance();
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardDeleteButtonClickDetectServiceImpl {
        if (!DeckCardDeleteButtonClickDetectServiceImpl.instance) {
            DeckCardDeleteButtonClickDetectServiceImpl.instance = new DeckCardDeleteButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckCardDeleteButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckCardDeleteButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckCardDeleteButtonClickDetectRepository.isButtonClickEnabled();
    }

    async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeckCardDeleteButton | null> {
        const { x, y } = clickPoint;
        const currentClickedDeckButtonId = this.getCurrentClickDeckButtonId();
        if (currentClickedDeckButtonId == null) return null;

        const allButtonList = this.getAllDeckCardDeleteButtonList(currentClickedDeckButtonId);
        if (allButtonList == null) return null;

        const clickedButton = this.deckCardDeleteButtonClickDetectRepository.isButtonClicked(
            { x, y },
            allButtonList,
            this.camera
        );

        if (clickedButton) {
            const buttonUniqueId = clickedButton.id;
            console.log(`Clicked Deck Card Delete Button Unique ID: ${buttonUniqueId}`);

            this.saveCurrentClickedButtonId(buttonUniqueId);

            const cardId = this.getCardIdByButtonId(buttonUniqueId);
            if (cardId == null) return null;
            this.saveClickedCardCount(currentClickedDeckButtonId, cardId);

            this.deleteNumberOfSelectedCardsClone(cardId);
            this.setCardBlockerVisibility(cardId, false);
            this.deleteRemainingCards(cardId);

            const selectedCardCount = this.cardCountManager.findCardCountByDeck(currentClickedDeckButtonId, cardId);
            if (selectedCardCount == 0) {
                this.myDeckCardMapRepository.deleteCard(currentClickedDeckButtonId, cardId);
                this.deleteDeckElement(currentClickedDeckButtonId, cardId);
                this.deleteNumberOfSelectedCardsClonePosition(cardId);
                this.adjustDeckCardDeleteButton(currentClickedDeckButtonId);
                this.adjustBlockClone();
                this.adjustCardNameClone();
                this.adjustNumberOfSelectedCardsClone();
                this.adjustDeckCardAddButton(currentClickedDeckButtonId);
            }
            return clickedButton;
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckCardDeleteButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleButtonClick(clickPoint);
        }
        return null;
    }

    private saveCurrentClickedButtonId(cardId: number): void {
        this.deckCardDeleteButtonClickDetectRepository.saveCurrentClickedButtonId(cardId);
    }

    public getCurrentClickedButtonId(): number | null {
        return this.deckCardDeleteButtonClickDetectRepository.getCurrentClickedButtonId() ?? null;
    }

    private getAllDeckCardDeleteButtonList(deckId: number): DeckCardDeleteButton[] | null {
        return this.deckCardDeleteButtonRepository.findButtonListByDeckId(deckId);
    }

    private getCurrentClickDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private getCardIdByButtonId(buttonId: number): number | null {
        return this.deckCardDeleteButtonRepository.findCardIdByButtonUniqueId(buttonId);
    }

    private setCardBlockerVisibility(cardId: number, isVisible: boolean): void {
        this.cardSelectionBlockerRepository.findBlockerByCardId(cardId)?.setVisibility(isVisible);
    }

    private saveClickedCardCount(deckId: number, cardId: number): void {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }
        const grade = Number(card.등급);

        const currentRemainingCardCount = this.cardCountManager.findRemainingCardCountByCardId(cardId);
        if (currentRemainingCardCount == null) {
            console.warn(`[WARN] "Remaining Card Count" not found for cardId: ${cardId}`);
            return;
        }

        const selectedCardCount = this.cardCountManager.findCardCountByDeck(deckId, cardId);
        console.log(`%c 현재 선택한 카드(ID: ${cardId}) 개수는? ${selectedCardCount}`, 'color: #FE2EF7; font-weight: bold;');
        if (selectedCardCount == 0) {
            console.warn(`[DEBUG] Card id: ${cardId}, Count: ${selectedCardCount} No more cards to remove.`);
            return;
        }

        // 선택한 카드 개수는 감소, 남은 카드 개수는 증가
        this.cardCountManager.incrementRemainingCardCount(cardId);
        this.cardCountManager.decrementCardCountByDeck(deckId, cardId);
        this.cardCountManager.decrementCardCountByGrade(deckId, grade);

        // To-do: 편집 완료 버튼 클릭시 map 데이터에 반영
//         const cardCountInDeck = this.cardCountManager.findCardCountByDeck(deckId, cardId);
//         this.myDeckCardMapRepository.addMyDeckCard(deckId, cardId, cardCountInDeck);
    }

    private deleteRemainingCards(cardId: number): void {
        this.myDeckRemainingCardsRepository.deleteRemainingCardsMesh(cardId);
        this.myDeckRemainingCardsRepository.deleteRemainingCardsByCardId(cardId);
    }

    private deleteNumberOfSelectedCardsClone(cardId: number): void {
        console.log(`%c 현재 삭제하려는 card ID: ${cardId}`, 'color: #FE2EF7; font-weight: bold;');
        this.myDeckNumberOfSelectedCardsCloneRepository.deleteCloneMesh(cardId);
        this.myDeckNumberOfSelectedCardsCloneRepository.deleteCloneByCardId(cardId);
    }

    private deleteNumberOfSelectedCardsClonePosition(cardId: number): void {
        this.myDeckNumberOfSelectedCardsClonePositionRepository.deleteByCardId(cardId);
    }

    // To-do: 메서드명 수정 필요(덱 삭제 버튼, 덱 블록, 카드 이름, 개수 객체 등 한 번에 삭제)
    private deleteDeckElement(deckId: number, cardId: number): void {
        const buttonId = this.deckCardDeleteButtonRepository.findButtonIdByDeckIdAndCardId(deckId, cardId);
        if (buttonId == null) return;

        this.deckCardDeleteButtonRepository.deleteButtonByDeckIdAndButtonId(deckId, buttonId);
        this.deckCardDeleteButtonPositionRepository.deleteById(deckId, buttonId);
        this.myDeckBlockCloneRepository.deleteCloneMesh(cardId);
        this.myDeckBlockCloneRepository.deleteCloneByCardId(cardId);
        this.myDeckBlockClonePositionRepository.deleteByCardId(cardId);
        this.myDeckCardNameCloneRepository.deleteCloneMesh(cardId);
        this.myDeckCardNameCloneRepository.deleteCloneByCardId(cardId);
        this.myDeckCardNameClonePositionRepository.deleteByCardId(cardId);
        this.deckCardAddButtonRepository.deleteButtonByDeckIdAndButtonId(deckId, buttonId);
        this.deckCardAddButtonPositionRepository.deleteById(deckId, buttonId);
    }

    private adjustDeckCardDeleteButton(deckId: number): void {
        const buttonIdList = this.deckCardDeleteButtonRepository.findButtonIdListByDeckId(deckId);
        for (const buttonId of buttonIdList) {
            const button = this.deckCardDeleteButtonRepository.findButtonByButtonUniqueId(buttonId);
            if (button == null) return;

            const buttonMesh = button.getMesh();
            const buttonPosition = this.deckCardDeleteButtonPositionRepository.findPositionByPositionId(buttonId);

            if (buttonPosition == null) return;

            const widthPercent = 0.0295; // 이 부분 나중에 수정 필요
            const heightPercent = 1;
            const positionX = buttonPosition.getX();
            const positionY = buttonPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(buttonMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustDeckCardAddButton(deckId: number): void {
        const buttonIdList = this.deckCardAddButtonRepository.findButtonIdListByDeckId(deckId);
        for (const buttonId of buttonIdList) {
            const button = this.deckCardAddButtonRepository.findButtonByButtonId(buttonId);
            if (button == null) return;

            const buttonMesh = button.getMesh();
            const buttonPosition = this.deckCardAddButtonPositionRepository.findPositionByPositionId(buttonId);

            if (buttonPosition == null) return;

            const widthPercent = 0.0295;
            const heightPercent = 1;
            const positionX = buttonPosition.getX();
            const positionY = buttonPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(buttonMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustNumberOfSelectedCardsClone(): void {
        const cardIdList = this.myDeckNumberOfSelectedCardsCloneRepository.findCardIdList();
        if (cardIdList == null) return;
        console.log(`%c 클론 재정렬 Card ID List: ${cardIdList}`, 'color: #FE2EF7; font-weight: bold;');

        for (const cardId of cardIdList) {
            const clone = this.myDeckNumberOfSelectedCardsCloneRepository.findCloneByCardId(cardId);
            if (clone == null) return;

            const cloneMesh = clone.getMesh();
            const clonePosition = this.myDeckNumberOfSelectedCardsClonePositionRepository.findPositionByCardId(cardId);
            if (clonePosition == null) return;

            const widthPercent = 0.015;
            const heightPercent = 1;
            const positionX = clonePosition.getX();
            const positionY = clonePosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cloneMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustBlockClone(): void {
        const cardIdList = this.myDeckBlockCloneRepository.findCardIdList();
        if (cardIdList == null) return;
        console.log(`%c 클론 재정렬 Card ID List: ${cardIdList}`, 'color: #FE2EF7; font-weight: bold;');

        for (const cardId of cardIdList) {
            const clone = this.myDeckBlockCloneRepository.findCloneByCardId(cardId);
            if (clone == null) return;

            const cloneMesh = clone.getMesh();
            const clonePosition = this.myDeckBlockClonePositionRepository.findPositionByCardId(cardId);
            if (clonePosition == null) return;

            const widthPercent = 0.166;
            const heightPercent = (250/1130);
            const positionX = clonePosition.getX();
            const positionY = clonePosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cloneMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustCardNameClone(): void {
        const cardIdList = this.myDeckCardNameCloneRepository.findCardIdList();
        if (cardIdList == null) return;
        console.log(`%c 클론 재정렬 Card ID List: ${cardIdList}`, 'color: #FE2EF7; font-weight: bold;');

        for (const cardId of cardIdList) {
            const clone = this.myDeckCardNameCloneRepository.findCloneByCardId(cardId);
            if (clone == null) return;

            const cloneMesh = clone.getMesh();
            const clonePosition = this.myDeckCardNameClonePositionRepository.findPositionByCardId(cardId);
            if (clonePosition == null) return;

            const width = clone.width;
            const height = clone.height;

            const newPositionX = clonePosition.getX() * window.innerWidth;
            const newPositionY = clonePosition.getY() * window.innerHeight;

            cloneMesh.geometry.dispose();
            cloneMesh.geometry = new THREE.PlaneGeometry(width, height);
            cloneMesh.position.set(newPositionX, newPositionY, 0);
        }
    }

}
