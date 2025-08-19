import * as THREE from 'three';
import {MyDeckBlockRepository} from './MyDeckBlockRepository';
import {MyDeckBlock} from "../entity/MyDeckBlock";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckBlockRepositoryImpl implements MyDeckBlockRepository {
    private static instance: MyDeckBlockRepositoryImpl;
    private blockMap: Map<number, { cardId: number, blockMesh: MyDeckBlock }> = new Map(); // block unique id: {card id: block mesh}
    private deckMap: Map<number, number[]> = new Map(); // deckId: block Unique ID List
    private blockGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private originalBlockMap: Map<number, { cardId: number, blockMesh: MyDeckBlock }> = new Map();
    private originalDeckMap: Map<number, number[]> = new Map();

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly BLOCK_WIDTH: number = 0.166

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckBlockRepositoryImpl {
        if (!MyDeckBlockRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckBlockRepositoryImpl.instance = new MyDeckBlockRepositoryImpl(textureManager, scene);
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

    public findBlockByDeckIdAndCardId(deckId: number, cardId: number): MyDeckBlock | null {
        const blockIdList = this.deckMap.get(deckId);
        if (!blockIdList) {
            return null;
        }

        for (const blockId of blockIdList) {
            const block = this.blockMap.get(blockId);
            if (block && block.cardId === cardId) {
                return block.blockMesh;
            }
        }
        return null;
    }

    public findBlockIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const blockIdList = this.deckMap.get(deckId);
        if (!blockIdList) {
            return null;
        }

        for (const blockId of blockIdList) {
            const blockEntry = this.blockMap.get(blockId);
            if (blockEntry && blockEntry.cardId === cardId) {
                return blockId;
            }
        }
        return null;
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

    public resetBlockGroup(): void {
        this.blockGroupMap.clear();
    }

    // 특정 덱의 특정 block 삭제
    public deleteBlock(deckId: number, blockId: number): void {
        const blockInfo = this.blockMap.get(blockId);
        if (blockInfo) {
            this.blockMap.delete(blockId);
        }

        const blockIdList = this.deckMap.get(deckId);
        if (blockIdList) {
            const updatedList = blockIdList.filter(id => id !== blockId);
            this.deckMap.set(deckId, updatedList);

//             if (updatedList.length === 0) {
//                 this.deckMap.delete(deckId);
//             }
        }
    }

    public deleteBlockMesh(deckId: number, blockId: number): void {
        const blockInfo = this.blockMap.get(blockId);
        if (blockInfo) {
            this.meshDestroyer.destroyMesh(blockInfo.blockMesh.getMesh());

            const group = this.blockGroupMap.get(deckId);
            if (group) {
                group.remove(blockInfo.blockMesh.getMesh());
            }
        }
    }

    // 모든 정보 삭제(덱, 블록 모두)
    public deleteAllBlock(): void {
        this.deckMap.clear();
        this.blockMap.clear();
    }

    // 특정 덱 삭제
    public deleteDeckByDeckId(deckId: number): void {
        const group = this.blockGroupMap.get(deckId);
        if (group) {
            this.meshDestroyer.destroyGroup(group);
            this.blockGroupMap.delete(deckId);
        }

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

    // 원본 데이터 복제
    public saveClonedOriginalDeckState(deckId: number): void {
        this.originalBlockMap.clear();
        this.originalDeckMap.set(deckId, [...(this.deckMap.get(deckId) || [])]);

        const blockIdList = this.deckMap.get(deckId);
        if (!blockIdList) {
            console.warn(`[WARN] No blockIdList for deck ${deckId}`);
            return;
        }

        blockIdList.forEach(blockId => {
            const entry = this.blockMap.get(blockId);
            if (entry) {
                const originalMesh = entry.blockMesh.getMesh();
                const clonedMesh = originalMesh.clone(true);
                const clonedPosition = entry.blockMesh.position.clone ? entry.blockMesh.position.clone() : entry.blockMesh.position;
                const clonedWrapper = new MyDeckBlock(clonedMesh, clonedPosition);

                this.originalBlockMap.set(blockId, {
                    cardId: entry.cardId,
                    blockMesh: clonedWrapper
                });

            } else {
                console.warn(`[WARN] blockId ${blockId} not found in blockMap`);
            }
        });

        // To-do: 확인 후 삭제하기
        console.log(
            `%c[INFO] Original deck state cloned and stored for deckId ${deckId}`, 'color: #2E9AFE; font-weight: bold;');
        console.log(
            'originalBlockMap:',
            Array.from(this.originalBlockMap.entries()).map(([id, data]) => ({
                blockId: id,
                cardId: data.cardId
            }))
        );
    }

    public restoreOriginalDeckState(deckId: number): void {
        const originalBlockIdList = this.originalDeckMap.get(deckId);
        if (originalBlockIdList) {
            this.deckMap.set(deckId, [...originalBlockIdList]);
        }

        const blockIdList = this.deckMap.get(deckId);
        if (!blockIdList) return;

        blockIdList.forEach(blockId => {
            const originalBlockInfo = this.originalBlockMap.get(blockId);
            if (originalBlockInfo) {
                const currentBlockInfo = this.blockMap.get(blockId);
                if (currentBlockInfo) {
                    this.meshDestroyer.destroyMesh(currentBlockInfo.blockMesh.getMesh());
                }

                this.blockMap.set(blockId, {
                    cardId: originalBlockInfo.cardId,
                    blockMesh: originalBlockInfo.blockMesh
                });

                const group = this.blockGroupMap.get(deckId);
                if (group) {
                    originalBlockInfo.blockMesh.setVisibility(false);
                    group.add(originalBlockInfo.blockMesh.getMesh());
                }
            }
        });

        // To-do: 확인 후 없애야 함
        const restoredData = blockIdList.map(blockId => {
            const data = this.blockMap.get(blockId);
            return data ? {
                blockId,
                cardId: data.cardId,
                blockMesh: data.blockMesh
            } : { blockId, cardId: null, blockMesh: null };
        });

        console.log(
            `%c[덱 편집 중단 후 다른 덱 버튼을 눌렀을 때] Deck ${deckId} restored.`,
            'color: #2E9AFE; font-weight: bold;'
        );
        console.log('복원된 mesh 데이터:', restoredData);

    }

}
