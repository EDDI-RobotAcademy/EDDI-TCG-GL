import { KeyboardAction } from "../entity/KeyboardAction";
import {BattleFieldHandMapRepository} from "../../battle_field_hand/repository/BattleFieldHandMapRepository";
import {BattleFieldHandMapRepositoryImpl} from "../../battle_field_hand/repository/BattleFieldHandMapRepositoryImpl";
import {BattleFieldHandRepository} from "../../battle_field_hand/repository/BattleFieldHandRepository";
import {BattleFieldHandRepositoryImpl} from "../../battle_field_hand/repository/BattleFieldHandRepositoryImpl";
import * as THREE from "three";
import {CardJob} from "../../card/job";
import {CardKind} from "../../card/kind";
import {getCardById} from "../../card/utility";
import {Vector2d} from "../../common/math/Vector2d";
import {BattleFieldCardPosition} from "../../battle_field_card_position/entity/BattleFieldCardPosition";
import {
    BattleFieldHandCardPositionRepository
} from "../../battle_field_card_position/repository/BattleFieldHandCardPositionRepository";
import {
    BattleFieldHandCardPositionRepositoryImpl
} from "../../battle_field_card_position/repository/BattleFieldHandCardPositionRepositoryImpl";
import {BattleFieldConstants} from "../../common/BattleFieldConstants";
import {BattleFieldCardScene} from "../../battle_field_card_scene/entity/BattleFieldCardScene";
import {Texture} from "three";
import {BattleFieldCardAttributeMark} from "../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMark";
import {MarkSceneType} from "../../battle_field_card_attribute_mark_scene/entity/MarkSceneType";
import {MeshGenerator} from "../../mesh/generator";
import {
    BattleFieldCardAttributeMarkPosition
} from "../../battle_field_card_attribute_mark_position/entity/BattleFieldCardAttributeMarkPosition";
import {
    BattleFieldCardAttributeMarkScene
} from "../../battle_field_card_attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";
import {
    BattleFieldCardAttributeMarkStatus
} from "../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMarkStatus";
import {
    BattleFieldHandSceneRepository
} from "../../battle_field_hand/deprecated_repository/BattleFieldHandSceneRepository";
import {
    BattleFieldCardAttributeMarkRepository
} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepository";
import {BattleFieldCardSceneRepository} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepository";
import {
    BattleFieldCardSceneRepositoryImpl
} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepositoryImpl";
import {
    BattleFieldCardAttributeMarkRepositoryImpl
} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepositoryImpl";
import {TextureManager} from "../../texture_manager/TextureManager";
import {
    BattleFieldCardAttributeMarkPositionRepository
} from "../../battle_field_card_attribute_mark_position/repository/BattleFieldCardAttributeMarkPositionRepository";
import {
    BattleFieldCardAttributeMarkPositionRepositoryImpl
} from "../../battle_field_card_attribute_mark_position/repository/BattleFieldCardAttributeMarkPositionRepositoryImpl";
import {
    BattleFieldCardAttributeMarkSceneRepository
} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepository";
import {
    BattleFieldCardAttributeMarkSceneRepositoryImpl
} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepositoryImpl";
import {BattleFieldCardAlignHandler} from "../../battle_field_card_alignment/handler/BattleFieldCardAlignHandler";


export class KeyboardActionHandler {
    private static instance: KeyboardActionHandler | null = null;
    private actionTable: Map<KeyboardAction, () => void>;

    private scene: THREE.Scene;

    private battleFieldHandMapRepository: BattleFieldHandMapRepository;
    private battleFieldHandRepository: BattleFieldHandRepository;
    private battleFieldHandCardPositionRepository: BattleFieldHandCardPositionRepository;
    private battleFieldHandSceneRepository: BattleFieldHandSceneRepository;
    private battleFieldCardSceneRepository: BattleFieldCardSceneRepository;
    private battleFieldCardAttributeMarkRepository: BattleFieldCardAttributeMarkRepository;
    private battleFieldCardAttributeMarkPositionRepository: BattleFieldCardAttributeMarkPositionRepository;
    private battleFieldCardAttributeMarkSceneRepository: BattleFieldCardAttributeMarkSceneRepository;

    private textureManager: TextureManager;

    private battleFieldCardAlignHandler: BattleFieldCardAlignHandler;

    private weaponTextureMap: { [key in CardJob]?: string } = {
        [CardJob.WARRIOR]: 'sword_power',
        [CardJob.MAGICIAN]: 'staff_power',
        [CardJob.ASSASSIN]: 'dagger_power',
    };

    private constructor(scene: THREE.Scene) {
        this.battleFieldHandMapRepository = BattleFieldHandMapRepositoryImpl.getInstance();
        this.battleFieldHandRepository = BattleFieldHandRepositoryImpl.getInstance();
        this.battleFieldHandCardPositionRepository = BattleFieldHandCardPositionRepositoryImpl.getInstance();
        this.battleFieldHandSceneRepository = BattleFieldHandSceneRepository.getInstance();
        this.battleFieldCardSceneRepository = BattleFieldCardSceneRepositoryImpl.getInstance();
        this.battleFieldCardAttributeMarkRepository = BattleFieldCardAttributeMarkRepositoryImpl.getInstance();
        this.battleFieldCardAttributeMarkPositionRepository = BattleFieldCardAttributeMarkPositionRepositoryImpl.getInstance();
        this.battleFieldCardAttributeMarkSceneRepository = BattleFieldCardAttributeMarkSceneRepositoryImpl.getInstance();

        this.textureManager = TextureManager.getInstance();

        this.battleFieldCardAlignHandler = BattleFieldCardAlignHandler.getInstance();

        this.scene = scene;

        this.actionTable = new Map<KeyboardAction, () => void>([
            [KeyboardAction.DEPLOY, () => {
                console.log("Handler: Deploying units...");
                // TODO: 실제 배치 로직
            }],
            [KeyboardAction.DRAW, async () => {
                console.log("Handler: Drawing a card...");
                const handCardId: number = 27
                this.battleFieldHandMapRepository.addBattleFieldHand(handCardId)

                const currentHandList = this.battleFieldHandRepository.findAll();

                if (currentHandList.length >= 5) {
                    console.log("Handler: 페이지 생성 필요함.");
                }

                const createdHand = await this.createHand(handCardId)

                if (createdHand) {
                    this.battleFieldHandSceneRepository.addBattleFieldHandScene(createdHand);
                    this.scene.add(createdHand);
                    this.battleFieldCardAlignHandler.alignHandCard();
                }
            }],
        ]);
    }

    static getInstance(scene: THREE.Scene): KeyboardActionHandler {
        if (!KeyboardActionHandler.instance) {
            KeyboardActionHandler.instance = new KeyboardActionHandler(scene);
        }
        return KeyboardActionHandler.instance;
    }

    execute(action: KeyboardAction): void {
        const handler = this.actionTable.get(action);
        if (handler) {
            handler();
        } else {
            console.warn(`Handler: No handler registered for action ${action}`);
        }
    }

    private async createHand(cardId: number): Promise<THREE.Group> {
        const cardGroup = new THREE.Group()
        const card = this.getCardByIdOrThrowError(cardId);

        const handPosition = this.calculateHandPosition();
        const createdHandPosition = this.saveHandPosition(handPosition);

        const mainCardScene = await this.createMainCardScene(cardId, handPosition);
        const mainCardMesh = mainCardScene.getMesh()
        cardGroup.add(mainCardMesh)

        const unitJob = parseInt(card.병종, 10) as CardJob;
        const cardKind = parseInt(card.종류, 10) as CardKind;

        try {
            const textures = await this.loadCardTextures(unitJob, cardKind, card);
            await this.addAttributesToCardGroup(mainCardScene, createdHandPosition, cardId, cardKind, unitJob, cardGroup, handPosition, textures);
        } catch (error) {
            console.error("Error loading textures:", error);
        }

        return cardGroup
    }

    private getCardByIdOrThrowError(cardId: number): any {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card ${cardId} 찾지 못함.`);
        }
        return card;
    }

    private calculateHandPosition(): Vector2d {
        const handPositionCount = this.battleFieldHandCardPositionRepository.count();
        const handPositionX = (BattleFieldConstants.HAND_INITIAL_X + handPositionCount * BattleFieldConstants.GAP_OF_EACH_CARD) * window.innerWidth;
        const handPositionY = BattleFieldConstants.HAND_INITIAL_Y * window.innerHeight
            + (BattleFieldConstants.CARD_HEIGHT_RATIO * BattleFieldConstants.HALF * window.innerWidth);
        return new Vector2d(handPositionX, handPositionY);
    }

    private saveHandPosition(position: Vector2d): BattleFieldCardPosition {
        const cardPosition = new BattleFieldCardPosition(position.getX(), position.getY());
        return this.battleFieldHandCardPositionRepository.save(cardPosition);
    }

    private async createMainCardScene(cardId: number, position: Vector2d): Promise<BattleFieldCardScene> {
        return await this.battleFieldCardSceneRepository.create(cardId, position);
    }

    private async loadCardTextures(unitJob: number, cardKind: number, card: any): Promise<(THREE.Texture | null)[]> {
        // 공통 텍스처 로드
        const commonTextures = await Promise.all([
            this.textureManager.getTexture('race', card.종족),
            this.textureManager.getTexture('hp', card.체력),
            this.textureManager.getTexture('energy', 0),
        ]);

        // CardKind.UNIT인 경우, 직업에 따라 무기 텍스처를 로드
        let specificTextures: Promise<THREE.Texture | null>[] = [];
        if (cardKind === CardKind.UNIT) {
            const weaponTextureName = this.weaponTextureMap[unitJob as CardJob] || 'default_weapon';
            specificTextures.push(
                this.textureManager.getTexture(weaponTextureName, card.공격력).then(texture => texture ?? null)
            );
        } else {
            specificTextures.push(
                this.textureManager.getTexture('card_kinds', card.종류).then(texture => texture ?? null)
            );
        }

        const textures = await Promise.all([...specificTextures, ...commonTextures]);

        return textures.map(texture => texture ?? null);
    }

    private async addAttributesToCardGroup(
        mainCardScene: BattleFieldCardScene,
        createdHandPosition: BattleFieldCardPosition,
        cardId: number,
        cardKind: number,
        unitJob: number,
        cardGroup: THREE.Group,
        handPosition: Vector2d,
        textures: (Texture | null)[]
    ): Promise<void> {
        const [kindsOrWeaponTexture, raceTexture, hpTexture, energyTexture] = textures;
        const attributeMarks: BattleFieldCardAttributeMark[] = [];

        if (cardKind === CardKind.UNIT && unitJob === CardJob.WARRIOR && kindsOrWeaponTexture) {
            const weaponPosition = this.calculateWeaponPosition(handPosition);
            const weaponMesh = this.createWeaponMesh(kindsOrWeaponTexture, weaponPosition);
            cardGroup.add(weaponMesh);

            const weaponMark = await this.saveCardAttributeMark(weaponMesh, weaponPosition, MarkSceneType.SWORD);
            // console.log(`weaponMark id -> ${weaponMark.getId()}`)
            attributeMarks.push(weaponMark)
        }

        if (cardKind === CardKind.UNIT && unitJob === CardJob.MAGICIAN && kindsOrWeaponTexture) {
            const staffPosition = this.calculateStaffPosition(handPosition);
            const staffMesh = this.createStaffMesh(kindsOrWeaponTexture, staffPosition);
            cardGroup.add(staffMesh);

            const staffMark = await this.saveCardAttributeMark(staffMesh, staffPosition, MarkSceneType.STAFF);
            attributeMarks.push(staffMark)
        }

        if (cardKind !== CardKind.UNIT && kindsOrWeaponTexture) {
            const kindsPosition = this.calculateKindsPosition(handPosition);
            const kinsMesh = this.createKindsMesh(kindsOrWeaponTexture, kindsPosition);
            cardGroup.add(kinsMesh);

            const kindsMark = await this.saveCardAttributeMark(kinsMesh, kindsPosition, MarkSceneType.KINDS);
            attributeMarks.push(kindsMark)
        }

        if (raceTexture) {
            const racePosition = this.calculateRacePosition(handPosition)
            const raceMesh = this.createRaceMesh(raceTexture, racePosition);
            cardGroup.add(raceMesh);

            const raceMark = await this.saveCardAttributeMark(raceMesh, racePosition, MarkSceneType.RACE);
            attributeMarks.push(raceMark)
        }

        if (hpTexture) {
            const hpPosition = this.calculateHpPosition(handPosition)
            const hpMesh = this.createHpMesh(hpTexture, hpPosition);
            cardGroup.add(hpMesh);

            const hpMark = await this.saveCardAttributeMark(hpMesh, hpPosition, MarkSceneType.HP);
            attributeMarks.push(hpMark)
        }

        if (cardKind === CardKind.UNIT && energyTexture) {
            const energyPosition = this.calculateEnergyPosition(handPosition)
            const energyMesh = this.createEnergyMesh(energyTexture, energyPosition);
            cardGroup.add(energyMesh);

            const energyMark = await this.saveCardAttributeMark(energyMesh, energyPosition, MarkSceneType.ENERGY);
            attributeMarks.push(energyMark)
        }

        const attributeMarkIdList = attributeMarks.map((mark) => mark.getId())
        this.battleFieldHandRepository.save(mainCardScene.getId(), createdHandPosition.getId(), attributeMarkIdList, cardId)
    }

    private calculateWeaponPosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() + BattleFieldConstants.CARD_WIDTH_RATIO * 0.44 * window.innerWidth;
        const y = handPosition.getY() - BattleFieldConstants.CARD_HEIGHT_RATIO * 0.45666 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createWeaponMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.63 * window.innerWidth,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.63 * 1.651 * window.innerWidth,
            position
        );
    }

    private calculateStaffPosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() + BattleFieldConstants.CARD_WIDTH_RATIO * 0.54 * window.innerWidth;
        const y = handPosition.getY() - BattleFieldConstants.CARD_HEIGHT_RATIO * 0.30666 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createStaffMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.63 * window.innerWidth,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.63 * 1.9353 * window.innerWidth,
            position
        );
    }

    private calculateKindsPosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() + BattleFieldConstants.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = handPosition.getY() - BattleFieldConstants.CARD_HEIGHT_RATIO * 0.5 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createKindsMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.4 * window.innerWidth,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.4 * window.innerWidth,
            position
        );
    }

    private calculateRacePosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() + BattleFieldConstants.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = handPosition.getY() + BattleFieldConstants.CARD_HEIGHT_RATIO * 0.5 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createRaceMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.4 * window.innerWidth,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.4 * window.innerWidth,
            position
        );
    }

    private calculateHpPosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() - BattleFieldConstants.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = handPosition.getY() - BattleFieldConstants.CARD_HEIGHT_RATIO * 0.43438 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createHpMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.31 * window.innerWidth,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.31 * 1.65454 * window.innerWidth,
            position
        );
    }

    private calculateEnergyPosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() - BattleFieldConstants.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = handPosition.getY() + BattleFieldConstants.CARD_HEIGHT_RATIO * 0.5 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createEnergyMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.39 * window.innerWidth,
            BattleFieldConstants.CARD_WIDTH_RATIO * 0.39 * 1.344907 * window.innerWidth,
            position
        );
    }

    private async saveCardAttributeMark(mesh: THREE.Mesh, position: Vector2d, markSceneType: MarkSceneType): Promise<BattleFieldCardAttributeMark> {
        const attributeMarkPosition = new BattleFieldCardAttributeMarkPosition(position.getX(), position.getY());
        await this.battleFieldCardAttributeMarkPositionRepository.save(attributeMarkPosition);

        const attributeMarkScene = new BattleFieldCardAttributeMarkScene(mesh, markSceneType);
        await this.battleFieldCardAttributeMarkSceneRepository.save(attributeMarkScene);

        const attributeMark = new BattleFieldCardAttributeMark(
            BattleFieldCardAttributeMarkStatus.HAND,
            attributeMarkScene.getId(),
            attributeMarkPosition.getId()
        );
        return await this.battleFieldCardAttributeMarkRepository.save(attributeMark);
    }
}
