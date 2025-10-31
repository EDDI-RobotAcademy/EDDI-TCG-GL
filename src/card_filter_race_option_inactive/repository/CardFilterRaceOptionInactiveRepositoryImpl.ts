import * as THREE from 'three';
import {CardFilterRaceOptionInactiveRepository} from './CardFilterRaceOptionInactiveRepository';
import {CardFilterRaceOptionInactive} from "../entity/CardFilterRaceOptionInactive";
import {CardRace} from "../../card/race";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {MeshDestroyer} from "../../mesh/destroyer";
import {Vector2d} from "../../common/math/Vector2d";

export class CardFilterRaceOptionInactiveRepositoryImpl implements CardFilterRaceOptionInactiveRepository {
    private static instance: CardFilterRaceOptionInactiveRepositoryImpl;
    private optionMap: Map<CardRace, CardFilterRaceOptionInactive> = new Map();

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly OPTION_WIDTH: number = 0.033;

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterRaceOptionInactiveRepositoryImpl {
        if (!CardFilterRaceOptionInactiveRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            CardFilterRaceOptionInactiveRepositoryImpl.instance = new CardFilterRaceOptionInactiveRepositoryImpl(textureManager, scene);
        }
        return CardFilterRaceOptionInactiveRepositoryImpl.instance;
    }

    public async createRaceOption(type: CardRace, position: Vector2d): Promise<CardFilterRaceOptionInactive> {
        const texture = await this.textureManager.getTexture('race_filter_option_inactive', type);
        if (!texture) {
            throw new Error(`Race Filter Option Inactive Texture not found`);
        }

        const optionWidth = this.OPTION_WIDTH * window.innerWidth;
        const optionHeight = optionWidth;
        const optionMesh = MeshGenerator.createMesh(texture, optionWidth, optionHeight, position);

        const positionX = position.getX() * window.innerWidth;
        const positionY = position.getY() * window.innerHeight;
        optionMesh.position.set(positionX, positionY, 0);

        const newOption = new CardFilterRaceOptionInactive(type, optionWidth, optionHeight, optionMesh, position);
        this.optionMap.set(type, newOption);

        return newOption;
    }

    public findRaceOptionByType(type: CardRace): CardFilterRaceOptionInactive | null {
        return this.optionMap.get(type) ?? null;
    }

    public findAllOptions(): CardFilterRaceOptionInactive[] {
        return Array.from(this.optionMap.values());
    }

    public deleteRaceOptionByType(type: CardRace): void {
        this.optionMap.delete(type);
    }

    public deleteAllOptions(): void {
        this.optionMap.clear();
    }

    public deleteAllOptionMesh(): void {
        const optionList = this.findAllOptions();
        for (const option of optionList) {
            this.meshDestroyer.destroyMesh(option.getMesh());
        }
    }

}
