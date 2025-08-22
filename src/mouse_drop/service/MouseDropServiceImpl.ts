import * as THREE from 'three';
import {MouseDropService} from './MouseDropService';
import {MouseDropFieldRepositoryImpl} from "../repository/MouseDropRepositoryImpl";
import {MouseDropFieldRepository} from "../repository/MouseDropRepository";
import {DragMoveRepository} from "../../drag_move/repository/DragMoveRepository";
import {DragMoveRepositoryImpl} from "../../drag_move/repository/DragMoveRepositoryImpl";
import {BattleFieldCardScene} from "../../battle_field_card_scene/entity/BattleFieldCardScene";
import {BattleFieldHandRepository} from "../../battle_field_hand/repository/BattleFieldHandRepository";
import {BattleFieldHandRepositoryImpl} from "../../battle_field_hand/repository/BattleFieldHandRepositoryImpl";
import {BattleFieldCardAttributeMarkRepository} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepository";
import {BattleFieldCardAttributeMarkRepositoryImpl} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepositoryImpl";
import {BattleFieldCardAttributeMark} from "../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMark";
import {BattleFieldCardAttributeMarkPositionRepository} from "../../battle_field_card_attribute_mark_position/repository/BattleFieldCardAttributeMarkPositionRepository";
import {BattleFieldCardAttributeMarkPositionRepositoryImpl} from "../../battle_field_card_attribute_mark_position/repository/BattleFieldCardAttributeMarkPositionRepositoryImpl";
import {BattleFieldHandCardPositionRepositoryImpl} from "../../battle_field_card_position/repository/BattleFieldHandCardPositionRepositoryImpl";
import {BattleFieldHandCardPositionRepository} from "../../battle_field_card_position/repository/BattleFieldHandCardPositionRepository";
import {BattleFieldCardPosition} from "../../battle_field_card_position/entity/BattleFieldCardPosition";
import {BattleFieldCardAttributeMarkSceneRepositoryImpl} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepositoryImpl";
import {BattleFieldCardAttributeMarkSceneRepository} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepository";
import {YourFieldRepositoryImpl} from "../../your_field/repository/YourFieldRepositoryImpl";
import {YourFieldRepository} from "../../your_field/repository/YourFieldRepository";
import {getCardById} from "../../card/utility";
import {CardKind} from "../../card/kind";
import {BattleFieldCardSceneRepository} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepository";
import {BattleFieldCardSceneRepositoryImpl} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepositoryImpl";
import {YourFieldCardSceneRepository} from "../../your_field_card_scene/repository/YourFieldCardSceneRepository";
import {YourFieldCardSceneRepositoryImpl} from "../../your_field_card_scene/repository/YourFieldCardSceneRepositoryImpl";
import {YourFieldCardPositionRepository} from "../../your_field_card_position/repository/YourFieldCardPositionRepository";
import {YourFieldCardPositionRepositoryImpl} from "../../your_field_card_position/repository/YourFieldCardPositionRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";
import {AttributeMarkPositionCalculator} from "../../common/attribute_mark/AttributeMarkPositionCalculator";
import {YourField} from "../../your_field/entity/YourField";
import {NeonBorderRepository} from "../../neon_border/repository/NeonBorderRepository";
import {NeonBorderLineSceneRepository} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepository";
import {NeonBorderRepositoryImpl} from "../../neon_border/repository/NeonBorderRepositoryImpl";
import {NeonBorderLineSceneRepositoryImpl} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepositoryImpl";
import {NeonBorderLinePositionRepository} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepository";
import {NeonBorderLinePositionRepositoryImpl} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepositoryImpl";
import {NeonBorderSceneType} from "../../neon_border/entity/NeonBorderSceneType";
import chalk from "chalk";
import {NeonBorderType} from "../../neon_border/entity/NeonBorderType";
import {BattleFieldConstants} from "../../common/BattleFieldConstants";

export class MouseDropServiceImpl implements MouseDropService {
    private static instance: MouseDropServiceImpl | null = null;

    private readonly HALF: number = BattleFieldConstants.HALF;
    private readonly GAP_OF_EACH_CARD: number = BattleFieldConstants.GAP_OF_EACH_CARD;
    private readonly HAND_X_CRITERIA: number = BattleFieldConstants.HAND_X_CRITERIA;
    // 0.862217 + 0.06493506493 * 1.615 = 0.1048701
    // 0.862217 + 0.1048701
    private readonly HAND_Y_CRITERIA: number = BattleFieldConstants.HAND_Y_CRITERIA;
    private readonly HAND_INITIAL_X: number = this.HAND_X_CRITERIA - this.HALF;
    private readonly HAND_INITIAL_Y: number = this.HALF - this.HAND_Y_CRITERIA;

    private readonly CARD_WIDTH_RATIO: number = BattleFieldConstants.CARD_WIDTH_RATIO;
    private readonly CARD_HEIGHT_RATIO: number = this.CARD_WIDTH_RATIO * 1.615

    private readonly YOUR_FIELD_X_CRITERIA: number = BattleFieldConstants.YOUR_FIELD_X_CRITERIA
    // private readonly YOUR_FIELD_Y_CRITERIA: number = 0.972107
    // private readonly YOUR_FIELD_Y_CRITERIA: number = 0.328463
    private readonly YOUR_FIELD_Y_CRITERIA: number = BattleFieldConstants.YOUR_FIELD_Y_CRITERIA
    // private readonly YOUR_FIELD_Y_CRITERIA: number = 0.770721
    private readonly YOUR_FIELD_INITIAL_X: number = this.YOUR_FIELD_X_CRITERIA - this.HALF
    private readonly YOUR_FIELD_INITIAL_Y: number = this.HALF - this.YOUR_FIELD_Y_CRITERIA - this.CARD_HEIGHT_RATIO;

    private raycaster: THREE.Raycaster;
    private mouseDropFieldRepository: MouseDropFieldRepository;
    private dragMoveRepository: DragMoveRepository;

    private battleFieldHandRepository: BattleFieldHandRepository
    private battleFieldHandCardPositionRepository: BattleFieldHandCardPositionRepository
    private battleFieldCardSceneRepository: BattleFieldCardSceneRepository

    private battleFieldCardAttributeMarkRepository: BattleFieldCardAttributeMarkRepository
    private battleFieldCardAttributeMarkPositionRepository: BattleFieldCardAttributeMarkPositionRepository
    private battleFieldCardAttributeMarkSceneRepository: BattleFieldCardAttributeMarkSceneRepository

    private yourFieldRepository: YourFieldRepository
    private yourFieldCardSceneRepository: YourFieldCardSceneRepository
    private yourFieldCardPositionRepository: YourFieldCardPositionRepository

    private neonBorderRepository: NeonBorderRepository;
    private neonBorderLineSceneRepository: NeonBorderLineSceneRepository;
    private neonBorderLinePositionRepository: NeonBorderLinePositionRepository;

    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.mouseDropFieldRepository = MouseDropFieldRepositoryImpl.getInstance();
        this.dragMoveRepository = DragMoveRepositoryImpl.getInstance()

        this.battleFieldHandRepository = BattleFieldHandRepositoryImpl.getInstance()
        this.battleFieldHandCardPositionRepository = BattleFieldHandCardPositionRepositoryImpl.getInstance()
        this.battleFieldCardSceneRepository = BattleFieldCardSceneRepositoryImpl.getInstance()

        this.battleFieldCardAttributeMarkRepository = BattleFieldCardAttributeMarkRepositoryImpl.getInstance()
        this.battleFieldCardAttributeMarkPositionRepository = BattleFieldCardAttributeMarkPositionRepositoryImpl.getInstance()
        this.battleFieldCardAttributeMarkSceneRepository = BattleFieldCardAttributeMarkSceneRepositoryImpl.getInstance()

        this.yourFieldRepository = YourFieldRepositoryImpl.getInstance()
        this.yourFieldCardSceneRepository = YourFieldCardSceneRepositoryImpl.getInstance()
        this.yourFieldCardPositionRepository = YourFieldCardPositionRepositoryImpl.getInstance()

        this.neonBorderRepository = NeonBorderRepositoryImpl.getInstance()
        this.neonBorderLineSceneRepository = NeonBorderLineSceneRepositoryImpl.getInstance()
        this.neonBorderLinePositionRepository = NeonBorderLinePositionRepositoryImpl.getInstance()
    }

    public static getInstance(): MouseDropServiceImpl {
        if (!MouseDropServiceImpl.instance) {
            MouseDropServiceImpl.instance = new MouseDropServiceImpl();
        }
        return MouseDropServiceImpl.instance;
    }

    public async onMouseUp(): Promise<void> {
        const selectedObject = this.dragMoveRepository.getSelectedObject();
        if (!selectedObject) {
            console.log("No object selected.");
            return;
        }

        if (this.mouseDropFieldRepository.isYourFieldAreaDropped(selectedObject, this.raycaster)) {
            console.log("Dropped inside YourFieldArea.");
            if (selectedObject instanceof BattleFieldCardScene) {
                const createdYourField = await this.handleValidDrop(selectedObject);

                if (createdYourField) {
                    await this.alignHandCard();
                    this.alignYourField(createdYourField);
                    await this.alignYourFieldAttributeMark(createdYourField)
                } else {
                    console.log("Failed to create YourField.");
                }
            }
        } else {
            console.log("Dropped outside YourFieldArea.");
            this.restoreOriginalPosition(selectedObject);
        }

        this.clearSelection();
    }

    private async alignYourFieldAttributeMark(createdYourField: YourField): Promise<void> {
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

                const calculatedPosition = AttributeMarkPositionCalculator.getPositionForType(markSceneType, cardPositionVector2d, this.CARD_WIDTH_RATIO, this.CARD_HEIGHT_RATIO);

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

    private alignYourField(createdYourField: YourField): void {
        console.log(`createdYourField: ${JSON.stringify(createdYourField, null, 2)}`)
        // x = 1920, y = 1848
        // (358, 607)
        const yourFieldCount = this.yourFieldRepository.count()
        console.log(`yourFieldCount: ${yourFieldCount}`)

        const calculatedYourFieldPosition = this.calculateYourFieldPositionByIndex(yourFieldCount - 1)
        const yourFieldPositionId = createdYourField.getPositionId()
        const cardPosition = this.battleFieldHandCardPositionRepository.findById(yourFieldPositionId)

        if (!cardPosition) {
            console.error(`yourFieldPosition: ${cardPosition}`);
            return;
        }

        const yourFieldSceneId = createdYourField.getCardSceneId()
        const yourFieldScene = this.yourFieldCardSceneRepository.findById(yourFieldSceneId)
        console.log(chalk.red.bold(`alignYourField() yourFieldScene: ${yourFieldScene}`))

        if (!yourFieldScene) {
            console.error(`yourFieldScene: ${yourFieldScene}`);
            return;
        }

        const yourFieldSceneMesh = yourFieldScene.getMesh()
        if (yourFieldSceneMesh) {
            const x = calculatedYourFieldPosition.getX()
            const y = calculatedYourFieldPosition.getY()

            // Update the mesh position
            yourFieldSceneMesh.position.x = x;
            yourFieldSceneMesh.position.y = y;

            cardPosition.setPosition(x, y);
            this.battleFieldHandCardPositionRepository.save(cardPosition);

            // TODO: yourFieldSceneId가 되면서 sceneId로 제어하던 일관성이 깨졌음
            this.repositionNeonBorder(yourFieldSceneId, x, y);
        } else {
            console.error(`Mesh not found`);
        }
    }

    private repositionNeonBorder(sceneId: number, x: number, y: number): void {
        const selectedObject = this.dragMoveRepository.getSelectedObject();
        const cardScene = selectedObject as unknown as BattleFieldCardScene;
        const cardSceneId = cardScene.getId();

        const neonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(cardSceneId, NeonBorderSceneType.HAND, NeonBorderType.ALLY);

        if (!neonBorder) {
            console.log(chalk.red.bold(`repositionNeonBorder() Neon Border not found for sceneId: ${cardSceneId}`));
            return;
        }

        const halfWidth = (this.CARD_WIDTH_RATIO * window.innerWidth) / 2;
        const halfHeight = (this.CARD_HEIGHT_RATIO * window.innerWidth) / 2;

        const startX = x - halfWidth;
        const startY = y - halfHeight;
        const width = this.CARD_WIDTH_RATIO * window.innerWidth;
        const height = this.CARD_HEIGHT_RATIO * window.innerWidth;

        console.log(chalk.red.bold(`repositionNeonBorder() neonBorder: ${JSON.stringify(neonBorder, null, 2)}`));
        console.log(chalk.red.bold(`repositionNeonBorder() Repositioning Neon Border for sceneId: ${sceneId}`));
        const lineSceneIds = neonBorder.getNeonBorderLineSceneIdList();
        const positionIds = neonBorder.getNeonBorderLinePositionIdList();

        lineSceneIds.forEach((lineSceneId: number, index: number) => {
            const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
            const position = this.neonBorderLinePositionRepository.findById(positionIds[index]);

            if (!lineScene || !position) {
                console.error(
                    `Failed to find lineScene or position for lineSceneId: ${lineSceneId}, positionId: ${positionIds[index]}`
                );
                return;
            }

            const line = lineScene.getLine();
            const newLinePosition = this.calculateLinePosition(index, startX, startY, width, height);

            if (line) {
                // Update the position of the line in the scene
                line.position.set(newLinePosition.getX(), newLinePosition.getY(), 0);
                line.visible = false;
            }

            // Update the position in the repository
            position.setPosition(newLinePosition);
            this.neonBorderLinePositionRepository.save(position);
        });

        neonBorder.neonBorderSceneType = NeonBorderSceneType.FIELD
        neonBorder.setNeonBorderSceneId(sceneId)

        console.log(`Neon Border reposition complete for sceneId: ${sceneId}`);
    }

    private calculateYourFieldPositionByIndex(index: number): Vector2d {
        const yourFieldPositionX = (this.YOUR_FIELD_INITIAL_X + index * this.GAP_OF_EACH_CARD) * window.innerWidth;
        const yourFieldPositionY = this.YOUR_FIELD_INITIAL_Y * window.innerHeight
            + (this.CARD_HEIGHT_RATIO * this.HALF * window.innerWidth);
        return new Vector2d(yourFieldPositionX, yourFieldPositionY);
    }

    private async alignHandCard(): Promise<void> {
        const currentHandCardList = this.battleFieldHandRepository.findAll();

        await Promise.all(currentHandCardList.map(async (handCard, index) => {
            console.log(`alignHandCard() -> index: ${index}`)

            const calculatedPosition = this.calculateHandPositionByIndex(index);
            const positionId = handCard.getPositionId();
            const cardSceneId = handCard.getCardSceneId();

            const cardPosition = this.battleFieldHandCardPositionRepository.findById(positionId);
            const mainCardScene = await this.battleFieldCardSceneRepository.findById(cardSceneId); // 비동기 처리

            if (!cardPosition) {
                console.error(`Position not found for Card Scene ID: ${handCard.getCardSceneId()}, PositionId: ${positionId}`);
                return;
            }

            if (!mainCardScene) {
                console.error(`Scene not found for Card Scene ID: ${handCard.getCardSceneId()}`);
                return;
            }

            // 카드 위치 업데이트
            cardPosition.setPosition(calculatedPosition.getX(), calculatedPosition.getY());
            // console.log(`Card Scene ID: ${handCard.getCardSceneId()}, New Position: (${calculatedPosition.getX()}, ${calculatedPosition.getY()})`);

            const mainCardSceneMesh = mainCardScene.getMesh();
            if (mainCardSceneMesh) {
                mainCardSceneMesh.position.x = calculatedPosition.getX();
                mainCardSceneMesh.position.y = calculatedPosition.getY();
                // console.log(`Mesh updated for Card Scene ID: ${handCard.getCardSceneId()}, Position: (${mainCardSceneMesh.position.x}, ${mainCardSceneMesh.position.y})`);
            } else {
                console.error(`Mesh not found for Card Scene ID: ${handCard.getCardSceneId()}`);
            }

            // NeonBorder 위치 재설정 호출
            console.log(`MouseDropService alignHandCard() -> cardSceneId: ${cardSceneId}`)
            this.resetNeonPosition(cardSceneId, mainCardScene, calculatedPosition);

            // Attribute Mark 업데이트
            const attributeMarkList = handCard.getAttributeMarkIdList();
            if (!attributeMarkList) {
                console.error(`attributeMarkList 없다: ${attributeMarkList}`);
                return;
            }
            console.log(`attributeMarkSceneList: ${attributeMarkList}`);

            // 각 attributeMarkSceneId에 대해 비동기 작업 처리
            await Promise.all(attributeMarkList.map(async (attributeMarkId) => {
                try {
                    const attributeMark = await this.battleFieldCardAttributeMarkRepository.findById(attributeMarkId); // 비동기 처리
                    if (!attributeMark) {
                        console.error(`AttributeMark not found for ID: ${attributeMarkId}`);
                        return;
                    }

                    const attributeMarkPosition = await this.battleFieldCardAttributeMarkPositionRepository.findById(attributeMark.attributeMarkPositionId);
                    if (!attributeMarkPosition) {
                        console.error(`AttributeMarkPosition not found for ID: ${attributeMark.attributeMarkPositionId}`);
                        return;
                    }

                    const attributeMarkScene = await this.battleFieldCardAttributeMarkSceneRepository.findById(attributeMark.attributeMarkSceneId); // Scene 가져오기
                    if (!attributeMarkScene) {
                        console.error(`AttributeMarkScene not found for ID: ${attributeMark.attributeMarkSceneId}`);
                        return;
                    }

                    const attributeMesh = attributeMarkScene.getMesh();
                    if (attributeMesh) {
                        const markSceneType = attributeMarkScene.getMarkSceneType();

                        // AttributeMarkPositionCalculator를 사용하여 위치 계산
                        const calculatedAttributeMarkPosition = AttributeMarkPositionCalculator.getPositionForType(
                            markSceneType,
                            calculatedPosition, // 여기서 calculatedPosition을 사용
                            this.CARD_WIDTH_RATIO,
                            this.CARD_HEIGHT_RATIO
                        );

                        // 계산된 위치로 attributeMesh의 포지션 업데이트
                        attributeMesh.position.x = calculatedAttributeMarkPosition.getX();
                        attributeMesh.position.y = calculatedAttributeMarkPosition.getY();

                        // attributeMarkPosition에 계산된 값 설정
                        attributeMarkPosition.setPosition(calculatedAttributeMarkPosition.getX(), calculatedAttributeMarkPosition.getY());

                        // console.log(`Attribute Mark Mesh updated for AttributeMarkScene ID: ${attributeMark.attributeMarkSceneId}`);
                    } else {
                        console.error(`Mesh not found for AttributeMarkScene ID: ${attributeMark.attributeMarkSceneId}`);
                    }
                } catch (error) {
                    console.error(`Error processing AttributeMark ID: ${attributeMarkId}`, error);
                }
            }));
        }));
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
        const halfWidth = (this.CARD_WIDTH_RATIO * window.innerWidth) / 2;
        const halfHeight = (this.CARD_HEIGHT_RATIO * window.innerWidth) / 2;

        const startX = calculatedPosition.getX() - halfWidth;
        const startY = calculatedPosition.getY() - halfHeight;
        const width = this.CARD_WIDTH_RATIO * window.innerWidth;
        const height = this.CARD_HEIGHT_RATIO * window.innerWidth;

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

    // BorderLine의 새로운 위치 계산 메서드
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

    private calculateHandPositionByIndex(index: number): Vector2d {
        const handPositionX = (this.HAND_INITIAL_X + index * this.GAP_OF_EACH_CARD) * window.innerWidth;
        const handPositionY = this.HAND_INITIAL_Y * window.innerHeight
            + (this.CARD_HEIGHT_RATIO * this.HALF * window.innerWidth);
        return new Vector2d(handPositionX, handPositionY);
    }

    private async handleValidDrop(selectedObject: BattleFieldCardScene): Promise<YourField> {
        const cardSceneId = selectedObject.getId()

        const willBePlacedYourFieldHandCard = this.battleFieldHandRepository.findByCardSceneId(cardSceneId);

        const cardId = willBePlacedYourFieldHandCard?.getCardId() ?? 0; // 기본값 0
        const card = getCardById(cardId)

        if (!card) {
            console.error(`Card not found for cardId: ${cardId}`);
            throw new Error(`Card not found for cardId: ${cardId}`);
        }

        const cardKind = parseInt(card.종류, 10) as CardKind;

        if (cardKind !== CardKind.UNIT) {
            this.restoreOriginalPosition(selectedObject as unknown as THREE.Object3D);
            throw new Error('유닛이 아닙니다')
        }

        // UNIT 카드에 대한 처리 로직
        console.log("Handling UNIT card:", card);

        const positionId = willBePlacedYourFieldHandCard?.getPositionId() ?? 0; // 기본값 0
        const attributeMarkIdList = willBePlacedYourFieldHandCard?.getAttributeMarkIdList() ?? [];

        const handCardIndex = this.battleFieldHandRepository.findCardIndexByCardSceneId(cardSceneId)
        if (handCardIndex === null) {
            throw new Error(`sceneId ${cardSceneId} 존재하지 않음`);
        }

        let yourFieldCardScene;
        const willBePlaceYourFieldCardScene = this.battleFieldCardSceneRepository.extractByIndex(handCardIndex)
        const willBePlaceYourFieldCardSceneMesh = willBePlaceYourFieldCardScene?.getMesh()

        if (willBePlaceYourFieldCardSceneMesh) {
            yourFieldCardScene = await this.yourFieldCardSceneRepository.create(willBePlaceYourFieldCardSceneMesh);
        }

        if (!yourFieldCardScene) {
            throw new Error("yourFieldCardScene이 생성되지 않았습니다.");
        }

        const createdYourField = this.yourFieldRepository.save(yourFieldCardScene.getId(), positionId, attributeMarkIdList, cardId);
        console.log(`handleValidDrop() yourFieldRepository saved: ${JSON.stringify(createdYourField, null, 2)}`);

        // const handCardPositionId = this.battleFieldHandRepository.findPositionIdByCardSceneId(cardSceneId)
        // if (handCardPositionId === null) {
        //     throw new Error('Position ID를 찾을 수 없습니다');
        // }
        //
        // const willBePlaceYourFieldCardPosition = this.battleFieldHandCardPositionRepository.extractById(handCardPositionId)
        // if (willBePlaceYourFieldCardPosition) {
        //     const positionX = willBePlaceYourFieldCardPosition.getX()
        //     const positionY = willBePlaceYourFieldCardPosition.getY()
        //     const yourFieldCardPosition = new YourFieldCardPosition(positionX, positionY)
        //     this.yourFieldCardPositionRepository.save(yourFieldCardPosition);
        // }

        const handCardId = willBePlacedYourFieldHandCard?.getId()
        if (handCardId === undefined) {
            throw new Error("Hand card ID를 찾을 수 없습니다.");
        }

        this.battleFieldHandRepository.deleteById(handCardId)
        console.log(`handleValidDrop() handCard: ${JSON.stringify(this.battleFieldHandRepository.findAll(), null, 2)}`);

        return createdYourField
    }

    private async restoreOriginalPosition(selectedObject: THREE.Object3D): Promise<void> {
        if (selectedObject instanceof BattleFieldCardScene) {
            const cardSceneId = selectedObject.getId();
            const cardPositionId = this.battleFieldHandRepository.findPositionIdByCardSceneId(cardSceneId);
            if (cardPositionId !== null) {
                const cardPositionEntity = await this.battleFieldHandCardPositionRepository.findById(cardPositionId);
                if (cardPositionEntity) {
                    this.restoreCardPosition(selectedObject, cardPositionEntity);
                }
            }

            await this.restoreAttributeMarksPosition(cardSceneId);
        } else {
            console.log("Selected object is not a BattleFieldCardScene.");
        }
    }

    private restoreCardPosition(selectedObject: BattleFieldCardScene, cardPositionEntity: BattleFieldCardPosition): void {
        const x = cardPositionEntity.getX();
        const y = cardPositionEntity.getY();
        const mainCardSceneMesh = selectedObject.getMesh();

        // Step 1: Restore card position
        if (mainCardSceneMesh) {
            mainCardSceneMesh.position.set(x, y, mainCardSceneMesh.position.z);
            console.log(`Main card mesh restored to position X: ${x}, Y: ${y}`);
        }

        const cardSceneId = selectedObject.getId();
        // const neonBorder = this.neonBorderRepository.findByCardSceneId(cardSceneId);
        const neonBorder = this.neonBorderRepository.findByCardSceneIdWithSceneType(cardSceneId, NeonBorderSceneType.HAND);

        if (neonBorder) {
            const positionIds = neonBorder.getNeonBorderLinePositionIdList(); // 저장된 위치 ID 리스트
            const lineSceneIds = neonBorder.getNeonBorderLineSceneIdList(); // 저장된 네온 라인 ID 리스트

            lineSceneIds.forEach((lineSceneId, index) => {
                const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
                const positionId = positionIds[index]; // 대응되는 위치 ID
                const neonBorderLinePosition = this.neonBorderLinePositionRepository.findById(positionId);

                if (lineScene && neonBorderLinePosition) {
                    const lineMesh = lineScene.getLine();
                    if (lineMesh) {
                        // Step 2: Restore neon border line position
                        const position = neonBorderLinePosition.getPosition();
                        const restoredX = position.getX()
                        const restoredY = position.getY();
                        lineMesh.position.set(restoredX, restoredY, lineMesh.position.z);

                        // Step 3: Hide the neon border
                        lineMesh.visible = false;
                    }
                } else {
                    console.warn(
                        `Could not restore position for Neon Border Line (Scene ID: ${lineSceneId}, Position ID: ${positionId}).`
                    );
                }
            });
        } else {
            console.warn(`No Neon Border found for card scene ID: ${cardSceneId}`);
        }
    }

    private async restoreAttributeMarksPosition(cardSceneId: number): Promise<void> {
        const attributeMarkIdList = this.battleFieldHandRepository.findAttributeMarkIdListByCardSceneId(cardSceneId);
        if (attributeMarkIdList?.length) {
            const attributeMarkList = await this.getAttributeMarks(attributeMarkIdList);
            const validAttributePositions = await this.getValidAttributePositions(attributeMarkList);
            const validAttributeScenes = await this.getValidAttributeScenes(attributeMarkList);
            this.restoreAttributeMarkScenes(validAttributePositions, validAttributeScenes);
        }
    }

    private async getAttributeMarks(attributeMarkIdList: number[]): Promise<BattleFieldCardAttributeMark[]> {
        const marks = await Promise.all(attributeMarkIdList.map(id => this.battleFieldCardAttributeMarkRepository.findById(id)));
        return marks.filter((mark): mark is BattleFieldCardAttributeMark => mark !== null); // Type guard to filter null values
    }

    private async getValidAttributePositions(attributeMarkList: BattleFieldCardAttributeMark[]): Promise<any[]> {
        return Promise.all(attributeMarkList.map(attributeMark =>
            this.battleFieldCardAttributeMarkPositionRepository.findById(attributeMark.attributeMarkPositionId)
        ));
    }

    private async getValidAttributeScenes(attributeMarkList: BattleFieldCardAttributeMark[]): Promise<any[]> {
        return Promise.all(attributeMarkList.map(attributeMark =>
            this.battleFieldCardAttributeMarkSceneRepository.findById(attributeMark.attributeMarkSceneId)
        ));
    }

    private restoreAttributeMarkScenes(validAttributePositions: any[], validAttributeScenes: any[]): void {
        validAttributeScenes.forEach((attributeScene, index) => {
            const attributePosition = validAttributePositions[index];
            if (attributePosition) {
                const x = attributePosition.position.getX();
                const y = attributePosition.position.getY();
                const mesh = attributeScene.getMesh();

                if (mesh) {
                    mesh.position.set(x, y, mesh.position.z);
                    console.log(`Attribute mark scene restored to position X: ${x}, Y: ${y}`);
                }
            }
        });
    }

    private clearSelection(): void {
        this.dragMoveRepository.deleteSelectedObject();
        this.dragMoveRepository.deleteSelectedGroup();
    }

    private calculateWeaponPosition(yourFieldPosition: Vector2d): Vector2d {
        const x = yourFieldPosition.getX() + this.CARD_WIDTH_RATIO * 0.44 * window.innerWidth;
        const y = yourFieldPosition.getY() - this.CARD_HEIGHT_RATIO * 0.45666 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private calculateStaffPosition(yourFieldPosition: Vector2d): Vector2d {
        const x = yourFieldPosition.getX() + this.CARD_WIDTH_RATIO * 0.54 * window.innerWidth;
        const y = yourFieldPosition.getY() - this.CARD_HEIGHT_RATIO * 0.30666 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private calculateKindsPosition(yourFieldPosition: Vector2d): Vector2d {
        const x = yourFieldPosition.getX() + this.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = yourFieldPosition.getY() - this.CARD_HEIGHT_RATIO * 0.5 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private calculateRacePosition(yourFieldPosition: Vector2d): Vector2d {
        const x = yourFieldPosition.getX() + this.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = yourFieldPosition.getY() + this.CARD_HEIGHT_RATIO * 0.5 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private calculateHpPosition(yourFieldPosition: Vector2d): Vector2d {
        const x = yourFieldPosition.getX() - this.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = yourFieldPosition.getY() - this.CARD_HEIGHT_RATIO * 0.43438 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private calculateEnergyPosition(yourFieldPosition: Vector2d): Vector2d {
        const x = yourFieldPosition.getX() - this.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = yourFieldPosition.getY() + this.CARD_HEIGHT_RATIO * 0.5 * window.innerWidth;
        return new Vector2d(x, y);
    }
}
