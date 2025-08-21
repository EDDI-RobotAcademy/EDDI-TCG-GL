import {LeftClickDetectService} from "./LeftClickDetectService";
import {BattleFieldCardSceneRepositoryImpl} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepositoryImpl";
import {BattleFieldCardSceneRepository} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepository";
import {LeftClickHandDetectRepositoryImpl} from "../repository/LeftClickHandDetectRepositoryImpl";
import {LeftClickHandDetectRepository} from "../repository/LeftClickHandDetectRepository";
import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import * as THREE from "three";

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

import {LeftClickOpponentMasterDetectRepository} from "../repository/LeftClickOpponentMasterDetectRepository";
import {LeftClickOpponentMasterDetectRepositoryImpl} from "../repository/LeftClickOpponentMasterDetectRepositoryImpl";

import {ActivePanelButtonType} from "../../active_panel_area/entity/ActivePanelButtonType";
import {GeneralAttackType} from "../../general_attack/entity/GeneralAttackType";
import {ActivePanelButtonHandler} from "../../active_panel_area/handler/ActivePanelButtonHandler";
import {BattleFieldCommonAreaType} from "../../common/type/BattleFieldCommonAreaType";
import {NeonBorderHandler} from "../../neon_border/handler/NeonBorderHandler";
import {OpponentFieldCardScene} from "../../opponent_field_card_scene/entity/OpponentFieldCardScene";

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

    private readonly OPPONENT_START_X: number = 0.4605885
    private readonly OPPONENT_START_Y: number = 0.1920103

    private readonly OPPONENT_END_X: number = 0.5410156
    private readonly OPPONENT_END_Y: number = 0.0476804

    private mouseCursorDetectRepository: MouseCursorDetectRepository

    private neonBorderRepository: NeonBorderRepository;
    private neonShape: NeonShape

    private neonBorderLineSceneRepository: NeonBorderLineSceneRepository;
    private neonBorderLinePositionRepository: NeonBorderLinePositionRepository;

    private neonBorderHandler: NeonBorderHandler;

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
    private leftClickOpponentMasterDetectRepository: LeftClickOpponentMasterDetectRepository;

    private cameraRepository: CameraRepository
    private dragMoveRepository: DragMoveRepository;

    private yourHandAttributeMarkManager: YourHandAttributeMarkManager
    private yourFieldAttributeMarkManager: YourFieldAttributeMarkManager

    private activePanelAreaRepository: ActivePanelAreaRepository
    private activePanelButtonHandler: ActivePanelButtonHandler

    private leftMouseDown: boolean = false;

    private prevMouseCursorDetectArea: MouseCursorDetectArea = MouseCursorDetectArea.NONE;
    private currentMouseCursorDetectArea: MouseCursorDetectArea = MouseCursorDetectArea.NONE;

    private areaHandlers: Record<MouseCursorDetectArea, (x: number, y: number) => Promise<void>> = {
        [MouseCursorDetectArea.NONE]: async () => { /* do nothing */ },
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
        [MouseCursorDetectArea.OPPONENT_MASETER]: this.handleOpponentMasterClick.bind(this),
    };

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.mouseCursorDetectRepository = MouseCursorDetectRepositoryImpl.getInstance()

        this.neonBorderRepository = NeonBorderRepositoryImpl.getInstance();
        this.neonShape = NeonShape.getInstance()

        this.neonBorderLineSceneRepository = NeonBorderLineSceneRepositoryImpl.getInstance()
        this.neonBorderLinePositionRepository = NeonBorderLinePositionRepositoryImpl.getInstance()

        this.neonBorderHandler = NeonBorderHandler.getInstance(camera, scene);

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
        this.leftClickOpponentMasterDetectRepository = LeftClickOpponentMasterDetectRepositoryImpl.getInstance()

        this.cameraRepository = CameraRepositoryImpl.getInstance()
        this.dragMoveRepository = DragMoveRepositoryImpl.getInstance();

        this.yourHandAttributeMarkManager = YourHandAttributeMarkManager.getInstance();
        this.yourFieldAttributeMarkManager = YourFieldAttributeMarkManager.getInstance()

        this.activePanelAreaRepository = ActivePanelAreaRepositoryImpl.getInstance(camera, scene)
        this.activePanelButtonHandler = ActivePanelButtonHandler.getInstance(camera, scene)
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

    private handleActivePanelClick(x: number, y: number): any | null {
        const buttons = this.activePanelAreaRepository.getActiveButtons() ?? [];
        if (buttons.length === 0) return null;

        const clickedButton = this.getIntersectedButton(x, y, buttons);
        if (!clickedButton) return null;

        const type = clickedButton.userData.type;
        console.log(`Active Panel 버튼 클릭됨: ${type}`);

        // currentMouseCursorDetectArea
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
                this.neonBorderHandler.createOpponentNeonBorderList()
                this.neonBorderHandler.createOpponentMasterNeonBorder()
                this.activePanelAreaRepository.setActivePanelButtonType(ActivePanelButtonType.GENERAL)
                break;
            case "firstSkill":
                console.log("firstSkill type")
                if (skill1Type === SkillType.Single) {
                    this.neonBorderHandler.createOpponentNeonBorderList()
                    this.neonBorderHandler.createOpponentMasterNeonBorder()
                    this.activePanelAreaRepository.setActivePanelButtonType(ActivePanelButtonType.FIRST_SKILL)
                }
                break;
            case "secondSkill":
                console.log("secondSkill type")
                if (skill2Type === SkillType.EveryUnitField) {
                    console.log("유닛 필드 전체 공격")
                    this.activePanelAreaRepository.setActivePanelButtonType(ActivePanelButtonType.SECOND_SKILL)
                    this.activePanelButtonHandler.execute(ActivePanelButtonType.SECOND_SKILL, BattleFieldCommonAreaType.EVERY_OPPONENT_FIELD_UNIT)
                }
                break;
            case "details":
                console.log("details type")
                this.activePanelAreaRepository.setActivePanelButtonType(ActivePanelButtonType.DETAILS)
                if (this.currentMouseCursorDetectArea === MouseCursorDetectArea.YOUR_FIELD) {
                    this.activePanelButtonHandler.execute(ActivePanelButtonType.DETAILS, BattleFieldCommonAreaType.YOUR_FIELD_UNIT)
                }
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

        this.currentMouseCursorDetectArea = detectedArea;

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

    private async handleYourHandClick(x: number, y: number): Promise<void> {
        const handSceneList = this.battleFieldCardSceneRepository.findAll();
        const clickedHandCard = this.leftClickHandDetectRepository.isYourHandAreaClicked({ x, y }, handSceneList, this.camera);
        if (clickedHandCard === null) {
            return;
        }

        const prevYourFieldCard = this.dragMoveRepository.getSelectedObject() as unknown as YourFieldCardScene;
        console.log(`prevYourFieldCard: ${prevYourFieldCard}`)

        if (prevYourFieldCard !== null) {
            this.neonBorderHandler.deactivateEveryExistOpponentNeonBorder()
            this.neonBorderHandler.deactivateExistNeonBorder(prevYourFieldCard)
            this.neonBorderHandler.deactivateOpponentMasterNeonBorder()
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

        this.neonBorderHandler.createYourNeonBorder(clickedHandCard);
    }

    private async handleYourFieldClick(x: number, y: number): Promise<void> {
        const yourFieldSceneList = this.yourFieldCardSceneRepository.findAll();
        const clickedYourFieldCard = this.leftClickHandDetectRepository.isYourHandAreaClicked({ x, y }, yourFieldSceneList, this.camera);
        if (clickedYourFieldCard === null) {
            return;
        }

        let prevYourFieldCard: YourFieldCardScene | null = null;

        if (this.currentMouseCursorDetectArea !== this.prevMouseCursorDetectArea) {
            this.prevMouseCursorDetectArea = this.currentMouseCursorDetectArea;

            this.dragMoveRepository.deleteSelectedObject()
        }

        prevYourFieldCard = this.dragMoveRepository.getSelectedObject() as unknown as YourFieldCardScene;
        console.log(`prevYourFieldCard: ${prevYourFieldCard}`)

        // this.activateExistNeonBorder(clickedYourFieldCard);
        this.neonBorderHandler.deactivateEveryExistNeonBorder()
        this.activePanelAreaRepository.delete();
        this.neonBorderHandler.activateExistNeonBorder(clickedYourFieldCard);

        if (prevYourFieldCard && prevYourFieldCard.getId() === clickedYourFieldCard.getId()) {
            console.log('같은 카드를 선택하였습니다!')
            return;
        }

        if (prevYourFieldCard !== null) {
            this.neonBorderHandler.deactivateEveryExistOpponentNeonBorder()
            this.neonBorderHandler.deactivateExistNeonBorder(prevYourFieldCard)
            this.neonBorderHandler.deactivateOpponentMasterNeonBorder()
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

    }

    async handleOpponentFieldClick(x: number, y: number): Promise<void> {
        console.log(`handleOpponentFieldClick()`);

        const currentActivePanelButtonType = this.activePanelAreaRepository.getActivePanelButtonType();

        if (currentActivePanelButtonType === ActivePanelButtonType.NONE) {
            console.warn("현재 ActivePanelButtonType이 선택되지 않았습니다.");

            // if (this.activePanelAreaRepository.exists()) {
            //     return;
            // }

            const opponentFieldSceneList = this.opponentFieldCardSceneRepository.findAll();
            const clickedOpponentFieldCard = this.leftClickHandDetectRepository.isYourHandAreaClicked({ x, y }, opponentFieldSceneList, this.camera);
            if (clickedOpponentFieldCard === null) {
                return;
            }

            let prevOpponentFieldCard: OpponentFieldCardScene | null = null;

            if (this.currentMouseCursorDetectArea !== this.prevMouseCursorDetectArea) {
                this.prevMouseCursorDetectArea = this.currentMouseCursorDetectArea;

                this.dragMoveRepository.deleteSelectedObject()
            }

            prevOpponentFieldCard = this.dragMoveRepository.getSelectedObject() as unknown as OpponentFieldCardScene;
            console.log(`prevOpponentFieldCard: ${prevOpponentFieldCard}`)

            this.neonBorderHandler.deactivateEveryExistNeonBorder()
            this.activePanelAreaRepository.delete();
            this.neonBorderHandler.activateExistOpponentNeonBorder(clickedOpponentFieldCard);

            if (prevOpponentFieldCard && prevOpponentFieldCard.getId() === clickedOpponentFieldCard.getId()) {
                console.log('같은 카드를 선택하였습니다!')
                return;
            }

            if (prevOpponentFieldCard !== null) {
                this.neonBorderHandler.deactivateEveryExistOpponentNeonBorder()
                this.neonBorderHandler.deactivateExistNeonBorder(prevOpponentFieldCard)
                this.neonBorderHandler.deactivateOpponentMasterNeonBorder()
                this.activePanelAreaRepository.delete();
            }

            this.dragMoveRepository.setSelectedObject(clickedOpponentFieldCard);
            this.dragMoveRepository.setSelectedArea(LeftClickedArea.OPPONENT_FIELD)

            this.neonBorderHandler.createNewOpponentNeonBorder(clickedOpponentFieldCard.getId())

            return;
        }

        this.activePanelButtonHandler.execute(currentActivePanelButtonType, BattleFieldCommonAreaType.OPPONENT_FIELD_UNIT, x, y)
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

    private async handleOpponentMasterClick(x: number, y: number): Promise<void> {
        const currentActivePanelButtonType = this.activePanelAreaRepository.getActivePanelButtonType();

        if (currentActivePanelButtonType === ActivePanelButtonType.NONE) {
            console.warn("현재 ActivePanelButtonType이 선택되지 않았습니다.");
            return;
        }

        this.activePanelButtonHandler.execute(currentActivePanelButtonType, BattleFieldCommonAreaType.OPPONENT_MASTER, x, y)
    }
}
