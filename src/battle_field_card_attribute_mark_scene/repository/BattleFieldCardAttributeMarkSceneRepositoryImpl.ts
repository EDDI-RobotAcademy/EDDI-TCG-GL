import { DisposableMeshStore, disposeMesh } from "../../core/lifecycle/DisposableMeshStore";
import { BattleFieldCardAttributeMarkSceneRepository } from './BattleFieldCardAttributeMarkSceneRepository';
import {BattleFieldCardAttributeMarkScene} from "../entity/BattleFieldCardAttributeMarkScene";

export class BattleFieldCardAttributeMarkSceneRepositoryImpl implements BattleFieldCardAttributeMarkSceneRepository, DisposableMeshStore {
    private static instance: BattleFieldCardAttributeMarkSceneRepositoryImpl;
    private scenes: BattleFieldCardAttributeMarkScene[] = [];

    private constructor() {}

    public static getInstance(): BattleFieldCardAttributeMarkSceneRepositoryImpl {
        if (!BattleFieldCardAttributeMarkSceneRepositoryImpl.instance) {
            BattleFieldCardAttributeMarkSceneRepositoryImpl.instance = new BattleFieldCardAttributeMarkSceneRepositoryImpl();
        }
        return BattleFieldCardAttributeMarkSceneRepositoryImpl.instance;
    }

    async save(scene: BattleFieldCardAttributeMarkScene): Promise<BattleFieldCardAttributeMarkScene> {
        this.scenes.push(scene);
        return scene;
    }

    async findById(id: number): Promise<BattleFieldCardAttributeMarkScene | null> {
        // console.log(`BattleFieldCardAttributeMarkSceneRepositoryImpl: Current scenes -> ${JSON.stringify(this.scenes, null, 2)}`);
        return this.scenes.find(scene => scene.id === id) || null;
    }

    async findAll(): Promise<BattleFieldCardAttributeMarkScene[]> {
        return this.scenes;
    }

    async deleteById(id: number): Promise<boolean> {
        const index = this.scenes.findIndex(scene => scene.id === id);
        if (index !== -1) {
            this.scenes.splice(index, 1);
            return true;
        }
        return false;
    }

    // 담고 있는 메시를 화면에서 빼고 그래픽 카드 자원을 놓아준 뒤 비운다.
    // 아직 아무도 부르지 않는다. 부르기 시작하는 것은 R2-32 다.
    // deleteAll 은 목록만 비운다. 그래픽 카드에 올라간 것은 그대로 남는다.
    dispose(): void {
        this.scenes.forEach((scene) => disposeMesh(scene.getMesh()));
        this.scenes = [];
    }

    async deleteAll(): Promise<void> {
        this.scenes = [];
    }
}
