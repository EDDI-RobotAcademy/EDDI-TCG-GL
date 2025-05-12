import * as THREE from 'three';
import {MyDeckNameTextRepository} from './MyDeckNameTextRepository';
import {MyDeckNameText} from "../entity/MyDeckNameText";
import {TextGenerator} from "../../text/generator";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckNameTextRepositoryImpl implements MyDeckNameTextRepository {
    private static instance: MyDeckNameTextRepositoryImpl;
    private deckNameTextMap: Map<number, { deckId: number, textMesh: MyDeckNameText }> = new Map(); // text unique id: {deck id: text mesh}
    private deckNameTextGroup: THREE.Group | null = null;

    private readonly NAME_WIDTH: number = 0.09375
    private readonly NAME_HEIGHT: number = 0.046296

    private constructor() {}

    public static getInstance(): MyDeckNameTextRepositoryImpl {
        if (!MyDeckNameTextRepositoryImpl.instance) {
            MyDeckNameTextRepositoryImpl.instance = new MyDeckNameTextRepositoryImpl();
        }
        return MyDeckNameTextRepositoryImpl.instance;
    }

    public async createMyDeckNameText(deckId: number, deckName: string, position: Vector2d): Promise<MyDeckNameText> {
        // To-do pont 종류, 색상 변경 필요
        const generator = new TextGenerator();
        const texture = generator.createText(deckName, 9, 'CustomFont', '#FFFFFF');

        if (!texture) {
            throw new Error('MyDeckButton Name not found.');
        }

        const canvas = texture.image;
        const textWidth = canvas.width;
        const textHeight = canvas.height;

        const nameWidth = textWidth;
        const nameHeight = textHeight;

        const namePositionX = position.getX() * window.innerWidth;
        const namePositionY = position.getY() * window.innerHeight;

        const nameTextMesh = MeshGenerator.createMesh(texture, nameWidth, nameHeight, position);
        nameTextMesh.position.set(namePositionX, namePositionY, 0);

        const newNameTextScene = new MyDeckNameText(nameTextMesh, position, nameWidth, nameHeight);
        this.deckNameTextMap.set(newNameTextScene.id, { deckId, textMesh: newNameTextScene });

        return newNameTextScene;
    }

    public findById(textUniqueId: number): MyDeckNameText | null {
        const text = this.deckNameTextMap.get(textUniqueId);
        if (text) {
            return text.textMesh;
        } else {
            return null;
        }
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

    public findDeckIdByTextId(textUniqueId: number): number | null {
        const text = this.deckNameTextMap.get(textUniqueId);
        if (text) {
            return text.deckId;
        } else {
            return null;
        }
    }

    public deleteById(textUniqueId: number): void {
        this.deckNameTextMap.delete(textUniqueId);
    }

    public deleteTextByDeckId(deckId: number): void {
        const textId = this.findNameTextIdByDeckId(deckId);
        if (textId) {
            this.deckNameTextMap.delete(textId);
        }
    }

    public deleteAll(): void {
        this.deckNameTextMap.clear();
    }

    public findAllTextGroups(): THREE.Group {
        if (!this.deckNameTextGroup) {
            this.deckNameTextGroup = new THREE.Group();
            for (const { textMesh } of this.deckNameTextMap.values()) {
                this.deckNameTextGroup.add(textMesh.getMesh());
            }
        }
        console.log(`%c[DEBUG] deckNameTextGroup 생성됨 ${this.deckNameTextGroup.children}`, 'color: #00FFBF; font-weight: bold;');
        return this.deckNameTextGroup;
    }

    public resetTextGroups(): void {
        this.deckNameTextGroup = null;
    }

    public hideText(deckId: number): void {
        const text = this.findNameTextByDeckId(deckId);
        if (text) {
            text.getMesh().visible = false;
        }
    }

    public showText(deckId: number): void {
        const text = this.findNameTextByDeckId(deckId);
        if (text) {
            text.getMesh().visible = true;
        }
    }

}
