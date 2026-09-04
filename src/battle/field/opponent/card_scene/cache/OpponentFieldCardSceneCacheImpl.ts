import {MeshGenerator} from "../../../../../mesh/generator";
import { DisposableMeshStore, disposeMesh } from "../../../../../core/lifecycle/DisposableMeshStore";

import {TextureManager} from "../../../../../texture_manager/TextureManager";
import {getCardById} from "../../../../../card/utility";
import {Vector2d} from "../../../../../common/math/Vector2d";
import {OpponentFieldCardSceneCache} from "./OpponentFieldCardSceneCache";
import {OpponentFieldCardScene} from "../entity/OpponentFieldCardScene";
import {BattleFieldConstants} from "../../../../../common/BattleFieldConstants";

export class OpponentFieldCardSceneCacheImpl implements OpponentFieldCardSceneCache, DisposableMeshStore {
    private static instance: OpponentFieldCardSceneCacheImpl;
    private cardSceneMap: Map<number, OpponentFieldCardScene> = new Map();

    private readonly CARD_WIDTH_RATIO: number = BattleFieldConstants.CARD_WIDTH_RATIO;

    private constructor() {}

    public static getInstance(): OpponentFieldCardSceneCacheImpl {
        if (!OpponentFieldCardSceneCacheImpl.instance) {
            OpponentFieldCardSceneCacheImpl.instance = new OpponentFieldCardSceneCacheImpl();
        }
        return OpponentFieldCardSceneCacheImpl.instance;
    }

    count(): number {
        return this.cardSceneMap.size;
    }

    async create(cardId: number, position: Vector2d): Promise<OpponentFieldCardScene> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }

        const textureManager = TextureManager.getInstance();
        const cardTexture = await textureManager.getTexture('card', card.카드번호);
        if (!cardTexture) {
            throw new Error(`Texture for card ${cardId} not found`);
        }

        const cardWidth = this.CARD_WIDTH_RATIO * window.innerWidth;
        const cardHeight = cardWidth * 1.615;

        const mainCardMesh = MeshGenerator.createMesh(cardTexture, cardWidth, cardHeight, position);
        const newCardScene = new OpponentFieldCardScene(mainCardMesh);

        const currentCount = this.count()
        this.cardSceneMap.set(currentCount, newCardScene);

        return newCardScene;
    }

    findById(id: number): OpponentFieldCardScene | undefined {
        return this.cardSceneMap.get(id);
    }

    findAll(): OpponentFieldCardScene[] {
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

    extractByIndex(index: number): OpponentFieldCardScene | undefined {
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