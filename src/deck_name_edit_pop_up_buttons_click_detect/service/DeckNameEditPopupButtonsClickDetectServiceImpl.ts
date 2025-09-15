import * as THREE from "three";

import {DeckNameEditPopupButtonsClickDetectService} from "./DeckNameEditPopupButtonsClickDetectService";
import {DeckNameEditPopupButtonsClickDetectRepositoryImpl} from "../repository/DeckNameEditPopupButtonsClickDetectRepositoryImpl";

import {DeckNameEditPopupButtons} from "../../deck_name_edit_pop_up_buttons/entity/DeckNameEditPopupButtons";
import {DeckNameEditPopupButtonsRepositoryImpl} from "../../deck_name_edit_pop_up_buttons/repository/DeckNameEditPopupButtonsRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeckNameEditPopupBackgroundRepositoryImpl} from "../../deck_name_edit_pop_up_background/repository/DeckNameEditPopupBackgroundRepositoryImpl";
import {DeckNameEditInputContainerRepositoryImpl} from "../../deck_name_edit_input_container/repository/DeckNameEditInputContainerRepositoryImpl";

export class DeckNameEditPopupButtonsClickDetectServiceImpl implements DeckNameEditPopupButtonsClickDetectService {
    private static instance: DeckNameEditPopupButtonsClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckNameEditPopupButtonsClickDetectRepository: DeckNameEditPopupButtonsClickDetectRepositoryImpl;
    private deckNameEditPopupButtonsRepository: DeckNameEditPopupButtonsRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private deckNameEditPopupBackgroundRepository: DeckNameEditPopupBackgroundRepositoryImpl;
    private deckNameEditInputContainerRepository: DeckNameEditInputContainerRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckNameEditPopupButtonsClickDetectRepository = DeckNameEditPopupButtonsClickDetectRepositoryImpl.getInstance();
        this.deckNameEditPopupButtonsRepository = DeckNameEditPopupButtonsRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deckNameEditPopupBackgroundRepository = DeckNameEditPopupBackgroundRepositoryImpl.getInstance();
        this.deckNameEditInputContainerRepository = DeckNameEditInputContainerRepositoryImpl.getInstance();
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

        if (clickedDeckNameEditPopupButton) {
            console.log(`Clicked Deck Make Pop-up Button ID: ${clickedDeckNameEditPopupButton.id}`);
            this.setTransparentBackgroundVisibility(false);
            this.setDeckNameEditPopupBackgroundVisibility(false);
            this.setDeckNameEditPopupButtonsVisibility(false);
            this.setDeckNameEditInputContainerVisibility('none');

            const deckNameInputText = this.deckNameEditInputContainerRepository.findInputValue();
            if (deckNameInputText !== null && deckNameInputText.length > 0) {
                this.deckNameEditInputContainerRepository.clearUserInput();
                this.deckNameEditInputContainerRepository.deleteUserInput();
            }

            if (clickedDeckNameEditPopupButton.id === 0) {
                console.log(`[DeckNameEditPopupButton] click cancel button!`);
            }

            if (clickedDeckNameEditPopupButton.id === 1) {
                console.log(`[DeckNameEditPopupButton] click edit button!`);
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

}