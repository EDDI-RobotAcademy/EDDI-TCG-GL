import * as THREE from 'three';
import {MyDeckNumberOfSelectedCardsCloneRepository} from './MyDeckNumberOfSelectedCardsCloneRepository';
import {MyDeckNumberOfSelectedCardsClone} from "..//entity/MyDeckNumberOfSelectedCardsClone";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckNumberOfSelectedCardsCloneRepositoryImpl implements MyDeckNumberOfSelectedCardsCloneRepository {
    private static instance: MyDeckNumberOfSelectedCardsCloneRepositoryImpl;
    // card id: {card count, number mesh}
    private cloneMap: Map<number, { cardCount: number, cloneMesh: MyDeckNumberOfSelectedCardsClone }> = new Map();
    private currentClickedDeckId: number | null = null;
    private cloneGroup: THREE.Group | null = null;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly CLONE_WIDTH: number = 0.015

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckNumberOfSelectedCardsCloneRepositoryImpl {
        if (!MyDeckNumberOfSelectedCardsCloneRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckNumberOfSelectedCardsCloneRepositoryImpl.instance = new MyDeckNumberOfSelectedCardsCloneRepositoryImpl(textureManager, scene);
        }
        return MyDeckNumberOfSelectedCardsCloneRepositoryImpl.instance;
    }

    public async createClone(cardCount: number, position: Vector2d): Promise<MyDeckNumberOfSelectedCardsClone> {
        const texture = await this.textureManager.getTexture('card_count', cardCount);

        if (!texture) {
            throw new Error('My Deck "Number Of Selected Cards" texture not found.');
        }

        const cloneWidth = this.CLONE_WIDTH * window.innerWidth;
        const cloneHeight = cloneWidth;

        const clonePositionX = position.getX() * window.innerWidth;
        const clonePositionY = position.getY() * window.innerHeight;

        const cloneMesh = MeshGenerator.createMesh(texture, cloneWidth, cloneHeight, position);
        cloneMesh.position.set(clonePositionX, clonePositionY, 0);

        const newClone = new MyDeckNumberOfSelectedCardsClone(cloneMesh, position);
        return newClone;
    }

    public saveCloneInfo(clickedDeckId: number, cardId: number, cardCount: number, clone: MyDeckNumberOfSelectedCardsClone): void {
        if (this.currentClickedDeckId == null) {
            this.currentClickedDeckId = clickedDeckId;
        }

        this.cloneMap.set(cardId, { cardCount, cloneMesh: clone });
    }

    public findCloneByCardId(cardId: number): MyDeckNumberOfSelectedCardsClone | null {
        return this.cloneMap.get(cardId)?.cloneMesh ?? null;
    }

    public findCardCountByCardId(cardId: number): number | null {
        return this.cloneMap.get(cardId)?.cardCount ?? null;
    }

    public findCloneList(): MyDeckNumberOfSelectedCardsClone[] | null {
        return Array.from(this.cloneMap.values()).map(({ cloneMesh }) => cloneMesh);
    }

    public findCardIdList(): number [] | null {
        return Array.from(this.cloneMap.keys());
    }

    public saveCloneGroup(): void {
        const newCloneGroup = new THREE.Group();
        const cloneList = this.findCloneList();
        if (cloneList == null) return;

        cloneList.forEach((clone) => {
            newCloneGroup.add(clone.getMesh());
        });

        this.cloneGroup = newCloneGroup;
    }

    public findCloneGroup(): THREE.Group {
        if (!this.cloneGroup) {
            throw new Error(`My Deck Number Of Selected Cards Clone Group not found`);
        }

        return this.cloneGroup;
    }

    public resetCloneGroup(): void {
        this.cloneGroup = null;
    }

    public deleteCloneByCardId(cardId: number): void {
        const cloneInfo = this.cloneMap.get(cardId);
        if (cloneInfo) {
            this.cloneMap.delete(cardId);
        }
    }

    public deleteCloneMesh(cardId: number): void {
        const cloneInfo = this.cloneMap.get(cardId);
        if (cloneInfo) {
            this.meshDestroyer.destroyMesh(cloneInfo.cloneMesh.getMesh());

            const group = this.cloneGroup;
            if (group) {
                group.remove(cloneInfo.cloneMesh.getMesh());
            }
        }
    }

    public deleteAll(): void {
        this.currentClickedDeckId == null;
        this.cloneMap.clear();
        this.resetCloneGroup();
    }

}
