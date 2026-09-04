import { DisposableMeshStore, disposeMesh } from "../../core/lifecycle/DisposableMeshStore";
import {OpponentFieldCardAttributeMarkSceneRepository} from "./OpponentFieldCardAttributeMarkSceneRepository";
import {OpponentFieldCardAttributeMarkScene} from "../entity/OpponentFieldCardAttributeMarkScene";

export class OpponentFieldCardAttributeMarkSceneRepositoryImpl implements OpponentFieldCardAttributeMarkSceneRepository, DisposableMeshStore {
    private static instance: OpponentFieldCardAttributeMarkSceneRepositoryImpl;
    private scenes: OpponentFieldCardAttributeMarkScene[] = [];

    private constructor() {}

    public static getInstance(): OpponentFieldCardAttributeMarkSceneRepositoryImpl {
        if (!OpponentFieldCardAttributeMarkSceneRepositoryImpl.instance) {
            OpponentFieldCardAttributeMarkSceneRepositoryImpl.instance = new OpponentFieldCardAttributeMarkSceneRepositoryImpl();
        }
        return OpponentFieldCardAttributeMarkSceneRepositoryImpl.instance;
    }

    async save(scene: OpponentFieldCardAttributeMarkScene): Promise<OpponentFieldCardAttributeMarkScene> {
        this.scenes.push(scene);
        return scene;
    }

    async findById(id: number): Promise<OpponentFieldCardAttributeMarkScene | null> {
        // console.log(`BattleFieldCardAttributeMarkSceneRepositoryImpl: Current scenes -> ${JSON.stringify(this.scenes, null, 2)}`);
        return this.scenes.find(scene => scene.id === id) || null;
    }

    async findAll(): Promise<OpponentFieldCardAttributeMarkScene[]> {
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
