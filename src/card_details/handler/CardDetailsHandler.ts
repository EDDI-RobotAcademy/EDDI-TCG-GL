import * as THREE from "three";

import {YourFieldCardScene} from "../../battle/field/your/card_scene/entity/YourFieldCardScene";
import {BattleFieldCardAttributeMark} from "../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMark";
import {DragMoveRepositoryImpl} from "../../drag_move/repository/DragMoveRepositoryImpl";
import {YourFieldRepositoryImpl} from "../../battle/field/your/repository/YourFieldRepositoryImpl";
import {YourFieldCardSceneRepositoryImpl} from "../../battle/field/your/card_scene/repository/YourFieldCardSceneRepositoryImpl";
import {BattleFieldCardAttributeMarkRepositoryImpl} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepositoryImpl";
import {BattleFieldCardAttributeMarkSceneRepositoryImpl} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepositoryImpl";
import {OpponentFieldCardSceneRepositoryImpl} from "../../battle/field/opponent/card_scene/repository/OpponentFieldCardSceneRepositoryImpl";
import {OpponentFieldRepositoryImpl} from "../../battle/field/opponent/repository/OpponentFieldRepositoryImpl";
import {OpponentFieldCardAttributeMarkRepositoryImpl} from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepositoryImpl";
import {OpponentFieldCardAttributeMarkSceneRepositoryImpl} from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepositoryImpl";
import {LeftClickHandDetectRepositoryImpl} from "../../left_click_detect/repository/LeftClickHandDetectRepositoryImpl";
import {ActivePanelAreaRepositoryImpl} from "../../battle/active_panel/repository/ActivePanelAreaRepositoryImpl";
import {NeonBorderRepositoryImpl} from "../../neon_border/repository/NeonBorderRepositoryImpl";
import {NeonBorderLineSceneRepositoryImpl} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepositoryImpl";
import {DragMoveRepository} from "../../drag_move/repository/DragMoveRepository";
import {YourFieldRepository} from "../../battle/field/your/repository/YourFieldRepository";
import {YourFieldCardSceneRepository} from "../../battle/field/your/card_scene/repository/YourFieldCardSceneRepository";
import {BattleFieldCardAttributeMarkRepository} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepository";
import {BattleFieldCardAttributeMarkSceneRepository} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepository";
import {OpponentFieldCardSceneRepository} from "../../battle/field/opponent/card_scene/repository/OpponentFieldCardSceneRepository";
import {OpponentFieldRepository} from "../../battle/field/opponent/repository/OpponentFieldRepository";
import {OpponentFieldCardAttributeMarkRepository} from "../../opponent_field_card_attribute_mark/repository/OpponentFieldCardAttributeMarkRepository";
import {OpponentFieldCardAttributeMarkSceneRepository} from "../../opponent_field_card_attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepository";
import {LeftClickHandDetectRepository} from "../../left_click_detect/repository/LeftClickHandDetectRepository";
import {ActivePanelAreaRepository} from "../../battle/active_panel/repository/ActivePanelAreaRepository";
import {NeonBorderRepository} from "../../neon_border/repository/NeonBorderRepository";
import {NeonBorderLineSceneRepository} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepository";
import {MarkSceneType} from "../../battle_field_card_attribute_mark_scene/entity/MarkSceneType";
import {NeonBorderHandler} from "../../neon_border/handler/NeonBorderHandler";
import {FirstSkillType} from "../../battle/ability/entity/FirstSkillType";
import {CardDetailsType} from "../entity/CardDetailsType";

export class CardDetailsHandler {
    private static instance: CardDetailsHandler;

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

    private neonBorderHandler: NeonBorderHandler;

    private handlers: Record<CardDetailsType,
        () => Promise<void>> = {
        [CardDetailsType.OPPONENT_FIELD_UNIT]: this.handleOpponentFieldUnit.bind(this),
        [CardDetailsType.OPPONENT_MASTER]: async () => {},
        [CardDetailsType.YOUR_FIELD_UNIT]: this.handleYourFieldUnit.bind(this),
        [CardDetailsType.YOUR_HAND_UNIT]: this.handleYourHandUnit.bind(this),
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
        this.activePanelAreaRepository = ActivePanelAreaRepositoryImpl.getInstance(camera, scene);

        this.neonBorderRepository = NeonBorderRepositoryImpl.getInstance();
        this.neonBorderLineSceneRepository = NeonBorderLineSceneRepositoryImpl.getInstance();

        this.neonBorderHandler = NeonBorderHandler.getInstance(camera, scene);
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): CardDetailsHandler {
        if (!CardDetailsHandler.instance) {
            CardDetailsHandler.instance = new CardDetailsHandler(camera, scene);
        }
        return CardDetailsHandler.instance;
    }

    public async execute(
        type: CardDetailsType,
    ): Promise<void> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`Handler not found for CardDetailsType: ${type}`);
            return;
        }
        await handler();
    }

    private async handleOpponentFieldUnit(): Promise<void> {
        console.log(`상세 보기: 상대 필드 유닛`);

        // const { cardGroup, selectedYourFieldCard } = await this.prepareYourAttacker();
        //
        // this.neonBorderHandler.cleanupAfterAction(selectedYourFieldCard)
    }

    private async handleYourFieldUnit(): Promise<void> {
        console.log(`상세 보기: 내 필드 유닛`);
    }

    private async handleYourHandUnit(): Promise<void> {
        console.log(`상세 보기: 내 핸드 카드`);
    }
}