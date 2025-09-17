import * as THREE from 'three';
import {MyDeckNameTextRepository} from './MyDeckNameTextRepository';
import {MyDeckNameText} from "../entity/MyDeckNameText";
import {TextGenerator} from "../../text/generator";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {MeshDestroyer} from "../../mesh/destroyer";

export class MyDeckNameTextRepositoryImpl implements MyDeckNameTextRepository {
    private static instance: MyDeckNameTextRepositoryImpl;
    private deckNameTextMap: Map<number, { deckId: number, deckName: string, textMesh: MyDeckNameText }> = new Map(); // text unique id: {deck id: text mesh}
    private deckNameTextGroup: THREE.Group | null = null;

    private meshDestroyer: MeshDestroyer;

    private readonly NAME_WIDTH: number = 0.09375
    private readonly NAME_HEIGHT: number = 0.046296

    private constructor(scene: THREE.Scene) {
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckNameTextRepositoryImpl {
        if (!MyDeckNameTextRepositoryImpl.instance) {
            MyDeckNameTextRepositoryImpl.instance = new MyDeckNameTextRepositoryImpl(scene);
        }
        return MyDeckNameTextRepositoryImpl.instance;
    }

    public async createMyDeckNameText(deckId: number, deckName: string, position: Vector2d): Promise<MyDeckNameText> {
        // To-do pont 종류, 색상 변경 필요
        const generator = new TextGenerator();
        const canvas = generator.createCanvas(deckName, 'Batang', '#FFFFFF', 9, 150);

        if (!canvas) {
            throw new Error('My Deck Name Canvas not found.');
        }

        const texture = generator.createTextureFromCanvas(canvas);
        if (!texture) {
            throw new Error('My Deck Name Texture not found.');
        }

        const nameTexture = texture.image;
        const textWidth = nameTexture.width;
        const textHeight = nameTexture.height;

        console.log(`%c 텍스트 가로 길이: ${textWidth}`, 'color: #ff14b5; font-weight: bold;');
        console.log(`%c 텍스트 세로 길이: ${textHeight}`, 'color: #ff14b5; font-weight: bold;');

        const nameWidth = (textWidth/1800) * window.innerWidth;
        const nameHeight = nameWidth * (textHeight / textWidth);

        const namePositionX = position.getX() * window.innerWidth;
        const namePositionY = position.getY() * window.innerHeight;

        const nameTextMesh = MeshGenerator.createMesh(texture, nameWidth, nameHeight, position);
        nameTextMesh.position.set(namePositionX, namePositionY, 0);

        const newNameTextScene = new MyDeckNameText(nameTextMesh, position, textWidth, textHeight);
        this.deckNameTextMap.set(newNameTextScene.id, { deckId, deckName, textMesh: newNameTextScene });

        return newNameTextScene;
    }

    public findById(textUniqueId: number): MyDeckNameText | null {
        return this.deckNameTextMap.get(textUniqueId)?.textMesh ?? null;
    }

    public findAll(): MyDeckNameText[] {
        return Array.from(this.deckNameTextMap.values()).map(({ textMesh }) => textMesh);
    }

    public findNameTextByDeckId(deckId: number): MyDeckNameText | null {
        for (const { deckId: storedDeckId, textMesh } of this.deckNameTextMap.values()) {
            if (storedDeckId === deckId) {
                return textMesh;
            }
        }
        return null;
    }


    public findDeckNameByDeckId(deckId: number): string | null {
        for (const { deckId: storedDeckId, deckName } of this.deckNameTextMap.values()) {
            if (storedDeckId === deckId) {
                return deckName;
            }
        }
        return null;
    }

    public findNameTextIdByDeckId(deckId: number): number | null {
        for (const [textId, { deckId: storedDeckId }] of this.deckNameTextMap.entries()) {
            if (storedDeckId === deckId) {
                console.log(`Match found! Returning textId: ${textId}`);
                return textId;
            }
        }
        return null;
    }

    public findAllNameTextIdList(): number[]{
        return Array.from(this.deckNameTextMap.keys());
    }

    public findTextDeckIdList(): number[] {
        return Array.from(this.deckNameTextMap.values()).map(({ deckId }) => deckId);
    }

    public findDeckNameList(): string[] {
        return Array.from(this.deckNameTextMap.values()).map(({ deckName }) => deckName);
    }

    public findDeckIdByTextId(textUniqueId: number): number | null {
        return this.deckNameTextMap.get(textUniqueId)?.deckId ?? null;
    }

    public deleteById(textUniqueId: number): void {
        const text = this.findById(textUniqueId);
        if (!text) return;

        const mesh = text.getMesh();
        this.meshDestroyer.destroyMesh(mesh);

        if (this.deckNameTextGroup) {
            this.deckNameTextGroup.remove(mesh);
        }

        this.deckNameTextMap.delete(textUniqueId);
    }

    public deleteTextByDeckId(deckId: number): void {
        const textId = this.findNameTextIdByDeckId(deckId);
        if (textId == null) return;

        const text = this.findById(textId);
        if (!text) return;

        const mesh = text.getMesh();
        this.meshDestroyer.destroyMesh(mesh);

        if (this.deckNameTextGroup) {
            this.deckNameTextGroup.remove(mesh);
        }

        this.deckNameTextMap.delete(textId);
    }

    public deleteAll(): void {
        this.deckNameTextMap.clear();
    }

    public saveTextGroup(): void {
        const newTextGroup = new THREE.Group();
        const textList = this.findAll();
        if (textList == null) return;

        textList.forEach((text) => {
            newTextGroup.add(text.getMesh());
        });

        this.deckNameTextGroup = newTextGroup;
    }

    public findTextGroup(): THREE.Group {
        if (!this.deckNameTextGroup) {
            throw new Error(`My Deck Name Text Group not found`);
        }

        return this.deckNameTextGroup;
    }

    public resetTextGroups(): void {
        this.deckNameTextGroup = null;
    }

}
