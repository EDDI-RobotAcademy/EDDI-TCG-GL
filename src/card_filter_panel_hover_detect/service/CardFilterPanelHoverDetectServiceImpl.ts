import * as THREE from "three";

import {CardFilterPanelHoverDetectService} from "./CardFilterPanelHoverDetectService";
import {CardFilterPanelHoverDetectRepositoryImpl} from "../repository/CardFilterPanelHoverDetectRepositoryImpl";
import {CardFilterPanel} from "../../card_filter_panel/entity/CardFilterPanel";
import {CardFilterPanelRepositoryImpl} from "../../card_filter_panel/repository/CardFilterPanelRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class CardFilterPanelHoverDetectServiceImpl implements CardFilterPanelHoverDetectService {
    private static instance: CardFilterPanelHoverDetectServiceImpl | null = null;
    private cardFilterPanelHoverDetectRepository: CardFilterPanelHoverDetectRepositoryImpl;
    private cardFilterPanelRepository: CardFilterPanelRepositoryImpl;
    private cameraRepository: CameraRepository;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cardFilterPanelHoverDetectRepository = CardFilterPanelHoverDetectRepositoryImpl.getInstance();
        this.cardFilterPanelRepository = CardFilterPanelRepositoryImpl.getInstance(scene);
        this.cameraRepository = CameraRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): CardFilterPanelHoverDetectServiceImpl {
        if (!CardFilterPanelHoverDetectServiceImpl.instance) {
            CardFilterPanelHoverDetectServiceImpl.instance = new CardFilterPanelHoverDetectServiceImpl(camera, scene);
        }
        return CardFilterPanelHoverDetectServiceImpl.instance;
    }

    public async handlePanelHover(hoverPoint: { x: number; y: number }): Promise<CardFilterPanel | null> {
        const { x, y } = hoverPoint;
        const panel = this.getCardFilterPanel();
        if (panel !== null) {
            const hoveredPanel = this.cardFilterPanelHoverDetectRepository.isPanelHover(
                { x, y },
                panel,
                this.camera);

            if (hoveredPanel) {
                console.log(`[DEBUG] Hovered Card Filter Panel`);
                this.savePanelHoverState(true);

                return hoveredPanel;
            } else {
                this.savePanelHoverState(false);
            }
        }
        return null;
    }

    public async onMouseMove(event: MouseEvent): Promise<CardFilterPanel | null> {
        if (!this.isPanelHoverEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            return await this.handlePanelHover(hoverPoint);
        }
        return null;
    }

    private setPanelHoverEnabled(isEnable: boolean): void {
        this.cardFilterPanelHoverDetectRepository.setPanelHoverEnabled(isEnable);
    }

    private isPanelHoverEnabled(): boolean {
        return this.cardFilterPanelHoverDetectRepository.isPanelHoverEnabled();
    }

    private getCardFilterPanel(): CardFilterPanel | null {
        return this.cardFilterPanelRepository.findPanel();
    }

    private savePanelHoverState(state: boolean): void {
        this.cardFilterPanelHoverDetectRepository.savePanelHoverState(state);
    }

}
