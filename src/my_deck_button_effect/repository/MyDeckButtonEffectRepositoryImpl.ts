import * as THREE from 'three';
import { MyDeckButtonEffectRepository } from './MyDeckButtonEffectRepository';
import {MyDeckButtonEffect} from "../entity/MyDeckButtonEffect";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckButtonEffectRepositoryImpl implements MyDeckButtonEffectRepository {
    private static instance: MyDeckButtonEffectRepositoryImpl;
    private effectMap: Map<number, MyDeckButtonEffect> = new Map();
    private deckToEffectMap: Map<number, number> = new Map();
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
        this.effectMap.set(newButtonEffect.id, newButtonEffect);
        this.deckToEffectMap.set(deckId, newButtonEffect.id);

        return newButtonEffect;
    }

    public getAllMyDeckButtonEffect(): Map<number, MyDeckButtonEffect> {
        return this.effectMap;
    }

    public findById(id: number): MyDeckButtonEffect | null {
        return this.effectMap.get(id) || null;
    }

    public findAll(): MyDeckButtonEffect[] {
        return Array.from(this.effectMap.values());
    }

    public findEffectByDeckId(deckId: number): MyDeckButtonEffect | null {
        const effectId = this.deckToEffectMap.get(deckId);
        if (effectId === undefined) {
            return null;
        }
        return this.effectMap.get(effectId) || null;
    }

    public deleteEffectByDeckId(deckId: number): void {
        const effectId = this.deckToEffectMap.get(deckId);
        if (effectId !== undefined) {
            this.effectMap.delete(effectId);
            this.deckToEffectMap.delete(deckId);
        }
    }

    public findEffectIdByDeckId(deckId: number): number {
        const effectId = this.deckToEffectMap.get(deckId);
        if (effectId === undefined) {
            throw new Error(`Button not found for deckId: ${deckId}`);
        }
        return effectId
    }

    public findAllEffectIds(): number[]{
        return Array.from(this.deckToEffectMap.values());
    }

    public deleteById(id: number): void {
        this.effectMap.delete(id);
    }

    public deleteAll(): void {
        this.effectMap.clear();
    }

    hideById(id: number): boolean {
        const button = this.findById(id);
        if (button) {
            button.getMesh().visible = false;
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
}
