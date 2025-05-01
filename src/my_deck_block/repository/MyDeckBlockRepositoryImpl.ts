import * as THREE from 'three';
import {MyDeckBlockRepository} from './MyDeckBlockRepository';
import {MyDeckBlock} from "../entity/MyDeckBlock";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

export class MyDeckBlockRepositoryImpl implements MyDeckBlockRepository {
    private static instance: MyDeckBlockRepositoryImpl;
    private blockMap: Map<number, { cardId: number, blockMesh: MyDeckBlock }> = new Map(); // block unique id: {card id: block mesh}
    private deckMap: Map<number, number[]> = new Map(); // deckId: block Unique ID List
    private textureManager: TextureManager;
    private blockGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private readonly BLOCK_WIDTH: number = 0.166

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckBlockRepositoryImpl {
        if (!MyDeckBlockRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckBlockRepositoryImpl.instance = new MyDeckBlockRepositoryImpl(textureManager);
        }
        return MyDeckBlockRepositoryImpl.instance;
    }

    public async createMyDeckBlock(deckId: number, cardId: number, position: Vector2d): Promise<MyDeckBlock> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }

        const grade = Number(card.등급);
        const texture = await this.textureManager.getTexture('block', grade);

        if (!texture) {
            throw new Error('My Deck Block texture not found.');
        }

        const blockWidth = this.BLOCK_WIDTH * window.innerWidth;
        const blockHeight = blockWidth * (250/1130);

        const blockPositionX = position.getX() * window.innerWidth;
        const blockPositionY = position.getY() * window.innerHeight;

        const blockMesh = MeshGenerator.createMesh(texture, blockWidth, blockHeight, position);
        blockMesh.position.set(blockPositionX, blockPositionY, 0);

        const newBlock = new MyDeckBlock(blockMesh, position);
        this.blockMap.set(newBlock.id, { cardId, blockMesh: newBlock });

        if (!this.deckMap.has(deckId)) {
            this.deckMap.set(deckId, []);
        }
        const blockIdList = this.deckMap.get(deckId)!;
        blockIdList.push(newBlock.id);
        this.deckMap.set(deckId, blockIdList);

        return newBlock;
    }

    public findBlockByCardId(cardId: number): MyDeckBlock | null {
        for (const { cardId: storedCardId, blockMesh } of this.blockMap.values()) {
            if (storedCardId === cardId) {
                return blockMesh;
            }
        }
        return null;
    }

    public findBlockByBlockUniqueId(blockUniqueId: number): MyDeckBlock | null {
        const block = this.blockMap.get(blockUniqueId);
        if (block) {
            return block.blockMesh;
        } else {
            return null;
        }
    }

    public findCardIdByBlockUniqueId(blockUniqueId: number): number | null {
        const card = this.blockMap.get(blockUniqueId);
        if (card) {
            return card.cardId;
        } else {
            return null;
        }
    }

    public findBlockListByDeckId(deckId: number): MyDeckBlock[] | null {
        const blockUniqueIdList = this.deckMap.get(deckId);
        if (blockUniqueIdList === undefined) {
            return null;
        }

        const blockMeshList: MyDeckBlock[] = [];
        blockUniqueIdList.forEach((uniqueId) => {
            const blockMesh = this.findBlockByBlockUniqueId(uniqueId);
            if (blockMesh) {
                blockMeshList.push(blockMesh);
            } else {
                console.warn(`[WARN] Block with Unique ID ${uniqueId} not found in blockMap`);
            }
        });

        return blockMeshList;
    }

    public findBlockUniqueIdListByDeckId(deckId: number): number[] {
        return this.deckMap.get(deckId) || [];
    }

    public findDeckIdList(): number[] {
        return Array.from(this.deckMap.keys());
    }

    public findBlockCountByDeckId(deckId: number): number {
        const blockUniqueIdList = this.deckMap.get(deckId);
        return blockUniqueIdList ? blockUniqueIdList.length : 0;
    }

    public saveBlockGroupByDeckId(deckId: number): void {
        const blockIdList = this.deckMap.get(deckId);
        if (!blockIdList) {
            throw new Error(`Deck with ID ${deckId} not found`);
        }

        const blockGroup = new THREE.Group();
        blockIdList.forEach(blockUniqueId => {
            const block = this.blockMap.get(blockUniqueId);
            if (block) {
                blockGroup.add(block.blockMesh.getMesh());
            } else {
                console.warn(`[WARN] Block with Unique ID ${blockUniqueId} not found in cardMap`);
            }
        });

        this.blockGroupMap.set(deckId, blockGroup);
    }

    public findBlockGroupByDeckId(deckId: number): THREE.Group {
        const blockGroup = this.blockGroupMap.get(deckId);
        if (!blockGroup) {
            throw new Error(`Block group with Deck ID ${deckId} not found`);
        }
        return blockGroup;
    }

    // 특정 덱의 특정 block 삭제
    public deleteBlockByDeckIdAndBlockUniqueId(deckId: number, blockUniqueId: number): void {
        this.blockMap.delete(blockUniqueId);

        const blockIdList = this.deckMap.get(deckId);
        if (blockIdList) {
            const updatedList = blockIdList.filter(id => id !== blockUniqueId);
            this.deckMap.set(deckId, updatedList);

//             if (updatedList.length === 0) {
//                 this.deckMap.delete(deckId);
//             }
        }
    }

    // 모든 정보 삭제(덱, 블록 모두)
    public deleteAllBlock(): void {
        this.deckMap.clear();
        this.blockMap.clear();
    }

    // 특정 덱 삭제
    public deleteDeckByDeckId(deckId: number): void {
        const blockUniqueIdList = this.findBlockUniqueIdListByDeckId(deckId);
        if (blockUniqueIdList) {
            blockUniqueIdList.forEach((blockId) => {
                this.blockMap.delete(blockId);
            });
        }
        this.deckMap.delete(deckId);
        const deckIdList = this.findDeckIdList();
        console.log(`%c삭제 후 남은 덱 id 리스트는? ${deckIdList}`, 'color: #FE2EF7; font-weight: bold;');
    }

}
