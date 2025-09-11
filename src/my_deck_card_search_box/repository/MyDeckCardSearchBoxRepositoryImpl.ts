import * as THREE from 'three';

import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckCardSearchBoxRepository} from './MyDeckCardSearchBoxRepository';
import {MyDeckCardSearchBox} from "../entity/MyDeckCardSearchBox";

export class MyDeckCardSearchBoxRepositoryImpl implements MyDeckCardSearchBoxRepository {
    private static instance: MyDeckCardSearchBoxRepositoryImpl;
    private searchBox: MyDeckCardSearchBox | null = null;
    private textureManager: TextureManager;

    private readonly BOX_WIDTH: number = 0.3
    private readonly BOX_POSITION_X: number = -0.093
    private readonly BOX_POSITION_Y: number = 0.273

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckCardSearchBoxRepositoryImpl {
        if (!MyDeckCardSearchBoxRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckCardSearchBoxRepositoryImpl.instance = new MyDeckCardSearchBoxRepositoryImpl(textureManager);
        }
        return MyDeckCardSearchBoxRepositoryImpl.instance;
    }

    public async createSearchBox(): Promise<MyDeckCardSearchBox> {
        const texture = await this.textureManager.getTexture('search_box', 1);
        if (!texture) {
            throw new Error(`Search Box texture not found`);
        }

        const boxWidth = this.BOX_WIDTH * window.innerWidth;
        const boxHeight = boxWidth * (100/1500);

        const position = new Vector2d(this.BOX_POSITION_X, this.BOX_POSITION_Y);

        const boxPositionX = this.BOX_POSITION_X * window.innerWidth;
        const boxPositionY = this.BOX_POSITION_Y * window.innerHeight;

        const boxMesh = MeshGenerator.createMesh(texture, boxWidth, boxHeight, position);
        boxMesh.position.set(boxPositionX, boxPositionY, 0);

        const newBox = new MyDeckCardSearchBox(boxMesh, position);
        this.searchBox = newBox;

        return newBox;
    }

    public findSearchBox(): MyDeckCardSearchBox | null {
        return this.searchBox ?? null;
    }

    public deleteSearchBox(): void {
        this.searchBox = null;
    }

}
