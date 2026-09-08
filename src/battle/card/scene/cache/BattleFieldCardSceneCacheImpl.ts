import {BattleFieldCardScene} from "../entity/BattleFieldCardScene";
import { DisposableMeshStore, disposeMesh } from "../../../../core/lifecycle/DisposableMeshStore";
import {BattleFieldCardSceneCache} from "./BattleFieldCardSceneCache";
import {MeshGenerator} from "../../../../mesh/generator";

import {TextureManager} from "../../../../texture_manager/TextureManager";
import {getCardById} from "../../../../card/utility";
import {Vector2d} from "../../../../common/math/Vector2d";
import {BattleFieldConstants} from "../../../../common/BattleFieldConstants";

export class BattleFieldCardSceneCacheImpl implements BattleFieldCardSceneCache, DisposableMeshStore {
    private static instance: BattleFieldCardSceneCacheImpl;
    private cardSceneMap: Map<number, BattleFieldCardScene> = new Map();

    private constructor() {}

    public static getInstance(): BattleFieldCardSceneCacheImpl {
        if (!BattleFieldCardSceneCacheImpl.instance) {
            BattleFieldCardSceneCacheImpl.instance = new BattleFieldCardSceneCacheImpl();
        }
        return BattleFieldCardSceneCacheImpl.instance;
    }

    count(): number {
        return this.cardSceneMap.size;
    }

    async create(cardId: number, position: Vector2d): Promise<BattleFieldCardScene> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }

        const textureManager = TextureManager.getInstance();
        const cardTexture = await textureManager.getTexture('card', card.카드번호);
        if (!cardTexture) {
            throw new Error(`Texture for card ${cardId} not found`);
        }

        const cardWidth = BattleFieldConstants.CARD_WIDTH_RATIO * window.innerWidth;
        const cardHeight = cardWidth * 1.615;

        const mainCardMesh = MeshGenerator.createMesh(cardTexture, cardWidth, cardHeight, position);
        const newCardScene = new BattleFieldCardScene(mainCardMesh);

        // 열쇠는 카드 자신의 번호다. 전에는 [만들 때 몇 개 있었나] 를 열쇠로 썼다.
        // 그러면 열쇠가 곧 자리라서, 중간 것을 진짜로 지우면 다음에 만드는 카드가
        // 이미 쓰던 번호를 받아 앞엣것을 덮어쓴다.
        this.cardSceneMap.set(newCardScene.getId(), newCardScene);

        return newCardScene;
    }

    findById(id: number): BattleFieldCardScene | undefined {
        return this.cardSceneMap.get(id);
    }

    // findAll(): BattleFieldCardScene[] {
    //     return Array.from(this.cardSceneMap.values());
    // }
    findAll(): BattleFieldCardScene[] {
        return Array.from(this.cardSceneMap.values());
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

    // 카드 하나를 꺼내 온다. 손패에서 필드로 갈 때 쓴다.
    //
    // 전에는 꺼낸 자리에 빈 것을 도로 넣었다. 열쇠가 자리 순번이라 진짜로 지울 수
    // 없었기 때문이다. 그 빈 자리가 [없는데 한 칸 비어 있는] 것의 정체였다.
    // 이제 열쇠가 카드 자신의 번호라서 그냥 지우면 된다.
    extractById(cardSceneId: number): BattleFieldCardScene | undefined {
        const value = this.cardSceneMap.get(cardSceneId);

        if (!value) {
            return undefined;
        }

        this.cardSceneMap.delete(cardSceneId);

        return value;
    }
}