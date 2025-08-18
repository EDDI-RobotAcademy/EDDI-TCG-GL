import {LeftClickDetectService} from "./LeftClickDetectService";
import {BattleFieldCardSceneRepositoryImpl} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepositoryImpl";
import {BattleFieldCardSceneRepository} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepository";
import {LeftClickHandDetectRepositoryImpl} from "../repository/LeftClickHandDetectRepositoryImpl";
import {LeftClickHandDetectRepository} from "../repository/LeftClickHandDetectRepository";
import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import * as THREE from "three";
// import TWEEN from '../../../src/animation/TweenInstance';

import {DragMoveRepository} from "../../drag_move/repository/DragMoveRepository";
import {DragMoveRepositoryImpl} from "../../drag_move/repository/DragMoveRepositoryImpl";
import {BattleFieldHandRepository} from "../../battle_field_hand/repository/BattleFieldHandRepository";
import {BattleFieldHandRepositoryImpl} from "../../battle_field_hand/repository/BattleFieldHandRepositoryImpl";
import {BattleFieldCardAttributeMarkSceneRepository} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepository";
import {BattleFieldCardAttributeMarkSceneRepositoryImpl} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepositoryImpl";
import {BattleFieldCardAttributeMarkScene} from "../../battle_field_card_attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";
import {BattleFieldCardAttributeMarkRepositoryImpl} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepositoryImpl";
import {BattleFieldCardAttributeMarkRepository} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepository";
import {BattleFieldCardAttributeMark} from "../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMark";
import {NeonBorderRepository} from "../../neon_border/repository/NeonBorderRepository";
import {NeonBorderRepositoryImpl} from "../../neon_border/repository/NeonBorderRepositoryImpl";
import {NeonBorder} from "../../neon_border/entity/NeonBorder";
import {NeonShape} from "../../neon/NeonShape";
import {NeonBorderLineSceneRepository} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepository";
import {NeonBorderLineSceneRepositoryImpl} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepositoryImpl";
import {NeonBorderLineScene} from "../../neon_border_line_scene/entity/NeonBorderLineScene";
import {NeonBorderLinePosition} from "../../neon_border_line_position/entity/NeonBorderLinePosition";
import {Vector2d} from "../../common/math/Vector2d";
import {NeonBorderLinePositionRepository} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepository";
import {NeonBorderLinePositionRepositoryImpl} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepositoryImpl";
import {NeonBorderSceneType} from "../../neon_border/entity/NeonBorderSceneType";
import chalk from "chalk";
import {YourFieldCardSceneRepository} from "../../your_field_card_scene/repository/YourFieldCardSceneRepository";
import {YourFieldCardSceneRepositoryImpl} from "../../your_field_card_scene/repository/YourFieldCardSceneRepositoryImpl";
import {LeftClickYourFieldDetectRepository} from "../repository/LeftClickYourFieldDetectRepository";
import {LeftClickYourFieldDetectRepositoryImpl} from "../repository/LeftClickYourFieldDetectRepositoryImpl";
import {LeftClickedArea} from "../entity/LeftClickedArea";
import {YourHandAttributeMarkManager} from "../handler/your_hand/YourHandAttributeMarkManager";
import {MouseCursorDetectArea} from "../../mouse_cursor_detect/entity/MouseCursorDetectArea";
import {MouseCursorDetectRepository} from "../../mouse_cursor_detect/repository/MouseCursorDetectRepository";
import {MouseCursorDetectRepositoryImpl} from "../../mouse_cursor_detect/repository/MouseCursorDetectRepositoryImpl";
import {ClickableCard} from "./ClickableCard";
import {YourFieldAttributeMarkManager} from "../handler/your_field/YourFieldAttributeMarkManager";
import {YourFieldRepository} from "../../your_field/repository/YourFieldRepository";
import {YourFieldRepositoryImpl} from "../../your_field/repository/YourFieldRepositoryImpl";
import {YourFieldCardScene} from "../../your_field_card_scene/entity/YourFieldCardScene";
import {ActivePanelAreaRepository} from "../../active_panel_area/repository/ActivePanelAreaRepository";
import {ActivePanelAreaRepositoryImpl} from "../../active_panel_area/repository/ActivePanelAreaRepositoryImpl";
import {getCardById} from "../../card/utility";
import {getSkillType, SkillType} from "../../card/SkillType";
import {OpponentFieldCardSceneRepository} from "../../opponent_field_card_scene/repository/OpponentFieldCradSceneRepository";
import {OpponentFieldCardSceneRepositoryImpl} from "../../opponent_field_card_scene/repository/OpponentFieldCradSceneRepositoryImpl";
import {OpponentFieldRepositoryImpl} from "../../opponent_field/repository/OpponentFieldRepositoryImpl";
import {OpponentFieldRepository} from "../../opponent_field/repository/OpponentFieldRepository";
import {OpponentFieldCardAttributeMarkRepository} from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepository";

import {OpponentFieldCardAttributeMarkSceneRepositoryImpl} from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepositoryImpl";
import {OpponentFieldCardAttributeMarkSceneRepository} from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepository";
import {OpponentFieldCardAttributeMarkRepositoryImpl} from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepositoryImpl";
import {NeonBorderType} from "../../neon_border/entity/NeonBorderType";
import {MarkSceneType} from "../../battle_field_card_attribute_mark_scene/entity/MarkSceneType";
import {OpponentFieldCardScene} from "../../opponent_field_card_scene/entity/OpponentFieldCardScene";
import {TCGJustTestBattleFieldView} from "../../../test/draw_opponent_neon_border/draw_opponent_neon_border";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

export class LeftClickDetectServiceImpl implements LeftClickDetectService {
    private static instance: LeftClickDetectServiceImpl | null = null;

    private readonly HALF: number = 0.5;
    private readonly GAP_OF_EACH_CARD: number = 0.094696
    private readonly HAND_X_CRITERIA: number = 0.311904
    // 0.862217 + 0.06493506493 * 1.615 = 0.1048701
    // 0.862217 + 0.1048701
    private readonly HAND_Y_CRITERIA: number = 0.972107
    private readonly HAND_INITIAL_X: number = this.HAND_X_CRITERIA - this.HALF;
    private readonly HAND_INITIAL_Y: number = this.HALF - this.HAND_Y_CRITERIA;

    private readonly CARD_WIDTH: number = 0.06493506493
    private readonly CARD_HEIGHT: number = this.CARD_WIDTH * 1.615

    private mouseCursorDetectRepository: MouseCursorDetectRepository

    private neonBorderRepository: NeonBorderRepository;
    private neonShape: NeonShape

    private neonBorderLineSceneRepository: NeonBorderLineSceneRepository;
    private neonBorderLinePositionRepository: NeonBorderLinePositionRepository;

    private battleFieldCardAttributeMarkSceneRepository: BattleFieldCardAttributeMarkSceneRepository
    private battleFieldCardAttributeMarkRepository: BattleFieldCardAttributeMarkRepository
    private battleFieldCardSceneRepository: BattleFieldCardSceneRepository;
    private battleFieldHandRepository: BattleFieldHandRepository;

    private yourFieldCardSceneRepository: YourFieldCardSceneRepository
    private yourFieldRepository: YourFieldRepository

    private opponentFieldCardSceneRepository: OpponentFieldCardSceneRepository
    private opponentFieldRepository: OpponentFieldRepository
    private opponentFieldCardAttributeMarkRepository: OpponentFieldCardAttributeMarkRepository
    private opponentFieldCardAttributeMarkSceneRepository: OpponentFieldCardAttributeMarkSceneRepository

    private leftClickHandDetectRepository: LeftClickHandDetectRepository;
    private leftClickYourFieldDetectRepository: LeftClickYourFieldDetectRepository;

    private cameraRepository: CameraRepository
    private dragMoveRepository: DragMoveRepository;

    private yourHandAttributeMarkManager: YourHandAttributeMarkManager
    private yourFieldAttributeMarkManager: YourFieldAttributeMarkManager

    private activePanelAreaRepository: ActivePanelAreaRepository

    private leftMouseDown: boolean = false;

    private areaHandlers: Record<MouseCursorDetectArea, (x: number, y: number) => Promise<void>> = {
        [MouseCursorDetectArea.YOUR_HAND]: this.handleYourHandClick.bind(this),
        [MouseCursorDetectArea.YOUR_FIELD]: this.handleYourFieldClick.bind(this),
        [MouseCursorDetectArea.OPPONENT_FIELD]: this.handleOpponentFieldClick.bind(this),
        [MouseCursorDetectArea.OPPONENT_HAND]: this.handleOpponentHandClick.bind(this),
        [MouseCursorDetectArea.FIELD_ENERGY]: this.handleFieldEnergyClick.bind(this),
        [MouseCursorDetectArea.YOUR_TOMB]: this.handleTombClick.bind(this),
        [MouseCursorDetectArea.YOUR_LOSTZONE]: this.handleLostZoneClick.bind(this),
        [MouseCursorDetectArea.OPPONENT_TOMB]: this.handleOpponentTombClick.bind(this),
        [MouseCursorDetectArea.OPPONENT_LOSTZONE]: this.handleOpponentLostZoneClick.bind(this),
        [MouseCursorDetectArea.OPPONENT_CONSTRUCTION]: this.handleOpponentConstructionClick.bind(this),
        [MouseCursorDetectArea.YOUR_CONSTRUCTION]: this.handleYourConstructionClick.bind(this),
        [MouseCursorDetectArea.ENVIRONMENT]: this.handleEnvironmentClick.bind(this),
        [MouseCursorDetectArea.SETTINGS]: this.handleSettingsClick.bind(this),
        [MouseCursorDetectArea.TURN_END]: this.handleTurnEndClick.bind(this),
    };

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.mouseCursorDetectRepository = MouseCursorDetectRepositoryImpl.getInstance()

        this.neonBorderRepository = NeonBorderRepositoryImpl.getInstance();
        this.neonShape = NeonShape.getInstance()

        this.neonBorderLineSceneRepository = NeonBorderLineSceneRepositoryImpl.getInstance()
        this.neonBorderLinePositionRepository = NeonBorderLinePositionRepositoryImpl.getInstance()

        this.battleFieldCardAttributeMarkSceneRepository = BattleFieldCardAttributeMarkSceneRepositoryImpl.getInstance()
        this.battleFieldCardAttributeMarkRepository = BattleFieldCardAttributeMarkRepositoryImpl.getInstance()
        this.battleFieldCardSceneRepository = BattleFieldCardSceneRepositoryImpl.getInstance();
        this.battleFieldHandRepository = BattleFieldHandRepositoryImpl.getInstance()

        this.yourFieldCardSceneRepository = YourFieldCardSceneRepositoryImpl.getInstance()
        this.yourFieldRepository = YourFieldRepositoryImpl.getInstance()

        this.opponentFieldRepository = OpponentFieldRepositoryImpl.getInstance()
        this.opponentFieldCardSceneRepository = OpponentFieldCardSceneRepositoryImpl.getInstance()
        this.opponentFieldCardAttributeMarkRepository = OpponentFieldCardAttributeMarkRepositoryImpl.getInstance()
        this.opponentFieldCardAttributeMarkSceneRepository = OpponentFieldCardAttributeMarkSceneRepositoryImpl.getInstance()

        this.leftClickHandDetectRepository = LeftClickHandDetectRepositoryImpl.getInstance()
        this.leftClickYourFieldDetectRepository = LeftClickYourFieldDetectRepositoryImpl.getInstance()

        this.cameraRepository = CameraRepositoryImpl.getInstance()
        this.dragMoveRepository = DragMoveRepositoryImpl.getInstance();

        this.yourHandAttributeMarkManager = YourHandAttributeMarkManager.getInstance();
        this.yourFieldAttributeMarkManager = YourFieldAttributeMarkManager.getInstance()

        this.activePanelAreaRepository = ActivePanelAreaRepositoryImpl.getInstance(camera, scene)
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): LeftClickDetectServiceImpl {
        if (!LeftClickDetectServiceImpl.instance) {
            LeftClickDetectServiceImpl.instance = new LeftClickDetectServiceImpl(camera, scene);
        }
        return LeftClickDetectServiceImpl.instance;
    }

    setLeftMouseDown(state: boolean): void {
        this.leftMouseDown = state;
    }

    isLeftMouseDown(): boolean {
        return this.leftMouseDown;
    }

    private determineClickedArea(x: number, y: number): { object: any; area: LeftClickedArea } | null {
        const handSceneList = this.battleFieldCardSceneRepository.findAll();
        const clickedHandCard = this.leftClickHandDetectRepository.isYourHandAreaClicked({ x, y }, handSceneList, this.camera);
        if (clickedHandCard) {
            return { object: clickedHandCard, area: LeftClickedArea.YOUR_HAND };
        }

        const yourFieldSceneList = this.yourFieldCardSceneRepository.findAll();
        const clickedYourFieldCard = this.leftClickYourFieldDetectRepository.isYourFieldAreaClicked({ x, y }, yourFieldSceneList, this.camera);
        if (clickedYourFieldCard) {
            return { object: clickedYourFieldCard, area: LeftClickedArea.YOUR_FIELD };
        }

        return null;
    }

    private getIntersectedButton(
        x: number,
        y: number,
        buttons: THREE.Mesh[]
    ): THREE.Mesh | null {
        const mouseVec = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVec, this.camera);

        const intersects = raycaster.intersectObjects(buttons);
        if (intersects.length > 0) {
            return intersects[0].object as THREE.Mesh;
        }

        return null;
    }

    private async createOpponentNeonBorderList() {
        const opponentFieldList = this.opponentFieldRepository.findAll();

        for (const opponentField of opponentFieldList) {
            const opponentCardSceneId = opponentField.getCardSceneId();

            // 기존 테두리 있는지 확인
            const existingNeonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(
                opponentCardSceneId,
                NeonBorderSceneType.FIELD,
                NeonBorderType.ENEMY
            );

            if (existingNeonBorder && existingNeonBorder.getType() === NeonBorderType.ENEMY) {
                // 기존 테두리 활성화
                existingNeonBorder.getNeonBorderLineSceneIdList().forEach((lineSceneId) => {
                    const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
                    if (lineScene) {
                        const lineMesh = lineScene.getLine();
                        if (lineMesh) {
                            lineMesh.visible = true;
                        }
                    }
                });
                continue; // 다음 카드로
            }

            const opponentCardSceneMesh = await this.opponentFieldCardSceneRepository.findById(opponentCardSceneId);
            if (!opponentCardSceneMesh) continue;

            const opponentCardMesh = opponentCardSceneMesh.getMesh();
            opponentCardMesh.renderOrder = 1;

            const attributeMarkIds = this.opponentFieldRepository.findAttributeMarkIdListByCardSceneId(opponentCardSceneId) || [];

            for (const attributeMarkId of attributeMarkIds) {
                const cardAttributeMark = await this.opponentFieldCardAttributeMarkRepository.findById(attributeMarkId);
                if (!cardAttributeMark) continue;

                const markScene = await this.opponentFieldCardAttributeMarkSceneRepository.findById(cardAttributeMark.attributeMarkSceneId);
                if (!markScene) continue;

                // 4. Attribute Mesh renderOrder 설정
                markScene.getMesh().renderOrder = 2;
            }

            const halfWidth = this.CARD_WIDTH * window.innerWidth / 2;
            const halfHeight = this.CARD_HEIGHT * window.innerWidth / 2;

            // 새 테두리 생성
            const startX = opponentCardMesh.position.x - halfWidth;
            const startY = opponentCardMesh.position.y - halfHeight;
            const width = this.CARD_WIDTH * window.innerWidth;
            const height = this.CARD_HEIGHT * window.innerWidth;

            // 빨간색 네온 테두리
            const { lines, neonMaterials } = await this.neonShape.addNeonShaderRectangle(
                startX,
                startY,
                width,
                height,
                new THREE.Color(0xFF1A1A), // baseColor 빨강
                new THREE.Color(0xFFEF7F)  // glowColor 밝은 빨강
            );

            // 라인 씬과 포지션 저장
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

            const neonBorder = new NeonBorder(lineSceneIds, positionIds, NeonBorderSceneType.FIELD, opponentCardSceneId, NeonBorderType.ENEMY);
            this.neonBorderRepository.save(neonBorder);
        }
    }

    private handleActivePanelClick(x: number, y: number): any | null {
        const buttons = this.activePanelAreaRepository.getActiveButtons() ?? [];
        if (buttons.length === 0) return null;

        const clickedButton = this.getIntersectedButton(x, y, buttons);
        if (!clickedButton) return null;

        const type = clickedButton.userData.type;
        console.log(`Active Panel 버튼 클릭됨: ${type}`);

        const selectedYourFieldCard = this.dragMoveRepository.getSelectedObject() as unknown as YourFieldCardScene;
        const yourFieldCardId = selectedYourFieldCard.getId()
        console.log(`yourFieldCardId: ${yourFieldCardId}`)

        const yourFieldCard = this.yourFieldRepository.findById(yourFieldCardId);
        if (yourFieldCard == null) return null;

        const cardId = yourFieldCard.getCardId()
        if (cardId == null) return null;
        console.log(`cardId: ${cardId}`)

        const card = getCardById(cardId);
        if (!card) {
            console.warn(`카드 데이터를 찾을 수 없음: ${cardId}`);
            return null;
        }

        // console.log(`카드: ${JSON.stringify(card, null, 2)}`)
        console.log(`카드명: ${card.카드명}, 스킬 개수: ${(card as any)["스킬 개수"]}`);

        const skill1Type = getSkillType((card as any)["스킬 1"]);
        const skill2Type = getSkillType((card as any)["스킬 2"]);
        const passive1Type = getSkillType((card as any)["패시브 1"]);
        const passive2Type = getSkillType((card as any)["패시브 2"]);

        console.log(`스킬1 타입: ${SkillType[skill1Type]}`);
        console.log(`스킬2 타입: ${SkillType[skill2Type]}`);
        console.log(`패시브1 타입: ${SkillType[passive1Type]}`);
        console.log(`패시브2 타입: ${SkillType[passive2Type]}`);

        // 버튼별 동작
        switch (type) {
            case "general":
                this.createOpponentNeonBorderList()
                break;
            case "firstSkill":
                console.log("firstSkill type")
                if (skill1Type === SkillType.Single) {
                    this.createOpponentNeonBorderList()
                }
                break;
            case "secondSkill":
                console.log("secondSkill type")
                break;
            case "details":
                // ...
                break;
        }

        return { type: "activePanelButton", buttonType: type };
    }

    async handleLeftClick(clickPoint: { x: number; y: number }): Promise<any | null> {
        const { x, y } = clickPoint;

        if (this.activePanelAreaRepository.exists()) {
            const activeResult = this.handleActivePanelClick(x, y);
            if (activeResult) return activeResult;
        }

        const detectedArea = this.mouseCursorDetectRepository.detectArea(x, y);

        if (detectedArea === null) {
            console.warn("클릭된 영역을 감지할 수 없습니다.");
            return null;
        }

        try {
            // area에 해당하는 핸들러 실행
            const handler = this.areaHandlers[detectedArea];
            if (handler) {
                return await handler(x, y);
            } else {
                console.warn(`No handler found for area`);
            }
        } catch (error) {
            console.error(`Error handling click event for area: `, error);
        }

        return null;
    }

    // 속성 마크 ID 목록 가져오기
    private getAttributeMarkIdList(cardSceneId: number): number[] {
        const result = this.battleFieldHandRepository.findAttributeMarkIdListByCardSceneId(cardSceneId);
        return result || []; // null인 경우 빈 배열 반환
    }

    // 속성 마크 객체 목록 가져오기
    private async getAttributeMarkList(attributeMarkIdList: number[]): Promise<BattleFieldCardAttributeMark[]> {
        const attributeMarkPromises = attributeMarkIdList.map(id =>
            this.battleFieldCardAttributeMarkRepository.findById(id)
        );

        const attributeMarkResults = await Promise.all(attributeMarkPromises);

        // null 값을 제외한 속성 마크 반환
        return attributeMarkResults.filter(
            (attributeMark): attributeMark is BattleFieldCardAttributeMark => attributeMark !== null
        );
    }

    // 유효한 속성 마크 장면 가져오기
    private async getValidAttributeScenes(attributeMarkList: BattleFieldCardAttributeMark[]): Promise<BattleFieldCardAttributeMarkScene[]> {
        const scenePromises = attributeMarkList.map(attributeMark =>
            this.battleFieldCardAttributeMarkSceneRepository.findById(attributeMark.attributeMarkSceneId)
        );

        const sceneResults = await Promise.all(scenePromises);

        // null 값을 제외한 장면 반환
        return sceneResults.filter(
            (scene): scene is BattleFieldCardAttributeMarkScene => scene !== null
        );
    }

    private async createNeonBorder(clickedCard: ClickableCard): Promise<void> {
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

        const existingNeonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(cardSceneId, NeonBorderSceneType.HAND, NeonBorderType.ALLY);
        console.log(chalk.red.bold(`existingNeonBorder: ${existingNeonBorder}`));
        if (existingNeonBorder) {
            console.log(`NeonBorder already exists for cardSceneId: ${cardSceneId}, enabling visibility.`);
            existingNeonBorder.getNeonBorderLineSceneIdList().forEach((lineSceneId) => {
                const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
                if (lineScene) {
                    const lineMesh = lineScene.getLine();
                    if (lineMesh) {
                        lineMesh.visible = true; // Enable visibility
                        console.log(`Neon Border Line (ID: ${lineSceneId}) visibility set to true.`);
                    }
                }
            });
            return;
        }

        const startX = cardPosition.x - halfWidth;
        const startY = cardPosition.y - halfHeight;
        const width = this.CARD_WIDTH * window.innerWidth;
        const height = this.CARD_HEIGHT * window.innerWidth;

        const { lines, neonMaterials } = await this.neonShape.addNeonShaderRectangle(startX, startY, width, height,
            new THREE.Color(0x2C75FF), new THREE.Color(0x2EFEF7));

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

        const neonBorder = new NeonBorder(lineSceneIds, positionIds, NeonBorderSceneType.HAND, cardSceneId, NeonBorderType.ALLY);
        console.log(chalk.red.bold(`neonBorderSceneType: ${neonBorder.getNeonBorderSceneType()}`));
        console.log(chalk.red.bold(`Expected sceneType: ${NeonBorderSceneType.HAND}`));
        console.log(chalk.red.bold(`Created new NeonBorder for cardSceneId: ${cardSceneId}`));
        console.log(chalk.red.bold(`chalk.red.bold(Saving NeonBorder: ${JSON.stringify(neonBorder)}`));
        this.neonBorderRepository.save(neonBorder);
    }

    private activateExistNeonBorder(clickedCard: ClickableCard): void {
        const yourFieldSceneId = clickedCard.getId();
        console.log(`activateExistNeonBorder() yourFieldSceneId: ${yourFieldSceneId}`)
        const yourField = this.yourFieldRepository.findByCardSceneId(yourFieldSceneId)
        console.log("activateExistNeonBorder() yourField (JSON):", JSON.stringify(yourField, null, 2));
        const existingNeonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(yourFieldSceneId, NeonBorderSceneType.FIELD, NeonBorderType.ALLY);

        if (!existingNeonBorder) {
            console.warn(`No existing NeonBorder found for cardSceneId: ${yourFieldSceneId}`);
            return;
        }

        console.log(`Activating existing NeonBorder for cardSceneId: ${yourFieldSceneId}`);

        existingNeonBorder.getNeonBorderLineSceneIdList().forEach((lineSceneId) => {
            const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
            if (lineScene) {
                const lineMesh = lineScene.getLine();
                if (lineMesh) {
                    lineMesh.visible = true;
                }
            }
        });
    }

    private deactivateEveryExistOpponentNeonBorder(): void {
        // 모든 NeonBorder 중에서 FIELD + ENEMY 타입만 찾음
        const allNeonBorders = this.neonBorderRepository.findAll();
        const opponentBorders = allNeonBorders.filter(
            border =>
                border.getNeonBorderSceneType() === NeonBorderSceneType.FIELD &&
                border.getType() === NeonBorderType.ENEMY
        );

        if (opponentBorders.length === 0) {
            console.warn("No existing opponent NeonBorders to deactivate.");
            return;
        }

        console.log(`Deactivating ${opponentBorders.length} opponent NeonBorders.`);

        opponentBorders.forEach(border => {
            border.getNeonBorderLineSceneIdList().forEach(lineSceneId => {
                const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
                const lineMesh = lineScene?.getLine();
                if (lineMesh) {
                    lineMesh.visible = false;
                }
            });
        });
    }

    private deactivateEveryNeonBorder(): void {
        // 모든 NeonBorder 중에서 FIELD + ENEMY 타입만 찾음
        const allNeonBorders = this.neonBorderRepository.findAll();

        if (allNeonBorders.length === 0) {
            console.warn("No existing opponent NeonBorders to deactivate.");
            return;
        }

        console.log(`Deactivating ${allNeonBorders.length} NeonBorders.`);

        allNeonBorders.forEach(border => {
            border.getNeonBorderLineSceneIdList().forEach(lineSceneId => {
                const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
                const lineMesh = lineScene?.getLine();
                if (lineMesh) {
                    lineMesh.visible = false;
                }
            });
        });
    }

    private deactivateExistNeonBorder(clickedCard: ClickableCard): void {
        const prevYourFieldSceneId = clickedCard.getId();
        console.log(`activateExistNeonBorder() yourFieldSceneId: ${prevYourFieldSceneId}`)
        const yourField = this.yourFieldRepository.findByCardSceneId(prevYourFieldSceneId)
        console.log("activateExistNeonBorder() yourField (JSON):", JSON.stringify(yourField, null, 2));
        const existingNeonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(prevYourFieldSceneId, NeonBorderSceneType.FIELD, NeonBorderType.ALLY);

        if (!existingNeonBorder) {
            console.warn(`No existing NeonBorder found for cardSceneId: ${prevYourFieldSceneId}`);
            return;
        }

        console.log(`Deactivating existing NeonBorder for cardSceneId: ${prevYourFieldSceneId}`);

        existingNeonBorder.getNeonBorderLineSceneIdList().forEach((lineSceneId) => {
            const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
            if (lineScene) {
                const lineMesh = lineScene.getLine();
                if (lineMesh) {
                    lineMesh.visible = false;
                }
            }
        });
    }

    private async handleYourHandClick(x: number, y: number): Promise<void> {
        const handSceneList = this.battleFieldCardSceneRepository.findAll();
        const clickedHandCard = this.leftClickHandDetectRepository.isYourHandAreaClicked({ x, y }, handSceneList, this.camera);
        if (clickedHandCard === null) {
            return;
        }

        const prevYourFieldCard = this.dragMoveRepository.getSelectedObject() as unknown as YourFieldCardScene;
        console.log(`prevYourFieldCard: ${prevYourFieldCard}`)

        if (prevYourFieldCard !== null) {
            this.deactivateEveryExistOpponentNeonBorder()
            this.deactivateExistNeonBorder(prevYourFieldCard)
            this.activePanelAreaRepository.delete();
        }

        this.dragMoveRepository.setSelectedObject(clickedHandCard);
        this.dragMoveRepository.setSelectedArea(LeftClickedArea.YOUR_HAND)

        const attributeMarkIdList = this.yourHandAttributeMarkManager.getAttributeMarkIdList(clickedHandCard.getId());
        if (attributeMarkIdList.length > 0) {
            const attributeMarkList = await this.yourHandAttributeMarkManager.getAttributeMarkList(attributeMarkIdList);
            const validAttributeSceneList = await this.yourHandAttributeMarkManager.getValidAttributeScenes(attributeMarkList);
            this.dragMoveRepository.setSelectedGroup(validAttributeSceneList);
        }

        this.createNeonBorder(clickedHandCard);
    }

    private async handleYourFieldClick(x: number, y: number): Promise<void> {
        const yourFieldSceneList = this.yourFieldCardSceneRepository.findAll();
        const clickedYourFieldCard = this.leftClickHandDetectRepository.isYourHandAreaClicked({ x, y }, yourFieldSceneList, this.camera);
        if (clickedYourFieldCard === null) {
            return;
        }

        // TODO: 이전 선택 카드가 현재 선택 카드와 같은지 판별해야함
        const prevYourFieldCard = this.dragMoveRepository.getSelectedObject() as unknown as YourFieldCardScene;
        console.log(`prevYourFieldCard: ${prevYourFieldCard}`)

        if (prevYourFieldCard && prevYourFieldCard.getId() === clickedYourFieldCard.getId()) {
            console.log('같은 카드를 선택하였습니다!')
            return;
        }

        if (prevYourFieldCard !== null) {
            this.deactivateEveryExistOpponentNeonBorder()
            this.deactivateExistNeonBorder(prevYourFieldCard)
            this.activePanelAreaRepository.delete();
        }

        this.dragMoveRepository.setSelectedObject(clickedYourFieldCard);
        this.dragMoveRepository.setSelectedArea(LeftClickedArea.YOUR_FIELD)

        const attributeMarkIdList = this.yourFieldAttributeMarkManager.getAttributeMarkIdList(clickedYourFieldCard.getId())
        if (attributeMarkIdList.length > 0) {
            const attributeMarkList = await this.yourFieldAttributeMarkManager.getAttributeMarkList(attributeMarkIdList);
            const validAttributeSceneList = await this.yourFieldAttributeMarkManager.getValidAttributeScenes(attributeMarkList);
            this.dragMoveRepository.setSelectedGroup(validAttributeSceneList);
        }

        // this.createNeonBorder(clickedYourFieldCard);
        this.activateExistNeonBorder(clickedYourFieldCard);
    }

    async handleOpponentFieldClick(x: number, y: number): Promise<void> {
        console.log(`handleOpponentFieldClick()`);

        // OPPONENT_FIELD 영역 클릭 감지
        const opponentFieldSceneList = this.opponentFieldCardSceneRepository.findAll();
        const clickedOpponentFieldCardScene = this.leftClickHandDetectRepository.isYourHandAreaClicked(
            { x, y },
            opponentFieldSceneList,
            this.camera
        );

        if (clickedOpponentFieldCardScene === null) {
            console.log('클릭한 요소 찾지 못함');
            return;
        }

        const clickedOpponentFieldCardSceneId = clickedOpponentFieldCardScene.getId();

        if (this.activePanelAreaRepository.exists()) {
            console.log(`공격 대상 Scene: ${JSON.stringify(clickedOpponentFieldCardScene, null, 2)}`);

            // OpponentField 엔티티 조회
            const opponentFieldEntity = this.opponentFieldRepository.findByCardSceneId(clickedOpponentFieldCardSceneId);
            if (!opponentFieldEntity) return;

            const targetCardId = opponentFieldEntity.cardId;
            console.log(`공격 대상 카드 id: ${targetCardId}`);

            const selectedYourFieldCard = this.dragMoveRepository.getSelectedObject() as unknown as YourFieldCardScene;
            const yourFieldCardId = selectedYourFieldCard.getId()
            console.log(`yourFieldCardId: ${yourFieldCardId}`)

            const yourFieldCard = this.yourFieldRepository.findById(yourFieldCardId);
            if (yourFieldCard == null) return;

            const cardId = yourFieldCard.getCardId()
            if (cardId == null) return;
            console.log(`공격 진행자 cardId: ${cardId}`)

            const attributeMarkIdList = yourFieldCard.getAttributeMarkIdList();

            const attributeMarkList = await Promise.all(
                attributeMarkIdList.map(id => this.battleFieldCardAttributeMarkRepository.findById(id))
            );

            const validMarkList = attributeMarkList.filter((mark): mark is BattleFieldCardAttributeMark => mark !== null);
            console.log(`validMarkList: ${validMarkList}`)

            let swordScene: BattleFieldCardAttributeMarkScene | null = null;

            for (const id of attributeMarkIdList) {
                const mark = await this.battleFieldCardAttributeMarkRepository.findById(id);
                if (!mark) continue;

                const markScene = await this.battleFieldCardAttributeMarkSceneRepository.findById(mark.attributeMarkSceneId);
                if (!markScene) continue;

                if (markScene.getMarkSceneType() === MarkSceneType.SWORD ||
                    markScene.getMarkSceneType() === MarkSceneType.STAFF) {
                    swordScene = markScene;
                    break;
                }
            }

            console.log(`swordScene: ${swordScene}`)
            if (!swordScene) return;

            this.activePanelAreaRepository.delete()
            this.deactivateExistNeonBorder(selectedYourFieldCard)
            this.deactivateEveryExistOpponentNeonBorder()

            await this.attackWithWeapon(swordScene, clickedOpponentFieldCardScene);
        }
    }

    private yoursWeaponToOpponent(swordMesh: THREE.Mesh, originPos: THREE.Vector3, targetPos: THREE.Vector3, duration: number): Promise<void> {
        return new Promise(resolve => {
            console.log('>>> [Debug] yoursWeaponToOpponent called');
            console.log('>>> swordMesh position before tween:', swordMesh.position);
            console.log('>>> targetPos:', targetPos);

            const startRot = swordMesh.rotation.z;        // 시작 회전
            const endRot = startRot + Math.PI * 130 / 180;        // 목표 회전 (좌측으로 기울이기)

            const tween = new TWEEN.Tween({
                x: originPos.x,
                y: originPos.y,
                z: originPos.z,
                rot: startRot
            })
                .to({
                    x: targetPos.x,
                    y: targetPos.y,
                    z: targetPos.z,
                    rot: endRot
                }, duration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((obj: { x: number; y: number; z: number; rot: number; }) => {
                    swordMesh.position.set(obj.x, obj.y, obj.z);
                    swordMesh.rotation.z = obj.rot;
                })
                .onComplete(() => resolve())
                .start();
        });
    }

    private attackOpponentLeftToRightWithWeapon(mesh: THREE.Mesh, duration: number): Promise<void> {
        return new Promise(resolve => {
            const startRot = mesh.rotation.z;        // 현재 회전값
            const endRot = startRot - Math.PI;       // 시계 방향 180도 회전

            const originPos = mesh.position.clone();
            const targetPos = originPos.clone();

            const halfWidth = this.CARD_WIDTH * window.innerWidth / 2;
            targetPos.x += halfWidth;

            const tween = new TWEEN.Tween({
                x: originPos.x,
                y: originPos.y,
                z: originPos.z,
                rot: startRot
            })
                .to({
                    x: targetPos.x,
                    y: targetPos.y,
                    z: targetPos.z,
                    rot: endRot
                }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((obj: { x: number; y: number; z: number; rot: number; }) => {
                    mesh.position.set(obj.x, obj.y, obj.z);
                    mesh.rotation.z = obj.rot;
                })
                .onComplete(() => resolve())
                .start();
        });
    }

    // private returnWeaponFromOpponent(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3, duration: number): Promise<void> {
    //     return new Promise(resolve => {
    //         const pos = { x: from.x, y: from.y, z: from.z };
    //         new TWEEN.Tween(pos)
    //             .to({ x: to.x, y: to.y, z: to.z }, duration)
    //             .easing(TWEEN.Easing.Quadratic.In)
    //             .onUpdate(() => {
    //                 mesh.position.set(pos.x, pos.y, pos.z);
    //             })
    //             .onComplete(() => resolve())
    //             .start();
    //     });
    // }

    private returnWeaponFromOpponent(
        mesh: THREE.Mesh,
        fromPos: THREE.Vector3,
        toPos: THREE.Vector3,
        fromRot: number,
        toRot: number,
        duration: number
    ): Promise<void> {
        return new Promise(resolve => {
            const obj = { x: fromPos.x, y: fromPos.y, z: fromPos.z, rot: fromRot };
            new TWEEN.Tween(obj)
                .to({ x: toPos.x, y: toPos.y, z: toPos.z, rot: toRot }, duration)
                .easing(TWEEN.Easing.Quadratic.In)
                .onUpdate(() => {
                    mesh.position.set(obj.x, obj.y, obj.z);
                    mesh.rotation.z = obj.rot;
                })
                .onComplete(() => resolve())
                .start();
        });
    }

    private async attackWithWeapon(
        swordScene: BattleFieldCardAttributeMarkScene,
        opponentScene: OpponentFieldCardScene
    ): Promise<void> {
        console.log(`attackWithWeapon`)
        const swordMesh = swordScene.getMesh();
        const targetMesh = opponentScene.getMesh();

        const originPos = swordMesh.position.clone();
        const originRot = swordMesh.rotation.z;

        const halfWidth = this.CARD_WIDTH * window.innerWidth / 2;
        const targetPos = targetMesh.position.clone().add(new THREE.Vector3(-halfWidth, 0, 0.5));

        // 1) 무기를 상대 근처로 이동
        await this.yoursWeaponToOpponent(swordMesh, originPos, targetPos.clone().add(new THREE.Vector3(0, 0, 0.5)), 1000);

        // 2) 좌우 휘두르기
        await this.attackOpponentLeftToRightWithWeapon(swordMesh, 300);

        // 3) 무기 복귀
        // await this.returnWeaponFromOpponent(swordMesh, swordMesh.position.clone(), originPos, 1000);
        await this.returnWeaponFromOpponent(swordMesh, swordMesh.position.clone(), originPos, swordMesh.rotation.z, originRot, 1000);
    }

    async handleOpponentHandClick(x: number, y: number): Promise<void> {
        // OPPONENT_HAND 영역에 대한 처리
    }

    async handleFieldEnergyClick(x: number, y: number): Promise<void> {
        // FIELD_ENERGY 영역에 대한 처리
    }

    async handleTombClick(x: number, y: number): Promise<void> {
        // TOMB 영역에 대한 처리
    }

    async handleLostZoneClick(x: number, y: number): Promise<void> {
        // LOSTZONE 영역에 대한 처리
    }

    private async handleOpponentTombClick(x: number, y: number): Promise<void> {
        // 아무런 내용 없이 기본 폼만 제공
    }

    private async handleOpponentLostZoneClick(x: number, y: number): Promise<void> {
        // 아무런 내용 없이 기본 폼만 제공
    }

    private async handleOpponentConstructionClick(x: number, y: number): Promise<void> {
        // 아무런 내용 없이 기본 폼만 제공
    }

    private async handleYourConstructionClick(x: number, y: number): Promise<void> {
        // 아무런 내용 없이 기본 폼만 제공
    }

    private async handleEnvironmentClick(x: number, y: number): Promise<void> {
        // 아무런 내용 없이 기본 폼만 제공
    }

    private async handleSettingsClick(x: number, y: number): Promise<void> {
        // 아무런 내용 없이 기본 폼만 제공
    }

    private async handleTurnEndClick(x: number, y: number): Promise<void> {
        // 아무런 내용 없이 기본 폼만 제공
    }
}
