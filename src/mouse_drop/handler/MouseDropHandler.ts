import * as THREE from "three";

import {CardKind} from "../../card/kind";
import {BattleFieldCardScene} from "../../battle_field_card_scene/entity/BattleFieldCardScene";
import {getCardById} from "../../card/utility";
import {BattleFieldHandRepository} from "../../battle_field_hand/repository/BattleFieldHandRepository";
import {BattleFieldHandRepositoryImpl} from "../../battle_field_hand/repository/BattleFieldHandRepositoryImpl";
import {BattleFieldCardSceneRepository} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepository";
import {
    BattleFieldCardSceneRepositoryImpl
} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepositoryImpl";
import {YourFieldCardSceneRepository} from "../../your_field_card_scene/repository/YourFieldCardSceneRepository";
import {
    YourFieldCardSceneRepositoryImpl
} from "../../your_field_card_scene/repository/YourFieldCardSceneRepositoryImpl";
import {YourFieldRepository} from "../../your_field/repository/YourFieldRepository";
import {YourFieldRepositoryImpl} from "../../your_field/repository/YourFieldRepositoryImpl";
import {YourField} from "../../your_field/entity/YourField";

export class MouseDropHandler {
    private static instance: MouseDropHandler;

    private battleFieldHandRepository: BattleFieldHandRepository;
    private battleFieldCardSceneRepository: BattleFieldCardSceneRepository;

    private yourFieldRepository: YourFieldRepository;
    private yourFieldCardSceneRepository: YourFieldCardSceneRepository;

    private handlers: Record<CardKind,
        (selectedObject: BattleFieldCardScene) => Promise<YourField | null>> = {
        [CardKind.UNIT]: this.handleCardKindUnit.bind(this),
        [CardKind.ITEM]: async () => null,
        [CardKind.TRAP]: async () => null,
        [CardKind.SUPPORT]: async () => null,
        [CardKind.TOOL]: async () => null,
        [CardKind.ENERGY]: async () => null,
        [CardKind.ENVIRONMENT]: async () => null,
        [CardKind.TOKEN]: async () => null,
    };

    private constructor() {
        this.battleFieldHandRepository = BattleFieldHandRepositoryImpl.getInstance();
        this.battleFieldCardSceneRepository = BattleFieldCardSceneRepositoryImpl.getInstance();

        this.yourFieldRepository = YourFieldRepositoryImpl.getInstance();
        this.yourFieldCardSceneRepository = YourFieldCardSceneRepositoryImpl.getInstance();
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
    ): Promise<YourField | null> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`CardKind 타입이 존재하지 않음: ${type}`);
            return null;
        }

        return await handler(selectedObject);
    }

    private async handleCardKindUnit(selectedObject: BattleFieldCardScene): Promise<YourField | null> {
        console.log(`유닛 타입 카드 사용`);

        const cardSceneId = selectedObject.getId();

        // handCard 가져오기
        const willBePlacedYourFieldHandCard = this.battleFieldHandRepository.findByCardSceneId(cardSceneId);
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
        const attributeMarkIdList = willBePlacedYourFieldHandCard.getAttributeMarkIdList() ?? [];

        // handCardIndex 확인
        const handCardIndex = this.battleFieldHandRepository.findCardIndexByCardSceneId(cardSceneId);
        if (handCardIndex === null) {
            throw new Error(`sceneId ${cardSceneId} 존재하지 않음`);
        }
        console.log(`handCardIndex: ${handCardIndex}`);

        // CardScene Mesh 가져오기
        const willBePlaceYourFieldCardScene = this.battleFieldCardSceneRepository.extractByIndex(handCardIndex);
        const willBePlaceYourFieldCardSceneMesh = willBePlaceYourFieldCardScene?.getMesh();

        if (!willBePlaceYourFieldCardSceneMesh) {
            throw new Error("yourFieldCardScene이 생성되지 않았습니다.");
        }

        const yourFieldCardScene = await this.yourFieldCardSceneRepository.create(willBePlaceYourFieldCardSceneMesh);

        const createdYourField = this.yourFieldRepository.save(
            yourFieldCardScene.getId(),
            positionId,
            attributeMarkIdList,
            cardId
        );

        console.log(`handleCardKindUnit() yourFieldRepository saved: ${JSON.stringify(createdYourField, null, 2)}`);

        // handCard 삭제
        const handCardId = willBePlacedYourFieldHandCard.getId();
        if (handCardId === undefined) {
            throw new Error("Hand card ID를 찾을 수 없습니다.");
        }
        this.battleFieldHandRepository.deleteById(handCardId);

        return createdYourField;
    }
}