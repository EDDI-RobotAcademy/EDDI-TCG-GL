import * as THREE from 'three';
import { MyDeckButtonEffectRepository } from './MyDeckButtonEffectRepository';
import {MyDeckButtonEffect} from "../entity/MyDeckButtonEffect";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {MeshDestroyer} from "../../mesh/destroyer";

export class MyDeckButtonEffectRepositoryImpl implements MyDeckButtonEffectRepository {
    private static instance: MyDeckButtonEffectRepositoryImpl;
    private deckButtonEffectMap: Map<number, { deckId: number, effectMesh: MyDeckButtonEffect }> = new Map(); // effect unique id: {deck id: button mesh}
    private deckButtonEffectGroup: THREE.Group | null = null;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly BUTTON_WIDTH: number = 0.18 //0.257
    private readonly BUTTON_HEIGHT: number = 90 / 1080

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckButtonEffectRepositoryImpl {
        if (!MyDeckButtonEffectRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckButtonEffectRepositoryImpl.instance = new MyDeckButtonEffectRepositoryImpl(textureManager, scene);
        }
        return MyDeckButtonEffectRepositoryImpl.instance;
    }

    public async createMyDeckButtonEffect(deckId: number, position: Vector2d): Promise<MyDeckButtonEffect> {
        const texture = await this.textureManager.getTexture('my_deck_buttons', 1);

        if (!texture) {
            throw new Error('MyDeckButtonEffect texture not found.');
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth * (240/1040);

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButtonEffect = new MyDeckButtonEffect(buttonMesh, position);
        this.deckButtonEffectMap.set(newButtonEffect.id, { deckId, effectMesh: newButtonEffect });

        return newButtonEffect;
    }

    public findById(effectId: number): MyDeckButtonEffect | null {
        return this.deckButtonEffectMap.get(effectId)?.effectMesh ?? null;
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
        const effect = this.findById(effectId);
        if (!effect) return;

        const mesh = effect.getMesh();
        this.meshDestroyer.destroyMesh(mesh);

        if (this.deckButtonEffectGroup) {
            this.deckButtonEffectGroup.remove(mesh);
        }

        this.deckButtonEffectMap.delete(effectId);
    }

    public deleteEffectByDeckId(deckId: number): void {
        const effectId = this.findEffectIdByDeckId(deckId);
        if (effectId === null) return;

        const effect = this.findById(effectId);
        if (!effect) return;

        const mesh = effect.getMesh();
        this.meshDestroyer.destroyMesh(mesh);

        if (this.deckButtonEffectGroup) {
            this.deckButtonEffectGroup.remove(mesh);
        }

        this.deckButtonEffectMap.delete(effectId);
    }

    public deleteAll(): void {
        this.deckButtonEffectMap.clear();
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

}
