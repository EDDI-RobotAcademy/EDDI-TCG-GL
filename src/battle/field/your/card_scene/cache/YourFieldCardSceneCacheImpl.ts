import * as THREE from 'three';
import { DisposableMeshStore, disposeMesh } from "../../../../../core/lifecycle/DisposableMeshStore";

import {YourFieldCardSceneCache} from "./YourFieldCardSceneCache";
import {YourFieldCardScene} from "../entity/YourFieldCardScene";

export class YourFieldCardSceneCacheImpl implements YourFieldCardSceneCache, DisposableMeshStore {
    private static instance: YourFieldCardSceneCacheImpl;
    private cardSceneMap: Map<number, YourFieldCardScene> = new Map();

    private readonly CARD_WIDTH_RATIO: number = 0.06493506493

    private constructor() {}

    public static getInstance(): YourFieldCardSceneCacheImpl {
        if (!YourFieldCardSceneCacheImpl.instance) {
            YourFieldCardSceneCacheImpl.instance = new YourFieldCardSceneCacheImpl();
        }
        return YourFieldCardSceneCacheImpl.instance;
    }

    count(): number {
        return this.cardSceneMap.size;
    }

    async create(cardMesh: THREE.Mesh): Promise<YourFieldCardScene> {
        const index = this.count();
        const yourFieldCardScene = new YourFieldCardScene(cardMesh);
        this.cardSceneMap.set(index, yourFieldCardScene);

        console.log(`YourFieldCardSceneCacheImpl index: ${index}, cardMeshId: ${cardMesh.id}`);

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

    // 담고 있는 메시를 화면에서 빼고 그래픽 카드 자원을 놓아준 뒤 비운다.
    // 아직 아무도 부르지 않는다. 부르기 시작하는 것은 R2-32 다.
    // deleteAll 은 지도만 비운다. 그래픽 카드에 올라간 것은 그대로 남는다.
    dispose(): void {
        this.cardSceneMap.forEach((scene) => disposeMesh(scene.getMesh()));
        this.cardSceneMap.clear();
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