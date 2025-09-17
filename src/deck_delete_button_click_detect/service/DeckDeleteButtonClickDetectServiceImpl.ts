import * as THREE from "three";
import {getCardById} from "../../card/utility";

import {DeckDeleteButtonClickDetectService} from "./DeckDeleteButtonClickDetectService";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../repository/DeckDeleteButtonClickDetectRepositoryImpl";
import {DeckDeleteButton} from "../../deck_delete_button/entity/DeckDeleteButton";
import {DeckDeleteButtonRepositoryImpl} from "../../deck_delete_button/repository/DeckDeleteButtonRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeleteDeckPopupWindowRepositoryImpl} from "../../delete_deck_popup_window/repository/DeleteDeckPopupWindowRepositoryImpl";
import {DeleteDeckPopupButtonRepositoryImpl} from "../../delete_deck_popup_button/repository/DeleteDeckPopupButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckButtonRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonRepositoryImpl";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../../deck_card_search_cancel_button_click_detect/repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";

export class DeckDeleteButtonClickDetectServiceImpl implements DeckDeleteButtonClickDetectService {
    private static instance: DeckDeleteButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private deleteDeckPopupWindowRepository: DeleteDeckPopupWindowRepositoryImpl;
    private deleteDeckPopupButtonRepository: DeleteDeckPopupButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance(scene);
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deleteDeckPopupWindowRepository = DeleteDeckPopupWindowRepositoryImpl.getInstance();
        this.deleteDeckPopupButtonRepository = DeleteDeckPopupButtonRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance(scene);
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckDeleteButtonClickDetectServiceImpl {
        if (!DeckDeleteButtonClickDetectServiceImpl.instance) {
            DeckDeleteButtonClickDetectServiceImpl.instance = new DeckDeleteButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckDeleteButtonClickDetectServiceImpl.instance;
    }

    public async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeckDeleteButton | null> {
        const { x, y } = clickPoint;
        const buttonList = this.getAllButtons();
        const clickedButton = this.deckDeleteButtonClickDetectRepository.isButtonClicked(
            { x, y },
            buttonList,
            this.camera
        );

        if (clickedButton) {
            const buttonId = clickedButton.id;
            console.log(`[DEBUG] Clicked Deck Delete Button ID: ${buttonId}`);

            const searchContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
            if (searchContainer) {
                searchContainer.setInputDisabled(true);
            }

            this.setSearchCancelButtonClickEnabled(false);

            const deckId = this.getDeckIdByDeleteButtonId(buttonId);
            if (deckId == null) return null;

            this.saveCurrentClickedButtonId(deckId);

            this.setTransparentBackgroundVisibility(true);
            this.setPopupWindowVisibility(true);
            this.setPopupButtonsVisibility(true);

            return clickedButton;

        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckDeleteButton | null> {
        if (!this.isAllDeckDeleteButtonClickEnabled()) return null;

        const currentClickedDeckId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
        if (currentClickedDeckId == null) return null;
//         console.log(`%c 현재 클릭한 덱 ID?: ${currentClickedDeckId}`, 'color: #00d5ff; font-weight: bold;');

        const deleteDeckButtonVisible = this.getDeckDeleteButtonVisibility(currentClickedDeckId);
        console.log(`%c 덱 삭제 버튼 visible 상태?: ${deleteDeckButtonVisible}`, 'color: #00d5ff; font-weight: bold;');
        if (deleteDeckButtonVisible !== true) return null;

        const deckDeleteButtonClickEnabled = this.isDeckDeleteButtonClickEnabled(currentClickedDeckId);
        console.log(`%c 덱 삭제 버튼 클릭 가능?: ${deckDeleteButtonClickEnabled}`, 'color: #00d5ff; font-weight: bold;');
        if (deckDeleteButtonClickEnabled !== true) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleButtonClick(clickPoint);
            if (result) {
                this.setDeckDeleteButtonClickEnabled(currentClickedDeckId, false);
                return result;
            }
        }
        return null;
    }

    public getAllButtons(): DeckDeleteButton[] {
        return this.deckDeleteButtonRepository.findAll();
    }

    private saveCurrentClickedButtonId(buttonId: number): void {
        this.deckDeleteButtonClickDetectRepository.saveCurrentClickedButtonId(buttonId);
    }

    private setTransparentBackgroundVisibility(isVisible: boolean): void {
        const background = this.transparentBackgroundRepository.findTransparentBackground();
        if (background) {
            background.setVisibility(isVisible);
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

    public getDeckDeleteButtonVisibility(deckId: number): boolean | undefined {
        const button = this.deckDeleteButtonRepository.findButtonByDeckId(deckId);
        if (button !== null) {
            return button.getVisibility();
        }
        return undefined;
    }

    private getDeckIdByDeleteButtonId(buttonId: number): number | null {
        return this.deckDeleteButtonRepository.findDeckIdByButtonUniqueId(buttonId);
    }

    private isDeckDeleteButtonClickEnabled(deckId: number): boolean | undefined {
        return this.deckDeleteButtonClickDetectRepository.isButtonClickEnabled(deckId);
    }

    private setDeckDeleteButtonClickEnabled(deckId: number, isEnabled: boolean): void {
        this.deckDeleteButtonClickDetectRepository.saveButtonClickEnabled(deckId, isEnabled);
    }

    private setSearchCancelButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private isAllDeckDeleteButtonClickEnabled(): boolean {
        return this.deckDeleteButtonClickDetectRepository.isAllButtonClickEnabled();
    }

}