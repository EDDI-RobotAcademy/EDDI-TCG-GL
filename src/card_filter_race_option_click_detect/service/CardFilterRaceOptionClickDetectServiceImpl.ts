import * as THREE from "three";

import {CardFilterRaceOptionClickDetectService} from "./CardFilterRaceOptionClickDetectService";
import {CardFilterRaceOptionClickDetectRepositoryImpl} from "../repository/CardFilterRaceOptionClickDetectRepositoryImpl";

import {CardFilterRaceOptionInactive} from "../../card_filter_race_option_inactive/entity/CardFilterRaceOptionInactive";
import {CardRace} from "../../card/race";
import {CardFilterRaceOptionInactiveRepositoryImpl} from "../../card_filter_race_option_inactive/repository/CardFilterRaceOptionInactiveRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class CardFilterRaceOptionClickDetectServiceImpl implements CardFilterRaceOptionClickDetectService {
    private static instance: CardFilterRaceOptionClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private cardFilterRaceOptionButtonsClickDetectRepository: CardFilterRaceOptionClickDetectRepositoryImpl;
    private cardFilterRaceOptionInactiveRepository: CardFilterRaceOptionInactiveRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardFilterRaceOptionButtonsClickDetectRepository = CardFilterRaceOptionClickDetectRepositoryImpl.getInstance();
        this.cardFilterRaceOptionInactiveRepository = CardFilterRaceOptionInactiveRepositoryImpl.getInstance(scene);
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): CardFilterRaceOptionClickDetectServiceImpl {
        if (!CardFilterRaceOptionClickDetectServiceImpl.instance) {
            CardFilterRaceOptionClickDetectServiceImpl.instance = new CardFilterRaceOptionClickDetectServiceImpl(camera, scene);
        }
        return CardFilterRaceOptionClickDetectServiceImpl.instance;
    }

    async handleOptionClick(clickPoint: { x: number; y: number }): Promise<CardFilterRaceOptionInactive | null> {
        const { x, y } = clickPoint;
        const optionList = this.getAllCardFilterRaceOptionInactives();
        const clickedOption = this.cardFilterRaceOptionButtonsClickDetectRepository.isOptionClicked(
            { x, y },
            optionList,
            this.camera
        );

        if (clickedOption) {
            const optionType = clickedOption.type;
            console.log(`[DEBUG] Click Card Filter Race Option Type: ${optionType}`);

            return clickedOption;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<CardFilterRaceOptionInactive | null> {
        if (!this.isAllOptionClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };

            return await this.handleOptionClick(clickPoint);
        }
        return null;
    }

    private setAllOptionClickEnabled(isEnabled: boolean): void {
        this.cardFilterRaceOptionButtonsClickDetectRepository.setAllOptionClickEnabled(isEnabled);
    }

    private isAllOptionClickEnabled(): boolean {
        return this.cardFilterRaceOptionButtonsClickDetectRepository.isAllOptionClickEnabled();
    }

    private getAllCardFilterRaceOptionInactives(): CardFilterRaceOptionInactive[] {
        return this.cardFilterRaceOptionInactiveRepository.findAllOptions();
    }

}