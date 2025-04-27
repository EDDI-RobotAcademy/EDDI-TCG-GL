import * as THREE from 'three';
import {BuildDeckButtonRepository} from './BuildDeckButtonRepository';
import {BuildDeckButton} from "../entity/BuildDeckButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class BuildDeckButtonRepositoryImpl implements BuildDeckButtonRepository {
    private static instance: BuildDeckButtonRepositoryImpl;
    private buttonMap: Map<number, BuildDeckButton> = new Map();
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 0.18

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): BuildDeckButtonRepositoryImpl {
        if (!BuildDeckButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            BuildDeckButtonRepositoryImpl.instance = new BuildDeckButtonRepositoryImpl(textureManager);
        }
        return BuildDeckButtonRepositoryImpl.instance;
    }

    public async createBuildDeckButton(type: number, position: Vector2d): Promise<BuildDeckButton> {
        const texture = await this.textureManager.getTexture('create_new_deck_button', type);

        if (!texture) {
            console.error('Failed to load texture for type number:', type);
            throw new Error('Build Deck Button texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (240/1040);

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new BuildDeckButton(type, buttonWidth, buttonHeight, buttonMesh, position);
        this.buttonMap.set(newButton.id, newButton);

        return newButton;
    }

    public findButtonById(id: number): BuildDeckButton | null {
        return this.buttonMap.get(id) || null;
    }

    public findAllButton(): BuildDeckButton[] {
        return Array.from(this.buttonMap.values());
    }

    public deleteById(id: number): void {
        this.buttonMap.delete(id);
    }

    public deleteAll(): void {
        this.buttonMap.clear();
    }

    public findAllButtonIds(): number[] {
        return Array.from(this.buttonMap.keys());
    }

    public hideButton(buttonId: number): void {
        const button = this.findButtonById(buttonId);
        if (button) {
            button.getMesh().visible = false;
        }
    }

    public showButton(buttonId: number): void {
        const button = this.findButtonById(buttonId);
        if (button) {
            button.getMesh().visible = true;
        }
    }
}
