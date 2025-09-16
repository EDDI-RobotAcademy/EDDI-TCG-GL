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

}
