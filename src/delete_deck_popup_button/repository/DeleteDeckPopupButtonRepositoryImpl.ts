import * as THREE from 'three';
import {DeleteDeckPopupButtonRepository} from './DeleteDeckPopupButtonRepository';
import {DeleteDeckPopupButton} from "../entity/DeleteDeckPopupButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeleteDeckPopupButtonRepositoryImpl implements DeleteDeckPopupButtonRepository {
    private static instance: DeleteDeckPopupButtonRepositoryImpl;
    private buttonMap: Map<number, DeleteDeckPopupButton> = new Map();
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 150 / 1920

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): DeleteDeckPopupButtonRepositoryImpl {
        if (!DeleteDeckPopupButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            DeleteDeckPopupButtonRepositoryImpl.instance = new DeleteDeckPopupButtonRepositoryImpl(textureManager);
        }
        return DeleteDeckPopupButtonRepositoryImpl.instance;
    }

    public async createDeleteDeckPopupButton(type: number, position: Vector2d): Promise<DeleteDeckPopupButton> {
        const texture = await this.textureManager.getTexture('delete_deck_popup_button', type);

        if (!texture) {
            console.error('Failed to load texture for type:', type);
            throw new Error('Delete Deck Popup Button texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (80/360);

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new DeleteDeckPopupButton(type, buttonMesh, position);
        this.buttonMap.set(newButton.id, newButton);

        return newButton;
    }

    public findButtonById(id: number): DeleteDeckPopupButton | null {
        return this.buttonMap.get(id) || null;
    }

    public findAllButton(): DeleteDeckPopupButton[] {
        return Array.from(this.buttonMap.values());
    }

    public deleteById(id: number): void {
        this.buttonMap.delete(id);
    }

    public deleteAll(): void {
        this.buttonMap.clear();
    }

    public findAllButtonIdList(): number[] {
        return Array.from(this.buttonMap.keys());
    }

}
