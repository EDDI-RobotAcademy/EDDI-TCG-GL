import * as THREE from 'three';
import {DeckNameEditButtonRepository} from './DeckNameEditButtonRepository';
import {DeckNameEditButton} from "../entity/DeckNameEditButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckNameEditButtonRepositoryImpl implements DeckNameEditButtonRepository {
    private static instance: DeckNameEditButtonRepositoryImpl;
    private buttonMap: Map<number, { deckId: number, buttonMesh: DeckNameEditButton }> = new Map(); // button Unique ID: [deck ID: button mesh]
    private textureManager: TextureManager;
    private buttonGroup: THREE.Group | null = null;

    private readonly BUTTON_WIDTH: number = 0.034

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): DeckNameEditButtonRepositoryImpl {
        if (!DeckNameEditButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            DeckNameEditButtonRepositoryImpl.instance = new DeckNameEditButtonRepositoryImpl(textureManager);
        }
        return DeckNameEditButtonRepositoryImpl.instance;
    }

    public async createDeckNameEditButton(deckId: number, position: Vector2d): Promise<DeckNameEditButton> {
        const texture = await this.textureManager.getTexture('deck_edit_remove_button', 1);
        if (!texture) {
            throw new Error(`Texture for Deck Name Edit Button(Deck Id: ${deckId}) not found`);
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * 0.9;

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new DeckNameEditButton(buttonMesh, position);
        this.buttonMap.set(newButton.id, { deckId: deckId, buttonMesh: newButton });

        return newButton
    }

    public findAll(): DeckNameEditButton[] {
        return Array.from(this.buttonMap.values()).map(({ buttonMesh }) => buttonMesh);
    }

    public findButtonByDeckId(deckId: number): DeckNameEditButton | null {
        for (const { deckId: storedDeckId, buttonMesh } of this.buttonMap.values()) {
            if (storedDeckId === deckId) {
                return buttonMesh;
            }
        }
        return null;
    }

    public findButtonByButtonUniqueId(buttonUniqueId: number): DeckNameEditButton | null {
        const button = this.buttonMap.get(buttonUniqueId);
        if (button) {
            return button.buttonMesh;
        } else {
            return null;
        }
    }

    public findDeckIdByButtonUniqueId(buttonUniqueId: number): number | null {
        const button = this.buttonMap.get(buttonUniqueId);
        if (button) {
            return button.deckId;
        } else {
            return null;
        }
    }

    public findButtonDeckIdList(): number[] {
        return Array.from(this.buttonMap.values()).map(({ deckId }) => deckId);
    }

    public deleteButtonByButtonUniqueId(buttonUniqueId: number): void {
        this.buttonMap.delete(buttonUniqueId);
    }

    public deleteAllButton(): void {
        this.buttonMap.clear();
    }

    public findAllButtonGroups(): THREE.Group {
        if (!this.buttonGroup) {
            this.buttonGroup = new THREE.Group();
            for (const { buttonMesh } of this.buttonMap.values()) {
                this.buttonGroup.add(buttonMesh.getMesh());
            }
        }
        console.log(`%c[DEBUG] Deck Name Edit Button Group create ${this.buttonGroup}`, 'color: #F79F81; font-weight: bold;');
        return this.buttonGroup;
    }

    public resetButtonGroups(): void {
        this.buttonGroup = null;
    }

}
