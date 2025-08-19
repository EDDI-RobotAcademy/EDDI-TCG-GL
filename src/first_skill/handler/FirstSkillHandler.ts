import * as THREE from "three";
import { FirstSkillType } from "../entity/FirstSkillType";
import {FirstSkillAnimation} from "../animation/FirstSkillAnimation";
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

export class FirstSkillHandler {
    private static instance: FirstSkillHandler;

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

    private firstSkillAnimation: FirstSkillAnimation;

    private handlers: Record<FirstSkillType,
        (x: number, y: number) => Promise<void>> = {
        [FirstSkillType.OPPONENT_FIELD_UNIT]: this.handleOpponentFieldUnit.bind(this),
        [FirstSkillType.OPPONENT_MASTER]: this.handleOpponentMaster.bind(this),
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

        this.firstSkillAnimation = FirstSkillAnimation.getInstance();
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): FirstSkillHandler {
        if (!FirstSkillHandler.instance) {
            FirstSkillHandler.instance = new FirstSkillHandler(camera, scene);
        }
        return FirstSkillHandler.instance;
    }

    public async execute(
        type: FirstSkillType,
        x: number,
        y: number
    ): Promise<void> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`Handler not found for FirstSkillType: ${type}`);
            return;
        }
        await handler(x, y);
    }

    private async handleOpponentFieldUnit(x: number, y: number): Promise<void> {
        console.log(`첫 번째 스킬 (타겟팅) 공격: 상대 필드 유닛 공격 처리 (x:${x}, y:${y})`);

        const { cardGroup } = await this.prepareYourAttacker();

        this.firstSkillAnimation.setScene(this.scene);
        this.firstSkillAnimation.targetingSkillToOpponent(cardGroup)
    }

    private async handleOpponentMaster(x: number, y: number): Promise<void> {
        console.log(`첫 번째 스킬 (타겟팅) 공격: 상대 본체 공격 처리 (x:${x}, y:${y})`);
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

        // 카드 + 마크 그룹핑
        const cardGroup = new THREE.Group();
        this.scene.remove(yourFieldCardScene.getMesh());
        cardGroup.add(yourFieldCardScene.getMesh());

        for (const id of attributeMarkIdList) {
            const mark = await this.battleFieldCardAttributeMarkRepository.findById(id);
            if (!mark) continue;

            const markScene = await this.battleFieldCardAttributeMarkSceneRepository.findById(mark.attributeMarkSceneId);
            if (!markScene) continue;

            this.scene.remove(markScene.getMesh());
            cardGroup.add(markScene.getMesh());
        }

        this.scene.add(cardGroup);
        return { cardGroup };
    }
}