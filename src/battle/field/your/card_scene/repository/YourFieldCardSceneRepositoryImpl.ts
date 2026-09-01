import * as THREE from 'three';

import {YourFieldCardSceneRepository} from "./YourFieldCardSceneRepository";
import {YourFieldCardScene} from "../entity/YourFieldCardScene";

export class YourFieldCardSceneRepositoryImpl implements YourFieldCardSceneRepository {
    private static instance: YourFieldCardSceneRepositoryImpl;
    private cardSceneMap: Map<number, YourFieldCardScene> = new Map();

    private readonly CARD_WIDTH_RATIO: number = 0.06493506493

    private constructor() {}

    public static getInstance(): YourFieldCardSceneRepositoryImpl {
        if (!YourFieldCardSceneRepositoryImpl.instance) {
            YourFieldCardSceneRepositoryImpl.instance = new YourFieldCardSceneRepositoryImpl();
        }
        return YourFieldCardSceneRepositoryImpl.instance;
    }

    count(): number {
        return this.cardSceneMap.size;
    }

    async create(cardMesh: THREE.Mesh): Promise<YourFieldCardScene> {
        const index = this.count();
        const yourFieldCardScene = new YourFieldCardScene(cardMesh);
        this.cardSceneMap.set(index, yourFieldCardScene);

        console.log(`YourFieldCardSceneRepositoryImpl index: ${index}, cardMeshId: ${cardMesh.id}`);

        return yourFieldCardScene;
    }

    findByIndex(id: number): YourFieldCardScene | undefined {
        return this.cardSceneMap.get(id);
    }

    findById(id: number): YourFieldCardScene | undefined {
        for (const cardScene of this.cardSceneMap.values()) {
            if (cardScene.getId() === id) {
                return cardScene;
            }
        }
        return undefined; // id에 해당하는 카드가 없을 경우
    }

    // findIndexByCardMeshId(cardMeshId: number): number | undefined {
    //     for (const [index, cardScene] of this.cardSceneMap.entries()) {
    //         if (cardScene && cardScene.getId() === cardMeshId) {
    //             return index;
    //         }
    //     }
    //     return undefined; // 해당하는 카드가 없을 경우
    // }

    findAll(): YourFieldCardScene[] {
        return Array.from(this.cardSceneMap.values()).filter(scene => scene !== null);
    }

    deleteById(id: number): boolean {
        return this.cardSceneMap.delete(id);
    }

    deleteAll(): void {
        this.cardSceneMap.clear();
    }

    extractByIndex(index: number): YourFieldCardScene | undefined {
        const entries = Array.from(this.cardSceneMap.entries());
        if (index < 0 || index >= entries.length) {
            return undefined;
        }

        const [key, value] = entries[index];
        this.cardSceneMap.delete(key);
        this.cardSceneMap.set(key, null as any);
        return value;
    }
}