import {BattleFieldCardScene} from "../entity/BattleFieldCardScene";
import {BattleFieldCardSceneRepository} from "./BattleFieldCardSceneRepository";
import {MeshGenerator} from "../../mesh/generator";

import {TextureManager} from "../../texture_manager/TextureManager";
import {getCardById} from "../../card/utility";
import {Vector2d} from "../../common/math/Vector2d";
import {CardConstants} from "../../card/CardConstants";

export class BattleFieldCardSceneRepositoryImpl implements BattleFieldCardSceneRepository {
    private static instance: BattleFieldCardSceneRepositoryImpl;
    private cardSceneMap: Map<number, BattleFieldCardScene> = new Map();

    private constructor() {}

    public static getInstance(): BattleFieldCardSceneRepositoryImpl {
        if (!BattleFieldCardSceneRepositoryImpl.instance) {
            BattleFieldCardSceneRepositoryImpl.instance = new BattleFieldCardSceneRepositoryImpl();
        }
        return BattleFieldCardSceneRepositoryImpl.instance;
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

        const cardWidth = CardConstants.CARD_WIDTH_RATIO * window.innerWidth;
        const cardHeight = cardWidth * 1.615;

        const mainCardMesh = MeshGenerator.createMesh(cardTexture, cardWidth, cardHeight, position);
        const newCardScene = new BattleFieldCardScene(mainCardMesh);

        const currentCount = this.count()
        this.cardSceneMap.set(currentCount, newCardScene);

        return newCardScene;
    }

    findById(id: number): BattleFieldCardScene | undefined {
        return this.cardSceneMap.get(id);
    }

    // findAll(): BattleFieldCardScene[] {
    //     return Array.from(this.cardSceneMap.values());
    // }
    findAll(): BattleFieldCardScene[] {
        return Array.from(this.cardSceneMap.values()).filter(scene => scene !== null);
    }

    deleteById(id: number): boolean {
        return this.cardSceneMap.delete(id);
    }

    deleteAll(): void {
        this.cardSceneMap.clear();
    }

    extractByIndex(index: number): BattleFieldCardScene | undefined {
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