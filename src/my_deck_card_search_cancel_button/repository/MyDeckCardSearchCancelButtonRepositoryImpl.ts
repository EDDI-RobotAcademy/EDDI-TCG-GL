import * as THREE from 'three';
import {MyDeckCardSearchCancelButtonRepository} from './MyDeckCardSearchCancelButtonRepository';
import {MyDeckCardSearchCancelButton} from "../entity/MyDeckCardSearchCancelButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckCardSearchCancelButtonRepositoryImpl implements MyDeckCardSearchCancelButtonRepository {
    private static instance: MyDeckCardSearchCancelButtonRepositoryImpl;
    private button: MyDeckCardSearchCancelButton | null = null;
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 0.009
    private readonly BUTTON_POSITION_X: number = 0.045
    private readonly BUTTON_POSITION_Y: number = 0.2735

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckCardSearchCancelButtonRepositoryImpl {
        if (!MyDeckCardSearchCancelButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckCardSearchCancelButtonRepositoryImpl.instance = new MyDeckCardSearchCancelButtonRepositoryImpl(textureManager);
        }
        return MyDeckCardSearchCancelButtonRepositoryImpl.instance;
    }

    public async createButton(): Promise<MyDeckCardSearchCancelButton> {
        const texture = await this.textureManager.getTexture('search_cancel_button', 1);
        if (!texture) {
            throw new Error(`Search Cancel Button texture not found`);
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth;

        const position = new Vector2d(this.BUTTON_POSITION_X, this.BUTTON_POSITION_Y);

        const buttonPositionX = this.BUTTON_POSITION_X * window.innerWidth;
        const buttonPositionY = this.BUTTON_POSITION_Y * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new MyDeckCardSearchCancelButton(buttonMesh, position);
        this.button = newButton;

        return newButton;
    }

    public findButton(): MyDeckCardSearchCancelButton | null {
        return this.button ?? null;
    }

    public deleteButton(): void {
        this.button = null;
    }

}
