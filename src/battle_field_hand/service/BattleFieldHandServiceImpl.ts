import {BattleFieldHandService} from "./BattleFieldHandService";
import {BattleFieldHandRepository} from "../repository/BattleFieldHandRepository";
import {BattleFieldHandRepositoryImpl} from "../repository/BattleFieldHandRepositoryImpl";
import {BattleFieldCardSceneRepository} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepository";
import {BattleFieldCardSceneRepositoryImpl} from "../../battle_field_card_scene/repository/BattleFieldCardSceneRepositoryImpl";
import {BattleFieldHandCardPositionRepository} from "../../battle_field_card_position/repository/BattleFieldHandCardPositionRepository";
import {BattleFieldHandCardPositionRepositoryImpl} from "../../battle_field_card_position/repository/BattleFieldHandCardPositionRepositoryImpl";
import {BattleFieldCardPosition} from "../../battle_field_card_position/entity/BattleFieldCardPosition";
import {Vector2d} from "../../common/math/Vector2d";
import {BattleFieldHand} from "../entity/BattleFieldHand";
import {BattleFieldHandMapRepository} from "../repository/BattleFieldHandMapRepository";
import {BattleFieldHandMapRepositoryImpl} from "../repository/BattleFieldHandMapRepositoryImpl";
import {getCardById} from "../../card/utility";
import * as THREE from "three";
import {BattleFieldCardScene} from "../../battle_field_card_scene/entity/BattleFieldCardScene";
import {CardJob} from "../../card/job";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {BattleFieldCardAttributeMarkRepository} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepository";
import {BattleFieldCardAttributeMarkRepositoryImpl} from "../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepositoryImpl";
import {BattleFieldCardAttributeMarkPositionRepository} from "../../battle_field_card_attribute_mark_position/repository/BattleFieldCardAttributeMarkPositionRepository";
import {BattleFieldCardAttributeMarkPositionRepositoryImpl} from "../../battle_field_card_attribute_mark_position/repository/BattleFieldCardAttributeMarkPositionRepositoryImpl";
import {BattleFieldCardAttributeMarkSceneRepository} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepository";
import {BattleFieldCardAttributeMarkSceneRepositoryImpl} from "../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepositoryImpl";
import {BattleFieldCardAttributeMarkPosition} from "../../battle_field_card_attribute_mark_position/entity/BattleFieldCardAttributeMarkPosition";
import {BattleFieldCardAttributeMarkScene} from "../../battle_field_card_attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";
import {BattleFieldCardAttributeMark} from "../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMark";
import {BattleFieldCardAttributeMarkStatus} from "../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMarkStatus";
import {Texture} from "three";
import {CardKind} from "../../card/kind";
import {MarkSceneType} from "../../battle_field_card_attribute_mark_scene/entity/MarkSceneType";
import {CardConstants} from "../../card/CardConstants";

export class BattleFieldHandServiceImpl implements BattleFieldHandService {
    private static instance: BattleFieldHandServiceImpl;

    private battleFieldHandRepository: BattleFieldHandRepository;
    private battleFieldHandMapRepository: BattleFieldHandMapRepository;
    private battleFieldCardSceneRepository: BattleFieldCardSceneRepository;
    private battleFieldHandCardPositionRepository: BattleFieldHandCardPositionRepository;

    private battleFieldCardAttributeMarkRepository: BattleFieldCardAttributeMarkRepository;
    private battleFieldCardAttributeMarkSceneRepository: BattleFieldCardAttributeMarkSceneRepository;
    private battleFieldCardAttributeMarkPositionRepository: BattleFieldCardAttributeMarkPositionRepository;

    private textureManager: TextureManager = TextureManager.getInstance();

    private readonly HALF: number = 0.5;
    private readonly GAP_OF_EACH_CARD: number = 0.094696
    private readonly HAND_X_CRITERIA: number = 0.311904
    private readonly HAND_Y_CRITERIA: number = 0.972107
    private readonly HAND_INITIAL_X: number = this.HAND_X_CRITERIA - this.HALF;
    private readonly HAND_INITIAL_Y: number = this.HALF - this.HAND_Y_CRITERIA;

    private readonly CARD_WIDTH_RATIO: number = CardConstants.CARD_WIDTH_RATIO;
    private readonly CARD_HEIGHT_RATIO: number = CardConstants.CARD_HEIGHT_RATIO;

    private static weaponTextureMap: { [key in CardJob]?: string } = {
        [CardJob.WARRIOR]: 'sword_power',
        [CardJob.MAGICIAN]: 'staff_power',
        [CardJob.ASSASSIN]: 'dagger_power',
    };

    private constructor() {
        this.battleFieldHandRepository = BattleFieldHandRepositoryImpl.getInstance();
        this.battleFieldHandMapRepository = BattleFieldHandMapRepositoryImpl.getInstance();
        this.battleFieldCardSceneRepository = BattleFieldCardSceneRepositoryImpl.getInstance();
        this.battleFieldHandCardPositionRepository = BattleFieldHandCardPositionRepositoryImpl.getInstance();

        this.battleFieldCardAttributeMarkRepository = BattleFieldCardAttributeMarkRepositoryImpl.getInstance();
        this.battleFieldCardAttributeMarkSceneRepository = BattleFieldCardAttributeMarkSceneRepositoryImpl.getInstance();
        this.battleFieldCardAttributeMarkPositionRepository = BattleFieldCardAttributeMarkPositionRepositoryImpl.getInstance();
    }

    public static getInstance(): BattleFieldHandServiceImpl {
        if (!this.instance) {
            this.instance = new BattleFieldHandServiceImpl();
        }
        return this.instance;
    }

    async createHand(cardId: number): Promise<THREE.Group> {
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
        const handPositionX = (this.HAND_INITIAL_X + handPositionCount * this.GAP_OF_EACH_CARD) * window.innerWidth;
        const handPositionY = this.HAND_INITIAL_Y * window.innerHeight
            + (this.CARD_HEIGHT_RATIO * this.HALF * window.innerWidth);
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
            const weaponTextureName = BattleFieldHandServiceImpl.weaponTextureMap[unitJob as CardJob] || 'default_weapon';
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
        const x = handPosition.getX() + this.CARD_WIDTH_RATIO * 0.44 * window.innerWidth;
        const y = handPosition.getY() - this.CARD_HEIGHT_RATIO * 0.45666 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createWeaponMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            this.CARD_WIDTH_RATIO * 0.63 * window.innerWidth,
            this.CARD_WIDTH_RATIO * 0.63 * 1.651 * window.innerWidth,
            position
        );
    }

    private calculateStaffPosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() + this.CARD_WIDTH_RATIO * 0.54 * window.innerWidth;
        const y = handPosition.getY() - this.CARD_HEIGHT_RATIO * 0.30666 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createStaffMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            this.CARD_WIDTH_RATIO * 0.63 * window.innerWidth,
            this.CARD_WIDTH_RATIO * 0.63 * 1.9353 * window.innerWidth,
            position
        );
    }

    private calculateKindsPosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() + this.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = handPosition.getY() - this.CARD_HEIGHT_RATIO * 0.5 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createKindsMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            this.CARD_WIDTH_RATIO * 0.4 * window.innerWidth,
            this.CARD_WIDTH_RATIO * 0.4 * window.innerWidth,
            position
        );
    }

    private calculateRacePosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() + this.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = handPosition.getY() + this.CARD_HEIGHT_RATIO * 0.5 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createRaceMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            this.CARD_WIDTH_RATIO * 0.4 * window.innerWidth,
            this.CARD_WIDTH_RATIO * 0.4 * window.innerWidth,
            position
        );
    }

    private calculateHpPosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() - this.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = handPosition.getY() - this.CARD_HEIGHT_RATIO * 0.43438 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createHpMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            this.CARD_WIDTH_RATIO * 0.31 * window.innerWidth,
            this.CARD_WIDTH_RATIO * 0.31 * 1.65454 * window.innerWidth,
            position
        );
    }

    private calculateEnergyPosition(handPosition: Vector2d): Vector2d {
        const x = handPosition.getX() - this.CARD_WIDTH_RATIO * 0.5 * window.innerWidth;
        const y = handPosition.getY() + this.CARD_HEIGHT_RATIO * 0.5 * window.innerWidth;
        return new Vector2d(x, y);
    }

    private createEnergyMesh(texture: THREE.Texture, position: Vector2d): THREE.Mesh {
        return MeshGenerator.createMesh(
            texture,
            this.CARD_WIDTH_RATIO * 0.39 * window.innerWidth,
            this.CARD_WIDTH_RATIO * 0.39 * 1.344907 * window.innerWidth,
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
