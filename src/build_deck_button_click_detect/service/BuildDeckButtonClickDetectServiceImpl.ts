import * as THREE from "three";

import {BuildDeckButtonClickDetectService} from "./BuildDeckButtonClickDetectService";
import {BuildDeckButtonClickDetectRepositoryImpl} from "../repository/BuildDeckButtonClickDetectRepositoryImpl";
import {BuildDeckButton} from "../../build_deck_button/entity/BuildDeckButton";
import {BuildDeckButtonRepositoryImpl} from "../../build_deck_button/repository/BuildDeckButtonRepositoryImpl";
import {BuildDeckButtonStateManager} from "../../build_deck_button_manager/BuildDeckButtonStateManager";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class BuildDeckButtonClickDetectServiceImpl implements BuildDeckButtonClickDetectService {
    private static instance: BuildDeckButtonClickDetectServiceImpl | null = null;
    private buildDeckButtonClickDetectRepository: BuildDeckButtonClickDetectRepositoryImpl;
    private buildDeckButtonRepository: BuildDeckButtonRepositoryImpl;
    private buildDeckButtonStateManager: BuildDeckButtonStateManager;
    private cameraRepository: CameraRepository;
    private buttonClickState: boolean = true;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.buildDeckButtonClickDetectRepository = BuildDeckButtonClickDetectRepositoryImpl.getInstance();
        this.buildDeckButtonRepository = BuildDeckButtonRepositoryImpl.getInstance();
        this.buildDeckButtonStateManager = BuildDeckButtonStateManager.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
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
        this.buildDeckButtonStateManager.setVisibility(buttonId, isVisible);
    }

}
