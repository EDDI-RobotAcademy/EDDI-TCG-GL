import * as THREE from 'three';
import {MyDeckCardNameCloneRepository} from './MyDeckCardNameCloneRepository';
import {MyDeckCardNameClone} from "../entity/MyDeckCardNameClone";
import {TextGenerator} from "../../text/generator";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckCardNameCloneRepositoryImpl implements MyDeckCardNameCloneRepository {
    private static instance: MyDeckCardNameCloneRepositoryImpl;
    private cloneMap: Map<number, MyDeckCardNameClone> = new Map(); // card id: clone mesh
    private currentClickedDeckId: number | null = null;
    private cloneGroup: THREE.Group | null = null;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly CLONE_WIDTH: number = 0.166

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckCardNameCloneRepositoryImpl {
        if (!MyDeckCardNameCloneRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckCardNameCloneRepositoryImpl.instance = new MyDeckCardNameCloneRepositoryImpl(textureManager, scene);
        }
        return MyDeckCardNameCloneRepositoryImpl.instance;
    }

    public async createClone(cardId: number, position: Vector2d): Promise<MyDeckCardNameClone> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }

        const cardName = card.카드명;
        const generator = new TextGenerator();
        const texture = generator.createText(cardName, 9, 'CustomFont', '#FFFFFF');

        if (!texture) {
            throw new Error('My Deck Card Name Clone texture not found.');
        }

        const canvas = texture.image;
        const cloneWidth = canvas.width;
        const cloneHeight = canvas.height;

        const clonePositionX = position.getX() * window.innerWidth;
        const clonePositionY = position.getY() * window.innerHeight;

        const cloneMesh = MeshGenerator.createMesh(texture, cloneWidth, cloneHeight, position);
        cloneMesh.position.set(clonePositionX, clonePositionY, 0);

        const newClone = new MyDeckCardNameClone(cloneMesh, position, cloneWidth, cloneHeight);
        return newClone;
    }

    public saveCloneInfo(clickedDeckId: number, cardId: number, clone: MyDeckCardNameClone): void {
        if (this.currentClickedDeckId == null) {
            this.currentClickedDeckId = clickedDeckId;
        }

        this.cloneMap.set(cardId, clone);
    }

    public findCloneByCardId(cardId: number): MyDeckCardNameClone | null {
        return this.cloneMap.get(cardId) ?? null;
    }

    public findCloneList(): MyDeckCardNameClone[] | null {
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
            throw new Error(`My Deck Card Name Clone Group not found`);
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
