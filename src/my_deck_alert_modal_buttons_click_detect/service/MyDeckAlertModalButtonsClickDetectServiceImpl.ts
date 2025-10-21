import * as THREE from "three";

import {MyDeckAlertModalButtonsClickDetectService} from "./MyDeckAlertModalButtonsClickDetectService";
import {MyDeckAlertModalButtonsClickDetectRepositoryImpl} from "../repository/MyDeckAlertModalButtonsClickDetectRepositoryImpl";

import {AlertModalButtons} from "../../alert_modal_buttons/entity/AlertModalButtons";
import {AlertModalButtonsType} from "../../alert_modal_buttons/entity/AlertModalButtonsType";
import {AlertModalButtonsRepositoryImpl} from "../../alert_modal_buttons/repository/AlertModalButtonsRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {AlertModalContainerType} from "../../alert_modal_container/entity/AlertModalContainerType";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {AlertModalContainerRepositoryImpl} from "../../alert_modal_container/repository/AlertModalContainerRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";

import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {DeckNameEditButtonClickDetectRepositoryImpl} from "../../deck_name_edit_button_click_detect/repository/DeckNameEditButtonClickDetectRepositoryImpl";
import {BuildDeckButtonHoverDetectRepositoryImpl} from "../../build_deck_button_hover_detect/repository/BuildDeckButtonHoverDetectRepositoryImpl";
import {BuildDeckButtonClickDetectRepositoryImpl} from "../../build_deck_button_click_detect/repository/BuildDeckButtonClickDetectRepositoryImpl";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../../deck_delete_button_click_detect/repository/DeckDeleteButtonClickDetectRepositoryImpl";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../../my_deck_block_hover_detect/repository/MyDeckBlockHoverDetectRepositoryImpl";
import {DeckEditDoneButtonHoverDetectRepositoryImpl} from "../../deck_edit_done_button_hover_detect/repository/DeckEditDoneButtonHoverDetectRepositoryImpl";

export class MyDeckAlertModalButtonsClickDetectServiceImpl implements MyDeckAlertModalButtonsClickDetectService {
    private static instance: MyDeckAlertModalButtonsClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private myDeckAlertModalButtonsClickDetectRepository: MyDeckAlertModalButtonsClickDetectRepositoryImpl;
    private alertModalButtonsRepository: AlertModalButtonsRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private alertModalContainerRepository: AlertModalContainerRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;

    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private deckNameEditButtonClickDetectRepository: DeckNameEditButtonClickDetectRepositoryImpl;
    private buildDeckButtonHoverDetectRepository: BuildDeckButtonHoverDetectRepositoryImpl;
    private buildDeckButtonClickDetectRepository: BuildDeckButtonClickDetectRepositoryImpl;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;
    private deckEditDoneButtonHoverDetectRepository: DeckEditDoneButtonHoverDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckAlertModalButtonsClickDetectRepository = MyDeckAlertModalButtonsClickDetectRepositoryImpl.getInstance();
        this.alertModalButtonsRepository = AlertModalButtonsRepositoryImpl.getInstance(scene);
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.alertModalContainerRepository = AlertModalContainerRepositoryImpl.getInstance(scene);
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();

        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckNameEditButtonClickDetectRepository = DeckNameEditButtonClickDetectRepositoryImpl.getInstance();
        this.buildDeckButtonHoverDetectRepository = BuildDeckButtonHoverDetectRepositoryImpl.getInstance();
        this.buildDeckButtonClickDetectRepository = BuildDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.deckEditDoneButtonHoverDetectRepository = DeckEditDoneButtonHoverDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyDeckAlertModalButtonsClickDetectServiceImpl {
        if (!MyDeckAlertModalButtonsClickDetectServiceImpl.instance) {
            MyDeckAlertModalButtonsClickDetectServiceImpl.instance = new MyDeckAlertModalButtonsClickDetectServiceImpl(camera, scene);
        }
        return MyDeckAlertModalButtonsClickDetectServiceImpl.instance;
    }

    async handleButtonClick(clickPoint: { x: number; y: number }): Promise<AlertModalButtons | null> {
        const { x, y } = clickPoint;
        const buttonsList = this.getAllAlertModalButtons();
        const clickedAlertModalButton = this.myDeckAlertModalButtonsClickDetectRepository.isAlertModalButtonsClicked(
            { x, y },
            buttonsList,
            this.camera
        );

        if (clickedAlertModalButton) {
            if (clickedAlertModalButton.type === AlertModalButtonsType.UNMATCHED_CARD) {
                console.log(`[DEBUG] Click Alert Modal Button Type: UNMATCHED_CARD`);
                this.hideNotFoundCardPopup();
                if (this.isDeckEditMode() == true) {
                    this.handleNotFoundCardPopupButtonClickInEditMode();
                    return clickedAlertModalButton;
                }

                this.handleNotFoundCardPopupButtonClickInNormalMode();
            }

            if (clickedAlertModalButton.type === AlertModalButtonsType.INCOMPLETE_DECK) {
                console.log(`[DEBUG] Click Alert Modal Button Type: INCOMPLETE_DECK`);
            }

            return clickedAlertModalButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<AlertModalButtons | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result  = await this.handleButtonClick(clickPoint);
            if (result) {
                this.setButtonClickEnabled(false);
            }
            return result;
        }
        return null;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.myDeckAlertModalButtonsClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.myDeckAlertModalButtonsClickDetectRepository.isButtonClickEnabled();
    }

    private getAllAlertModalButtons(): AlertModalButtons[] {
        return this.alertModalButtonsRepository.findAllButtons();
    }

    private getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

    private isDeckEditMode(): boolean | null {
        return this.deckEditButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private hideNotFoundCardPopup(): void {
        this.setTransparentBackgroundVisible(false);
        this.setUnmatchedCardPopupContainerVisibility(false);
        this.setUnmatchedCardPopupButtonVisibility(false);
    }

    private setTransparentBackgroundVisible(isVisible: boolean): void {
        const background = this.transparentBackgroundRepository.findTransparentBackground();
        if (background) {
            background.setVisibility(isVisible);
        }
    }

    private setUnmatchedCardPopupContainerVisibility(isVisible: boolean): void {
        const unmatchedCardPopupContainer = this.alertModalContainerRepository.findContainerByType(AlertModalContainerType.UNMATCHED_CARD);
        if (unmatchedCardPopupContainer !== null) {
            unmatchedCardPopupContainer.setVisibility(isVisible);
        }
    }

    private setUnmatchedCardPopupButtonVisibility(isVisible: boolean): void {
        const unmatchedCardPopupButton = this.alertModalButtonsRepository.findButtonByType(AlertModalButtonsType.UNMATCHED_CARD);

        if (unmatchedCardPopupButton !== null) {
            unmatchedCardPopupButton.setVisibility(isVisible);
        }
    }

    private handleNotFoundCardPopupButtonClickInNormalMode(): void {
        const currentClickedDeckId = this.getCurrentClickDeckId()!;

        this.setAllMyDeckButtonClickEnabled(true);
        this.setAllDeckNameEditButtonClickEnabled(true);
        this.setDeckNameEditButtonClickEnabled(currentClickedDeckId, true);
        this.setDeckEditButtonClickEnabled(true);
        this.setBuildDeckButtonHoverEnabled(true);
        this.setBuildDeckButtonClickEnabled(true);
        this.setAllDeckDeleteButtonClickEnabled(true);
        this.setMyDeckCardSearchInputEnabled(false);
    }

    private handleNotFoundCardPopupButtonClickInEditMode(): void {
        const currentClickedDeckId = this.getCurrentClickDeckId()!;

        this.setAllMyDeckButtonClickEnabled(true);
        this.setAllDeckNameEditButtonClickEnabled(true);
        this.setDeckNameEditButtonClickEnabled(currentClickedDeckId, true);
        this.setBuildDeckButtonHoverEnabled(true);
        this.setBuildDeckButtonClickEnabled(true);
        this.setAllDeckDeleteButtonClickEnabled(true);
        this.setMyDeckCardSearchInputEnabled(false);
        this.setMyDeckBlockHoverEnabled(true);
        this.setDeckEditDoneButtonHoverEnabled(true);
    }

    private setAllMyDeckButtonClickEnabled(isEnabled: boolean): void {
        this.myDeckButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private setAllDeckNameEditButtonClickEnabled(isEnabled: boolean): void {
        this.deckNameEditButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private setDeckNameEditButtonClickEnabled(deckId: number, isEnabled: boolean): void {
        this.deckNameEditButtonClickDetectRepository.saveButtonClickEnabled(deckId, isEnabled);
    }

    private setDeckEditButtonClickEnabled(isEnabled: boolean): void {
        this.deckEditButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setBuildDeckButtonHoverEnabled(isEnabled: boolean): void {
        this.buildDeckButtonHoverDetectRepository.setButtonHoverEnabled(isEnabled);
    }

    private setBuildDeckButtonClickEnabled(isEnabled: boolean): void {
        this.buildDeckButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setAllDeckDeleteButtonClickEnabled(isEnabled: boolean): void {
        this.deckDeleteButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private setMyDeckCardSearchInputEnabled(isEnabled: boolean): void {
        const searchContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
        if (searchContainer) {
            searchContainer.setInputDisabled(isEnabled); // 사용 가능: false, 사용 불가능: true
        }
    }

    private setMyDeckBlockHoverEnabled(isEnabled: boolean): void {
        this.myDeckBlockHoverDetectRepository.setBlockHoverEnabled(isEnabled);
    }

    private setDeckEditDoneButtonHoverEnabled(isEnabled: boolean): void {
        this.deckEditDoneButtonHoverDetectRepository.setButtonHoverEnabled(isEnabled);
    }

}