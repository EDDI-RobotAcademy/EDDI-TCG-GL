import * as THREE from 'three';
import {DeckEditButtonRepository} from './DeckEditButtonRepository';
import {DeckEditButton} from "../entity/DeckEditButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckEditButtonRepositoryImpl implements DeckEditButtonRepository {
    private static instance: DeckEditButtonRepositoryImpl;
    private buttonMap: Map<number, DeckEditButton> = new Map(); // button Unique ID: button mesh
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 0.18

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): DeckEditButtonRepositoryImpl {
        if (!DeckEditButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            DeckEditButtonRepositoryImpl.instance = new DeckEditButtonRepositoryImpl(textureManager);
        }
        return DeckEditButtonRepositoryImpl.instance;
    }

    public async createDeckEditButton(type: number, position: Vector2d): Promise<DeckEditButton> {
        const texture = await this.textureManager.getTexture('deck_edit_done_button', type);
        if (!texture) {
            throw new Error(`Texture for Deck Edit Button(button Id: ${type}) not found`);
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (250/950);

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new DeckEditButton(buttonMesh, position);
        if (type == 1) {
            newButton.setVisibility(false);
        }
        this.buttonMap.set(newButton.id, newButton);

        return newButton
    }

    public findAll(): DeckEditButton[] {
        return Array.from(this.buttonMap.values());
    }

    public findButtonById(buttonUniqueId: number): DeckEditButton | null {
        return this.buttonMap.get(buttonUniqueId) || null;
    }

    public findAllButtonIds(): number[] {
        return Array.from(this.buttonMap.keys());
    }

    public deleteButtonById(buttonUniqueId: number): void {
        this.buttonMap.delete(buttonUniqueId);
    }

    public deleteAll(): void {
        this.buttonMap.clear();
    }

}
