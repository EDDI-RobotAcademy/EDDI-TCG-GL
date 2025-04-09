import * as THREE from 'three';
import { MyDeckCardPageMovementButtonRepository } from './MyDeckCardPageMovementButtonRepository';
import {MyDeckCardPageMovementButton} from "../entity/MyDeckCardPageMovementButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MyDeckCardPageMovementButtonType} from "../entity/MyDeckCardPageMovementButtonType";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckCardPageMovementButtonRepositoryImpl implements MyDeckCardPageMovementButtonRepository {
    private static instance: MyDeckCardPageMovementButtonRepositoryImpl;
    private buttonMap: Map<number, MyDeckCardPageMovementButton> = new Map();
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 0.05
    private readonly BUTTON_HEIGHT: number = 46 / 1080

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckCardPageMovementButtonRepositoryImpl {
        if (!MyDeckCardPageMovementButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckCardPageMovementButtonRepositoryImpl.instance = new MyDeckCardPageMovementButtonRepositoryImpl(textureManager);
        }
        return MyDeckCardPageMovementButtonRepositoryImpl.instance;
    }

    public async createMyDeckCardPageMovementButton(
        type: MyDeckCardPageMovementButtonType,
        position: Vector2d
    ): Promise<MyDeckCardPageMovementButton> {
        const texture = await this.textureManager.getTexture('my_deck_page_movement_button', type);

        if (!texture) {
            console.error('Failed to load texture for type:', type);
            throw new Error('MyDeckCardPageMovementButton texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * 1.66;

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new MyDeckCardPageMovementButton(type, buttonWidth, buttonHeight, buttonMesh, position);
        this.buttonMap.set(newButton.id, newButton);

        return newButton;
    }

    public getAllMyDeckCardPageMovementButtons(): Map<number, MyDeckCardPageMovementButton> {
        return this.buttonMap;
    }

    public findById(id: number): MyDeckCardPageMovementButton | null {
        return this.buttonMap.get(id) || null;
    }

    public findAll(): MyDeckCardPageMovementButton[] {
        return Array.from(this.buttonMap.values());
    }

    public deleteById(id: number): void {
        this.buttonMap.delete(id);
    }

    public deleteAll(): void {
        this.buttonMap.clear();
    }
}
