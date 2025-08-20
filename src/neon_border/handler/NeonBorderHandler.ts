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
import {YourFieldRepository} from "../../your_field/repository/YourFieldRepository";
import {YourFieldRepositoryImpl} from "../../your_field/repository/YourFieldRepositoryImpl";
import {NeonBorder} from "../entity/NeonBorder";
import {NeonBorderLineScene} from "../../neon_border_line_scene/entity/NeonBorderLineScene";
import {NeonBorderLinePosition} from "../../neon_border_line_position/entity/NeonBorderLinePosition";
import {Vector2d} from "../../common/math/Vector2d";
import {OpponentFieldRepository} from "../../opponent_field/repository/OpponentFieldRepository";
import {OpponentFieldRepositoryImpl} from "../../opponent_field/repository/OpponentFieldRepositoryImpl";
import {
    OpponentFieldCardSceneRepository
} from "../../opponent_field_card_scene/repository/OpponentFieldCradSceneRepository";
import {
    OpponentFieldCardSceneRepositoryImpl
} from "../../opponent_field_card_scene/repository/OpponentFieldCradSceneRepositoryImpl";
import {NeonShape} from "../../neon/NeonShape";
import {
    NeonBorderLinePositionRepository
} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepository";
import {
    NeonBorderLinePositionRepositoryImpl
} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepositoryImpl";
import {
    OpponentFieldCardAttributeMarkRepository
} from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepository";
import {
    OpponentFieldCardAttributeMarkRepositoryImpl
} from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepositoryImpl";
import {
    OpponentFieldCardAttributeMarkSceneRepository
} from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepository";
import {
    OpponentFieldCardAttributeMarkSceneRepositoryImpl
} from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepositoryImpl";

export class NeonBorderHandler {
    private static instance: NeonBorderHandler;

    private readonly CARD_WIDTH: number = 0.06493506493;
    private readonly CARD_HEIGHT: number = this.CARD_WIDTH * 1.615;

    private readonly OPPONENT_START_X: number = 0.4605885;
    private readonly OPPONENT_START_Y: number = 0.1920103;

    private readonly OPPONENT_END_X: number = 0.5410156;
    private readonly OPPONENT_END_Y: number = 0.0476804;

    private yourFieldRepository: YourFieldRepository;

    private opponentFieldRepository: OpponentFieldRepository;
    private opponentFieldCardSceneRepository: OpponentFieldCardSceneRepository;
    private opponentFieldCardAttributeMarkRepository: OpponentFieldCardAttributeMarkRepository;
    private opponentFieldCardAttributeMarkSceneRepository: OpponentFieldCardAttributeMarkSceneRepository;

    private neonShape: NeonShape;
    private neonBorderRepository: NeonBorderRepository;
    private neonBorderLineSceneRepository: NeonBorderLineSceneRepository;
    private neonBorderLinePositionRepository: NeonBorderLinePositionRepository;

    private activePanelAreaRepository: ActivePanelAreaRepository;

    private dragMoveRepository: DragMoveRepository;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.yourFieldRepository = YourFieldRepositoryImpl.getInstance();

        this.opponentFieldRepository = OpponentFieldRepositoryImpl.getInstance();
        this.opponentFieldCardSceneRepository = OpponentFieldCardSceneRepositoryImpl.getInstance();
        this.opponentFieldCardAttributeMarkRepository = OpponentFieldCardAttributeMarkRepositoryImpl.getInstance();
        this.opponentFieldCardAttributeMarkSceneRepository = OpponentFieldCardAttributeMarkSceneRepositoryImpl.getInstance();

        this.neonShape = NeonShape.getInstance();
        this.neonBorderRepository = NeonBorderRepositoryImpl.getInstance();
        this.neonBorderLineSceneRepository = NeonBorderLineSceneRepositoryImpl.getInstance();
        this.neonBorderLinePositionRepository = NeonBorderLinePositionRepositoryImpl.getInstance();

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
        this.dragMoveRepository.deleteSelectedObject();
    }

    /** ================== 네온보더 처리 ================== */
    public async createYourNeonBorder(clickedCard: ClickableCard): Promise<void> {
        const cardMesh = clickedCard.getMesh();
        cardMesh.renderOrder = 1;

        const cardPosition = cardMesh.position;
        this.dragMoveRepository.getSelectedGroup().forEach((obj) => {
            const attributeMesh = obj.getMesh();
            attributeMesh.renderOrder = 2;
        });

        const halfWidth = this.CARD_WIDTH * window.innerWidth / 2;
        const halfHeight = this.CARD_HEIGHT * window.innerWidth / 2;

        const cardSceneId = clickedCard.getId();

        const existingNeonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(
            cardSceneId, NeonBorderSceneType.HAND, NeonBorderType.ALLY
        );

        if (existingNeonBorder) {
            this.enableExistingNeonBorder(existingNeonBorder);
            return;
        }

        const startX = cardPosition.x - halfWidth;
        const startY = cardPosition.y - halfHeight;
        const width = this.CARD_WIDTH * window.innerWidth;
        const height = this.CARD_HEIGHT * window.innerWidth;

        await this.createNeonBorderNormalization(
            startX, startY, width, height,
            NeonBorderSceneType.HAND, cardSceneId, NeonBorderType.ALLY,
            new THREE.Color(0x2C75FF), new THREE.Color(0x2EFEF7)
        );
    }

    private async createNeonBorderNormalization(
        startX: number,
        startY: number,
        width: number,
        height: number,
        sceneType: NeonBorderSceneType,
        targetSceneId: number | null,
        borderType: NeonBorderType,
        color1: THREE.ColorRepresentation = 0x2C75FF,
        color2: THREE.ColorRepresentation = 0x2EFEF7
    ): Promise<NeonBorder> {
        const { lines } = await this.neonShape.addNeonShaderRectangle(
            startX, startY, width, height,
            new THREE.Color(color1), new THREE.Color(color2)
        );

        const lineSceneIds = lines.map((line) => {
            const scene = new NeonBorderLineScene(line, line.material as THREE.ShaderMaterial);
            this.neonBorderLineSceneRepository.save(scene);
            return scene.getId();
        });

        const positionIds = lines.map((line) => {
            const position = new NeonBorderLinePosition(new Vector2d(line.position.x, line.position.y));
            this.neonBorderLinePositionRepository.save(position);
            return position.getId();
        });

        const neonBorder = new NeonBorder(
            lineSceneIds,
            positionIds,
            sceneType,
            targetSceneId ?? -1,
            borderType
        );

        this.neonBorderRepository.save(neonBorder);
        return neonBorder;
    }

    /** ================== 상대 마스터 네온보더 생성 ================== */
    public async createOpponentMasterNeonBorder(): Promise<void> {
        const existingOpponentMaster = this.neonBorderRepository.findOpponentMaster(NeonBorderType.OPPONENT_MASTER);
        if (existingOpponentMaster) {
            this.enableExistingNeonBorder(existingOpponentMaster);
            return;
        }

        const startX = (this.OPPONENT_START_X - 0.5) * window.innerWidth;
        const startY = (0.5 - this.OPPONENT_START_Y) * window.innerHeight;
        const endX = (this.OPPONENT_END_X - 0.5) * window.innerWidth;
        const endY = (0.5 - this.OPPONENT_END_Y) * window.innerHeight;

        const width = endX - startX;
        const height = endY - startY;

        await this.createNeonBorderNormalization(
            startX, startY, width, height,
            NeonBorderSceneType.OPPONENT_MASTER, null, NeonBorderType.OPPONENT_MASTER,
            0xFF1A1A, 0xFFEF7F
        );
    }

    public async createOpponentNeonBorderList() {
        const opponentFieldList = this.opponentFieldRepository.findAll();

        for (const opponentField of opponentFieldList) {
            const opponentCardSceneId = opponentField.getCardSceneId();

            const existingNeonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(
                opponentCardSceneId, NeonBorderSceneType.FIELD, NeonBorderType.ENEMY
            );

            if (existingNeonBorder) {
                this.enableExistingNeonBorder(existingNeonBorder);
                continue;
            }

            await this.createNewOpponentNeonBorder(opponentCardSceneId);
        }
    }

    private async createNewOpponentNeonBorder(opponentCardSceneId: number): Promise<void> {
        const opponentCardSceneMesh = await this.opponentFieldCardSceneRepository.findById(opponentCardSceneId);
        if (!opponentCardSceneMesh) return;

        const opponentCardMesh = opponentCardSceneMesh.getMesh();
        opponentCardMesh.renderOrder = 1;

        const attributeMarkIds = this.opponentFieldRepository.findAttributeMarkIdListByCardSceneId(opponentCardSceneId) || [];
        await this.updateOpponentMarkRenderOrder(attributeMarkIds);

        const halfWidth = this.CARD_WIDTH * window.innerWidth / 2;
        const halfHeight = this.CARD_HEIGHT * window.innerWidth / 2;

        const startX = opponentCardMesh.position.x - halfWidth;
        const startY = opponentCardMesh.position.y - halfHeight;
        const width = this.CARD_WIDTH * window.innerWidth;
        const height = this.CARD_HEIGHT * window.innerWidth;

        const { lines } = await this.neonShape.addNeonShaderRectangle(
            startX, startY, width, height,
            new THREE.Color(0xFF1A1A),
            new THREE.Color(0xFFEF7F)
        );

        const lineSceneIds = lines.map((line) => {
            const scene = new NeonBorderLineScene(line, line.material as THREE.ShaderMaterial);
            this.neonBorderLineSceneRepository.save(scene);
            return scene.getId();
        });

        const positionIds = lines.map((line) => {
            const position = new NeonBorderLinePosition(new Vector2d(line.position.x, line.position.y));
            this.neonBorderLinePositionRepository.save(position);
            return position.getId();
        });

        const neonBorder = new NeonBorder(
            lineSceneIds,
            positionIds,
            NeonBorderSceneType.FIELD,
            opponentCardSceneId,
            NeonBorderType.ENEMY
        );

        this.neonBorderRepository.save(neonBorder);
    }

    private async updateOpponentMarkRenderOrder(attributeMarkIds: number[]): Promise<void> {
        for (const attributeMarkId of attributeMarkIds) {
            const cardAttributeMark = await this.opponentFieldCardAttributeMarkRepository.findById(attributeMarkId);
            if (!cardAttributeMark) continue;

            const markScene = await this.opponentFieldCardAttributeMarkSceneRepository.findById(cardAttributeMark.attributeMarkSceneId);
            if (!markScene) continue;

            markScene.getMesh().renderOrder = 2;
        }
    }

    public activateExistNeonBorder(clickedCard: ClickableCard): void {
        const yourFieldSceneId = clickedCard.getId();
        const existingNeonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(
            yourFieldSceneId, NeonBorderSceneType.FIELD, NeonBorderType.ALLY
        );
        if (!existingNeonBorder) return;
        this.enableExistingNeonBorder(existingNeonBorder);
    }

    public enableExistingNeonBorder(neonBorder: NeonBorder): void {
        this.setNeonBorderVisibility(neonBorder, true);
    }

    public deactivateExistNeonBorder(clickedCard: ClickableCard): void {
        const existingNeonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(
            clickedCard.getId(), NeonBorderSceneType.FIELD, NeonBorderType.ALLY
        );
        if (!existingNeonBorder) return;
        this.setNeonBorderVisibility(existingNeonBorder, false);
    }

    public deactivateEveryExistOpponentNeonBorder(): void {
        const allNeonBorders = this.neonBorderRepository.findAll();
        const opponentBorders = allNeonBorders.filter(
            border => border.getNeonBorderSceneType() === NeonBorderSceneType.FIELD &&
                border.getType() === NeonBorderType.ENEMY
        );
        opponentBorders.forEach(border => this.setNeonBorderVisibility(border, false));
    }

    public deactivateOpponentMasterNeonBorder(): void {
        const opponentMasterNeonBorder = this.neonBorderRepository.findOpponentMaster(NeonBorderType.OPPONENT_MASTER);
        if (!opponentMasterNeonBorder) return;
        this.setNeonBorderVisibility(opponentMasterNeonBorder, false);
    }

    /** ================== Private 헬퍼 ================== */
    private setNeonBorderVisibility(neonBorder: NeonBorder, visible: boolean): void {
        neonBorder.getNeonBorderLineSceneIdList().forEach((lineSceneId) => {
            const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
            const lineMesh = lineScene?.getLine();
            if (lineMesh) lineMesh.visible = visible;
        });
    }
}
