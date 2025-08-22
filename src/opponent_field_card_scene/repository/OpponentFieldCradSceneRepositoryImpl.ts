import {MeshGenerator} from "../../mesh/generator";

import {TextureManager} from "../../texture_manager/TextureManager";
import {getCardById} from "../../card/utility";
import {Vector2d} from "../../common/math/Vector2d";
import {OpponentFieldCardSceneRepository} from "./OpponentFieldCradSceneRepository";
import {OpponentFieldCardScene} from "../entity/OpponentFieldCardScene";
import {BattleFieldConstants} from "../../common/BattleFieldConstants";

export class OpponentFieldCardSceneRepositoryImpl implements OpponentFieldCardSceneRepository {
    private static instance: OpponentFieldCardSceneRepositoryImpl;
    private cardSceneMap: Map<number, OpponentFieldCardScene> = new Map();

    private readonly CARD_WIDTH_RATIO: number = BattleFieldConstants.CARD_WIDTH_RATIO;

    private constructor() {}

    public static getInstance(): OpponentFieldCardSceneRepositoryImpl {
        if (!OpponentFieldCardSceneRepositoryImpl.instance) {
            OpponentFieldCardSceneRepositoryImpl.instance = new OpponentFieldCardSceneRepositoryImpl();
        }
        return OpponentFieldCardSceneRepositoryImpl.instance;
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