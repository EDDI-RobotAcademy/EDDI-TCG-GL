import * as THREE from 'three';
import {MyDeckNameTextRepository} from './MyDeckNameTextRepository';
import {MyDeckNameText} from "../entity/MyDeckNameText";
import {TextGenerator} from "../../text/generator";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckNameTextRepositoryImpl implements MyDeckNameTextRepository {
    private static instance: MyDeckNameTextRepositoryImpl;
    private nameTextMap: Map<number, MyDeckNameText> = new Map();
    private deckToNameTextMap: Map<number, number> = new Map();

    private readonly NAME_WIDTH: number = 180 / 1920
    private readonly NAME_HEIGHT: number = 50 / 1080

    private constructor() {}

    public static getInstance(): MyDeckNameTextRepositoryImpl {
        if (!MyDeckNameTextRepositoryImpl.instance) {
            MyDeckNameTextRepositoryImpl.instance = new MyDeckNameTextRepositoryImpl();
        }
        return MyDeckNameTextRepositoryImpl.instance;
    }

    public async createMyDeckNameText(deckId: number, deckName: string, position: Vector2d): Promise<MyDeckNameText> {
        // To-do pont 종류, 색상 변경 필요
        const texture = TextGenerator.createText(deckName, 12, 'CustomFont', '#FFFFFF');

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
        this.nameTextMap.set(newNameTextScene.id, newNameTextScene);
        this.deckToNameTextMap.set(deckId, newNameTextScene.id);

        return newNameTextScene;
    }

    public getAllMyDeckNameText(): Map<number, MyDeckNameText> {
        return this.nameTextMap;
    }

    public findById(id: number): MyDeckNameText | null {
        return this.nameTextMap.get(id) || null;
    }

    public findAll(): MyDeckNameText[] {
        return Array.from(this.nameTextMap.values());
    }

    public findNameTextByDeckId(deckId: number): MyDeckNameText | null {
        const nameTextId = this.deckToNameTextMap.get(deckId);
        if (nameTextId === undefined) {
            return null;
        }
        return this.nameTextMap.get(nameTextId) || null;
    }

    public findNameTextIdByDeckId(deckId: number): number {
        const nameTextId = this.deckToNameTextMap.get(deckId);
        if (nameTextId === undefined) {
            throw new Error(`Button not found for deckId: ${deckId}`);
        }
        return nameTextId;
    }

    public findAllNameTextIds(): number[]{
        return Array.from(this.deckToNameTextMap.values());
    }

    public deleteById(id: number): void {
        this.nameTextMap.delete(id);
    }

    public deleteAll(): void {
        this.nameTextMap.clear();
        this.deckToNameTextMap.clear();
    }

    public deleteNameTextByDeckId(deckId: number): void {
        const nameTextId = this.deckToNameTextMap.get(deckId);
        if (nameTextId !== undefined) {
            this.nameTextMap.delete(nameTextId);
            this.deckToNameTextMap.delete(deckId);
        }
    }

}
