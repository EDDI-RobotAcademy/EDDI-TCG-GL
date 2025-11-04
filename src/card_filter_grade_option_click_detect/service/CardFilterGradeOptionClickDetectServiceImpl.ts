import * as THREE from "three";

import {CardGrade} from "../../card/grade";

import {CardFilterGradeOptionClickDetectService} from "./CardFilterGradeOptionClickDetectService";
import {CardFilterGradeOptionClickDetectRepositoryImpl} from "../repository/CardFilterGradeOptionClickDetectRepositoryImpl";

import {CardFilterGradeOptionInactive} from "../../card_filter_grade_option_inactive/entity/CardFilterGradeOptionInactive";
import {CardFilterGradeOptionInactiveRepositoryImpl} from "../../card_filter_grade_option_inactive/repository/CardFilterGradeOptionInactiveRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {CardFilterGradeOptionActiveRepositoryImpl} from "../../card_filter_grade_option_active/repository/CardFilterGradeOptionActiveRepositoryImpl";

export class CardFilterGradeOptionClickDetectServiceImpl implements CardFilterGradeOptionClickDetectService {
    private static instance: CardFilterGradeOptionClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private cardFilterGradeOptionClickDetectRepository: CardFilterGradeOptionClickDetectRepositoryImpl;
    private cardFilterGradeOptionInactiveRepository: CardFilterGradeOptionInactiveRepositoryImpl;
    private cardFilterGradeOptionActiveRepository: CardFilterGradeOptionActiveRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardFilterGradeOptionClickDetectRepository = CardFilterGradeOptionClickDetectRepositoryImpl.getInstance();
        this.cardFilterGradeOptionInactiveRepository = CardFilterGradeOptionInactiveRepositoryImpl.getInstance(scene);
        this.cardFilterGradeOptionActiveRepository = CardFilterGradeOptionActiveRepositoryImpl.getInstance(scene);
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): CardFilterGradeOptionClickDetectServiceImpl {
        if (!CardFilterGradeOptionClickDetectServiceImpl.instance) {
            CardFilterGradeOptionClickDetectServiceImpl.instance = new CardFilterGradeOptionClickDetectServiceImpl(camera, scene);
        }
        return CardFilterGradeOptionClickDetectServiceImpl.instance;
    }

    async handleOptionClick(clickPoint: { x: number; y: number }): Promise<CardFilterGradeOptionInactive | null> {
        const { x, y } = clickPoint;
        const optionList = this.getAllCardFilterGradeOptionInactives();
        const clickedOption = this.cardFilterGradeOptionClickDetectRepository.isOptionClicked(
            { x, y },
            optionList,
            this.camera
        );

        if (clickedOption) {
            const currentClickedOptionType = clickedOption.type;
            console.log(`[DEBUG] Click Card Filter Grade Option Type: ${currentClickedOptionType}`);
            this.handleFilterGradeOptionToggle(currentClickedOptionType);

            return clickedOption;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<CardFilterGradeOptionInactive | null> {
        if (!this.isAllGradeOptionClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };

            return await this.handleOptionClick(clickPoint);
        }
        return null;
    }

    private handleFilterGradeOptionToggle(optionType: CardGrade): void {
        const prevClickedOptionState = this.getCardFilterGradeOptionClickState(optionType);
        if (prevClickedOptionState == true) {
            // 이전에 클릭했을 때
            this.updateGradeOptionState(optionType, true);
        } else {
            // 이전에 클릭하지 않았을 때
            this.updateGradeOptionState(optionType, false);
        }
    }

    private updateGradeOptionState(type: CardGrade, isActive: boolean): void {
        this.saveCardFilterGradeOptionClickState(type, !isActive);
        this.updateGradeOptionVisibility(type, isActive);
    }

    private updateGradeOptionVisibility(type: CardGrade, isActive: boolean): void {
        this.setCardFilterGradeOptionInactiveVisibility(type, isActive);
        this.setCardFilterGradeOptionActiveVisibility(type, !isActive);
    }

    private getAllCardFilterGradeOptionInactives(): CardFilterGradeOptionInactive[] {
        return this.cardFilterGradeOptionInactiveRepository.findAllGradeOptions();
    }

    private setAllGradeOptionClickEnabled(isEnabled: boolean): void {
        this.cardFilterGradeOptionClickDetectRepository.setAllOptionClickEnabled(isEnabled);
    }

    private isAllGradeOptionClickEnabled(): boolean {
        return this.cardFilterGradeOptionClickDetectRepository.isAllOptionClickEnabled();
    }

    private saveCardFilterGradeOptionClickState(type: CardGrade, state: boolean): void {
        this.cardFilterGradeOptionClickDetectRepository.saveOptionClickState(type, state);
    }

    private getCardFilterGradeOptionClickState(type: CardGrade): boolean | undefined {
        return this.cardFilterGradeOptionClickDetectRepository.findOptionClickState(type);
    }

    private setCardFilterGradeOptionInactiveVisibility(type: CardGrade, isVisible: boolean): void {
        this.cardFilterGradeOptionInactiveRepository.findGradeOptionByType(type)?.setVisibility(isVisible);
    }

    private setCardFilterGradeOptionActiveVisibility(type: CardGrade, isVisible: boolean): void {
        this.cardFilterGradeOptionActiveRepository.findGradeOptionByType(type)?.setVisibility(isVisible);
    }

}