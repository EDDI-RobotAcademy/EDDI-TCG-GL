import * as THREE from 'three';
import {CardSelectionBlockerRepository} from './CardSelectionBlockerRepository';
import {CardSelectionBlocker} from "../entity/CardSelectionBlocker";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer";

export class CardSelectionBlockerRepositoryImpl implements CardSelectionBlockerRepository {
    private static instance: CardSelectionBlockerRepositoryImpl;
    private blockerMap: Map<number, { cardId: number, blockerMesh: CardSelectionBlocker}> = new Map(); // blocker Unique ID: [card ID: card mesh]
    private blockerGroup: THREE.Group | null = null;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly BLOCKER_WIDTH: number = 0.096

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): CardSelectionBlockerRepositoryImpl {
        if (!CardSelectionBlockerRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            CardSelectionBlockerRepositoryImpl.instance = new CardSelectionBlockerRepositoryImpl(textureManager, scene);
        }
        return CardSelectionBlockerRepositoryImpl.instance;
    }

    public async createCardSelectionBlocker(cardId: number, position: Vector2d): Promise<CardSelectionBlocker> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }

        const cardKind = Number(card.종류);
        const texture = await this.textureManager.getTexture('card_selection_blocker', cardKind);
        if (!texture) {
            throw new Error(`Texture for card ${cardId} not found`);
        }

        const blockerWidth = this.BLOCKER_WIDTH * window.innerWidth;
        const blockerHeight = blockerWidth * (1540 / 952);

        const blockerPositionX = position.getX() * window.innerWidth;
        const blockerPositionY = position.getY() * window.innerHeight;

        const blockerMesh = MeshGenerator.createMesh(texture, blockerWidth, blockerHeight, position);
        blockerMesh.position.set(blockerPositionX, blockerPositionY, 0);

        const newBlocker = new CardSelectionBlocker(blockerMesh, position);
        this.blockerMap.set(newBlocker.id, { cardId: cardId, blockerMesh: newBlocker });

        return newBlocker;
    }

    public findBlockerByBlockerId(blockerId: number): CardSelectionBlocker | null {
        return this.blockerMap.get(blockerId)?.blockerMesh ?? null;
    }

    public findBlockerByCardId(cardId: number): CardSelectionBlocker | null {
        return Array.from(this.blockerMap.values()).find(blocker => blocker.cardId === cardId)?.blockerMesh ?? null;
    }

    public findAllBlockers(): CardSelectionBlocker[] {
        return Array.from(this.blockerMap.values()).map(({ blockerMesh }) => blockerMesh);
    }

    public findAllCardIdList(): number[] {
        return Array.from(this.blockerMap.values()).map(({ cardId }) => cardId);
    }

    public findAllBlockerIdList(): number[] {
        return Array.from(this.blockerMap.keys());
    }

    public findCardIdByBlockerId(blockerId: number): number | null {
        return this.blockerMap.get(blockerId)?.cardId ?? null;
    }

    public findBlockerGroup(): THREE.Group {
        if (!this.blockerGroup) {
            this.blockerGroup = new THREE.Group();
            this.findAllBlockers()?.forEach((blocker) => {
                this.blockerGroup!.add(blocker.getMesh());
            });
        }
        return this.blockerGroup;
    }

    public deleteAllBlocker(): void {
        const blockerList = this.findAllBlockers();
        for (const blocker of blockerList) {
            this.meshDestroyer.destroyMesh(blocker.getMesh());

            if (this.blockerGroup) {
                this.blockerGroup.remove(blocker.getMesh());
            }
        }
        this.blockerMap.clear();
    }

    // 사용자가 소지한 카드 중 특정 카드를 삭제하게 될 경우 (확장성 고려)
    public deleteBlockerByBlockerId(blockerId: number): void {
        const blocker = this.findBlockerByBlockerId(blockerId);
        if (blocker == null) return;

        const mesh = blocker.getMesh();
        this.meshDestroyer.destroyMesh(mesh);

        if (this.blockerGroup) {
            this.blockerGroup.remove(mesh);
        }
        this.blockerMap.delete(blockerId);
    }
}
