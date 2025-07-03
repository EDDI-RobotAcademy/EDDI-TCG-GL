import * as THREE from "three";

import {BuildDeckButtonClickDetectService} from "./BuildDeckButtonClickDetectService";

import {BuildDeckButton} from "../../build_deck_button/entity/BuildDeckButton";
import {TransparentBackground} from "../../transparent_background/entity/TransparentBackground";
import {DeckMakePopupBackground} from "../../deck_make_pop_up_background/entity/DeckMakePopupBackground";

import {BuildDeckButtonClickDetectRepositoryImpl} from "../repository/BuildDeckButtonClickDetectRepositoryImpl";
import {BuildDeckButtonRepositoryImpl} from "../../build_deck_button/repository/BuildDeckButtonRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeckMakePopupBackgroundRepositoryImpl} from "../../deck_make_pop_up_background/repository/DeckMakePopupBackgroundRepositoryImpl";
import {DeckMakePopupButtonsRepositoryImpl} from "../../deck_make_pop_up_buttons/repository/DeckMakePopupButtonsRepositoryImpl";
import {DeckMakePopupInputContainerRepositoryImpl} from "../../deck_make_pop_up_input_container/repository/DeckMakePopupInputContainerRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class BuildDeckButtonClickDetectServiceImpl implements BuildDeckButtonClickDetectService {
    private static instance: BuildDeckButtonClickDetectServiceImpl | null = null;
    private buildDeckButtonClickDetectRepository: BuildDeckButtonClickDetectRepositoryImpl;
    private buildDeckButtonRepository: BuildDeckButtonRepositoryImpl;
    private cameraRepository: CameraRepository;

    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private deckMakePopupBackgroundRepository: DeckMakePopupBackgroundRepositoryImpl;
    private deckMakePopupButtonsRepository: DeckMakePopupButtonsRepositoryImpl;
    private deckMakePopupInputContainerRepository: DeckMakePopupInputContainerRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.buildDeckButtonClickDetectRepository = BuildDeckButtonClickDetectRepositoryImpl.getInstance();
        this.buildDeckButtonRepository = BuildDeckButtonRepositoryImpl.getInstance(scene);
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deckMakePopupBackgroundRepository = DeckMakePopupBackgroundRepositoryImpl.getInstance();
        this.deckMakePopupButtonsRepository = DeckMakePopupButtonsRepositoryImpl.getInstance();
        this.deckMakePopupInputContainerRepository = DeckMakePopupInputContainerRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): BuildDeckButtonClickDetectServiceImpl {
        if (!BuildDeckButtonClickDetectServiceImpl.instance) {
            BuildDeckButtonClickDetectServiceImpl.instance = new BuildDeckButtonClickDetectServiceImpl(camera, scene);
        }
        return BuildDeckButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnable: boolean): void {
        this.buildDeckButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private isButtonClickEnabled(): boolean {
        return this.buildDeckButtonClickDetectRepository.isButtonClickEnabled();
    }

    public async handleClick(clickPoint: { x: number; y: number }): Promise<BuildDeckButton | null> {
        const { x, y } = clickPoint;
        const button = this.getBuildDeckButton();
        if (button !== null) {
            const clickedButton = this.buildDeckButtonClickDetectRepository.isBuildDeckButtonClicked(
                { x, y },
                button,
                this.camera);

            if (clickedButton) {
                console.log(`[DEBUG] Clicked Build Deck Button`);
                this.setTransparentBackgroundVisible(true);
                this.setDeckMakePopupBackgroundVisible(true);
                this.setDeckMakePopupButtonsVisible(true);
                this.setDeckMakePopupInputContainerVisible(true);
                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<BuildDeckButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            return await this.handleClick(hoverPoint);
        }
        return null;
    }

    private getBuildDeckButton(): BuildDeckButton | null {
        return this.buildDeckButtonRepository.findButtonById(0);
    }

    private setButtonVisibility(buttonId: number, isVisible: boolean): void {
        this.buildDeckButtonRepository.findButtonById(buttonId)?.setVisibility(isVisible);
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
        if (isVisible == true){
           buttonIds.forEach((buttonId) => {
               this.deckMakePopupButtonsRepository.showDeckMakePopupButton(buttonId);
           });
        } else {
            buttonIds.forEach((buttonId) => {
                this.deckMakePopupButtonsRepository.hideDeckMakePopupButton(buttonId);
            });
        }
    }

    private setDeckMakePopupInputContainerVisible(isVisible: boolean): void {
        if (isVisible == true) {
            this.deckMakePopupInputContainerRepository.showDeckMakePopupInputContainer();
        } else {
            this.deckMakePopupInputContainerRepository.hideDeckMakePopupInputContainer();
        }
    }

}
