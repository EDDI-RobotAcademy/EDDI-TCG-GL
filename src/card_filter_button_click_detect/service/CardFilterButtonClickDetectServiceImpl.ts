import * as THREE from "three";

import {CardFilterButtonClickDetectService} from "./CardFilterButtonClickDetectService";

import {CardFilterButton} from "../../card_filter_button/entity/CardFilterButton";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {CardFilterButtonClickDetectRepositoryImpl} from "../repository/CardFilterButtonClickDetectRepositoryImpl";
import {CardFilterButtonRepositoryImpl} from "../../card_filter_button/repository/CardFilterButtonRepositoryImpl";
import {CardFilterPanelRepositoryImpl} from "../../card_filter_panel/repository/CardFilterPanelRepositoryImpl";
import {CardFilterRaceOptionInactiveRepositoryImpl} from "../../card_filter_race_option_inactive/repository/CardFilterRaceOptionInactiveRepositoryImpl";
import {CardFilterGradeOptionInactiveRepositoryImpl} from "../../card_filter_grade_option_inactive/repository/CardFilterGradeOptionInactiveRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";

import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {DeckNameEditButtonClickDetectRepositoryImpl} from "../../deck_name_edit_button_click_detect/repository/DeckNameEditButtonClickDetectRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {BuildDeckButtonHoverDetectRepositoryImpl} from "../../build_deck_button_hover_detect/repository/BuildDeckButtonHoverDetectRepositoryImpl";
import {BuildDeckButtonClickDetectRepositoryImpl} from "../../build_deck_button_click_detect/repository/BuildDeckButtonClickDetectRepositoryImpl";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../../deck_delete_button_click_detect/repository/DeckDeleteButtonClickDetectRepositoryImpl";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../../my_deck_block_hover_detect/repository/MyDeckBlockHoverDetectRepositoryImpl";

export class CardFilterButtonClickDetectServiceImpl implements CardFilterButtonClickDetectService {
    private static instance: CardFilterButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private cardFilterButtonClickDetectRepository: CardFilterButtonClickDetectRepositoryImpl;
    private cardFilterButtonRepository: CardFilterButtonRepositoryImpl;
    private cardFilterPanelRepository: CardFilterPanelRepositoryImpl;
    private cardFilterRaceOptionInactiveRepository: CardFilterRaceOptionInactiveRepositoryImpl;
    private cardFilterGradeOptionInactiveRepository: CardFilterGradeOptionInactiveRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private deckNameEditButtonClickDetectRepository: DeckNameEditButtonClickDetectRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private buildDeckButtonHoverDetectRepository: BuildDeckButtonHoverDetectRepositoryImpl;
    private buildDeckButtonClickDetectRepository: BuildDeckButtonClickDetectRepositoryImpl;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardFilterButtonClickDetectRepository = CardFilterButtonClickDetectRepositoryImpl.getInstance();
        this.cardFilterButtonRepository = CardFilterButtonRepositoryImpl.getInstance(scene);
        this.cardFilterPanelRepository = CardFilterPanelRepositoryImpl.getInstance(scene);
        this.cardFilterRaceOptionInactiveRepository = CardFilterRaceOptionInactiveRepositoryImpl.getInstance(scene);
        this.cardFilterGradeOptionInactiveRepository = CardFilterGradeOptionInactiveRepositoryImpl.getInstance(scene);
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckNameEditButtonClickDetectRepository = DeckNameEditButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.buildDeckButtonHoverDetectRepository = BuildDeckButtonHoverDetectRepositoryImpl.getInstance();
        this.buildDeckButtonClickDetectRepository = BuildDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): CardFilterButtonClickDetectServiceImpl {
        if (!CardFilterButtonClickDetectServiceImpl.instance) {
            CardFilterButtonClickDetectServiceImpl.instance = new CardFilterButtonClickDetectServiceImpl(camera, scene);
        }
        return CardFilterButtonClickDetectServiceImpl.instance;
    }

    public async handleButtonClick(clickPoint: { x: number; y: number }): Promise<CardFilterButton | null> {
        const { x, y } = clickPoint;
        const currentClickedDeckId = this.getCurrentClickDeckId();
        if (currentClickedDeckId == null) return null;

        const button = this.getCardFilterButton();
        if (button !== null) {
            const clickedButton = this.cardFilterButtonClickDetectRepository.isButtonClicked(
                { x, y },
                button,
                this.camera);

            if (clickedButton) {
                console.log(`[DEBUG] Clicked Card Filter Button`);
                this.handleFilterButtonToggle(currentClickedDeckId);
                this.setOutSideFilterButtonClickDetected(false);

                return clickedButton;

            } else {
                console.log(`[DEBUG] Clicked Outside Filter Button`);
                this.hideCardFilterPanel();
                this.setOutSideFilterButtonClickDetected(true);
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<CardFilterButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };

            return await this.handleButtonClick(clickPoint);
        }
        return null;
    }

    public async onMouseUp(event: MouseEvent): Promise<void> {
        if (!this.isButtonClickEnabled()) return;

        // 다른 영역을 클릭한 뒤 마우스를 뗄 때 동작
        this.handleMouseUpResult();
    }

    private handleFilterButtonToggle(deckId: number): void {
        const isClicked = this.getFilterButtonClickState();
        if (isClicked == false) {
            this.handleFilterButtonFirstClick(deckId);
        } else {
            this.handleFilterButtonClickAgain(deckId);
        }
    }

    private handleMouseUpResult(): void {
        if (!this.isOutsideFilterButtonClickDetected()) return;

        console.log(`[DEBUG] MouseUp Outside Filter Button`);

        this.setFilterButtonClickState(false);
        this.setInteractionAfterFilterPanelClosed(this.getCurrentClickDeckId()!);
        this.setOutSideFilterButtonClickDetected(false);
    }

    private handleFilterButtonFirstClick(deckId: number): void {
        this.showCardFilterPanel();
        this.setInteractionAfterCardFilterButtonClick(deckId);
        this.setFilterButtonClickState(true);
    }

    private handleFilterButtonClickAgain(deckId: number): void {
        this.hideCardFilterPanel();
        this.setInteractionAfterFilterPanelClosed(deckId);
        this.setFilterButtonClickState(false);
    }

    private setButtonClickEnabled(isEnable: boolean): void {
        this.cardFilterButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private isButtonClickEnabled(): boolean {
        return this.cardFilterButtonClickDetectRepository.isButtonClickEnabled();
    }

    private getFilterButtonClickState(): boolean {
        return this.cardFilterButtonClickDetectRepository.findButtonClickState();
    }

    private setFilterButtonClickState(isClicked: boolean): void {
        this.cardFilterButtonClickDetectRepository.setButtonClickState(isClicked);
    }

    private getCardFilterButton(): CardFilterButton | null {
        return this.cardFilterButtonRepository.findButton();
    }

    private setOutSideFilterButtonClickDetected(isDetected: boolean): void {
        this.cardFilterButtonClickDetectRepository.setOutsideButtonClickDetected(isDetected);
    }

    private isOutsideFilterButtonClickDetected(): boolean {
        return this.cardFilterButtonClickDetectRepository.isOutsideButtonClickDetected();
    }

    private getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

    private showCardFilterPanel(): void {
        this.setCardFilterPanelVisibility(true);
        this.setAllCardFilterRaceOptionButtonVisibility(true);
        this.setAllCardFilterGradeOptionButtonVisibility(true);
    }

    private hideCardFilterPanel(): void {
        this.setCardFilterPanelVisibility(false);
        this.setAllCardFilterRaceOptionButtonVisibility(false);
        this.setAllCardFilterGradeOptionButtonVisibility(false);
    }

    private setInteractionAfterCardFilterButtonClick(deckId: number): void {
        this.setAllMyDeckButtonClickEnabled(false);
        this.setAllDeckNameEditButtonClickEnabled(false);
        this.setDeckNameEditButtonClickEnabled(deckId, false);
        this.setDeckEditButtonClickEnabled(false);
        this.setBuildDeckButtonHoverEnabled(false);
        this.setBuildDeckButtonClickEnabled(false);
        this.setAllDeckDeleteButtonClickEnabled(false);
        this.setMyDeckBlockHoverEnabled(false);
        this.setMyDeckCardSearchInputEnabled(true);
    }

    // 필터 버튼을 한 번 클릭한 상태에서 다시 클릭했을 경우
    // 필터 버튼 외에 다른 곳을 클릭한 뒤 마우스를 뗄 경우
    private setInteractionAfterFilterPanelClosed(deckId: number): void {
        this.setAllMyDeckButtonClickEnabled(true);
        this.setAllDeckNameEditButtonClickEnabled(true);
        this.setDeckNameEditButtonClickEnabled(deckId, true);
        this.setDeckEditButtonClickEnabled(true);
        this.setBuildDeckButtonHoverEnabled(true);
        this.setBuildDeckButtonClickEnabled(true);
        this.setAllDeckDeleteButtonClickEnabled(true);
        this.setMyDeckBlockHoverEnabled(true);
        this.setMyDeckCardSearchInputEnabled(false);
    }

    private setCardFilterPanelVisibility(isVisible: boolean): void {
        this.cardFilterPanelRepository.findPanel()?.setVisibility(isVisible);
    }

    private setAllCardFilterRaceOptionButtonVisibility(isVisible: boolean): void {
        this.cardFilterRaceOptionInactiveRepository.findAllOptions().forEach(option =>
            option.setVisibility(isVisible)
        );
    }

    private setAllCardFilterGradeOptionButtonVisibility(isVisible: boolean): void {
        this.cardFilterGradeOptionInactiveRepository.findAllGradeOptions().forEach(option =>
            option.setVisibility(isVisible)
        );
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

    private setMyDeckBlockHoverEnabled(isEnabled: boolean): void {
        this.myDeckBlockHoverDetectRepository.setBlockHoverEnabled(isEnabled);
    }

    private setMyDeckCardSearchInputEnabled(isEnabled: boolean): void {
        const searchContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
        if (searchContainer) {
            searchContainer.setInputDisabled(isEnabled); // 사용 가능: false, 사용 불가능: true
        }
    }

}
