import * as THREE from "three";

import {DeckMakePopupButtonsClickDetectService} from "./DeckMakePopupButtonsClickDetectService";
import {DeckMakePopupButtonsClickDetectRepository} from "../repository/DeckMakePopupButtonsClickDetectRepository";
import {DeckMakePopupButtonsClickDetectRepositoryImpl} from "../repository/DeckMakePopupButtonsClickDetectRepositoryImpl";

import {DeckMakePopupButtons} from "../../deck_make_pop_up_buttons/entity/DeckMakePopupButtons";
import {DeckMakePopupButtonsRepositoryImpl} from "../../deck_make_pop_up_buttons/repository/DeckMakePopupButtonsRepositoryImpl";
import {DeckMakePopupBackgroundRepositoryImpl} from "../../deck_make_pop_up_background/repository/DeckMakePopupBackgroundRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeckMakePopupInputContainerRepositoryImpl} from "../../deck_make_pop_up_input_container/repository/DeckMakePopupInputContainerRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class DeckMakePopupButtonsClickDetectServiceImpl implements DeckMakePopupButtonsClickDetectService {
    private static instance: DeckMakePopupButtonsClickDetectServiceImpl | null = null;
    private deckMakePopupButtonsClickDetectRepository: DeckMakePopupButtonsClickDetectRepositoryImpl;
    private deckMakePopupButtonsRepository: DeckMakePopupButtonsRepositoryImpl;
    private deckMakePopupBackgroundRepository: DeckMakePopupBackgroundRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private deckMakePopupInputContainerRepository: DeckMakePopupInputContainerRepositoryImpl;
    private cameraRepository: CameraRepository;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.deckMakePopupButtonsClickDetectRepository = DeckMakePopupButtonsClickDetectRepositoryImpl.getInstance();
        this.deckMakePopupButtonsRepository = DeckMakePopupButtonsRepositoryImpl.getInstance();
        this.deckMakePopupBackgroundRepository = DeckMakePopupBackgroundRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deckMakePopupInputContainerRepository = DeckMakePopupInputContainerRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckMakePopupButtonsClickDetectServiceImpl {
        if (!DeckMakePopupButtonsClickDetectServiceImpl.instance) {
            DeckMakePopupButtonsClickDetectServiceImpl.instance = new DeckMakePopupButtonsClickDetectServiceImpl(camera, scene);
        }
        return DeckMakePopupButtonsClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckMakePopupButtonsClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckMakePopupButtonsClickDetectRepository.isButtonClickEnabled();
    }

    async handleLeftClick(clickPoint: { x: number; y: number }): Promise<DeckMakePopupButtons | null> {
        const { x, y } = clickPoint;
        const deckMakePopupButtonsList = this.getAllDeckMakePopupButtons();
        const clickedDeckMakePopupButton = this.deckMakePopupButtonsClickDetectRepository.isDeckMakePopupButtonsClicked(
            { x, y },
            deckMakePopupButtonsList,
            this.camera
        );

        if (clickedDeckMakePopupButton) {
            console.log(`Clicked Deck Make Pop-up Button ID: ${clickedDeckMakePopupButton.id}`);
            this.saveCurrentButtonClickState(clickedDeckMakePopupButton);

            if (clickedDeckMakePopupButton.id === 0) {
                console.log(`[DEBUG] click cancel button!`);
                this.setTransparentBackgroundVisible(false);
                this.setDeckMakePopupBackgroundVisible(false);
                this.setDeckMakePopupButtonsVisible(false);
                this.setDeckMakePopupInputContainerVisible(false);
                this.clearUserInput();
            }

            if (clickedDeckMakePopupButton.id === 1) {
                console.log(`[DEBUG] click create button!`);
                this.saveUserInput();
                this.clearUserInput();
                this.deckMakePopupInputContainerRepository.findUserInput();

            }
            return clickedDeckMakePopupButton;
        }
        this.resetCurrentButtonClickState();

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckMakePopupButtons | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result  = await this.handleLeftClick(clickPoint);
            if (result) {
                this.setButtonClickEnabled(false);
            }
            return result;
        }
        return null;
    }

    private getAllDeckMakePopupButtons(): DeckMakePopupButtons[] {
        return this.deckMakePopupButtonsRepository.findAll();
    }

    private setTransparentBackgroundVisible(isVisible: boolean): void {
        const background = this.transparentBackgroundRepository.findTransparentBackground();
        if (background) {
            background.setVisibility(isVisible);
        }
    }

    private setDeckMakePopupBackgroundVisible(isVisible: boolean): void {
        const background = this.deckMakePopupBackgroundRepository.findDeckMakePopupBackground();
        if (background) {
            background.setVisibility(isVisible);
        }
    }

    private setDeckMakePopupButtonsVisible(isVisible: boolean): void {
        const buttonIds = this.deckMakePopupButtonsRepository.findAllButtonIds();
        for (const buttonId of buttonIds) {
            this.deckMakePopupButtonsRepository.findById(buttonId)?.setVisibility(isVisible);
        }
    }

    private setDeckMakePopupInputContainerVisible(isVisible: boolean): void {
        if (isVisible == true) {
            this.deckMakePopupInputContainerRepository.showDeckMakePopupInputContainer();
        } else {
            this.deckMakePopupInputContainerRepository.hideDeckMakePopupInputContainer();
        }
    }

    private saveUserInput(): void {
        this.deckMakePopupInputContainerRepository.updateUserInput();
    }

    // 입력창에 사용자가 입력한 텍스트 지우기
    private clearUserInput(): void {
        this.deckMakePopupInputContainerRepository.clearUserInput();
    }

    private saveCurrentButtonClickState(button: DeckMakePopupButtons): void {
        this.deckMakePopupButtonsClickDetectRepository.saveCurrentButtonClickState(button);
    }

    public getCurrentButtonClickState(): DeckMakePopupButtons | null {
        return this.deckMakePopupButtonsClickDetectRepository.getCurrentButtonClickState();
    }

    public resetCurrentButtonClickState(): void {
        this.deckMakePopupButtonsClickDetectRepository.resetCurrentButtonClickState();
    }

}