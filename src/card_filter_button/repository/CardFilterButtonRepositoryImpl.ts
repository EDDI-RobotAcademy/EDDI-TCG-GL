import * as THREE from 'three';
import {CardFilterButtonRepository} from './CardFilterButtonRepository';
import {CardFilterButton} from "../entity/CardFilterButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {MeshDestroyer} from "../../mesh/destroyer"

export class CardFilterButtonRepositoryImpl implements CardFilterButtonRepository {
    private static instance: CardFilterButtonRepositoryImpl;
    private filterButton: CardFilterButton | null = null;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly BUTTON_WIDTH: number = 0.023; // 가로:세로 = 48:40
    private readonly BUTTON_POSITION_X: number = 0.07
    private readonly BUTTON_POSITION_Y: number = 0.273

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterButtonRepositoryImpl {
        if (!CardFilterButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            CardFilterButtonRepositoryImpl.instance = new CardFilterButtonRepositoryImpl(textureManager, scene);
        }
        return CardFilterButtonRepositoryImpl.instance;
    }

    public async createButton(): Promise<CardFilterButton> {
        const texture = await this.textureManager.getTexture('filter_button', 1);

        if (!texture) {
            throw new Error('Card Filter Button texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (40/48);

        const buttonPositionX = this.BUTTON_POSITION_X * window.innerWidth;
        const buttonPositionY = this.BUTTON_POSITION_Y * window.innerHeight;
        const position = new Vector2d(this.BUTTON_POSITION_X, this.BUTTON_POSITION_Y);

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new CardFilterButton(buttonWidth, buttonHeight, buttonMesh, position);
        this.filterButton = newButton;

        return newButton;
    }

    public findButton(): CardFilterButton | null {
        return this.filterButton;
    }

    public deleteButton(): void {
        const filterButton = this.findButton();
        if (filterButton == null) return;

        const filterButtonMesh = filterButton.getMesh();
        this.meshDestroyer.destroyMesh(filterButtonMesh);

        this.filterButton = null;
    }

}
