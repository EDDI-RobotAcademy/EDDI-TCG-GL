import * as THREE from 'three';
import {AlertModalButtonsRepository} from './AlertModalButtonsRepository';
import {AlertModalButtons} from "../entity/AlertModalButtons";
import {AlertModalButtonsType} from "../entity/AlertModalButtonsType";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {MeshDestroyer} from "../../mesh/destroyer";
import {Vector2d} from "../../common/math/Vector2d";

export class AlertModalButtonsRepositoryImpl implements AlertModalButtonsRepository {
    private static instance: AlertModalButtonsRepositoryImpl;
    private buttonMap: Map<AlertModalButtonsType, AlertModalButtons> = new Map();

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly BUTTON_WIDTH: number = 150/1920

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): AlertModalButtonsRepositoryImpl {
        if (!AlertModalButtonsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            AlertModalButtonsRepositoryImpl.instance = new AlertModalButtonsRepositoryImpl(textureManager, scene);
        }
        return AlertModalButtonsRepositoryImpl.instance;
    }

    public async createButton(type: AlertModalButtonsType, position: Vector2d): Promise<AlertModalButtons> {
        const texture = await this.textureManager.getTexture('alert_modal_buttons', 0);
        if (!texture) {
            throw new Error(`Alert Modal Button Texture not found`);
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (80/360);
        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);

        const positionX = position.getX() * window.innerWidth;
        const positionY = position.getY() * window.innerHeight;
        buttonMesh.position.set(positionX, positionY, 0);

        const newButton = new AlertModalButtons(type, buttonMesh, buttonWidth, buttonHeight, position);
        this.buttonMap.set(type, newButton);

        return newButton;
    }

    public findButtonByType(type: AlertModalButtonsType): AlertModalButtons | null {
        return this.buttonMap.get(type) ?? null;
    }

    public findAllButtons(): AlertModalButtons[] {
        return Array.from(this.buttonMap.values());
    }

    public deleteButtonByType(type: AlertModalButtonsType): void {
        this.buttonMap.delete(type);
    }

    public deleteAllButtons(): void {
        this.buttonMap.clear();
    }

    public deleteAllButtonMesh(): void {
        const buttonList = this.findAllButtons();
        for (const button of buttonList) {
            this.meshDestroyer.destroyMesh(button.getMesh());
        }
    }

}
