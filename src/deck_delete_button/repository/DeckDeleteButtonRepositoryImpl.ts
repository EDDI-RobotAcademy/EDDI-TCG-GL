import * as THREE from 'three';
import {DeckDeleteButtonRepository} from './DeckDeleteButtonRepository';
import {DeckDeleteButton} from "../entity/DeckDeleteButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckDeleteButtonRepositoryImpl implements DeckDeleteButtonRepository {
    private static instance: DeckDeleteButtonRepositoryImpl;
    private buttonMap: Map<number, { deckId: number, buttonMesh: DeckDeleteButton }> = new Map(); // button Unique ID: [deck ID: card mesh]
    private textureManager: TextureManager;
    private buttonGroup: THREE.Group | null = null;

    private readonly BUTTON_WIDTH: number = 0.034

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): DeckDeleteButtonRepositoryImpl {
        if (!DeckDeleteButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            DeckDeleteButtonRepositoryImpl.instance = new DeckDeleteButtonRepositoryImpl(textureManager);
        }
        return DeckDeleteButtonRepositoryImpl.instance;
    }

    public async createDeckDeleteButton(deckId: number, position: Vector2d): Promise<DeckDeleteButton> {
        const texture = await this.textureManager.getTexture('deck_edit_remove_button', 2);
        if (!texture) {
            throw new Error(`Texture for Deck Delete Button(Deck Id: ${deckId}) not found`);
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * 0.9;

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new DeckDeleteButton(buttonMesh, position);
        this.buttonMap.set(newButton.id, { deckId: deckId, buttonMesh: newButton });

        return newButton
    }

    public findAll(): DeckDeleteButton[] {
        return Array.from(this.buttonMap.values()).map(({ buttonMesh }) => buttonMesh);
    }

    public findButtonByDeckId(deckId: number): DeckDeleteButton | null {
        for (const { deckId: storedDeckId, buttonMesh } of this.buttonMap.values()) {
            if (storedDeckId === deckId) {
                return buttonMesh;
            }
        }
        return null;
    }

    public findButtonByButtonUniqueId(buttonUniqueId: number): DeckDeleteButton | null {
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
        console.log(`%c[DEBUG] Deck Delete Button Group create ${this.buttonGroup}`, 'color: #F79F81; font-weight: bold;');
        return this.buttonGroup;
    }

    public resetButtonGroups(): void {
        this.buttonGroup = null;
    }

}
