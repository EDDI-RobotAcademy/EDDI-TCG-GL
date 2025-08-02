import * as THREE from 'three';
import {MyDeckBlockCloneRepository} from './MyDeckBlockCloneRepository';
import {MyDeckBlockClone} from "..//entity/MyDeckBlockClone";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckBlockCloneRepositoryImpl implements MyDeckBlockCloneRepository {
    private static instance: MyDeckBlockCloneRepositoryImpl;
    private cloneMap: Map<number, MyDeckBlockClone> = new Map(); // card id: clone mesh
    private currentClickedDeckId: number | null = null;
    private cloneGroup: THREE.Group | null = null;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly CLONE_WIDTH: number = 0.166

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckBlockCloneRepositoryImpl {
        if (!MyDeckBlockCloneRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckBlockCloneRepositoryImpl.instance = new MyDeckBlockCloneRepositoryImpl(textureManager, scene);
        }
        return MyDeckBlockCloneRepositoryImpl.instance;
    }

    public async createClone(cardId: number, position: Vector2d): Promise<MyDeckBlockClone> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }

        const grade = Number(card.등급);
        const texture = await this.textureManager.getTexture('block', grade);

        if (!texture) {
            throw new Error('My Deck Block Clone texture not found.');
        }

        const cloneWidth = this.CLONE_WIDTH * window.innerWidth;
        const cloneHeight = cloneWidth * (250/1130);

        const clonePositionX = position.getX() * window.innerWidth;
        const clonePositionY = position.getY() * window.innerHeight;

        const cloneMesh = MeshGenerator.createMesh(texture, cloneWidth, cloneHeight, position);
        cloneMesh.position.set(clonePositionX, clonePositionY, 0);

        const newClone = new MyDeckBlockClone(cloneMesh, position);
        return newClone;
    }

    public saveCloneInfo(clickedDeckId: number, cardId: number, clone: MyDeckBlockClone): void {
        if (this.currentClickedDeckId == null) {
            this.currentClickedDeckId = clickedDeckId;
        }

        this.cloneMap.set(cardId, clone);
    }

    public findCloneByCardId(cardId: number): MyDeckBlockClone | null {
        return this.cloneMap.get(cardId) ?? null;
    }

    public findCloneList(): MyDeckBlockClone[] | null {
        return Array.from(this.cloneMap.values());
    }

    public findCardIdList(): number [] | null {
        return Array.from(this.cloneMap.keys());
    }

    public findCloneCount(): number {
        return this.cloneMap.size;
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
            throw new Error(`My Deck Block Clone Group not found`);
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
        const clone = this.cloneMap.get(cardId);
        if (clone) {
            this.meshDestroyer.destroyMesh(clone.getMesh());

            const group = this.cloneGroup;
            if (group) {
                group.remove(clone.getMesh());
            }
        }
    }

    public deleteAll(): void {
        this.currentClickedDeckId == null;
        this.cloneMap.clear();
        this.resetCloneGroup();
    }

}
