import * as THREE from "three";

import {DeleteDeckPopupButtonClickDetectService} from "./DeleteDeckPopupButtonClickDetectService";
import {DeleteDeckPopupButtonClickDetectRepositoryImpl} from '../repository/DeleteDeckPopupButtonClickDetectRepositoryImpl';
import {DeleteDeckPopupButton} from "../../delete_deck_popup_button/entity/DeleteDeckPopupButton";
import {DeleteDeckPopupButtonRepositoryImpl} from "../../delete_deck_popup_button/repository/DeleteDeckPopupButtonRepositoryImpl"
import {DeleteDeckPopupWindowRepositoryImpl} from "../../delete_deck_popup_window/repository/DeleteDeckPopupWindowRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../../deck_delete_button_click_detect/repository/DeckDeleteButtonClickDetectRepositoryImpl";

import {DeckDeleteButtonRepositoryImpl} from "../../deck_delete_button/repository/DeckDeleteButtonRepositoryImpl";
import {DeckEditButtonRepositoryImpl} from "../../deck_edit_button/repository/DeckEditButtonRepositoryImpl";
import {MyDeckButtonRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonRepositoryImpl";
import {MyDeckButtonEffectRepositoryImpl} from "../../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckNameTextRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextRepositoryImpl";

import {DeckDeleteButtonPositionRepositoryImpl} from "../../deck_delete_button_position/repository/DeckDeleteButtonPositionRepositoryImpl";
import {DeckEditButtonPositionRepositoryImpl} from "../../deck_edit_button_position/repository/DeckEditButtonPositionRepositoryImpl";
import {MyDeckButtonPositionRepositoryImpl} from "../../my_deck_button_position/repository/MyDeckButtonPositionRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckNameTextPositionRepositoryImpl} from "../../my_deck_name_text_position/repository/MyDeckNameTextPositionRepositoryImpl";

import {MyDeckButtonMapRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonMapRepositoryImpl";
import {MyDeckCardMapRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardMapRepositoryImpl";
import {MyDeckNameTextMapRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextMapRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class DeleteDeckPopupButtonClickDetectServiceImpl implements DeleteDeckPopupButtonClickDetectService {
    private static instance: DeleteDeckPopupButtonClickDetectServiceImpl | null = null;
    private deleteDeckPopupButtonClickDetectRepository: DeleteDeckPopupButtonClickDetectRepositoryImpl;
    private deleteDeckPopupButtonRepository: DeleteDeckPopupButtonRepositoryImpl;
    private deleteDeckPopupWindowRepository: DeleteDeckPopupWindowRepositoryImpl;
    private transparentBackgroundRepository : TransparentBackgroundRepositoryImpl;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private cameraRepository: CameraRepository;

    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private deckEditButtonRepository: DeckEditButtonRepositoryImpl;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckNameTextRepository: MyDeckNameTextRepositoryImpl;

    private deckDeleteButtonPositionRepository: DeckDeleteButtonPositionRepositoryImpl;
    private deckEditButtonPositionRepository: DeckEditButtonPositionRepositoryImpl;
    private myDeckButtonPositionRepository: MyDeckButtonPositionRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckNameTextPositionRepository: MyDeckNameTextPositionRepositoryImpl;

    private myDeckButtonMapRepository: MyDeckButtonMapRepositoryImpl;
    private myDeckCardMapRepository: MyDeckCardMapRepositoryImpl;
    private myDeckNameTextMapRepository: MyDeckNameTextMapRepositoryImpl;

    private buttonClickState: boolean = false;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.deleteDeckPopupButtonClickDetectRepository = DeleteDeckPopupButtonClickDetectRepositoryImpl.getInstance();
        this.deleteDeckPopupButtonRepository = DeleteDeckPopupButtonRepositoryImpl.getInstance();
        this.deleteDeckPopupWindowRepository = DeleteDeckPopupWindowRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();

        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance();
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance();
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance();
        this.myDeckNameTextRepository = MyDeckNameTextRepositoryImpl.getInstance();

        this.deckDeleteButtonPositionRepository = DeckDeleteButtonPositionRepositoryImpl.getInstance();
        this.deckEditButtonPositionRepository = DeckEditButtonPositionRepositoryImpl.getInstance();
        this.myDeckButtonPositionRepository = MyDeckButtonPositionRepositoryImpl.getInstance();
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckNameTextPositionRepository = MyDeckNameTextPositionRepositoryImpl.getInstance();

        this.myDeckButtonMapRepository = MyDeckButtonMapRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
        this.myDeckNameTextMapRepository = MyDeckNameTextMapRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeleteDeckPopupButtonClickDetectServiceImpl {
        if (!DeleteDeckPopupButtonClickDetectServiceImpl.instance) {
            DeleteDeckPopupButtonClickDetectServiceImpl.instance = new DeleteDeckPopupButtonClickDetectServiceImpl(camera, scene);
        }
        return DeleteDeckPopupButtonClickDetectServiceImpl.instance;
    }

    public setButtonClickState(state: boolean): void {
        this.buttonClickState = state;
    }

    public getButtonClickState(): boolean {
        return this.buttonClickState;
    }

    async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeleteDeckPopupButton | null> {
        const { x, y } = clickPoint;
        const buttonList = this.getAllButtons();
        const clickedButton = this.deleteDeckPopupButtonClickDetectRepository.isButtonClicked(
            { x, y },
            buttonList,
            this.camera
        );

        if (clickedButton) {
            console.log(`[DEBUG] Clicked Popup Button ID: ${clickedButton.id}`);
            this.saveCurrentClickedButtonId(clickedButton.id);
            const currentClickedButtonId = this.getCurrentClickedButtonId();

            this.setTransparentBackgroundVisibility(false);
            this.setPopupWindowVisibility(false);
            this.setPopupButtonsVisibility(false);


            switch (currentClickedButtonId) {
                case 0:
                    console.log(`Deck Delete Cancel!`);
                    break;
                case 1:
                    console.log(`Deck Delete!`);
                    this.deleteCard();
                    this.deleteCardMapData();
                    this.deleteDeckButtonMapData();
                    this.deleteTextMapData();
                    this.deleteDeckDeleteButton();
                    this.deleteDeckEditButton();
                    this.deleteDeckButton();
                    this.deleteDeckButtonEffect();
                    this.deleteDeckNameText();

                    break;
                default:
                    console.log(`Unknown button action`);
                    break;
            }

            return clickedButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeleteDeckPopupButton | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleButtonClick(clickPoint);
        }
        return null;
    }

    public getAllButtons(): DeleteDeckPopupButton[] {
        return this.deleteDeckPopupButtonRepository.findAllButton();
    }

    public saveCurrentClickedButtonId(buttonId: number): void {
        this.deleteDeckPopupButtonClickDetectRepository.saveCurrentClickedButtonId(buttonId);
    }

    public getCurrentClickedButtonId(): number | null {
        return this.deleteDeckPopupButtonClickDetectRepository.findCurrentClickedButtonId();
    }

    private setTransparentBackgroundVisibility(isVisible: boolean): void {
        if (isVisible == true) {
            this.transparentBackgroundRepository.showTransparentBackground();
        } else {
            this.transparentBackgroundRepository.hideTransparentBackground();
        }
    }

    private setPopupWindowVisibility(isVisible: boolean): void {
        const popupWindow = this.deleteDeckPopupWindowRepository.findPopupWindow();
        if (popupWindow !== null) {
            popupWindow.setVisibility(isVisible);
        }
    }

    private setPopupButtonsVisibility(isVisible: boolean): void {
        const popupButtons = this.deleteDeckPopupButtonRepository.findAllButton();
        popupButtons.forEach((button) => button.setVisibility(isVisible));
    }

    private getCurrentClickDeckDeleteButtonId(): number | null {
        return this.deckDeleteButtonClickDetectRepository.findCurrentClickedButtonId();
    }

    private getDeckIdByDeleteButtonId(): number | null {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn('버튼의 ID가 존재하지 않습니다.');
            return null;
        }

        return this.myDeckButtonRepository.findDeckIdByButtonId(buttonId);
    }

    private deleteDeckDeleteButton(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.deckDeleteButtonRepository.deleteButtonByButtonUniqueId(buttonId);
        this.deckDeleteButtonPositionRepository.deleteByPositionId(buttonId);
    }

    private deleteDeckEditButton(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.deckEditButtonRepository.deleteButtonByButtonUniqueId(buttonId);
        this.deckEditButtonPositionRepository.deleteByPositionId(buttonId);
    }

    private deleteDeckButton(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.myDeckButtonRepository.deleteById(buttonId);
        this.myDeckButtonPositionRepository.deleteById(buttonId);
    }

    private deleteDeckButtonEffect(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.myDeckButtonEffectRepository.deleteById(buttonId);
    }

    private deleteDeckNameText(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.myDeckNameTextRepository.deleteById(buttonId);
        this.myDeckNameTextPositionRepository.deleteById(buttonId);
    }

    private deleteCard(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckCardRepository.deleteDeckByDeckId(deckId);
        this.myDeckCardPositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteDeckButtonMapData(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckButtonMapRepository.removeMyDeckByDeckId(deckId);
    }

    private deleteCardMapData(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckCardMapRepository.deleteMyDeck(deckId);
    }

    private deleteTextMapData(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckNameTextMapRepository.deleteMyDeckNameText(deckId);
    }

}
