import * as THREE from "three";
import {getCardById} from "../../card/utility";

import {DeckCardDeleteButtonClickDetectService} from "./DeckCardDeleteButtonClickDetectService";
import {DeckCardDeleteButtonClickDetectRepositoryImpl} from "../repository/DeckCardDeleteButtonClickDetectRepositoryImpl";

import {DeckCardDeleteButton} from "../../deck_card_delete_button/entity/DeckCardDeleteButton";
import {DeckCardDeleteButtonRepositoryImpl} from "../../deck_card_delete_button/repository/DeckCardDeleteButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

export class DeckCardDeleteButtonClickDetectServiceImpl implements DeckCardDeleteButtonClickDetectService {
    private static instance: DeckCardDeleteButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckCardDeleteButtonClickDetectRepository: DeckCardDeleteButtonClickDetectRepositoryImpl;
    private deckCardDeleteButtonRepository: DeckCardDeleteButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private cardCountManager: CardCountManager;

    private buttonClickEnabled: boolean = false;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardDeleteButtonClickDetectRepository = DeckCardDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonRepository = DeckCardDeleteButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardDeleteButtonClickDetectServiceImpl {
        if (!DeckCardDeleteButtonClickDetectServiceImpl.instance) {
            DeckCardDeleteButtonClickDetectServiceImpl.instance = new DeckCardDeleteButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckCardDeleteButtonClickDetectServiceImpl.instance;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
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


            return clickedButton;
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckCardDeleteButton | null> {
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

}
