import * as THREE from 'three';
import {MyDeckRemainingOutOfTotalSlashRepository} from './MyDeckRemainingOutOfTotalSlashRepository';
import {MyDeckRemainingOutOfTotalSlash} from "../entity/MyDeckRemainingOutOfTotalSlash";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

export class MyDeckRemainingOutOfTotalSlashRepositoryImpl implements MyDeckRemainingOutOfTotalSlashRepository {
    private static instance: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private slashMap: Map<number, { cardId: number, slashMesh: MyDeckRemainingOutOfTotalSlash }> = new Map();
    private textureManager: TextureManager;
    private slashGroup: THREE.Group | null = null;

    private readonly SLASH_WIDTH: number = 0.013

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckRemainingOutOfTotalSlashRepositoryImpl {
        if (!MyDeckRemainingOutOfTotalSlashRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckRemainingOutOfTotalSlashRepositoryImpl.instance = new MyDeckRemainingOutOfTotalSlashRepositoryImpl(textureManager);
        }
        return MyDeckRemainingOutOfTotalSlashRepositoryImpl.instance;
    }

    public async createSlash(cardId: number, position: Vector2d): Promise<MyDeckRemainingOutOfTotalSlash> {
        const texture = await this.textureManager.getTexture('card_count_notation', 1);

        if (!texture) {
            throw new Error('[My Deck] slash texture not found.');
        }

        const slashWidth = this.SLASH_WIDTH * window.innerWidth;
        const slashHeight = slashWidth;

        const slashPositionX = position.getX() * window.innerWidth;
        const slashPositionY = position.getY() * window.innerHeight;

        const slashMesh = MeshGenerator.createMesh(texture, slashWidth, slashHeight, position);
        slashMesh.position.set(slashPositionX, slashPositionY, 0);

        const newSlash = new MyDeckRemainingOutOfTotalSlash(slashMesh, position);
        this.slashMap.set(newSlash.id, { cardId, slashMesh: newSlash });

        return newSlash;
    }

    public findSlashById(slashId: number): MyDeckRemainingOutOfTotalSlash | null {
        return this.slashMap.get(slashId)?.slashMesh ?? null;
    }

    public findCardIdBySlashId(slashId: number): number | null {
        return this.slashMap.get(slashId)?.cardId ?? null;
    }

    public findSlashIdByCardId(cardId: number): number | null {
        for (const [slashId, { cardId: storedCardId }] of this.slashMap.entries()) {
            if (storedCardId === cardId) {
                return slashId;
            }
        }
        return null;
    }

    public findAllSlashList(): MyDeckRemainingOutOfTotalSlash[] {
        return Array.from(this.slashMap.values()).map(({ slashMesh }) => slashMesh);
    }

    public findAllCardIdList(): number[] {
        return Array.from(this.slashMap.values()).map(({ cardId }) => cardId);
    }

    public findAllSlashIdList(): number[] {
        return Array.from(this.slashMap.keys());
    }

    public deleteSlashById(slashId: number): void {
        const slash = this.slashMap.get(slashId);
        if (slash && this.slashGroup) {
            this.slashGroup.remove(slash.slashMesh.getMesh());
        }
        this.slashMap.delete(slashId);
    }

    public deleteAll(): void {
        this.slashMap.clear();
        this.resetSlashGroup();
    }

    public findSlashGroup(): THREE.Group {
        if (!this.slashGroup) {
            this.slashGroup = new THREE.Group();
            this.findAllSlashList()?.forEach((slashMesh) => {
                this.slashGroup!.add(slashMesh.getMesh());
            });
        }
        return this.slashGroup;
    }

    public resetSlashGroup(): void {
        this.slashGroup = null;
    }

}
