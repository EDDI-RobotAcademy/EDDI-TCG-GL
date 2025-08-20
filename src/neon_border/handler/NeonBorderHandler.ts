import * as THREE from "three";

import {NeonBorderRepository} from "../repository/NeonBorderRepository";
import {NeonBorderLineSceneRepository} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepository";
import {NeonBorderSceneType} from "../entity/NeonBorderSceneType";
import {NeonBorderType} from "../entity/NeonBorderType";
import {NeonBorderRepositoryImpl} from "../repository/NeonBorderRepositoryImpl";
import {
    NeonBorderLineSceneRepositoryImpl
} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepositoryImpl";
import {YourFieldCardScene} from "../../your_field_card_scene/entity/YourFieldCardScene";
import {ClickableCard} from "../../left_click_detect/service/ClickableCard";
import { ActivePanelAreaRepository } from "src/active_panel_area/repository/ActivePanelAreaRepository";
import {ActivePanelAreaRepositoryImpl} from "../../active_panel_area/repository/ActivePanelAreaRepositoryImpl";
import {DragMoveRepository} from "../../drag_move/repository/DragMoveRepository";
import {DragMoveRepositoryImpl} from "../../drag_move/repository/DragMoveRepositoryImpl";

export class NeonBorderHandler {
    private static instance: NeonBorderHandler;

    private neonBorderRepository: NeonBorderRepository;
    private neonBorderLineSceneRepository: NeonBorderLineSceneRepository;

    private activePanelAreaRepository: ActivePanelAreaRepository;

    private dragMoveRepository: DragMoveRepository;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.neonBorderRepository = NeonBorderRepositoryImpl.getInstance();
        this.neonBorderLineSceneRepository = NeonBorderLineSceneRepositoryImpl.getInstance();

        this.activePanelAreaRepository = ActivePanelAreaRepositoryImpl.getInstance(camera, scene);

        this.dragMoveRepository = DragMoveRepositoryImpl.getInstance();
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): NeonBorderHandler {
        if (!NeonBorderHandler.instance) {
            NeonBorderHandler.instance = new NeonBorderHandler(camera, scene);
        }
        return NeonBorderHandler.instance;
    }

    public cleanupAfterAction(selectedYourFieldCard: YourFieldCardScene) {
        this.activePanelAreaRepository.delete();
        this.deactivateExistNeonBorder(selectedYourFieldCard);
        this.deactivateEveryExistOpponentNeonBorder();
        this.deactivateOpponentMasterNeonBorder();
        this.dragMoveRepository.deleteSelectedObject()
    }

    /** ================== 네온보더 처리 ================== */

    private deactivateExistNeonBorder(clickedCard: ClickableCard): void {
        const prevYourFieldSceneId = clickedCard.getId();
        const existingNeonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(
            prevYourFieldSceneId,
            NeonBorderSceneType.FIELD,
            NeonBorderType.ALLY
        );

        if (!existingNeonBorder) return;

        existingNeonBorder.getNeonBorderLineSceneIdList().forEach((lineSceneId) => {
            const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
            const lineMesh = lineScene?.getLine();
            if (lineMesh) lineMesh.visible = false;
        });
    }

    private deactivateEveryExistOpponentNeonBorder(): void {
        const allNeonBorders = this.neonBorderRepository.findAll();
        const opponentBorders = allNeonBorders.filter(
            border =>
                border.getNeonBorderSceneType() === NeonBorderSceneType.FIELD &&
                border.getType() === NeonBorderType.ENEMY
        );

        opponentBorders.forEach(border => {
            border.getNeonBorderLineSceneIdList().forEach(lineSceneId => {
                const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
                const lineMesh = lineScene?.getLine();
                if (lineMesh) lineMesh.visible = false;
            });
        });
    }

    private deactivateOpponentMasterNeonBorder(): void {
        const opponentMasterNeonBorder = this.neonBorderRepository.findOpponentMaster(NeonBorderType.OPPONENT_MASTER);
        if (!opponentMasterNeonBorder) return;

        opponentMasterNeonBorder.getNeonBorderLineSceneIdList().forEach((lineSceneId) => {
            const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
            const lineMesh = lineScene?.getLine();
            if (lineMesh) lineMesh.visible = false;
        });
    }
}
