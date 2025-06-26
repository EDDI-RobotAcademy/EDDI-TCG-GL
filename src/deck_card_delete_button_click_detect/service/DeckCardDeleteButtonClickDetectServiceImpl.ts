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

            const selectedCardCount = this.cardCountManager.findCardCountByDeck(currentClickedDeckButtonId, cardId);
            if (selectedCardCount == 0) {
                this.myDeckCardMapRepository.deleteCard(currentClickedDeckButtonId, cardId);
                this.deleteDeckCardDeleteButton(currentClickedDeckButtonId, cardId);
                this.adjustDeckCardDeleteButton(currentClickedDeckButtonId);
                this.adjustCardBlock(currentClickedDeckButtonId);
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
        if (selectedCardCount == 0) {
            console.warn(`[DEBUG] Card id: ${cardId}, Count: ${selectedCardCount} No more cards to remove.`);
            return;
        }

        // 선택한 카드 개수는 감소, 남은 카드 개수는 증가
        this.cardCountManager.incrementRemainingCardCount(cardId);
        this.cardCountManager.decrementCardCountByDeck(deckId, cardId);
        this.cardCountManager.decrementCardCountByGrade(deckId, grade);
    }

    // To-do: 메서드명 수정 필요(덱 삭제 버튼, 덱 블록, 카드 이름, 개수 객체 등 한 번에 삭제)
    private deleteDeckCardDeleteButton(deckId: number, cardId: number): void {
        const buttonId = this.deckCardDeleteButtonRepository.findButtonIdByDeckIdAndCardId(deckId, cardId);
        if (buttonId == null) return;

        this.deckCardDeleteButtonRepository.deleteButtonByDeckIdAndButtonId(deckId, buttonId);
        this.deckCardDeleteButtonPositionRepository.deleteById(deckId, buttonId);
        this.myDeckBlockRepository.deleteBlockByDeckIdAndBlockUniqueId(deckId, buttonId);
        this.myDeckBlockPositionRepository.deleteById(deckId, buttonId);
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

    private adjustCardBlock(deckId: number): void {
        const blockIdList = this.myDeckBlockRepository.findBlockUniqueIdListByDeckId(deckId);
        for (const blockId of blockIdList) {
            const block = this.myDeckBlockRepository.findBlockByBlockUniqueId(blockId);
            if (block == null) return;

            const blockMesh = block.getMesh();
            const blockPosition = this.myDeckBlockPositionRepository.findPositionByPositionId(blockId);

            if (blockPosition == null) return;

            const widthPercent = 0.166;
            const heightPercent = (250/1130);
            const positionX = blockPosition.getX();
            const positionY = blockPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(blockMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

}
