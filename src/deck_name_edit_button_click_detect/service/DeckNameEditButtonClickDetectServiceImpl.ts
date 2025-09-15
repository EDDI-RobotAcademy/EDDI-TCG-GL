import * as THREE from "three";
import {getCardById} from "../../card/utility";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckNameEditButtonClickDetectService} from "./DeckNameEditButtonClickDetectService";
import {DeckNameEditButtonClickDetectRepositoryImpl} from "../repository/DeckNameEditButtonClickDetectRepositoryImpl";
import {DeckNameEditButton} from "../../deck_name_edit_button/entity/DeckNameEditButton";
import {DeckNameEditButtonRepositoryImpl} from "../../deck_name_edit_button/repository/DeckNameEditButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../../deck_card_search_cancel_button_click_detect/repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeckNameEditPopupBackgroundRepositoryImpl} from "../../deck_name_edit_pop_up_background/repository/DeckNameEditPopupBackgroundRepositoryImpl";
import {DeckNameEditPopupButtonsRepositoryImpl} from "../../deck_name_edit_pop_up_buttons/repository/DeckNameEditPopupButtonsRepositoryImpl";
import {DeckNameEditInputContainerRepositoryImpl} from "../../deck_name_edit_input_container/repository/DeckNameEditInputContainerRepositoryImpl";
import {DeckNameEditPopupButtonsClickDetectRepositoryImpl} from "../../deck_name_edit_pop_up_buttons_click_detect/repository/DeckNameEditPopupButtonsClickDetectRepositoryImpl";
import {DeckNameEditInputChangeDetectRepositoryImpl} from "../../deck_name_edit_input_change_detect/repository/DeckNameEditInputChangeDetectRepositoryImpl";
import {MyDeckNameTextMapRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextMapRepositoryImpl";

export class DeckNameEditButtonClickDetectServiceImpl implements DeckNameEditButtonClickDetectService {
    private static instance: DeckNameEditButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckNameEditButtonClickDetectRepository: DeckNameEditButtonClickDetectRepositoryImpl;
    private deckNameEditButtonRepository: DeckNameEditButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private deckNameEditPopupBackgroundRepository: DeckNameEditPopupBackgroundRepositoryImpl;
    private deckNameEditPopupButtonsRepository: DeckNameEditPopupButtonsRepositoryImpl;
    private deckNameEditInputContainerRepository: DeckNameEditInputContainerRepositoryImpl;
    private deckNameEditPopupButtonsClickDetectRepository: DeckNameEditPopupButtonsClickDetectRepositoryImpl;
    private deckNameEditInputChangeDetectRepository: DeckNameEditInputChangeDetectRepositoryImpl;
    private myDeckNameTextMapRepository: MyDeckNameTextMapRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckNameEditButtonClickDetectRepository = DeckNameEditButtonClickDetectRepositoryImpl.getInstance();
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deckNameEditPopupBackgroundRepository = DeckNameEditPopupBackgroundRepositoryImpl.getInstance();
        this.deckNameEditPopupButtonsRepository = DeckNameEditPopupButtonsRepositoryImpl.getInstance();
        this.deckNameEditInputContainerRepository = DeckNameEditInputContainerRepositoryImpl.getInstance();
        this.deckNameEditPopupButtonsClickDetectRepository = DeckNameEditPopupButtonsClickDetectRepositoryImpl.getInstance();
        this.deckNameEditInputChangeDetectRepository = DeckNameEditInputChangeDetectRepositoryImpl.getInstance();
        this.myDeckNameTextMapRepository = MyDeckNameTextMapRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckNameEditButtonClickDetectServiceImpl {
        if (!DeckNameEditButtonClickDetectServiceImpl.instance) {
            DeckNameEditButtonClickDetectServiceImpl.instance = new DeckNameEditButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckNameEditButtonClickDetectServiceImpl.instance;
    }

    public async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeckNameEditButton | null> {
        const { x, y } = clickPoint;
        const buttonList = this.getAllButtons();
        const clickedButton = this.deckNameEditButtonClickDetectRepository.isButtonClicked(
            { x, y },
            buttonList,
            this.camera
        );

        if (clickedButton) {
            const buttonId = clickedButton.id;
            console.log(`[DEBUG] Clicked Deck Name Edit Button ID: ${buttonId}`);
            this.saveCurrentClickedDeckNameEditButtonId(buttonId);

            const currentClickedDeckId = this.getCurrentClickedDeckId();
            if (currentClickedDeckId == null) return null;

            const searchContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
            if (searchContainer) {
                searchContainer.setInputDisabled(true);
            }

            this.setSearchCancelButtonClickEnabled(false);

            this.setTransparentBackgroundVisible(true);
            this.setDeckNameEditPopupBackgroundVisibility(true);
            this.setDeckNameEditPopupButtonsVisibility(true);
            this.setDeckNameEditPopupInputContainerVisibility(`block`);
            this.setDefaultDeckNameInputValue(currentClickedDeckId);

            return clickedButton;

        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckNameEditButton | null> {
        const currentClickedDeckId = this.getCurrentClickedDeckId();
        if (currentClickedDeckId == null) return null;
//         console.log(`%c 현재 클릭한 덱 ID?: ${currentClickedDeckId}`, 'color: #00d5ff; font-weight: bold;');

        const deckNameEditButtonVisible = this.getDeckNameEditButtonVisibility(currentClickedDeckId);
        console.log(`%c 덱 이름 편집 버튼 visible 상태?: ${deckNameEditButtonVisible}`, 'color: #00d5ff; font-weight: bold;');
        if (deckNameEditButtonVisible !== true) return null;

        const deckNameEditButtonClickEnabled = this.isDeckNameEditButtonClickEnabled(currentClickedDeckId);
        console.log(`%c 덱 이름 편집 버튼 클릭 가능?: ${deckNameEditButtonClickEnabled}`, 'color: #00d5ff; font-weight: bold;');
        if (deckNameEditButtonClickEnabled !== true) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleButtonClick(clickPoint);
            if (result) {
                this.setDeckNameEditButtonClickEnabled(currentClickedDeckId, false);
                this.setDeckNameEditPopupButtonsClickEnabled(true);
                this.setDeckNameEditInputChangeDetectEnabled(true);
            }
        }
        return null;
    }

    public getAllButtons(): DeckNameEditButton[] {
        return this.deckNameEditButtonRepository.findAll();
    }

    private saveCurrentClickedDeckNameEditButtonId(buttonId: number): void {
        this.deckNameEditButtonClickDetectRepository.saveCurrentClickedButtonId(buttonId);
    }

    public getDeckNameEditButtonVisibility(deckId: number): boolean | undefined {
        const button = this.deckNameEditButtonRepository.findButtonByDeckId(deckId);
        if (button !== null) {
            return button.getVisibility();
        }
        return undefined;
    }

    private isDeckNameEditButtonClickEnabled(deckId: number): boolean | undefined {
        return this.deckNameEditButtonClickDetectRepository.isButtonClickEnabled(deckId);
    }

    private setDeckNameEditButtonClickEnabled(deckId: number, isEnabled: boolean): void {
        this.deckNameEditButtonClickDetectRepository.saveButtonClickEnabled(deckId, isEnabled);
    }

    private setSearchCancelButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private setDeckNameEditPopupButtonsClickEnabled(isEnabled: boolean): void {
        this.deckNameEditPopupButtonsClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setTransparentBackgroundVisible(isVisible: boolean): void {
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

    private setDeckNameEditPopupInputContainerVisibility(isVisible: 'block' | 'none'): void {
        const container = this.deckNameEditInputContainerRepository.findDeckNameEditInputContainer();
        if (container == null) return;

        container.setVisibility(isVisible);
    }

    private setDeckNameEditInputChangeDetectEnabled(isVisible: boolean): void {
        this.deckNameEditInputChangeDetectRepository.setChangeDetectionEnabled(isVisible);
    }

    private getCurrentDeckNameText(deckId: number): string | undefined {
        return this.myDeckNameTextMapRepository.findMyDeckNameByDeckId(deckId);
    }

    private setDefaultDeckNameInputValue(deckId: number): void {
        const container = this.deckNameEditInputContainerRepository.findDeckNameEditInputContainer();
        if (container == null) return;

        const currentDeckNameText = this.getCurrentDeckNameText(deckId);
        if (currentDeckNameText == undefined) return;

        container.setDefaultInputValue(currentDeckNameText);
    }

    private getCurrentClickedDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }
}