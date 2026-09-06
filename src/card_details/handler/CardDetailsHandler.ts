import * as THREE from "three";

import {YourFieldCardScene} from "../../battle/field/your/card_scene/entity/YourFieldCardScene";
import {BattleFieldCardAttributeMark} from "../../battle/card/attribute_mark/entity/BattleFieldCardAttributeMark";
import {DragMoveRepositoryImpl} from "../../drag_move/repository/DragMoveRepositoryImpl";
import {YourFieldRepositoryImpl} from "../../battle/field/your/repository/YourFieldRepositoryImpl";
import {YourFieldCardSceneCacheImpl} from "../../battle/field/your/card_scene/cache/YourFieldCardSceneCacheImpl";
import {BattleFieldCardAttributeMarkStoreImpl} from "../../battle/card/attribute_mark/store/BattleFieldCardAttributeMarkStoreImpl";
import {BattleFieldCardAttributeMarkSceneCacheImpl} from "../../battle/card/attribute_mark_scene/cache/BattleFieldCardAttributeMarkSceneCacheImpl";
import {OpponentFieldCardSceneCacheImpl} from "../../battle/field/opponent/card_scene/cache/OpponentFieldCardSceneCacheImpl";
import {OpponentFieldRepositoryImpl} from "../../battle/field/opponent/repository/OpponentFieldRepositoryImpl";
import {OpponentFieldCardAttributeMarkRepositoryImpl} from "../../battle/field/opponent/attribute_mark/repository/OpponentFieldCardAttributeMarkRepositoryImpl";
import {OpponentFieldCardAttributeMarkSceneRepositoryImpl} from "../../battle/field/opponent/attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepositoryImpl";
import {LeftClickHandDetectRepositoryImpl} from "../../left_click_detect/repository/LeftClickHandDetectRepositoryImpl";
import {ActivePanelAreaCacheImpl} from "../../battle/active_panel/cache/ActivePanelAreaCacheImpl";
import {NeonBorderRepositoryImpl} from "../../neon_border/repository/NeonBorderRepositoryImpl";
import {NeonBorderLineSceneRepositoryImpl} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepositoryImpl";
import {DragMoveRepository} from "../../drag_move/repository/DragMoveRepository";
import {YourFieldRepository} from "../../battle/field/your/repository/YourFieldRepository";
import {YourFieldCardSceneCache} from "../../battle/field/your/card_scene/cache/YourFieldCardSceneCache";
import {BattleFieldCardAttributeMarkStore} from "../../battle/card/attribute_mark/store/BattleFieldCardAttributeMarkStore";
import {BattleFieldCardAttributeMarkSceneCache} from "../../battle/card/attribute_mark_scene/cache/BattleFieldCardAttributeMarkSceneCache";
import {OpponentFieldCardSceneCache} from "../../battle/field/opponent/card_scene/cache/OpponentFieldCardSceneCache";
import {OpponentFieldRepository} from "../../battle/field/opponent/repository/OpponentFieldRepository";
import {OpponentFieldCardAttributeMarkRepository} from "../../battle/field/opponent/attribute_mark/repository/OpponentFieldCardAttributeMarkRepository";
import {OpponentFieldCardAttributeMarkSceneRepository} from "../../battle/field/opponent/attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepository";
import {LeftClickHandDetectRepository} from "../../left_click_detect/repository/LeftClickHandDetectRepository";
import {ActivePanelAreaCache} from "../../battle/active_panel/cache/ActivePanelAreaCache";
import {NeonBorderRepository} from "../../neon_border/repository/NeonBorderRepository";
import {NeonBorderLineSceneRepository} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepository";
import {MarkSceneType} from "../../battle/card/attribute_mark_scene/entity/MarkSceneType";
import {NeonBorderHandler} from "../../neon_border/handler/NeonBorderHandler";
import {FirstSkillType} from "../../battle/ability/entity/FirstSkillType";
import {CardDetailsType} from "../entity/CardDetailsType";

export class CardDetailsHandler {
    private static instance: CardDetailsHandler;

    private dragMoveRepository: DragMoveRepository;
    private yourFieldRepository: YourFieldRepository;
    private yourFieldCardSceneCache: YourFieldCardSceneCache;
    private battleFieldCardAttributeMarkStore: BattleFieldCardAttributeMarkStore;
    private battleFieldCardAttributeMarkSceneCache: BattleFieldCardAttributeMarkSceneCache;
    private opponentFieldCardSceneCache: OpponentFieldCardSceneCache;
    private opponentFieldRepository: OpponentFieldRepository;
    private opponentFieldCardAttributeMarkRepository: OpponentFieldCardAttributeMarkRepository;
    private opponentFieldCardAttributeMarkSceneRepository: OpponentFieldCardAttributeMarkSceneRepository;

    private leftClickHandDetectRepository: LeftClickHandDetectRepository;
    private activePanelAreaCache: ActivePanelAreaCache;

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
        this.yourFieldCardSceneCache = YourFieldCardSceneCacheImpl.getInstance();
        this.battleFieldCardAttributeMarkStore = BattleFieldCardAttributeMarkStoreImpl.getInstance();
        this.battleFieldCardAttributeMarkSceneCache = BattleFieldCardAttributeMarkSceneCacheImpl.getInstance();
        this.opponentFieldCardSceneCache = OpponentFieldCardSceneCacheImpl.getInstance();
        this.opponentFieldRepository = OpponentFieldRepositoryImpl.getInstance();
        this.opponentFieldCardAttributeMarkRepository = OpponentFieldCardAttributeMarkRepositoryImpl.getInstance();
        this.opponentFieldCardAttributeMarkSceneRepository = OpponentFieldCardAttributeMarkSceneRepositoryImpl.getInstance();

        this.leftClickHandDetectRepository = LeftClickHandDetectRepositoryImpl.getInstance();
        this.activePanelAreaCache = ActivePanelAreaCacheImpl.getInstance(camera, scene);

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