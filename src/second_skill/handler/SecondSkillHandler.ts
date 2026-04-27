import * as THREE from "three";

import {YourFieldCardScene} from "../../your_field_card_scene/entity/YourFieldCardScene";
import {BattleFieldCardAttributeMark} from "../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMark";
import {DragMoveRepositoryImpl} from "../../drag_move/repository/DragMoveRepositoryImpl";
import {YourFieldRepositoryImpl} from "../../your_field/repository/YourFieldRepositoryImpl";
import {YourFieldCardSceneRepositoryImpl} from "../../your_field_card_scene/repository/YourFieldCardSceneRepositoryImpl";
import {BattleFieldCardAttributeMarkRepositoryImpl} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepositoryImpl";
import {BattleFieldCardAttributeMarkSceneRepositoryImpl} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepositoryImpl";
import {OpponentFieldCardSceneRepositoryImpl} from "../../opponent_field_card_scene/repository/OpponentFieldCradSceneRepositoryImpl";
import {OpponentFieldRepositoryImpl} from "../../opponent_field/repository/OpponentFieldRepositoryImpl";
import {OpponentFieldCardAttributeMarkRepositoryImpl} from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepositoryImpl";
import {OpponentFieldCardAttributeMarkSceneRepositoryImpl} from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepositoryImpl";
import {LeftClickHandDetectRepositoryImpl} from "../../left_click_detect/repository/LeftClickHandDetectRepositoryImpl";
import {ActivePanelAreaRepositoryImpl} from "../../active_panel_area/repository/ActivePanelAreaRepositoryImpl";
import {NeonBorderRepositoryImpl} from "../../neon_border/repository/NeonBorderRepositoryImpl";
import {NeonBorderLineSceneRepositoryImpl} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepositoryImpl";
import {DragMoveRepository} from "../../drag_move/repository/DragMoveRepository";
import {YourFieldRepository} from "../../your_field/repository/YourFieldRepository";
import {YourFieldCardSceneRepository} from "../../your_field_card_scene/repository/YourFieldCardSceneRepository";
import {BattleFieldCardAttributeMarkRepository} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepository";
import {BattleFieldCardAttributeMarkSceneRepository} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepository";
import {OpponentFieldCardSceneRepository} from "../../opponent_field_card_scene/repository/OpponentFieldCradSceneRepository";
import {OpponentFieldRepository} from "../../opponent_field/repository/OpponentFieldRepository";
import {OpponentFieldCardAttributeMarkRepository} from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepository";
import {OpponentFieldCardAttributeMarkSceneRepository} from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepository";
import {LeftClickHandDetectRepository} from "../../left_click_detect/repository/LeftClickHandDetectRepository";
import {ActivePanelAreaRepository} from "../../active_panel_area/repository/ActivePanelAreaRepository";
import {NeonBorderRepository} from "../../neon_border/repository/NeonBorderRepository";
import {NeonBorderLineSceneRepository} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepository";
import {MarkSceneType} from "../../battle_field_card_attribute_mark_scene/entity/MarkSceneType";
import {NeonBorderHandler} from "../../neon_border/handler/NeonBorderHandler";
import {SecondSkillType} from "../entity/SecondSkillType";
import {SecondSkillAnimation} from "../animation/SecondSkillAnimation";

export class SecondSkillHandler {
    private static instance: SecondSkillHandler;

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

    private secondSkillAnimation: SecondSkillAnimation;
    private neonBorderHandler: NeonBorderHandler;

    private handlers: Record<SecondSkillType,
        (x: number, y: number) => Promise<void>> = {
        [SecondSkillType.OPPONENT_FIELD_UNIT]: this.handleOpponentFieldUnit.bind(this),
        [SecondSkillType.OPPONENT_MASTER]: this.handleOpponentMaster.bind(this),
        [SecondSkillType.EVERY_OPPONENT_FIELD_UNIT]: this.handleEveryOpponentFieldUnit.bind(this),
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

        this.secondSkillAnimation = SecondSkillAnimation.getInstance();
        this.neonBorderHandler = NeonBorderHandler.getInstance(camera, scene);
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): SecondSkillHandler {
        if (!SecondSkillHandler.instance) {
            SecondSkillHandler.instance = new SecondSkillHandler(camera, scene);
        }
        return SecondSkillHandler.instance;
    }

    public async execute(
        type: SecondSkillType,
        x: number,
        y: number
    ): Promise<void> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`Handler not found for SecondSkillType: ${type}`);
            return;
        }
        await handler(x, y);
    }

    private async handleOpponentFieldUnit(x: number, y: number): Promise<void> {
        console.log(`두 번째 스킬 (타겟팅) 공격: 상대 필드 유닛 공격 처리 (x:${x}, y:${y})`);

        // const { cardGroup, selectedYourFieldCard } = await this.prepareYourAttacker();

        // this.neonBorderHandler.cleanupAfterAction(selectedYourFieldCard)

        // this.secondSkillAnimation.setScene(this.scene);
        // this.secondSkillAnimation.targetingSkillToOpponent(cardGroup)
    }

    private async handleOpponentMaster(x: number, y: number): Promise<void> {
        console.log(`두 번째 스킬 (타겟팅) 공격: 상대 본체 공격 처리 (x:${x}, y:${y})`);
    }

    private async handleEveryOpponentFieldUnit(x: number, y: number): Promise<void> {
        console.log(`[SecondSkillHandler] handleEveryOpponentFieldUnit (x=${x}, y=${y})`);

        const { cardGroup, selectedYourFieldCard, attackerCardId } = await this.prepareYourAttacker();
        console.log(`[SecondSkillHandler] attackerCardId=${attackerCardId}`);

        this.neonBorderHandler.cleanupAfterAction(selectedYourFieldCard)

        this.secondSkillAnimation.setScene(this.scene);
        this.secondSkillAnimation.skillToEveryOpponentFieldUnit(cardGroup, attackerCardId)
    }

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

        // 카드 씬의 원래 위치 저장
        if (!yourFieldCardScene.getMesh().userData.originPos) {
            yourFieldCardScene.getMesh().userData.originPos = yourFieldCardScene.getMesh().position.clone();
        }

        const originPos = yourFieldCardScene.getMesh().userData.originPos.clone();

        // 그룹 위치를 카드 원래 위치로
        const cardGroup = new THREE.Group();
        cardGroup.position.copy(originPos);

        // 카드 mesh 위치를 그룹 기준 0,0,0으로
        yourFieldCardScene.getMesh().position.set(0, 0, 0);
        cardGroup.add(yourFieldCardScene.getMesh());

        // 마크 처리
        for (const id of attributeMarkIdList) {
            const mark = await this.battleFieldCardAttributeMarkRepository.findById(id);
            if (!mark) continue;

            const markScene = await this.battleFieldCardAttributeMarkSceneRepository.findById(mark.attributeMarkSceneId);
            if (!markScene) continue;

            this.scene.remove(markScene.getMesh());

            // 카드 기준 상대좌표로 변환
            if (!markScene.getMesh().userData.originPos) {
                markScene.getMesh().userData.originPos = markScene.getMesh().position.clone();
            }
            const relativePos = markScene.getMesh().userData.originPos.clone().sub(originPos);
            markScene.getMesh().position.copy(relativePos);

            cardGroup.add(markScene.getMesh());
        }

        this.scene.add(cardGroup);

        console.log("원래 카드 씬 위치:", yourFieldCardScene.getMesh().position);
        console.log("그룹핑 후 카드 위치:", cardGroup.position);
        cardGroup.children.forEach((child, idx) => {
            console.log(`child[${idx}] mesh position:`, child.position);
        });

        return { cardGroup, selectedYourFieldCard, attackerCardId: cardId };
    }
}