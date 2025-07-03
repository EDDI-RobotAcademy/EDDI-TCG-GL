import * as THREE from "three";

import {BuildDeckButtonHoverDetectService} from "./BuildDeckButtonHoverDetectService";
import {BuildDeckButtonHoverDetectRepositoryImpl} from "../repository/BuildDeckButtonHoverDetectRepositoryImpl";
import {BuildDeckButton} from "../../build_deck_button/entity/BuildDeckButton";
import {BuildDeckButtonRepositoryImpl} from "../../build_deck_button/repository/BuildDeckButtonRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class BuildDeckButtonHoverDetectServiceImpl implements BuildDeckButtonHoverDetectService {
    private static instance: BuildDeckButtonHoverDetectServiceImpl | null = null;
    private buildDeckButtonHoverDetectRepository: BuildDeckButtonHoverDetectRepositoryImpl;
    private buildDeckButtonRepository: BuildDeckButtonRepositoryImpl;
    private cameraRepository: CameraRepository;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.buildDeckButtonHoverDetectRepository = BuildDeckButtonHoverDetectRepositoryImpl.getInstance();
        this.buildDeckButtonRepository = BuildDeckButtonRepositoryImpl.getInstance(scene);
        this.cameraRepository = CameraRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): BuildDeckButtonHoverDetectServiceImpl {
        if (!BuildDeckButtonHoverDetectServiceImpl.instance) {
            BuildDeckButtonHoverDetectServiceImpl.instance = new BuildDeckButtonHoverDetectServiceImpl(camera, scene);
        }
        return BuildDeckButtonHoverDetectServiceImpl.instance;
    }

    private setButtonHoverEnabled(isEnable: boolean): void {
        this.buildDeckButtonHoverDetectRepository.setButtonHoverEnabled(isEnable);
    }

    private isButtonHoverEnabled(): boolean {
        return this.buildDeckButtonHoverDetectRepository.isButtonHoverEnabled();
    }

    public async handleHover(hoverPoint: { x: number; y: number }): Promise<BuildDeckButton | null> {
        const { x, y } = hoverPoint;
        const button = this.getBuildDeckButton();
        if (button !== null) {
            const hoveredButton = this.buildDeckButtonHoverDetectRepository.isBuildDeckButtonHover(
                { x, y },
                button,
                this.camera);

            if (hoveredButton) {
                console.log(`[DEBUG] Hovered Build Deck Button`);
                this.setButtonVisibility(0, false);
                this.setButtonVisibility(1, true);
                return hoveredButton;
            } else {
                this.setButtonVisibility(0, true);
                this.setButtonVisibility(1, false);
            }
        }
        return null;
    }

    public async onMouseMove(event: MouseEvent): Promise<BuildDeckButton | null> {
        if (!this.isButtonHoverEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            return await this.handleHover(hoverPoint);
        }
        return null;
    }

    private getBuildDeckButton(): BuildDeckButton | null {
        return this.buildDeckButtonRepository.findButtonById(0);
    }

    private setButtonVisibility(buttonId: number, isVisible: boolean): void {
        this.buildDeckButtonRepository.findButtonById(buttonId)?.setVisibility(isVisible);
    }

}
