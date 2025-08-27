import * as THREE from "three";

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

import {NeonBorderHandler} from "../../neon_border/handler/NeonBorderHandler";

import {AttributeMarkPositionCalculator} from "../../common/attribute_mark/AttributeMarkPositionCalculator";
import {BattleFieldHandRepositoryImpl} from "../../battle_field_hand/repository/BattleFieldHandRepositoryImpl";
import {
    BattleFieldHandCardPositionRepositoryImpl
} from "../../battle_field_card_position/repository/BattleFieldHandCardPositionRepositoryImpl";
import {
    BattleFieldCardSceneRepositoryImpl
} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepositoryImpl";
import {BattleFieldHandRepository} from "../../battle_field_hand/repository/BattleFieldHandRepository";
import {
    BattleFieldHandCardPositionRepository
} from "../../battle_field_card_position/repository/BattleFieldHandCardPositionRepository";
import {BattleFieldCardSceneRepository} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepository";
import {Vector2d} from "../../common/math/Vector2d";
import {BattleFieldConstants} from "../../common/BattleFieldConstants";
import chalk from "chalk";
import {BattleFieldCardScene} from "../../battle_field_card_scene/entity/BattleFieldCardScene";
import {NeonBorderSceneType} from "../../neon_border/entity/NeonBorderSceneType";
import {
    BattleFieldCardAttributeMarkPositionRepository
} from "../../battle_field_card_attribute_mark_position/repository/BattleFieldCardAttributeMarkPositionRepository";
import {
    BattleFieldCardAttributeMarkPositionRepositoryImpl
} from "../../battle_field_card_attribute_mark_position/repository/BattleFieldCardAttributeMarkPositionRepositoryImpl";
import {
    NeonBorderLinePositionRepository
} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepository";
import {
    NeonBorderLinePositionRepositoryImpl
} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepositoryImpl";
import {YourField} from "../../your_field/entity/YourField";
import {BattleFieldHandPageRepository} from "../../battle_field_hand_page/repository/BattleFieldHandPageRepository";
import {BattleFieldHandPageRepositoryImpl} from "../../battle_field_hand_page/repository/BattleFieldHandPageRepositoryImpl";
import {BattleFieldCardPosition} from "../../battle_field_card_position/entity/BattleFieldCardPosition";
import {BattleFieldHand} from "../../battle_field_hand/entity/BattleFieldHand";

export class BattleFieldCardAlignHandler {
    private static instance: BattleFieldCardAlignHandler;

    private dragMoveRepository: DragMoveRepository;

    private battleFieldHandPageRepository: BattleFieldHandPageRepository;

    private battleFieldHandRepository: BattleFieldHandRepository
    private battleFieldHandCardPositionRepository: BattleFieldHandCardPositionRepository
    private battleFieldCardSceneRepository: BattleFieldCardSceneRepository

    private battleFieldCardAttributeMarkRepository: BattleFieldCardAttributeMarkRepository;
    private battleFieldCardAttributeMarkSceneRepository: BattleFieldCardAttributeMarkSceneRepository;
    private battleFieldCardAttributeMarkPositionRepository: BattleFieldCardAttributeMarkPositionRepository;

    private neonBorderRepository: NeonBorderRepository;
    private neonBorderLineSceneRepository: NeonBorderLineSceneRepository;
    private neonBorderLinePositionRepository: NeonBorderLinePositionRepository;

    private constructor() {
        this.dragMoveRepository = DragMoveRepositoryImpl.getInstance();

        this.battleFieldHandPageRepository = BattleFieldHandPageRepositoryImpl.getInstance();

        this.battleFieldHandRepository = BattleFieldHandRepositoryImpl.getInstance()
        this.battleFieldHandCardPositionRepository = BattleFieldHandCardPositionRepositoryImpl.getInstance()
        this.battleFieldCardSceneRepository = BattleFieldCardSceneRepositoryImpl.getInstance()

        this.battleFieldCardAttributeMarkRepository = BattleFieldCardAttributeMarkRepositoryImpl.getInstance();
        this.battleFieldCardAttributeMarkSceneRepository = BattleFieldCardAttributeMarkSceneRepositoryImpl.getInstance();
        this.battleFieldCardAttributeMarkPositionRepository = BattleFieldCardAttributeMarkPositionRepositoryImpl.getInstance();

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
        const currentPage = this.battleFieldHandPageRepository.getCurrentPage();
        const cardsPerPage = this.battleFieldHandPageRepository.getCardsPerPage();

        const currentHandCardList = this.battleFieldHandRepository.findAllWithPage(currentPage, cardsPerPage);

        await Promise.all(
            currentHandCardList.map((handCard, index) =>
                this.alignPaginatedHandCard(handCard, index, visible)
            )
        );
    }

    private async alignPaginatedHandCard(
        handCard: BattleFieldHand,
        index: number,
        visible: boolean = true
    ): Promise<void> {
        console.log(`alignHandCard() -> index: ${index}`);

        const calculatedPosition = this.calculateHandPositionByIndex(index);
        const positionId = handCard.getPositionId();
        const cardSceneId = handCard.getCardSceneId();

        const cardPosition = this.battleFieldHandCardPositionRepository.findById(positionId);
        const mainCardScene = await this.battleFieldCardSceneRepository.findById(cardSceneId);

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
        handCard: BattleFieldHand,
        calculatedPosition: Vector2d,
        visible: boolean = true
    ): Promise<void> {
        const attributeMarkList = handCard.getAttributeMarkIdList();
        if (!attributeMarkList) {
            console.error(`attributeMarkList 없다: ${attributeMarkList}`);
            return;
        }

        await Promise.all(attributeMarkList.map(async (attributeMarkId: number) => {
            try {
                const attributeMark = await this.battleFieldCardAttributeMarkRepository.findById(attributeMarkId);
                if (!attributeMark) {
                    console.error(`AttributeMark not found for ID: ${attributeMarkId}`);
                    return;
                }

                const attributeMarkPosition =
                    await this.battleFieldCardAttributeMarkPositionRepository.findById(attributeMark.attributeMarkPositionId);
                if (!attributeMarkPosition) {
                    console.error(`AttributeMarkPosition not found for ID: ${attributeMark.attributeMarkPositionId}`);
                    return;
                }

                const attributeMarkScene =
                    await this.battleFieldCardAttributeMarkSceneRepository.findById(attributeMark.attributeMarkSceneId);
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

    public async alignYourFieldAttributeMark(createdYourField: YourField): Promise<void> {
        const yourFieldAttributeMarkSceneIdList = createdYourField.getAttributeMarkIdList();
        console.log(`alignYourField() yourFieldAttributeMarkSceneIdList: ${yourFieldAttributeMarkSceneIdList}`);

        for (const attributeMarkId of yourFieldAttributeMarkSceneIdList) {
            // BattleFieldCardAttributeMark 객체를 비동기적으로 가져오기
            const attributeMark = await this.battleFieldCardAttributeMarkRepository.findById(attributeMarkId);
            console.log(`alignYourField() attributeMark: ${attributeMark}`);
            if (!attributeMark) {
                console.error(`AttributeMark을 찾을 수 없습니다. id: ${attributeMarkId}`);
                continue; // attributeMarkId가 없으면 다음 attributeMarkId로 넘어갑니다
            }

            // attributeMark을 처리하는 부분 (예: 위치 업데이트)
            const attributeMarkPositionId = attributeMark.attributeMarkPositionId;
            const attributeMarkPosition = await this.battleFieldCardAttributeMarkPositionRepository.findById(attributeMarkPositionId);
            if (!attributeMarkPosition) {
                console.error(`AttributeMarkPosition을 찾을 수 없습니다. id: ${attributeMarkPositionId}`);
                continue; // 위치가 없으면 다음 iteration으로 넘어갑니다
            }

            // 예시: attributeMarkPosition으로 mesh 위치 업데이트
            const attributeMarkSceneId = attributeMark.attributeMarkSceneId;
            const attributeMarkScene = await this.battleFieldCardAttributeMarkSceneRepository.findById(attributeMarkSceneId);
            if (!attributeMarkScene) {
                console.error(`AttributeMarkScene을 찾을 수 없습니다. id: ${attributeMarkSceneId}`);
                continue; // Scene을 찾을 수 없으면 다음으로 넘어갑니다
            }

            // attributeMarkPosition에서 위치 데이터 {x, y, z}를 가져온다고 가정
            const mesh = attributeMarkScene.getMesh();
            const markSceneType = attributeMarkScene.getMarkSceneType();

            if (mesh) {
                const yourFieldPositionId = createdYourField.getPositionId()
                const cardPosition = this.battleFieldHandCardPositionRepository.findById(yourFieldPositionId)

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
                await this.battleFieldCardAttributeMarkPositionRepository.save(attributeMarkPosition);
                // console.log(`attributeMarkPosition이 업데이트되었습니다. id: ${attributeMarkPositionId}`);
            }
        }
    }
}