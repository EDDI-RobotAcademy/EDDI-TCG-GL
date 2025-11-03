import * as THREE from "three";

import {CardFilterPanelHoverDetectRepository} from "./CardFilterPanelHoverDetectRepository";
import {CardFilterPanel} from "../../card_filter_panel/entity/CardFilterPanel";

export class CardFilterPanelHoverDetectRepositoryImpl implements CardFilterPanelHoverDetectRepository {
    private static instance: CardFilterPanelHoverDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private panelHoverEnabled: boolean = false;
    private hoverState: boolean = false;

    public static getInstance(): CardFilterPanelHoverDetectRepositoryImpl {
        if (!CardFilterPanelHoverDetectRepositoryImpl.instance) {
            CardFilterPanelHoverDetectRepositoryImpl.instance = new CardFilterPanelHoverDetectRepositoryImpl();
        }
        return CardFilterPanelHoverDetectRepositoryImpl.instance;
    }

    public isPanelHover(hoverPoint: { x: number; y: number },
        panel: CardFilterPanel,
        camera: THREE.Camera
    ): CardFilterPanel | null {
        const { x, y } = hoverPoint;
        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const mesh = panel.getMesh();
        const intersects = this.raycaster.intersectObject(mesh);

        if (intersects.length > 0) {
            return panel;
        } else {
            return null;
        }

    }

    public setPanelHoverEnabled(isEnable: boolean): void {
        this.panelHoverEnabled = isEnable;
    }

    public isPanelHoverEnabled(): boolean {
        return this.panelHoverEnabled;
    }

    public savePanelHoverState(state: boolean): void {
        this.hoverState = state;
    }

    public findPanelHoverState(): boolean {
        return this.hoverState;
    }

}