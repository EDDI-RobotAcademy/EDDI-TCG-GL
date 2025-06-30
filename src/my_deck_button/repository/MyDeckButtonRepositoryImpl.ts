import * as THREE from 'three';
import { MyDeckButtonRepository } from './MyDeckButtonRepository';
import {MyDeckButton} from "../entity/MyDeckButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MyDeckButtonType} from "../entity/MyDeckButtonType";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {MeshDestroyer} from "../../mesh/destroyer";

export class MyDeckButtonRepositoryImpl implements MyDeckButtonRepository {
    private static instance: MyDeckButtonRepositoryImpl;
    private deckButtonMap: Map<number, { deckId: number, buttonMesh: MyDeckButton }> = new Map(); // button unique id: {deck id: button mesh}
    private deckButtonGroup: THREE.Group | null = null;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly BUTTON_WIDTH: number = 0.18 //0.257
    private readonly BUTTON_HEIGHT: number = 0.083333

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckButtonRepositoryImpl {
        if (!MyDeckButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckButtonRepositoryImpl.instance = new MyDeckButtonRepositoryImpl(textureManager, scene);
        }
        return MyDeckButtonRepositoryImpl.instance;
    }

    public async createMyDeckButton(deckId: number, position: Vector2d): Promise<MyDeckButton> {
        const texture = await this.textureManager.getTexture('my_deck_buttons', 0);

        if (!texture) {
            throw new Error('MyDeckButton texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (240/1040);

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new MyDeckButton(buttonMesh, position);
        this.deckButtonMap.set(newButton.id, { deckId, buttonMesh: newButton });

        return newButton;
    }

    public findById(buttonId: number): MyDeckButton | null {
        return this.deckButtonMap.get(buttonId)?.buttonMesh ?? null;
    }

    public findAll(): MyDeckButton[] {
        return Array.from(this.deckButtonMap.values()).map(({ buttonMesh }) => buttonMesh);
    }

    public findButtonByDeckId(deckId: number): MyDeckButton | null {
        for (const { deckId: storedDeckId, buttonMesh } of this.deckButtonMap.values()) {
            if (storedDeckId === deckId) {
                return buttonMesh;
            }
        }
        return null;
    }

    public findButtonIdByDeckId(deckId: number): number | null {
        for (const [buttonId, { deckId: storedDeckId }] of this.deckButtonMap.entries()) {
            if (storedDeckId === deckId) {
                console.log(`Match found! Returning buttonId: ${buttonId}`);
                return buttonId;
            }
        }
        return null;
    }

    public findAllButtonIds(): number[] {
        return Array.from(this.deckButtonMap.keys());
    }

    public findButtonDeckIdList(): number[] {
        return Array.from(this.deckButtonMap.values()).map(({ deckId }) => deckId);
    }

    public findDeckIdByButtonId(buttonId: number): number | null {
        return this.deckButtonMap.get(buttonId)?.deckId ?? null;
    }

    public deleteButtonByDeckId(deckId: number): void {
        const buttonId = this.findButtonIdByDeckId(deckId);
        if (buttonId === null) return;

        const button = this.findById(buttonId);
        if (!button) return;

        const mesh = button.getMesh();
        this.meshDestroyer.destroyMesh(mesh);

        if (this.deckButtonGroup) {
            this.deckButtonGroup.remove(mesh);
        }

        this.deckButtonMap.delete(buttonId);
    }

    public deleteById(buttonId: number): void {
        const button = this.findById(buttonId);
        if (!button) return;

        const mesh = button.getMesh();
        this.meshDestroyer.destroyMesh(mesh);

        if (this.deckButtonGroup) {
            this.deckButtonGroup.remove(mesh);
        }

        this.deckButtonMap.delete(buttonId);
    }

    public deleteAll(): void {
        this.deckButtonMap.clear();
    }

    public findAllButtonGroups(): THREE.Group {
        if (!this.deckButtonGroup) {
            this.deckButtonGroup = new THREE.Group();
            for (const { buttonMesh } of this.deckButtonMap.values()) {
                this.deckButtonGroup.add(buttonMesh.getMesh());
            }
        }
        console.log(`%c[DEBUG] deckButtonGroup 생성됨 ${this.deckButtonGroup}`, 'color: #00FFBF; font-weight: bold;');
        return this.deckButtonGroup;
    }

    public resetButtonGroups(): void {
        this.deckButtonGroup = null;
    }

    public findDeckCount(): number {
        return this.deckButtonMap.size;
    }
}
