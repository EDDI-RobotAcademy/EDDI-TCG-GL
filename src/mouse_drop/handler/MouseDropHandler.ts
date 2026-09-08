import * as THREE from "three";
import {FieldCard} from "../../battle/domain/FieldCard";
import {BattleRepositoryImpl} from "../../battle/repository/BattleRepositoryImpl";

import {CardKind} from "../../card/kind";
import {BattleFieldCardScene} from "../../battle/card/scene/entity/BattleFieldCardScene";
import {getCardById} from "../../card/utility";
import {BattleFieldCardSceneCache} from "../../battle/card/scene/cache/BattleFieldCardSceneCache";
import {
    BattleFieldCardSceneCacheImpl
} from "../../battle/card/scene/cache/BattleFieldCardSceneCacheImpl";
import {YourFieldCardSceneCache} from "../../battle/field/your/card_scene/cache/YourFieldCardSceneCache";
import {
    YourFieldCardSceneCacheImpl
} from "../../battle/field/your/card_scene/cache/YourFieldCardSceneCacheImpl";

export class MouseDropHandler {
    private static instance: MouseDropHandler;
    private battleFieldCardSceneCache: BattleFieldCardSceneCache;
    private yourFieldCardSceneCache: YourFieldCardSceneCache;

    private handlers: Record<CardKind,
        (selectedObject: BattleFieldCardScene) => Promise<FieldCard | null>> = {
        [CardKind.UNIT]: this.handleCardKindUnit.bind(this),
        [CardKind.ITEM]: this.handleCardKindItem.bind(this),
        [CardKind.TRAP]: this.handleCardKindTrap.bind(this),
        [CardKind.SUPPORT]: this.handleCardKindSupport.bind(this),
        [CardKind.TOOL]: this.handleCardKindTool.bind(this),
        [CardKind.ENERGY]: this.handleCardKindEnergy.bind(this),
        [CardKind.ENVIRONMENT]: this.handleCardKindEnvironment.bind(this),
        [CardKind.TOKEN]: this.handleCardKindToken.bind(this),
    };

    private constructor() {
        this.battleFieldCardSceneCache = BattleFieldCardSceneCacheImpl.getInstance();
        this.yourFieldCardSceneCache = YourFieldCardSceneCacheImpl.getInstance();
    }

    public static getInstance(): MouseDropHandler {
        if (!MouseDropHandler.instance) {
            MouseDropHandler.instance = new MouseDropHandler();
        }
        return MouseDropHandler.instance;
    }

    public async execute(
        type: CardKind,
        selectedObject: BattleFieldCardScene,
    ): Promise<FieldCard | null> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`CardKind 타입이 존재하지 않음: ${type}`);
            return null;
        }

        return await handler(selectedObject);
    }

    private async handleCardKindUnit(selectedObject: BattleFieldCardScene): Promise<FieldCard | null> {
        console.log(`유닛 타입 카드 사용`);

        const cardSceneId = selectedObject.getId();

        // handCard 가져오기
        const willBePlacedYourFieldHandCard = BattleRepositoryImpl.getInstance().getCurrentOrThrow().findInHand(cardSceneId);
        if (!willBePlacedYourFieldHandCard) {
            throw new Error(`Hand card not found for sceneId: ${cardSceneId}`);
        }

        const cardId = willBePlacedYourFieldHandCard.getCardId();
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card not found for cardId: ${cardId}`);
        }

        console.log("Handling UNIT card:", card);

        const positionId = willBePlacedYourFieldHandCard.getPositionId() ?? 0;
        const attributeMarkIdList = willBePlacedYourFieldHandCard.getAttributeMarkIds() ?? [];

        // CardScene Mesh 가져오기
        // 카드 번호로 바로 꺼낸다. 전에는 손패에서 몇 번째인지를 세어 그 수로 꺼냈는데,
        // 손패와 화면 저장소가 각자 구멍을 남기며 자라야만 그 수가 맞았다.
        const willBePlaceYourFieldCardScene = this.battleFieldCardSceneCache.extractById(cardSceneId);
        const willBePlaceYourFieldCardSceneMesh = willBePlaceYourFieldCardScene?.getMesh();

        if (!willBePlaceYourFieldCardSceneMesh) {
            throw new Error("yourFieldCardScene이 생성되지 않았습니다.");
        }

        const yourFieldCardScene = await this.yourFieldCardSceneCache.create(willBePlaceYourFieldCardSceneMesh);

        // 필드에 놓는다. 맨 뒤에 붙는다.
        const createdYourField = new FieldCard(
            yourFieldCardScene.getId(),
            cardId,
            attributeMarkIdList,
            positionId,
        );
        BattleRepositoryImpl.getInstance().getCurrentOrThrow().placeOnYourField(createdYourField);

        // 손패에서 뺀다. 뒤엣것이 당겨진다.
        BattleRepositoryImpl.getInstance().getCurrentOrThrow().removeFromHand(cardSceneId);

        return createdYourField;
    }

    private async handleCardKindItem(selectedObject: BattleFieldCardScene): Promise<FieldCard | null> {
        console.log(`아이템 타입 카드 사용`);
        
        return null
    }

    private async handleCardKindTrap(selectedObject: BattleFieldCardScene): Promise<FieldCard | null> {
        console.log(`함정 타입 카드 사용`);

        return null
    }
    
    private async handleCardKindSupport(selectedObject: BattleFieldCardScene): Promise<FieldCard | null> {
        console.log(`서포트 타입 카드 사용`);

        return null
    }

    private async handleCardKindTool(selectedObject: BattleFieldCardScene): Promise<FieldCard | null> {
        console.log(`도구 타입 카드 사용`);

        return null
    }

    private async handleCardKindEnergy(selectedObject: BattleFieldCardScene): Promise<FieldCard | null> {
        console.log(`에너지 타입 카드 사용`);

        const selectedObjectMesh = selectedObject.getMesh();
        // 위의 메쉬와
        // 현재 필드상의 카드 메쉬가 겹치는 구간이 있는지 확인
        // 겹친다면 해당 카드로 에너지 카드 주입

        return null
    }

    private async handleCardKindEnvironment(selectedObject: BattleFieldCardScene): Promise<FieldCard | null> {
        console.log(`환경 타입 카드 사용`);

        return null
    }

    private async handleCardKindToken(selectedObject: BattleFieldCardScene): Promise<FieldCard | null> {
        console.log(`토큰 타입 카드 사용`);

        return null
    }
}