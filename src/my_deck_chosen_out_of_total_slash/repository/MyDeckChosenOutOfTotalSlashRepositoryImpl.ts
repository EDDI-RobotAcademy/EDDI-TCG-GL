import * as THREE from 'three';
import {MyDeckChosenOutOfTotalSlashRepository} from './MyDeckChosenOutOfTotalSlashRepository';
import {MyDeckChosenOutOfTotalSlash} from "../entity/MyDeckChosenOutOfTotalSlash";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckChosenOutOfTotalSlashRepositoryImpl implements MyDeckChosenOutOfTotalSlashRepository {
    private static instance: MyDeckChosenOutOfTotalSlashRepositoryImpl;
    private slash: MyDeckChosenOutOfTotalSlash | null = null;
    private textureManager: TextureManager;

    private readonly SLASH_WIDTH: number = 0.014
    private readonly SLASH_POSITION_X: number = 0.455
    private readonly SLASH_POSITION_Y: number = 0.31

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckChosenOutOfTotalSlashRepositoryImpl {
        if (!MyDeckChosenOutOfTotalSlashRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckChosenOutOfTotalSlashRepositoryImpl.instance = new MyDeckChosenOutOfTotalSlashRepositoryImpl(textureManager);
        }
        return MyDeckChosenOutOfTotalSlashRepositoryImpl.instance;
    }

    public async createSlash(): Promise<MyDeckChosenOutOfTotalSlash> {
        const texture = await this.textureManager.getTexture('card_count_notation', 1);
        if (!texture) {
            throw new Error(`[My Deck Edit] slash texture not found`);
        }

        const slashWidth = this.SLASH_WIDTH * window.innerWidth;
        const slashHeight = slashWidth;

        const position = new Vector2d(this.SLASH_POSITION_X, this.SLASH_POSITION_Y);

        const slashPositionX = this.SLASH_POSITION_X * window.innerWidth;
        const slashPositionY = this.SLASH_POSITION_Y * window.innerHeight;

        const slashMesh = MeshGenerator.createMesh(texture, slashWidth, slashHeight, position);
        slashMesh.position.set(slashPositionX, slashPositionY, 0);

        const newSlash = new MyDeckChosenOutOfTotalSlash(slashMesh, position);
        this.slash = newSlash;

        return newSlash;
    }

    public findSlash(): MyDeckChosenOutOfTotalSlash | null {
        return this.slash ?? null;
    }

    public deleteSlash(): void {
        this.slash = null;
    }

}
