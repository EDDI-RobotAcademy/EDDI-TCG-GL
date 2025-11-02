import * as THREE from 'three';
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {MeshDestroyer} from "../../mesh/destroyer";
import {Vector2d} from "../../common/math/Vector2d";
import {CardGrade} from "../../card/grade";
import {CardFilterGradeOptionActive} from "../entity/CardFilterGradeOptionActive";
import {CardFilterGradeOptionActiveRepository} from './CardFilterGradeOptionActiveRepository';

export class CardFilterGradeOptionActiveRepositoryImpl implements CardFilterGradeOptionActiveRepository {
    private static instance: CardFilterGradeOptionActiveRepositoryImpl;
    private optionMap: Map<CardGrade, CardFilterGradeOptionActive> = new Map();

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly OPTION_WIDTH: number = 0.127; // 244: 24

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterGradeOptionActiveRepositoryImpl {
        if (!CardFilterGradeOptionActiveRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            CardFilterGradeOptionActiveRepositoryImpl.instance = new CardFilterGradeOptionActiveRepositoryImpl(textureManager, scene);
        }
        return CardFilterGradeOptionActiveRepositoryImpl.instance;
    }

    public async createGradeOption(type: CardGrade, position: Vector2d): Promise<CardFilterGradeOptionActive> {
        const texture = await this.textureManager.getTexture('grade_filter_option_active', type);
        if (!texture) {
            throw new Error(`Grade Filter Option Active Texture not found.`);
        }

        const optionWidth = this.OPTION_WIDTH * window.innerWidth;
        const optionHeight = optionWidth * (24/244);
        const optionMesh = MeshGenerator.createMesh(texture, optionWidth, optionHeight, position);

        const positionX = position.getX() * window.innerWidth;
        const positionY = position.getY() * window.innerHeight;
        optionMesh.position.set(positionX, positionY, 0);

        const newOption = new CardFilterGradeOptionActive(type, optionWidth, optionHeight, optionMesh, position);
        this.optionMap.set(type, newOption);

        return newOption;
    }

    public findGradeOptionByType(type: CardGrade): CardFilterGradeOptionActive | null {
        return this.optionMap.get(type) ?? null;
    }

    public findAllGradeOptions(): CardFilterGradeOptionActive[] {
        return Array.from(this.optionMap.values());
    }

    public deleteGradeOptionByType(type: CardGrade): void {
        this.optionMap.delete(type);
    }

    public deleteAllGradeOptions(): void {
        this.optionMap.clear();
    }

    public deleteAllGradeOptionMesh(): void {
        const optionList = this.findAllGradeOptions();
        for (const option of optionList) {
            this.meshDestroyer.destroyMesh(option.getMesh());
        }
    }

}
