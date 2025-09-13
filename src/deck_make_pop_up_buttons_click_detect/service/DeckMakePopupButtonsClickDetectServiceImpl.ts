import * as THREE from "three";

import {DeckMakePopupButtonsClickDetectService} from "./DeckMakePopupButtonsClickDetectService";
import {DeckMakePopupButtonsClickDetectRepository} from "../repository/DeckMakePopupButtonsClickDetectRepository";
import {DeckMakePopupButtonsClickDetectRepositoryImpl} from "../repository/DeckMakePopupButtonsClickDetectRepositoryImpl";

import {DeckMakePopupButtons} from "../../deck_make_pop_up_buttons/entity/DeckMakePopupButtons";
import {DeckMakePopupButtonsRepositoryImpl} from "../../deck_make_pop_up_buttons/repository/DeckMakePopupButtonsRepositoryImpl";
import {DeckMakePopupBackgroundRepositoryImpl} from "../../deck_make_pop_up_background/repository/DeckMakePopupBackgroundRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeckMakePopupInputContainerRepositoryImpl} from "../../deck_make_pop_up_input_container/repository/DeckMakePopupInputContainerRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../../my_deck_card_search_cancel_button/repository/MyDeckCardSearchCancelButtonRepositoryImpl";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../../deck_card_search_cancel_button_click_detect/repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class DeckMakePopupButtonsClickDetectServiceImpl implements DeckMakePopupButtonsClickDetectService {
    private static instance: DeckMakePopupButtonsClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckMakePopupButtonsClickDetectRepository: DeckMakePopupButtonsClickDetectRepositoryImpl;
    private deckMakePopupButtonsRepository: DeckMakePopupButtonsRepositoryImpl;
    private deckMakePopupBackgroundRepository: DeckMakePopupBackgroundRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private deckMakePopupInputContainerRepository: DeckMakePopupInputContainerRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckMakePopupButtonsClickDetectRepository = DeckMakePopupButtonsClickDetectRepositoryImpl.getInstance();
        this.deckMakePopupButtonsRepository = DeckMakePopupButtonsRepositoryImpl.getInstance();
        this.deckMakePopupBackgroundRepository = DeckMakePopupBackgroundRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deckMakePopupInputContainerRepository = DeckMakePopupInputContainerRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
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

            const searchContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
            if (searchContainer) {
                searchContainer.setInputDisabled(false);
            }

            if (clickedDeckMakePopupButton.id === 0) {
                console.log(`[DEBUG] click cancel button!`);
                this.setSearchCancelButtonClickEnabled(true);

                this.setTransparentBackgroundVisible(false);
                this.setDeckMakePopupBackgroundVisible(false);
                this.setDeckMakePopupButtonsVisible(false);
                this.setDeckMakePopupInputContainerVisible(`none`);
                this.clearUserInput();
            }

            if (clickedDeckMakePopupButton.id === 1) {
                console.log(`[DEBUG] click create button!`);

                // 덱 생성 버튼을 클릭하면 다른 페이지로 넘어가므로 검색창에 입력되어 있는 텍스트가 지워져야 함
                const searchInputText = this.myDeckSearchInputContainerRepository.findInputValue();
                if (searchInputText !== null && searchInputText.length > 0) {
                    this.myDeckSearchInputContainerRepository.clearUserInput();
                    this.myDeckSearchInputContainerRepository.deleteUserInput();
                }

                this.setSearchCancelButtonVisibility(false);

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

    private setDeckMakePopupInputContainerVisible(isVisible: 'block' | 'none'): void {
        const container = this.deckMakePopupInputContainerRepository.findDeckMakePopupInputContainer();
        if (container == null) return;

        container.setVisibility(isVisible);
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

    private setSearchCancelButtonVisibility(isVisible: boolean): void {
        this.myDeckCardSearchCancelButtonRepository.findButton()?.setVisibility(isVisible);
    }

    private setSearchCancelButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

}