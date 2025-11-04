import * as THREE from "three";

import {CardGrade} from "../../card/grade";

import {CardFilterGradeOptionClickDetectService} from "./CardFilterGradeOptionClickDetectService";
import {CardFilterGradeOptionClickDetectRepositoryImpl} from "../repository/CardFilterGradeOptionClickDetectRepositoryImpl";

import {CardFilterGradeOptionInactive} from "../../card_filter_grade_option_inactive/entity/CardFilterGradeOptionInactive";
import {CardFilterGradeOptionInactiveRepositoryImpl} from "../../card_filter_grade_option_inactive/repository/CardFilterGradeOptionInactiveRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class CardFilterGradeOptionClickDetectServiceImpl implements CardFilterGradeOptionClickDetectService {
    private static instance: CardFilterGradeOptionClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private cardFilterGradeOptionClickDetectRepository: CardFilterGradeOptionClickDetectRepositoryImpl;
    private cardFilterGradeOptionInactiveRepository: CardFilterGradeOptionInactiveRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardFilterGradeOptionClickDetectRepository = CardFilterGradeOptionClickDetectRepositoryImpl.getInstance();
        this.cardFilterGradeOptionInactiveRepository = CardFilterGradeOptionInactiveRepositoryImpl.getInstance(scene);
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

            return clickedOption;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<CardFilterGradeOptionInactive | null> {
        if (!this.isAllOptionClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };

            return await this.handleOptionClick(clickPoint);
        }
        return null;
    }

    private getAllCardFilterGradeOptionInactives(): CardFilterGradeOptionInactive[] {
        return this.cardFilterGradeOptionInactiveRepository.findAllGradeOptions();
    }

    private setAllOptionClickEnabled(isEnabled: boolean): void {
        this.cardFilterGradeOptionClickDetectRepository.setAllOptionClickEnabled(isEnabled);
    }

    private isAllOptionClickEnabled(): boolean {
        return this.cardFilterGradeOptionClickDetectRepository.isAllOptionClickEnabled();
    }

    private saveCardFilterRaceOptionClickState(type: CardGrade, state: boolean): void {
        this.cardFilterGradeOptionClickDetectRepository.saveOptionClickState(type, state);
    }

    private getCardFilterRaceOptionClickState(type: CardGrade): boolean | undefined {
        return this.cardFilterGradeOptionClickDetectRepository.findOptionClickState(type);
    }

}