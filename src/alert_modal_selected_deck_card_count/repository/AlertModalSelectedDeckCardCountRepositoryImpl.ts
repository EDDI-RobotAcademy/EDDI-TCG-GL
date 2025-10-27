import * as THREE from 'three';
import {AlertModalSelectedDeckCardCountRepository} from './AlertModalSelectedDeckCardCountRepository';
import {AlertModalSelectedDeckCardCount} from "../entity/AlertModalSelectedDeckCardCount";
import {TextGenerator} from "../../text/generator";
import {MeshGenerator} from "../../mesh/generator";
import {MeshDestroyer} from "../../mesh/destroyer";
import {Vector2d} from "../../common/math/Vector2d";

export class AlertModalSelectedDeckCardCountRepositoryImpl implements AlertModalSelectedDeckCardCountRepository {
    private static instance: AlertModalSelectedDeckCardCountRepositoryImpl;
    private cardCount: AlertModalSelectedDeckCardCount | null = null;
    private meshDestroyer: MeshDestroyer;

    private readonly COUNT_POSITION_X: number = - 0.016
    private readonly COUNT_POSITION_Y: number = - 0.03

    private constructor(scene: THREE.Scene) {
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): AlertModalSelectedDeckCardCountRepositoryImpl {
        if (!AlertModalSelectedDeckCardCountRepositoryImpl.instance) {
            AlertModalSelectedDeckCardCountRepositoryImpl.instance = new AlertModalSelectedDeckCardCountRepositoryImpl(scene);
        }
        return AlertModalSelectedDeckCardCountRepositoryImpl.instance;
    }

    public async createSelectedDeckCardCount(count: number): Promise<AlertModalSelectedDeckCardCount> {
        const generator = new TextGenerator();
        const countText = count.toString();
        const canvas = generator.createCanvas(countText, 'KakaoFont', '#FFFFFF', 12);
        if (!canvas) {
            throw new Error('Alert Modal Selected Deck Card Count Canvas not found.');
        }

        const texture = generator.createTextureFromCanvas(canvas);
        if (!texture) {
            throw new Error('Alert Modal Selected Deck Card Count Texture not found.');
        }

        const countTexture = texture.image;
        const textureWidth = countTexture.width;
        const textureHeight = countTexture.height;

        const countWidth = (textureWidth/1800) * window.innerWidth;
        const countHeight = countWidth * (textureHeight / textureWidth);

        const countPositionX = this.COUNT_POSITION_X * window.innerWidth;
        const countPositionY = this.COUNT_POSITION_Y * window.innerHeight;
        const position = new Vector2d(this.COUNT_POSITION_X, this.COUNT_POSITION_Y);

        const countMesh = MeshGenerator.createMesh(texture, countWidth, countHeight, position);
        countMesh.position.set(countPositionX, countPositionY, 0);

        const newCount = new AlertModalSelectedDeckCardCount(countMesh, position, textureWidth, textureHeight);
        this.cardCount = newCount;

        return newCount;
    }

    public findSelectedDeckCardCount(): AlertModalSelectedDeckCardCount | null {
        return this.cardCount ?? null;
    }

    public deleteSelectedDeckCardCount(): void {
        const deckCardCount = this.findSelectedDeckCardCount();
        if (deckCardCount == null) return;

        const deckCardCountMesh = deckCardCount.getMesh();
        this.meshDestroyer.destroyMesh(deckCardCountMesh);

        this.cardCount = null;
    }

}
