import * as THREE from 'three';
import { MyDeckButtonEffectRepository } from './MyDeckButtonEffectRepository';
import {MyDeckButtonEffect} from "../entity/MyDeckButtonEffect";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckButtonEffectRepositoryImpl implements MyDeckButtonEffectRepository {
    private static instance: MyDeckButtonEffectRepositoryImpl;
    private deckButtonEffectMap: Map<number, { deckId: number, effectMesh: MyDeckButtonEffect }> = new Map(); // effect unique id: {deck id: button mesh}
    private deckButtonEffectGroup: THREE.Group | null = null;
    private textureManager: TextureManager;

    private readonly BUTTON_WIDTH: number = 0.257
    private readonly BUTTON_HEIGHT: number = 90 / 1080

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckButtonEffectRepositoryImpl {
        if (!MyDeckButtonEffectRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckButtonEffectRepositoryImpl.instance = new MyDeckButtonEffectRepositoryImpl(textureManager);
        }
        return MyDeckButtonEffectRepositoryImpl.instance;
    }

    public async createMyDeckButtonEffect(deckId: number, position: Vector2d): Promise<MyDeckButtonEffect> {
        const texture = await this.textureManager.getTexture('my_deck_buttons', 1);

        if (!texture) {
            throw new Error('MyDeckButtonEffect texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
//         const buttonHeight = this.BUTTON_HEIGHT * window.innerHeight;
        const buttonHeight = buttonWidth * 0.3;

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButtonEffect = new MyDeckButtonEffect(buttonWidth, buttonHeight, buttonMesh, position);
        this.deckButtonEffectMap.set(newButtonEffect.id, { deckId, effectMesh: newButtonEffect });

        return newButtonEffect;
    }

    public findById(effectId: number): MyDeckButtonEffect | null {
        const effect = this.deckButtonEffectMap.get(effectId);
        if (effect) {
            return effect.effectMesh;
        } else {
            return null;
        }
    }

    public findAll(): MyDeckButtonEffect[] {
        return Array.from(this.deckButtonEffectMap.values()).map(({ effectMesh }) => effectMesh);
    }

    public findEffectByDeckId(deckId: number): MyDeckButtonEffect | null {
        for (const { deckId: storedDeckId, effectMesh } of this.deckButtonEffectMap.values()) {
            if (storedDeckId === deckId) {
                return effectMesh;
            }
        }
        return null;
    }

    public findEffectIdByDeckId(deckId: number): number | null {
        for (const [effectId, { deckId: storedDeckId }] of this.deckButtonEffectMap.entries()) {
            if (storedDeckId === deckId) {
                console.log(`Match found! Returning effect ID: ${effectId}`);
                return effectId;
            }
        }
        return null;
    }

    public findAllEffectIds(): number[] {
        return Array.from(this.deckButtonEffectMap.keys());
    }

    public findEffectDeckIdList(): number[] {
        return Array.from(this.deckButtonEffectMap.values()).map(({ deckId }) => deckId);
    }

    public deleteById(effectId: number): void {
        this.deckButtonEffectMap.delete(effectId);
    }

    public deleteEffectByDeckId(deckId: number): void {
        const effectId = this.findEffectIdByDeckId(deckId);
        if (effectId) {
            this.deckButtonEffectMap.delete(effectId);
        }
    }

    public deleteAll(): void {
        this.deckButtonEffectMap.clear();
    }

    hideById(id: number): boolean {
        const effect = this.findById(id);
        if (effect) {
            effect.getMesh().visible = false;
            return true;
        }
        return false;
    }

    showById(id: number): boolean {
        const button = this.findById(id);
        if (button) {
            button.getMesh().visible = true;
            return true;
        }
        return false;
    }

    public findAllEffectGroups(): THREE.Group {
        if (!this.deckButtonEffectGroup) {
            this.deckButtonEffectGroup = new THREE.Group();
            for (const { effectMesh } of this.deckButtonEffectMap.values()) {
                this.deckButtonEffectGroup.add(effectMesh.getMesh());
            }
        }
        return this.deckButtonEffectGroup;
    }

    public resetEffectGroups(): void {
        this.deckButtonEffectGroup = null;
    }

    public hideEffect(deckId: number): void {
        const effect = this.findEffectByDeckId(deckId);
        if (effect) {
            effect.getMesh().visible = false;
        }
    }

    public showEffect(deckId: number): void {
        const effect = this.findEffectByDeckId(deckId);
        if (effect) {
            effect.getMesh().visible = true;
        }
    }

}
