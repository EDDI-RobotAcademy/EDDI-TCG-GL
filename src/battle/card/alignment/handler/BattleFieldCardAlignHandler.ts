import * as THREE from "three";
import {BattleRepositoryImpl} from "../../../../battle/repository/BattleRepositoryImpl";

import {DragMoveRepositoryImpl} from "../../../../drag_move/repository/DragMoveRepositoryImpl";
import {YourFieldCardSceneCacheImpl} from "../../../field/your/card_scene/cache/YourFieldCardSceneCacheImpl";
import {BattleFieldCardAttributeMarkStoreImpl} from "../../attribute_mark/store/BattleFieldCardAttributeMarkStoreImpl";
import {BattleFieldCardAttributeMarkSceneCacheImpl} from "../../attribute_mark_scene/cache/BattleFieldCardAttributeMarkSceneCacheImpl";
import {OpponentFieldCardSceneCacheImpl} from "../../../field/opponent/card_scene/cache/OpponentFieldCardSceneCacheImpl";
import {OpponentFieldCardAttributeMarkRepositoryImpl} from "../../../field/opponent/attribute_mark/repository/OpponentFieldCardAttributeMarkRepositoryImpl";
import {OpponentFieldCardAttributeMarkSceneRepositoryImpl} from "../../../field/opponent/attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepositoryImpl";
import {LeftClickHandDetectRepositoryImpl} from "../../../../left_click_detect/repository/LeftClickHandDetectRepositoryImpl";
import {ActivePanelAreaCacheImpl} from "../../../active_panel/cache/ActivePanelAreaCacheImpl";
import {NeonBorderRepositoryImpl} from "../../../../neon_border/repository/NeonBorderRepositoryImpl";
import {NeonBorderLineSceneRepositoryImpl} from "../../../../neon_border_line_scene/repository/NeonBorderLineSceneRepositoryImpl";
import {DragMoveRepository} from "../../../../drag_move/repository/DragMoveRepository";
import {YourFieldCardSceneCache} from "../../../field/your/card_scene/cache/YourFieldCardSceneCache";
import {BattleFieldCardAttributeMarkStore} from "../../attribute_mark/store/BattleFieldCardAttributeMarkStore";
import {BattleFieldCardAttributeMarkSceneCache} from "../../attribute_mark_scene/cache/BattleFieldCardAttributeMarkSceneCache";
import {OpponentFieldCardSceneCache} from "../../../field/opponent/card_scene/cache/OpponentFieldCardSceneCache";
import {OpponentFieldCardAttributeMarkRepository} from "../../../field/opponent/attribute_mark/repository/OpponentFieldCardAttributeMarkRepository";
import {OpponentFieldCardAttributeMarkSceneRepository} from "../../../field/opponent/attribute_mark_scene/repository/OpponentFieldCardAttributeMarkSceneRepository";
import {LeftClickHandDetectRepository} from "../../../../left_click_detect/repository/LeftClickHandDetectRepository";
import {ActivePanelAreaCache} from "../../../active_panel/cache/ActivePanelAreaCache";
import {NeonBorderRepository} from "../../../../neon_border/repository/NeonBorderRepository";
import {NeonBorderLineSceneRepository} from "../../../../neon_border_line_scene/repository/NeonBorderLineSceneRepository";

import {NeonBorderHandler} from "../../../../neon_border/handler/NeonBorderHandler";

import {AttributeMarkPositionCalculator} from "../../../../common/attribute_mark/AttributeMarkPositionCalculator";
import {
    BattleFieldCardPositionStoreImpl
} from "../../position/store/BattleFieldCardPositionStoreImpl";
import {
    BattleFieldCardSceneCacheImpl
} from "../../scene/cache/BattleFieldCardSceneCacheImpl";
import {
    BattleFieldCardPositionStore
} from "../../position/store/BattleFieldCardPositionStore";
import {BattleFieldCardSceneCache} from "../../scene/cache/BattleFieldCardSceneCache";
import {Vector2d} from "../../../../common/math/Vector2d";
import {BattleFieldConstants} from "../../../../common/BattleFieldConstants";
import chalk from "chalk";
import {BattleFieldCardScene} from "../../scene/entity/BattleFieldCardScene";
import {NeonBorderSceneType} from "../../../../neon_border/entity/NeonBorderSceneType";
import {
    BattleFieldCardAttributeMarkPositionStore
} from "../../attribute_mark_position/store/BattleFieldCardAttributeMarkPositionStore";
import {
    BattleFieldCardAttributeMarkPositionStoreImpl
} from "../../attribute_mark_position/store/BattleFieldCardAttributeMarkPositionStoreImpl";
import {
    NeonBorderLinePositionRepository
} from "../../../../neon_border_line_position/repository/NeonBorderLinePositionRepository";
import {
    NeonBorderLinePositionRepositoryImpl
} from "../../../../neon_border_line_position/repository/NeonBorderLinePositionRepositoryImpl";
import {FieldCard} from "../../../domain/FieldCard";
import {BattleFieldHandPageStore} from "../../../hand/page/store/BattleFieldHandPageStore";
import {BattleFieldHandPageStoreImpl} from "../../../hand/page/store/BattleFieldHandPageStoreImpl";
import {BattleFieldCardPosition} from "../../position/entity/BattleFieldCardPosition";
import {HandCard} from "../../../domain/HandCard";

export class BattleFieldCardAlignHandler {
    private static instance: BattleFieldCardAlignHandler;

    private dragMoveRepository: DragMoveRepository;

    private battleFieldHandPageStore: BattleFieldHandPageStore;
    private battleFieldCardPositionStore: BattleFieldCardPositionStore
    private battleFieldCardSceneCache: BattleFieldCardSceneCache

    private battleFieldCardAttributeMarkStore: BattleFieldCardAttributeMarkStore;
    private battleFieldCardAttributeMarkSceneCache: BattleFieldCardAttributeMarkSceneCache;
    private battleFieldCardAttributeMarkPositionStore: BattleFieldCardAttributeMarkPositionStore;

    private neonBorderRepository: NeonBorderRepository;
    private neonBorderLineSceneRepository: NeonBorderLineSceneRepository;
    private neonBorderLinePositionRepository: NeonBorderLinePositionRepository;

    private constructor() {
        this.dragMoveRepository = DragMoveRepositoryImpl.getInstance();

        this.battleFieldHandPageStore = BattleFieldHandPageStoreImpl.getInstance();
        this.battleFieldCardPositionStore = BattleFieldCardPositionStoreImpl.getInstance()
        this.battleFieldCardSceneCache = BattleFieldCardSceneCacheImpl.getInstance()

        this.battleFieldCardAttributeMarkStore = BattleFieldCardAttributeMarkStoreImpl.getInstance();
        this.battleFieldCardAttributeMarkSceneCache = BattleFieldCardAttributeMarkSceneCacheImpl.getInstance();
        this.battleFieldCardAttributeMarkPositionStore = BattleFieldCardAttributeMarkPositionStoreImpl.getInstance();

        this.neonBorderRepository = NeonBorderRepositoryImpl.getInstance();
        this.neonBorderLineSceneRepository = NeonBorderLineSceneRepositoryImpl.getInstance();
        this.neonBorderLinePositionRepository = NeonBorderLinePositionRepositoryImpl.getInstance();
    }

    public static getInstance(): BattleFieldCardAlignHandler {
        if (!BattleFieldCardAlignHandler.instance) {
            BattleFieldCardAlignHandler.instance = new BattleFieldCardAlignHandler();
        }
        return BattleFieldCardAlignHandler.instance;
    }

    async alignHandCard(visible: boolean = true): Promise<void> {
        const currentPage = this.battleFieldHandPageStore.getCurrentPage();
        const cardsPerPage = this.battleFieldHandPageStore.getCardsPerPage();

        // 몇 장씩 나눠 보여줄지는 화면이 정한다. 전투는 목록만 준다.
        const startIndex = (currentPage - 1) * cardsPerPage;
        const currentHandCardList = BattleRepositoryImpl.getInstance().getCurrentOrThrow()
            .getHandCards().slice(startIndex, startIndex + cardsPerPage);

        await Promise.all(
            currentHandCardList.map((handCard, index) =>
                this.alignPaginatedHandCard(handCard, index, visible)
            )
        );
    }

    private async alignPaginatedHandCard(
        handCard: HandCard,
        index: number,
        visible: boolean = true
    ): Promise<void> {
        console.log(`alignHandCard() -> index: ${index}`);

        const calculatedPosition = this.calculateHandPositionByIndex(index);
        const positionId = handCard.getPositionId();
        const cardSceneId = handCard.getBattleCardId();

        const cardPosition = this.battleFieldCardPositionStore.findById(positionId);
        const mainCardScene = await this.battleFieldCardSceneCache.findById(cardSceneId);

        if (!cardPosition) {
            console.error(`Position not found for Card Scene ID: ${cardSceneId}, PositionId: ${positionId}`);
            return;
        }

        if (!mainCardScene) {
            console.error(`Scene not found for Card Scene ID: ${cardSceneId}`);
            return;
        }

        // 카드 위치 업데이트
        cardPosition.setPosition(calculatedPosition.getX(), calculatedPosition.getY());

        const mainCardSceneMesh = mainCardScene.getMesh();
        if (mainCardSceneMesh) {
            mainCardSceneMesh.position.x = calculatedPosition.getX();
            mainCardSceneMesh.position.y = calculatedPosition.getY();
            mainCardSceneMesh.visible = visible;
        } else {
            console.error(`Mesh not found for Card Scene ID: ${cardSceneId}`);
        }

        // NeonBorder 위치 재설정 호출
        this.resetNeonPosition(cardSceneId, mainCardScene, calculatedPosition);

        // Attribute Mark 처리
        await this.alignAttributeMarks(handCard, calculatedPosition, visible);
    }

    private async alignAttributeMarks(
        handCard: HandCard,
        calculatedPosition: Vector2d,
        visible: boolean = true
    ): Promise<void> {
        const attributeMarkList = handCard.getAttributeMarkIds();
        if (!attributeMarkList) {
            console.error(`attributeMarkList 없다: ${attributeMarkList}`);
            return;
        }

        await Promise.all(attributeMarkList.map(async (attributeMarkId: number) => {
            try {
                const attributeMark = await this.battleFieldCardAttributeMarkStore.findById(attributeMarkId);
                if (!attributeMark) {
                    console.error(`AttributeMark not found for ID: ${attributeMarkId}`);
                    return;
                }

                const attributeMarkPosition =
                    await this.battleFieldCardAttributeMarkPositionStore.findById(attributeMark.attributeMarkPositionId);
                if (!attributeMarkPosition) {
                    console.error(`AttributeMarkPosition not found for ID: ${attributeMark.attributeMarkPositionId}`);
                    return;
                }

                const attributeMarkScene =
                    await this.battleFieldCardAttributeMarkSceneCache.findById(attributeMark.attributeMarkSceneId);
                if (!attributeMarkScene) {
                    console.error(`AttributeMarkScene not found for ID: ${attributeMark.attributeMarkSceneId}`);
                    return;
                }

                const attributeMesh = attributeMarkScene.getMesh();
                if (attributeMesh) {
                    const markSceneType = attributeMarkScene.getMarkSceneType();

                    const calculatedAttributeMarkPosition =
                        AttributeMarkPositionCalculator.getPositionForType(
                            markSceneType,
                            calculatedPosition,
                            BattleFieldConstants.CARD_WIDTH_RATIO,
                            BattleFieldConstants.CARD_HEIGHT_RATIO
                        );

                    attributeMesh.position.x = calculatedAttributeMarkPosition.getX();
                    attributeMesh.position.y = calculatedAttributeMarkPosition.getY();
                    attributeMesh.visible = visible;

                    attributeMarkPosition.setPosition(
                        calculatedAttributeMarkPosition.getX(),
                        calculatedAttributeMarkPosition.getY()
                    );
                } else {
                    console.error(`Mesh not found for AttributeMarkScene ID: ${attributeMark.attributeMarkSceneId}`);
                }
            } catch (error) {
                console.error(`Error processing AttributeMark ID: ${attributeMarkId}`, error);
            }
        }));
    }

    private calculateHandPositionByIndex(index: number): Vector2d {
        const handPositionX = (BattleFieldConstants.HAND_INITIAL_X + index * BattleFieldConstants.GAP_OF_EACH_CARD) * window.innerWidth;
        const handPositionY = BattleFieldConstants.HAND_INITIAL_Y * window.innerHeight
            + (BattleFieldConstants.CARD_HEIGHT_RATIO * BattleFieldConstants.HALF * window.innerWidth);
        return new Vector2d(handPositionX, handPositionY);
    }

    private resetNeonPosition(cardSceneId: number, mainCardScene: any, calculatedPosition: Vector2d): void {
        console.log(chalk.red.bold(`resetNeonPosition`))
        const selectedObject = this.dragMoveRepository.getSelectedObject();
        if (!selectedObject) {
            console.log("No object selected.");
            return;
        }

        if (selectedObject instanceof BattleFieldCardScene) {
            if (cardSceneId === selectedObject.getId()) {
                console.log(chalk.red.bold(`Current CardSceneId: ${cardSceneId}, selectedObject: ${selectedObject.getId()}`));
                return;
            }
        }

        console.log(`Resetting neon position for cardSceneId: ${cardSceneId}`);

        // NeonBorderRepository에서 cardSceneId를 사용해 NeonBorder 찾기
        // const neonBorder = this.neonBorderRepository.findById(cardSceneId);
        const neonBorder = this.neonBorderRepository.findByCardSceneIdWithSceneType(cardSceneId, NeonBorderSceneType.HAND);

        if (!neonBorder) {
            console.log(`NeonBorder not found for cardSceneId: ${cardSceneId}`);
            return;
        }

        // mainCardScene과 calculatedPosition으로 새로운 위치 계산
        const halfWidth = (BattleFieldConstants.CARD_WIDTH_RATIO * window.innerWidth) / 2;
        const halfHeight = (BattleFieldConstants.CARD_HEIGHT_RATIO * window.innerWidth) / 2;

        const startX = calculatedPosition.getX() - halfWidth;
        const startY = calculatedPosition.getY() - halfHeight;
        const width = BattleFieldConstants.CARD_WIDTH_RATIO * window.innerWidth;
        const height = BattleFieldConstants.CARD_HEIGHT_RATIO * window.innerWidth;

        console.log(`Calculated position - StartX: ${startX}, StartY: ${startY}, Width: ${width}, Height: ${height}`);

        // NeonBorder의 각 neonBorderLineSceneIdList와 neonBorderLinePositionIdList를 기반으로 업데이트
        const lineSceneIds = neonBorder.getNeonBorderLineSceneIdList();
        const positionIds = neonBorder.getNeonBorderLinePositionIdList();

        lineSceneIds.forEach((sceneId: number, index: number) => {
            const lineScene = this.neonBorderLineSceneRepository.findById(sceneId);
            const position = this.neonBorderLinePositionRepository.findById(positionIds[index]);

            if (!lineScene || !position) {
                console.error(`Failed to find lineScene or position for SceneId: ${sceneId}, PositionId: ${positionIds[index]}`);
                return;
            }

            // 새로운 위치 계산
            const line = lineScene.getLine();
            const newLinePosition = this.calculateLinePosition(index, startX, startY, width, height);

            if (line) {
                // Line의 실제 Scene에 위치 적용
                line.position.set(newLinePosition.getX(), newLinePosition.getY(), 0);
                console.log(`Updated NeonBorderLine position for SceneId: ${sceneId}`);
                line.visible = false;
            }

            // Position 데이터에도 위치 정보 업데이트
            position.setPosition(newLinePosition);
            this.neonBorderLinePositionRepository.save(position);
        });

        console.log(`Neon position reset complete for cardSceneId: ${cardSceneId}`);
    }

    private calculateLinePosition(index: number, startX: number, startY: number, width: number, height: number): Vector2d {
        const offset = 5.0;

        switch (index) {
            case 0: // Top line
                return new Vector2d(startX + width / 2, startY);
            case 1: // Right line
                return new Vector2d(startX + width, startY + height / 2 - offset / 2);
            case 2: // Bottom line
                return new Vector2d(startX + width / 2, startY + height);
            case 3: // Left line
                return new Vector2d(startX, startY + height / 2 - offset / 2);
            default:
                console.error(`Invalid line index: ${index}`);
                return new Vector2d(startX, startY);
        }
    }

    public async alignYourFieldAttributeMark(createdYourField: FieldCard): Promise<void> {
        const yourFieldAttributeMarkSceneIdList = createdYourField.getAttributeMarkIds();
        console.log(`alignYourField() yourFieldAttributeMarkSceneIdList: ${yourFieldAttributeMarkSceneIdList}`);

        for (const attributeMarkId of yourFieldAttributeMarkSceneIdList) {
            // BattleFieldCardAttributeMark 객체를 비동기적으로 가져오기
            const attributeMark = await this.battleFieldCardAttributeMarkStore.findById(attributeMarkId);
            console.log(`alignYourField() attributeMark: ${attributeMark}`);
            if (!attributeMark) {
                console.error(`AttributeMark을 찾을 수 없습니다. id: ${attributeMarkId}`);
                continue; // attributeMarkId가 없으면 다음 attributeMarkId로 넘어갑니다
            }

            // attributeMark을 처리하는 부분 (예: 위치 업데이트)
            const attributeMarkPositionId = attributeMark.attributeMarkPositionId;
            const attributeMarkPosition = await this.battleFieldCardAttributeMarkPositionStore.findById(attributeMarkPositionId);
            if (!attributeMarkPosition) {
                console.error(`AttributeMarkPosition을 찾을 수 없습니다. id: ${attributeMarkPositionId}`);
                continue; // 위치가 없으면 다음 iteration으로 넘어갑니다
            }

            // 예시: attributeMarkPosition으로 mesh 위치 업데이트
            const attributeMarkSceneId = attributeMark.attributeMarkSceneId;
            const attributeMarkScene = await this.battleFieldCardAttributeMarkSceneCache.findById(attributeMarkSceneId);
            if (!attributeMarkScene) {
                console.error(`AttributeMarkScene을 찾을 수 없습니다. id: ${attributeMarkSceneId}`);
                continue; // Scene을 찾을 수 없으면 다음으로 넘어갑니다
            }

            // attributeMarkPosition에서 위치 데이터 {x, y, z}를 가져온다고 가정
            const mesh = attributeMarkScene.getMesh();
            const markSceneType = attributeMarkScene.getMarkSceneType();

            if (mesh) {
                const yourFieldPositionId = createdYourField.getPositionId()
                const cardPosition = this.battleFieldCardPositionStore.findById(yourFieldPositionId)

                if (!cardPosition) {
                    console.error(`yourFieldPosition을 찾을 수 없습니다: ${cardPosition}`);
                    return;
                }

                const cardPositionVector2d = cardPosition.getPosition()

                const calculatedPosition = AttributeMarkPositionCalculator.getPositionForType(
                    markSceneType, cardPositionVector2d, BattleFieldConstants.CARD_WIDTH_RATIO, BattleFieldConstants.CARD_HEIGHT_RATIO);

                const x = calculatedPosition.getX();
                const y = calculatedPosition.getY();

                mesh.position.set(x, y, 0); // mesh의 위치를 업데이트
                // console.log(`mesh의 위치가 업데이트되었습니다. id: ${attributeMarkSceneId}`);

                attributeMarkPosition.setPosition(x, y);

                // 업데이트된 position을 다시 저장
                await this.battleFieldCardAttributeMarkPositionStore.save(attributeMarkPosition);
                // console.log(`attributeMarkPosition이 업데이트되었습니다. id: ${attributeMarkPositionId}`);
            }
        }
    }
}