import * as THREE from "three";

import {CardFilterButtonClickDetectService} from "./CardFilterButtonClickDetectService";

import {CardFilterButton} from "../../card_filter_button/entity/CardFilterButton";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {CardFilterButtonClickDetectRepositoryImpl} from "../repository/CardFilterButtonClickDetectRepositoryImpl";
import {CardFilterButtonRepositoryImpl} from "../../card_filter_button/repository/CardFilterButtonRepositoryImpl";

export class CardFilterButtonClickDetectServiceImpl implements CardFilterButtonClickDetectService {
    private static instance: CardFilterButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private cardFilterButtonClickDetectRepository: CardFilterButtonClickDetectRepositoryImpl;
    private cardFilterButtonRepository: CardFilterButtonRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardFilterButtonClickDetectRepository = CardFilterButtonClickDetectRepositoryImpl.getInstance();
        this.cardFilterButtonRepository = CardFilterButtonRepositoryImpl.getInstance(scene);
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

}
