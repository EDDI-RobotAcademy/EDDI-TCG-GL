import * as THREE from 'three';
import { MyDeckButtonRepository } from './MyDeckButtonRepository';
import {MyDeckButton} from "../entity/MyDeckButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MyDeckButtonType} from "../entity/MyDeckButtonType";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckButtonRepositoryImpl implements MyDeckButtonRepository {
    private static instance: MyDeckButtonRepositoryImpl;
    private buttonMap: Map<number, MyDeckButton> = new Map();
    private deckToButtonMap: Map<number, number> = new Map();
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 0.257
    private readonly BUTTON_HEIGHT: number = 90 / 1080

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckButtonRepositoryImpl {
        if (!MyDeckButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckButtonRepositoryImpl.instance = new MyDeckButtonRepositoryImpl(textureManager);
        }
        return MyDeckButtonRepositoryImpl.instance;
    }

    public async createMyDeckButton(deckId: number, position: Vector2d): Promise<MyDeckButton> {
        const texture = await this.textureManager.getTexture('my_deck_buttons', 0);

        if (!texture) {
            throw new Error('MyDeckButton texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
//         const buttonHeight = this.BUTTON_HEIGHT * window.innerHeight;
        const buttonHeight = buttonWidth * 0.3;

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new MyDeckButton(buttonWidth, buttonHeight, buttonMesh, position);
        this.buttonMap.set(newButton.id, newButton);
        this.deckToButtonMap.set(deckId, newButton.id);

        return newButton;
    }

    public getAllMyDeckButtons(): Map<number, MyDeckButton> {
        return this.buttonMap;
    }

    public findById(id: number): MyDeckButton | null {
        return this.buttonMap.get(id) || null;
    }

    public findAll(): MyDeckButton[] {
        return Array.from(this.buttonMap.values());
    }

    public findButtonByDeckId(deckId: number): MyDeckButton | null {
        const buttonId = this.deckToButtonMap.get(deckId);
        if (buttonId === undefined) {
            return null;
        }
        return this.buttonMap.get(buttonId) || null;
    }

    public deleteButtonByDeckId(deckId: number): void {
        const buttonId = this.deckToButtonMap.get(deckId);
        if (buttonId !== undefined) {
            this.buttonMap.delete(buttonId);
            this.deckToButtonMap.delete(deckId);
        }
    }

    public findButtonIdByDeckId(deckId: number): number {
        const buttonId = this.deckToButtonMap.get(deckId);
        if (buttonId === undefined) {
            throw new Error(`Button not found for deckId: ${deckId}`);
        }
        return buttonId;
    }

    public findAllButtonIds(): number[]{
        return Array.from(this.deckToButtonMap.values());
    }

    public deleteById(id: number): void {
        this.buttonMap.delete(id);
    }

    public deleteAll(): void {
        this.buttonMap.clear();
    }

    hideById(id: number): boolean {
        const button = this.findById(id);
        if (button) {
            button.getMesh().visible = false;
            return true;
        }
        return false;
    }

    showById(id: number): boolean {
        const button = this.findById(id);
        if (button) {
            button.getMesh().visible = true;
            return true;
        }
        return false;
    }
}
