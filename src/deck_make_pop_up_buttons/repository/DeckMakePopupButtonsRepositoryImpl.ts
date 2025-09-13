import * as THREE from 'three';
import {DeckMakePopupButtonsRepository} from './DeckMakePopupButtonsRepository';
import {DeckMakePopupButtons} from "../entity/DeckMakePopupButtons";
import {DeckMakePopupButtonsType} from "../entity/DeckMakePopupButtonsType";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckMakePopupButtonsRepositoryImpl implements DeckMakePopupButtonsRepository {
    private static instance: DeckMakePopupButtonsRepositoryImpl;
    private buttonMap: Map<number, DeckMakePopupButtons> = new Map();
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 150 / 1920
    private readonly BUTTON_HEIGHT: number = 45 / 1080

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): DeckMakePopupButtonsRepositoryImpl {
        if (!DeckMakePopupButtonsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            DeckMakePopupButtonsRepositoryImpl.instance = new DeckMakePopupButtonsRepositoryImpl(textureManager);
        }
        return DeckMakePopupButtonsRepositoryImpl.instance;
    }

    public async createDeckMakePopupButtons(
        type: DeckMakePopupButtonsType,
        position: Vector2d
    ): Promise<DeckMakePopupButtons> {
        const texture = await this.textureManager.getTexture('deck_making_pop_up_buttons', type);

        if (!texture) {
            console.error('Failed to load texture for type:', type);
            throw new Error('DeckMakePopupButtons texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (80/360);

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new DeckMakePopupButtons(type, buttonWidth, buttonHeight, buttonMesh, position);
        this.buttonMap.set(newButton.id, newButton);

        return newButton;
    }

    public getAllDeckMakePopupButtons(): Map<number, DeckMakePopupButtons> {
        return this.buttonMap;
    }

    public findById(id: number): DeckMakePopupButtons | null {
        return this.buttonMap.get(id) ?? null;
    }

    public findAll(): DeckMakePopupButtons[] {
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

}
