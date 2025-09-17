import * as THREE from "three";

import {DeckNameEditInfoTextType} from "../../deck_name_edit_info_text/entity/DeckNameEditInfoTextType";

import {DeckNameEditPopupButtonsClickDetectService} from "./DeckNameEditPopupButtonsClickDetectService";
import {DeckNameEditPopupButtonsClickDetectRepositoryImpl} from "../repository/DeckNameEditPopupButtonsClickDetectRepositoryImpl";

import {DeckNameEditPopupButtons} from "../../deck_name_edit_pop_up_buttons/entity/DeckNameEditPopupButtons";
import {DeckNameEditPopupButtonsRepositoryImpl} from "../../deck_name_edit_pop_up_buttons/repository/DeckNameEditPopupButtonsRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeckNameEditPopupBackgroundRepositoryImpl} from "../../deck_name_edit_pop_up_background/repository/DeckNameEditPopupBackgroundRepositoryImpl";
import {DeckNameEditInputContainerRepositoryImpl} from "../../deck_name_edit_input_container/repository/DeckNameEditInputContainerRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../../deck_card_search_cancel_button_click_detect/repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../../my_deck_card_search_cancel_button/repository/MyDeckCardSearchCancelButtonRepositoryImpl";
import {DeckNameEditInfoTextRepositoryImpl} from "../../deck_name_edit_info_text/repository/DeckNameEditInfoTextRepositoryImpl";
import {MyDeckNameTextRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextRepositoryImpl";
import {MyDeckNameTextMapRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextMapRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

export class DeckNameEditPopupButtonsClickDetectServiceImpl implements DeckNameEditPopupButtonsClickDetectService {
    private static instance: DeckNameEditPopupButtonsClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckNameEditPopupButtonsClickDetectRepository: DeckNameEditPopupButtonsClickDetectRepositoryImpl;
    private deckNameEditPopupButtonsRepository: DeckNameEditPopupButtonsRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private deckNameEditPopupBackgroundRepository: DeckNameEditPopupBackgroundRepositoryImpl;
    private deckNameEditInputContainerRepository: DeckNameEditInputContainerRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;
    private deckNameEditInfoTextRepository: DeckNameEditInfoTextRepositoryImpl;
    private myDeckNameTextRepository: MyDeckNameTextRepositoryImpl;
    private myDeckNameTextMapRepository: MyDeckNameTextMapRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckNameEditPopupButtonsClickDetectRepository = DeckNameEditPopupButtonsClickDetectRepositoryImpl.getInstance();
        this.deckNameEditPopupButtonsRepository = DeckNameEditPopupButtonsRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deckNameEditPopupBackgroundRepository = DeckNameEditPopupBackgroundRepositoryImpl.getInstance();
        this.deckNameEditInputContainerRepository = DeckNameEditInputContainerRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
        this.deckNameEditInfoTextRepository = DeckNameEditInfoTextRepositoryImpl.getInstance(scene);
        this.myDeckNameTextRepository = MyDeckNameTextRepositoryImpl.getInstance(scene);
        this.myDeckNameTextMapRepository = MyDeckNameTextMapRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckNameEditPopupButtonsClickDetectServiceImpl {
        if (!DeckNameEditPopupButtonsClickDetectServiceImpl.instance) {
            DeckNameEditPopupButtonsClickDetectServiceImpl.instance = new DeckNameEditPopupButtonsClickDetectServiceImpl(camera, scene);
        }
        return DeckNameEditPopupButtonsClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckNameEditPopupButtonsClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckNameEditPopupButtonsClickDetectRepository.isButtonClickEnabled();
    }

    async handleLeftClick(clickPoint: { x: number; y: number }): Promise<DeckNameEditPopupButtons | null> {
        const { x, y } = clickPoint;
        const deckNameEditPopupButtonsList = this.getAllDeckNameEditPopupButtons();
        const clickedDeckNameEditPopupButton = this.deckNameEditPopupButtonsClickDetectRepository.isDeckNameEditPopupButtonsClicked(
            { x, y },
            deckNameEditPopupButtonsList,
            this.camera
        );

        const currentClickedDeckId = this.getCurrentClickedDeckId();
        if (currentClickedDeckId == null) return null;

        if (clickedDeckNameEditPopupButton) {
            console.log(`Clicked Deck Make Pop-up Button ID: ${clickedDeckNameEditPopupButton.id}`);

            if (clickedDeckNameEditPopupButton.id === 0) {
                console.log(`[DeckNameEditPopupButton] click cancel button!`);

                this.hideDeckNameEditPopupElements();
                this.clearDeckNameEditPopupInputText();
                this.setMyDeckCardSearchDisabled();
                this.setDeckCardSearchCancelButtonClickEnabled(true);
            }

            if (clickedDeckNameEditPopupButton.id === 1) {
                console.log(`[DeckNameEditPopupButton] click edit button!`);

                if (this.getDeckNameEditInfoTextVisibility(DeckNameEditInfoTextType.ENABLE) !== true) return null;

                this.deckNameEdit(currentClickedDeckId);
                this.setDeckCardSearchCancelButtonVisibility(false);
                this.clearMyDeckCardSearchInputText();
                this.hideDeckNameEditPopupElements();
                this.clearDeckNameEditPopupInputText();
            }

            return clickedDeckNameEditPopupButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckNameEditPopupButtons | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const buttonClick =  await this.handleLeftClick(clickPoint);
            if (buttonClick) {
                this.setButtonClickEnabled(false);
                return buttonClick;
            }
        }
        return null;
    }

    private getAllDeckNameEditPopupButtons(): DeckNameEditPopupButtons[] {
        return this.deckNameEditPopupButtonsRepository.findAllButtons();
    }

    private setTransparentBackgroundVisibility(isVisible: boolean): void {
        const background = this.transparentBackgroundRepository.findTransparentBackground();
        if (background) {
            background.setVisibility(isVisible);
        }
    }

    private setDeckNameEditPopupBackgroundVisibility(isVisible: boolean): void {
        const background = this.deckNameEditPopupBackgroundRepository.findPopupBackground();
        if (background !== null) {
            background.setVisibility(isVisible);
        }
    }

    private setDeckNameEditPopupButtonsVisibility(isVisible: boolean): void {
        const buttons = this.deckNameEditPopupButtonsRepository.findAllButtons();
        for (const button of buttons) {
            button.setVisibility(isVisible);
        }
    }

    private setDeckNameEditInputContainerVisibility(isVisible: 'block' | 'none'): void {
        const container = this.deckNameEditInputContainerRepository.findDeckNameEditInputContainer();
        if (container !== null) {
            container.setVisibility(isVisible);
        }
    }

    private setDeckCardSearchCancelButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private setDeckCardSearchCancelButtonVisibility(isVisible: boolean): void {
        this.myDeckCardSearchCancelButtonRepository.findButton()?.setVisibility(isVisible);
    }

    private setAllInfoTextVisibility(isVisible: boolean): void {
        const infoTextList = this.deckNameEditInfoTextRepository.findAllInfoText();
        for (const infoText of infoTextList) {
            infoText.setVisibility(isVisible);
        }
    }

    private getDeckNameEditInfoTextVisibility(type: DeckNameEditInfoTextType): boolean | undefined {
        return this.deckNameEditInfoTextRepository.findInfoTextByType(type)?.getVisibility();
    }

    private getCurrentDeckNameInputText(): string | null {
        return this.deckNameEditInputContainerRepository.findInputValue();
    }

    private hideDeckNameEditPopupElements(): void {
        this.setTransparentBackgroundVisibility(false);
        this.setDeckNameEditPopupBackgroundVisibility(false);
        this.setDeckNameEditPopupButtonsVisibility(false);
        this.setDeckNameEditInputContainerVisibility('none');
        this.setAllInfoTextVisibility(false);
    }

    private clearDeckNameEditPopupInputText(): void {
        const deckNameInputText = this.getCurrentDeckNameInputText();
        if (deckNameInputText !== null && deckNameInputText.length > 0) {
            this.deckNameEditInputContainerRepository.clearUserInput();
            this.deckNameEditInputContainerRepository.deleteUserInput();
        }
    }

    private setMyDeckCardSearchDisabled(): void {
        const myDeckCardSearchContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
        if (myDeckCardSearchContainer) {
            myDeckCardSearchContainer.setInputDisabled(false);
        }
    }

    private clearMyDeckCardSearchInputText(): void {
        const cardSearchInputText = this.myDeckSearchInputContainerRepository.findInputValue();
        if (cardSearchInputText !== null && cardSearchInputText.length > 0) {
            this.myDeckSearchInputContainerRepository.clearUserInput();
            this.myDeckSearchInputContainerRepository.deleteUserInput();
        }
    }

    private deleteDeckNameTextMesh(deckId: number): void {
        this.myDeckNameTextRepository.deleteTextByDeckId(deckId);
    }

    private updateNewDeckName(deckId: number, deckName: string): void {
        this.myDeckNameTextMapRepository.updateMyDeckName(deckId, deckName);
    }

    // 새로 입력한 덱 이름이 기존의 이름에서 바뀌었는 지의 여부 체크
    private isDeckNameUnchanged(deckId: number): boolean {
        const currentDeckName = this.myDeckNameTextRepository.findDeckNameByDeckId(deckId);
        const editDeckName = this.getCurrentDeckNameInputText();

        if (currentDeckName == null || editDeckName == null) {
            return false; // 비교 불가한 경우 "변경 없음"으로 보지 않음
        }

        console.log(`%c 원래의 이름: ${currentDeckName}, 바뀐 이름: ${editDeckName}`, 'color: #00d5ff; font-weight: bold;');
        return currentDeckName === editDeckName;
    }

    private deckNameEdit(deckId: number): void {
        if (this.isDeckNameUnchanged(deckId)) {
            // 이름이 그대로일 때 처리
            return;
        }

        // 이름이 바뀐 경우 처리
        const editDeckName = this.getCurrentDeckNameInputText();
        if (editDeckName == null) return;

        this.deleteDeckNameTextMesh(deckId);
        this.updateNewDeckName(deckId, editDeckName);
    }

    private getCurrentClickedDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

}