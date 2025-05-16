import * as THREE from 'three';
import {DeckEditDoneButtonRepository} from './DeckEditDoneButtonRepository';
import {DeckEditDoneButton} from "../entity/DeckEditDoneButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckEditDoneButtonRepositoryImpl implements DeckEditDoneButtonRepository {
    private static instance: DeckEditDoneButtonRepositoryImpl;
    private buttonMap: Map<number, DeckEditDoneButton> = new Map(); // button Unique ID: button mesh
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 0.18

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): DeckEditDoneButtonRepositoryImpl {
        if (!DeckEditDoneButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            DeckEditDoneButtonRepositoryImpl.instance = new DeckEditDoneButtonRepositoryImpl(textureManager);
        }
        return DeckEditDoneButtonRepositoryImpl.instance;
    }

    public async createDeckEditDoneButton(type: number, position: Vector2d): Promise<DeckEditDoneButton> {
        const texture = await this.textureManager.getTexture('deck_edit_done_button', type);
        if (!texture) {
            throw new Error(`Texture for Deck Edit Done Button(button Id: ${type}) not found`);
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (250/950);

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new DeckEditDoneButton(buttonMesh, position);
        this.buttonMap.set(newButton.id, newButton);

        return newButton
    }

    public findAll(): DeckEditDoneButton[] {
        return Array.from(this.buttonMap.values());
    }

    public findButtonById(buttonUniqueId: number): DeckEditDoneButton | null {
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
