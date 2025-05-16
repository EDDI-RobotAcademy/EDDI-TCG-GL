import * as THREE from "three";

import {DeckEditButton} from "../../deck_edit_button/entity/DeckEditButton";
import {MyDeckOwnedCards} from "../../my_deck_owned_cards/entity/MyDeckOwnedCards";
import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";

import {DeckEditButtonClickDetectService} from "./DeckEditButtonClickDetectService";
import {DeckEditButtonClickDetectRepositoryImpl} from "../repository/DeckEditButtonClickDetectRepositoryImpl";
import {DeckEditButtonRepositoryImpl} from "../../deck_edit_button/repository/DeckEditButtonRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {DeckEditDoneButtonRepositoryImpl} from "../../deck_edit_done_button/repository/DeckEditDoneButtonRepositoryImpl";
import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {CardStateManager} from "../../my_deck_card_manager/CardStateManager";

export class DeckEditButtonClickDetectServiceImpl implements DeckEditButtonClickDetectService {
    private static instance: DeckEditButtonClickDetectServiceImpl | null = null;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private deckEditButtonRepository: DeckEditButtonRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;
    private cardStateManager: CardStateManager;
    private cameraRepository: CameraRepository;
    private buttonClickEnabled: boolean = true;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance();
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();

        this.cardStateManager = CardStateManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckEditButtonClickDetectServiceImpl {
        if (!DeckEditButtonClickDetectServiceImpl.instance) {
            DeckEditButtonClickDetectServiceImpl.instance = new DeckEditButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckEditButtonClickDetectServiceImpl.instance;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

    public async handleClick(clickPoint: { x: number; y: number }): Promise<DeckEditButton | null> {
        const { x, y } = clickPoint;
        const button = this.getDeckEditButton();
        if (button !== null) {
            const clickedButton = this.deckEditButtonClickDetectRepository.isDeckEditButtonClicked(
                { x, y },
                button,
                this.camera);

            if (clickedButton) {
                this.saveCurrentButtonClickState(true);
                console.log(`[DEBUG] Clicked Deck Edit Button`);

                const currentClickedDeckButtonId = this.getCurrentClickedDeckButtonId();
                if (currentClickedDeckButtonId !== null) {
                    console.log(`Deck Button Id?: ${currentClickedDeckButtonId}`);
                    this.setMyDeckCardVisibilityByDeckId(currentClickedDeckButtonId, false);
                }

                this.setDeckEditButtonVisibility(false);
                this.setDeckEditDoneButtonVisibility(true);
                this.setOwnedCardsVisibility(true);
                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckEditButton | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleClick(clickPoint);
        }
        return null;
    }

    private getDeckEditButton(): DeckEditButton | null {
        return this.deckEditButtonRepository.findButtonById(0);
    }

    private getDeckEditDoneButton(): DeckEditDoneButton | null {
        return this.deckEditDoneButtonRepository.findButtonById(0);
    }

    private setDeckEditButtonVisibility(isVisible: boolean): void {
        this.getDeckEditButton()?.setVisibility(isVisible);
    }

    private setDeckEditDoneButtonVisibility(isVisible: boolean): void {
        this.getDeckEditDoneButton()?.setVisibility(isVisible);
    }

    private saveCurrentButtonClickState(state: boolean): void {
        this.deckEditButtonClickDetectRepository.saveCurrentButtonClickState(state);
    }

    private getAllOwnedCards(): MyDeckOwnedCards[] {
        return this.myDeckOwnedCardsRepository.findAllCards();
    }

    private setOwnedCardsVisibility(isVisible: boolean): void {
        const allCards = this.getAllOwnedCards();
        allCards.forEach((card) => card.setVisibility(true));
    }

    private setMyDeckCardVisibility(deckId: number, cardId: number, isVisible: boolean): void {
        this.cardStateManager.setCardVisibility(deckId, cardId, isVisible);
    }

    private setMyDeckCardVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        const cardUniqueIdList = this.getMyDeckCardUniqueIdListByDeckId(deckId);
        cardUniqueIdList.forEach((cardUniqueId) => {
            this.setMyDeckCardVisibility(deckId, cardUniqueId, isVisible);
        });
    }

    private getMyDeckCardUniqueIdListByDeckId(deckId: number): number[] {
        return this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
    }

    private getCurrentClickedDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

}
