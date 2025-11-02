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

export class CardFilterButtonClickDetectServiceImpl implements CardFilterButtonClickDetectService {
    private static instance: CardFilterButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private cardFilterButtonClickDetectRepository: CardFilterButtonClickDetectRepositoryImpl;
    private cardFilterButtonRepository: CardFilterButtonRepositoryImpl;
    private cardFilterPanelRepository: CardFilterPanelRepositoryImpl;
    private cardFilterRaceOptionInactiveRepository: CardFilterRaceOptionInactiveRepositoryImpl;
    private cardFilterGradeOptionInactiveRepository: CardFilterGradeOptionInactiveRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardFilterButtonClickDetectRepository = CardFilterButtonClickDetectRepositoryImpl.getInstance();
        this.cardFilterButtonRepository = CardFilterButtonRepositoryImpl.getInstance(scene);
        this.cardFilterPanelRepository = CardFilterPanelRepositoryImpl.getInstance(scene);
        this.cardFilterRaceOptionInactiveRepository = CardFilterRaceOptionInactiveRepositoryImpl.getInstance(scene);
        this.cardFilterGradeOptionInactiveRepository = CardFilterGradeOptionInactiveRepositoryImpl.getInstance(scene);
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): CardFilterButtonClickDetectServiceImpl {
        if (!CardFilterButtonClickDetectServiceImpl.instance) {
            CardFilterButtonClickDetectServiceImpl.instance = new CardFilterButtonClickDetectServiceImpl(camera, scene);
        }
        return CardFilterButtonClickDetectServiceImpl.instance;
    }

    public async handleButtonClick(clickPoint: { x: number; y: number }): Promise<CardFilterButton | null> {
        const { x, y } = clickPoint;
        const button = this.getCardFilterButton();
        if (button !== null) {
            const clickedButton = this.cardFilterButtonClickDetectRepository.isButtonClicked(
                { x, y },
                button,
                this.camera);

            if (clickedButton) {
                console.log(`[DEBUG] Clicked Card Filter Button`);
                this.showCardFilterPanel();

                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<CardFilterButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };

            return await this.handleButtonClick(hoverPoint);
        }
        return null;
    }

    private setButtonClickEnabled(isEnable: boolean): void {
        this.cardFilterButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private isButtonClickEnabled(): boolean {
        return this.cardFilterButtonClickDetectRepository.isButtonClickEnabled();
    }

    private getCardFilterButton(): CardFilterButton | null {
        return this.cardFilterButtonRepository.findButton();
    }

    private showCardFilterPanel(): void {
        this.setCardFilterPanelVisibility(true);
        this.setAllCardFilterRaceOptionButtonVisibility(true);
        this.setAllCardFilterGradeOptionButtonVisibility(true);
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

}
