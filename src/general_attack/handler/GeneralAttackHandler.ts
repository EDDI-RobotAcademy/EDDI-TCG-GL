import * as THREE from "three";

import { GeneralAttackType } from "../entity/GeneralAttackType";
import { MarkSceneType } from "../../battle_field_card_attribute_mark_scene/entity/MarkSceneType";

import { YourFieldCardScene } from "../../your_field_card_scene/entity/YourFieldCardScene";
import { DragMoveRepository } from "../../drag_move/repository/DragMoveRepository";
import { DragMoveRepositoryImpl } from "../../drag_move/repository/DragMoveRepositoryImpl";
import { YourFieldRepository } from "../../your_field/repository/YourFieldRepository";
import { YourFieldRepositoryImpl } from "../../your_field/repository/YourFieldRepositoryImpl";
import { YourFieldCardSceneRepository } from "../../your_field_card_scene/repository/YourFieldCardSceneRepository";
import { YourFieldCardSceneRepositoryImpl } from "../../your_field_card_scene/repository/YourFieldCardSceneRepositoryImpl";
import { BattleFieldCardAttributeMarkScene } from "../../battle_field_card_attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";
import { BattleFieldCardAttributeMarkRepository } from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepository";
import { BattleFieldCardAttributeMarkRepositoryImpl } from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepositoryImpl";
import { BattleFieldCardAttributeMarkSceneRepository } from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepository";
import { BattleFieldCardAttributeMarkSceneRepositoryImpl } from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepositoryImpl";
import { OpponentFieldCardSceneRepository } from "../../opponent_field_card_scene/repository/OpponentFieldCradSceneRepository";
import { OpponentFieldCardSceneRepositoryImpl } from "../../opponent_field_card_scene/repository/OpponentFieldCradSceneRepositoryImpl";
import { LeftClickHandDetectRepository } from "../../left_click_detect/repository/LeftClickHandDetectRepository";
import { LeftClickHandDetectRepositoryImpl } from "../../left_click_detect/repository/LeftClickHandDetectRepositoryImpl";
import { OpponentFieldRepository } from "../../opponent_field/repository/OpponentFieldRepository";
import { OpponentFieldRepositoryImpl } from "../../opponent_field/repository/OpponentFieldRepositoryImpl";
import { OpponentFieldCardAttributeMarkRepository } from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepository";
import { OpponentFieldCardAttributeMarkRepositoryImpl } from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepositoryImpl";
import { OpponentFieldCardAttributeMarkSceneRepository } from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepository";
import { OpponentFieldCardAttributeMarkSceneRepositoryImpl } from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepositoryImpl";
import { ActivePanelAreaRepository } from "../../active_panel_area/repository/ActivePanelAreaRepository";
import { ActivePanelAreaRepositoryImpl } from "../../active_panel_area/repository/ActivePanelAreaRepositoryImpl";
import { ClickableCard } from "../../left_click_detect/service/ClickableCard";
import { NeonBorderSceneType } from "../../neon_border/entity/NeonBorderSceneType";
import { NeonBorderType } from "../../neon_border/entity/NeonBorderType";
import { NeonBorderRepositoryImpl } from "../../neon_border/repository/NeonBorderRepositoryImpl";
import { NeonBorderRepository } from "../../neon_border/repository/NeonBorderRepository";
import { NeonBorderLineSceneRepository } from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepository";
import { NeonBorderLineSceneRepositoryImpl } from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepositoryImpl";
import { BattleFieldCardAttributeMark } from "../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMark";
import {GeneralAttackAnimation} from "../animation/GeneralAttackAnimation";
import {OpponentFieldCardScene} from "../../opponent_field_card_scene/entity/OpponentFieldCardScene";

export class GeneralAttackHandler {
    private static instance: GeneralAttackHandler;

    private dragMoveRepository: DragMoveRepository;
    private yourFieldRepository: YourFieldRepository;
    private yourFieldCardSceneRepository: YourFieldCardSceneRepository;
    private battleFieldCardAttributeMarkRepository: BattleFieldCardAttributeMarkRepository;
    private battleFieldCardAttributeMarkSceneRepository: BattleFieldCardAttributeMarkSceneRepository;
    private opponentFieldCardSceneRepository: OpponentFieldCardSceneRepository;
    private opponentFieldRepository: OpponentFieldRepository;
    private opponentFieldCardAttributeMarkRepository: OpponentFieldCardAttributeMarkRepository;
    private opponentFieldCardAttributeMarkSceneRepository: OpponentFieldCardAttributeMarkSceneRepository;

    private leftClickHandDetectRepository: LeftClickHandDetectRepository;
    private activePanelAreaRepository: ActivePanelAreaRepository;

    private neonBorderRepository: NeonBorderRepository;
    private neonBorderLineSceneRepository: NeonBorderLineSceneRepository;

    private generalAttackAnimation: GeneralAttackAnimation;

    private handlers: Record<
        GeneralAttackType,
        (x: number, y: number) => Promise<void>
        > = {
        [GeneralAttackType.OPPONENT_FIELD_UNIT]: this.handleOpponentFieldUnit.bind(this),
        [GeneralAttackType.OPPONENT_MASTER]: this.handleOpponentMaster.bind(this),
    };

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.dragMoveRepository = DragMoveRepositoryImpl.getInstance();
        this.yourFieldRepository = YourFieldRepositoryImpl.getInstance();
        this.yourFieldCardSceneRepository = YourFieldCardSceneRepositoryImpl.getInstance();
        this.battleFieldCardAttributeMarkRepository = BattleFieldCardAttributeMarkRepositoryImpl.getInstance();
        this.battleFieldCardAttributeMarkSceneRepository = BattleFieldCardAttributeMarkSceneRepositoryImpl.getInstance();
        this.opponentFieldCardSceneRepository = OpponentFieldCardSceneRepositoryImpl.getInstance();
        this.opponentFieldRepository = OpponentFieldRepositoryImpl.getInstance();
        this.opponentFieldCardAttributeMarkRepository = OpponentFieldCardAttributeMarkRepositoryImpl.getInstance();
        this.opponentFieldCardAttributeMarkSceneRepository = OpponentFieldCardAttributeMarkSceneRepositoryImpl.getInstance();

        this.leftClickHandDetectRepository = LeftClickHandDetectRepositoryImpl.getInstance();
        this.activePanelAreaRepository= ActivePanelAreaRepositoryImpl.getInstance(camera, scene);

        this.neonBorderRepository = NeonBorderRepositoryImpl.getInstance();
        this.neonBorderLineSceneRepository = NeonBorderLineSceneRepositoryImpl.getInstance();

        this.generalAttackAnimation = GeneralAttackAnimation.getInstance();
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): GeneralAttackHandler {
        if (!GeneralAttackHandler.instance) {
            GeneralAttackHandler.instance = new GeneralAttackHandler(camera, scene);
        }
        return GeneralAttackHandler.instance;
    }

    public async execute(
        type: GeneralAttackType,
        x: number,
        y: number
    ): Promise<void> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`Handler not found for GeneralAttackType: ${type}`);
            return;
        }
        await handler(x, y);
    }

    /** ================== 공격 핸들러 ================== */
    private async handleOpponentFieldUnit(x: number, y: number): Promise<void> {
        console.log(`일반 공격: 상대 필드 유닛 공격 처리 (x:${x}, y:${y})`);

        const opponentTarget = await this.buildOpponentTargetGroup(x, y);
        if (!opponentTarget) return;

        const { group: opponentCardGroup, scene: clickedOpponentFieldCardScene } = opponentTarget;

        const { weaponScene, cardGroup, selectedYourFieldCard } = await this.prepareYourAttacker();
        if (!weaponScene) return;

        this.cleanupAfterAttack(selectedYourFieldCard);
        await this.attackWithWeapon(weaponScene, cardGroup, opponentCardGroup, clickedOpponentFieldCardScene);
    }

    private async handleOpponentMaster(x: number, y: number): Promise<void> {
        console.log(`일반 공격: 상대 본체 공격 처리 (x:${x}, y:${y})`);

        const { weaponScene, cardGroup, selectedYourFieldCard } = await this.prepareYourAttacker();
        if (!weaponScene) return;

        this.cleanupAfterAttack(selectedYourFieldCard);
        await this.attackOpponentMasterWithWeapon(weaponScene, cardGroup);
    }

    /** ================== 공통 로직 ================== */

    /** 내 공격자 준비 */
    private async prepareYourAttacker() {
        const selectedYourFieldCard = this.dragMoveRepository.getSelectedObject() as unknown as YourFieldCardScene;
        const yourFieldCardId = selectedYourFieldCard.getId();

        const yourFieldCard = this.yourFieldRepository.findById(yourFieldCardId);
        if (!yourFieldCard) throw new Error("공격자 카드 찾기 실패");

        const cardId = yourFieldCard.getCardId();
        if (!cardId) throw new Error("공격자 카드 ID 없음");

        const attributeMarkIdList = yourFieldCard.getAttributeMarkIdList();
        const attributeMarkList = await Promise.all(
            attributeMarkIdList.map(id => this.battleFieldCardAttributeMarkRepository.findById(id))
        );
        const validMarkList = attributeMarkList.filter((mark): mark is BattleFieldCardAttributeMark => mark !== null);

        const cardSceneId = yourFieldCard.getCardSceneId();
        if (cardSceneId == null) throw new Error("공격자 SceneId 없음");

        const yourFieldCardScene = this.yourFieldCardSceneRepository.findById(cardSceneId);
        if (yourFieldCardScene == null) throw new Error("공격자 Scene 없음");

        // 카드 + 마크 그룹핑
        const cardGroup = new THREE.Group();
        this.scene.remove(yourFieldCardScene.getMesh());
        cardGroup.add(yourFieldCardScene.getMesh());

        let weaponScene: BattleFieldCardAttributeMarkScene | null = null;

        for (const id of attributeMarkIdList) {
            const mark = await this.battleFieldCardAttributeMarkRepository.findById(id);
            if (!mark) continue;

            const markScene = await this.battleFieldCardAttributeMarkSceneRepository.findById(mark.attributeMarkSceneId);
            if (!markScene) continue;

            if (markScene.getMarkSceneType() === MarkSceneType.SWORD ||
                markScene.getMarkSceneType() === MarkSceneType.STAFF) {
                weaponScene = markScene;
                continue;
            }

            this.scene.remove(markScene.getMesh());
            cardGroup.add(markScene.getMesh());
        }

        this.scene.add(cardGroup);
        return { weaponScene, cardGroup, selectedYourFieldCard };
    }

    /** 상대 타겟 준비 */
    private async buildOpponentTargetGroup(x: number, y: number): Promise<{ group: THREE.Group, scene: OpponentFieldCardScene } | null> {
        const opponentFieldSceneList = this.opponentFieldCardSceneRepository.findAll();
        const clickedOpponentFieldCardScene =
            this.leftClickHandDetectRepository.isYourHandAreaClicked(
                { x, y },
                opponentFieldSceneList,
                this.camera
            );

        if (!clickedOpponentFieldCardScene) {
            console.log("클릭한 상대 유닛 없음");
            return null;
        }

        const opponentCardGroup = new THREE.Group();
        this.scene.remove(clickedOpponentFieldCardScene.getMesh());
        opponentCardGroup.add(clickedOpponentFieldCardScene.getMesh());

        // 속성 마크도 붙이기
        const opponentFieldEntity = this.opponentFieldRepository.findByCardSceneId(clickedOpponentFieldCardScene.getId());
        if (!opponentFieldEntity) return null;

        for (const id of opponentFieldEntity.getAttributeMarkIdList()) {
            const mark = await this.opponentFieldCardAttributeMarkRepository.findById(id);
            if (!mark) continue;

            const markScene = await this.opponentFieldCardAttributeMarkSceneRepository.findById(mark.attributeMarkSceneId);
            if (!markScene) continue;

            this.scene.remove(markScene.getMesh());
            opponentCardGroup.add(markScene.getMesh());
        }

        this.scene.add(opponentCardGroup);
        return { group: opponentCardGroup, scene: clickedOpponentFieldCardScene };
    }

    /** 공격 후 공통 정리 */
    private cleanupAfterAttack(selectedYourFieldCard: YourFieldCardScene) {
        this.activePanelAreaRepository.delete();
        this.deactivateExistNeonBorder(selectedYourFieldCard);
        this.deactivateEveryExistOpponentNeonBorder();
        this.deactivateOpponentMasterNeonBorder();
    }

    /** ================== 애니메이션 호출부 ================== */

    async attackWithWeapon(
        weaponScene: BattleFieldCardAttributeMarkScene,
        attackerGroup: THREE.Group,
        targetGroup: THREE.Group,
        targetScene: OpponentFieldCardScene
    ) {
        console.log(">> 유닛 공격 애니메이션 실행");
        this.generalAttackAnimation.setScene(this.scene);  // 반드시 먼저 Scene 설정
        await this.generalAttackAnimation.attackWithWeapon(weaponScene, attackerGroup, targetGroup, targetScene);
    }

    private async attackOpponentMasterWithWeapon(
        weaponScene: BattleFieldCardAttributeMarkScene,
        attackerGroup: THREE.Group
    ) {
        console.log(">> 본체 공격 애니메이션 실행");
        this.generalAttackAnimation.setScene(this.scene);
        await this.generalAttackAnimation.attackOpponentMasterWithWeapon(weaponScene, attackerGroup);
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
