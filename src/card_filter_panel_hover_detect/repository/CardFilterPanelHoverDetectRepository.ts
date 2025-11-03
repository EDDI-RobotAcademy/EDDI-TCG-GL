import * as THREE from "three";
import {CardFilterPanel} from "../../card_filter_panel/entity/CardFilterPanel";

export interface CardFilterPanelHoverDetectRepository {
    isPanelHover(hoverPoint: { x: number; y: number },
        panel: CardFilterPanel,
        camera: THREE.Camera): any | null;
}