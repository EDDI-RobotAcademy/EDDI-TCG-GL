import * as THREE from 'three';
import {DeckNameEditPopupButtonsRepository} from './DeckNameEditPopupButtonsRepository';
import {DeckNameEditPopupButtons} from "../entity/DeckNameEditPopupButtons";
import {DeckNameEditPopupButtonsType} from "../entity/DeckNameEditPopupButtonsType";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckNameEditPopupButtonsRepositoryImpl implements DeckNameEditPopupButtonsRepository {
    private static instance: DeckNameEditPopupButtonsRepositoryImpl;
    private buttonMap: Map<number, DeckNameEditPopupButtons> = new Map();
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 150 / 1920

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): DeckNameEditPopupButtonsRepositoryImpl {
        if (!DeckNameEditPopupButtonsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            DeckNameEditPopupButtonsRepositoryImpl.instance = new DeckNameEditPopupButtonsRepositoryImpl(textureManager);
        }
        return DeckNameEditPopupButtonsRepositoryImpl.instance;
    }

    public async createPopupButtons(
        type: DeckNameEditPopupButtonsType,
        position: Vector2d
    ): Promise<DeckNameEditPopupButtons> {
        const texture = await this.textureManager.getTexture('deck_name_edit_pop_up_buttons', type);

        if (!texture) {
            console.error('Failed to load texture for type:', type);
            throw new Error('Deck Name Edit Popup Buttons texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (80/360);

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new DeckNameEditPopupButtons(type, buttonWidth, buttonHeight, buttonMesh, position);
        this.buttonMap.set(newButton.id, newButton);

        return newButton;
    }

    public findButtonById(id: number): DeckNameEditPopupButtons | null {
        return this.buttonMap.get(id) ?? null;
    }

    public findAllButtons(): DeckNameEditPopupButtons[] {
        return Array.from(this.buttonMap.values());
    }

    public deleteButtonById(id: number): void {
        this.buttonMap.delete(id);
    }

    public deleteAllButtons(): void {
        this.buttonMap.clear();
    }

    public findAllButtonIds(): number[] {
        return Array.from(this.buttonMap.keys());
    }

}
