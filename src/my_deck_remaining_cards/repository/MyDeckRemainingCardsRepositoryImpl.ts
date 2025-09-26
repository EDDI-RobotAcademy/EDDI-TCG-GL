import * as THREE from 'three';
import {MyDeckRemainingCardsRepository} from './MyDeckRemainingCardsRepository';
import {MyDeckRemainingCards} from "../entity/MyDeckRemainingCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckRemainingCardsRepositoryImpl implements MyDeckRemainingCardsRepository {
    private static instance: MyDeckRemainingCardsRepositoryImpl;
    private remainingCardsMap: Map<number, { cardId: number, cardCount: number, remainingCardsMesh: MyDeckRemainingCards }> = new Map();
    private remainingCardsGroup: THREE.Group | null = null;

    private originalRemainingCardsMap: Map<number, { cardId: number, cardCount: number, remainingCardsMesh: MyDeckRemainingCards }> = new Map();

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly REMAINING_CARDS_WIDTH: number = 0.013

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckRemainingCardsRepositoryImpl {
        if (!MyDeckRemainingCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckRemainingCardsRepositoryImpl.instance = new MyDeckRemainingCardsRepositoryImpl(textureManager, scene);
        }
        return MyDeckRemainingCardsRepositoryImpl.instance;
    }

    public async createMyDeckRemainingCards(cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckRemainingCards> {
        const texture = await this.textureManager.getTexture('card_count', cardCount);

        if (!texture) {
            throw new Error('My Deck Card Count texture not found.');
        }

        const remainingCardsWidth = this.REMAINING_CARDS_WIDTH * window.innerWidth;
        const remainingCardsHeight = remainingCardsWidth;

        const remainingCardsPositionX = position.getX() * window.innerWidth;
        const remainingCardsPositionY = position.getY() * window.innerHeight;

        const remainingCardsMesh = MeshGenerator.createMesh(texture, remainingCardsWidth, remainingCardsHeight, position);
        remainingCardsMesh.position.set(remainingCardsPositionX, remainingCardsPositionY, 0);

        const newRemainingCards = new MyDeckRemainingCards(remainingCardsMesh, position);
        this.remainingCardsMap.set(newRemainingCards.id, { cardId, cardCount, remainingCardsMesh: newRemainingCards });

        return newRemainingCards;
    }

    public findRemainingCardsById(remainingCardsId: number): MyDeckRemainingCards | null {
        return this.remainingCardsMap.get(remainingCardsId)?.remainingCardsMesh ?? null;
    }

    public findCardCountByRemainingCardsId(remainingCardsId: number): number | null {
        return this.remainingCardsMap.get(remainingCardsId)?.cardCount ?? null;
    }

    public findCardIdByRemainingCardsId(remainingCardsId: number): number | null {
        return this.remainingCardsMap.get(remainingCardsId)?.cardId ?? null;
    }

    public findRemainingCardIdByCardId(cardId: number): number | null {
        for (const [remainingCardsId, { cardId: storedCardId }] of this.remainingCardsMap.entries()) {
            if (storedCardId === cardId) {
//                 console.log(`Match found! Returning Remaining Cards Id: ${remainingCardsId}`);
                return remainingCardsId;
            }
        }
        return null;
    }

    public findRemainingCardByCardId(cardId: number): MyDeckRemainingCards | null {
        for (const [remainingCardsId, { cardId: storedCardId, remainingCardsMesh}] of this.remainingCardsMap.entries()) {
            if (storedCardId === cardId) {
//                 console.log(`Match found! Returning Remaining Cards Id: ${cardId}`);
                return remainingCardsMesh;
            }
        }
        return null;
    }

    public findAllRemainingCardsList(): MyDeckRemainingCards[] {
        return Array.from(this.remainingCardsMap.values()).map(({ remainingCardsMesh }) => remainingCardsMesh);
    }

    public findAllCardIdList(): number[] {
        return Array.from(this.remainingCardsMap.values()).map(({ cardId }) => cardId);
    }

    public findAllRemainingCardsIdList(): number[] {
        return Array.from(this.remainingCardsMap.keys());
    }

    public findRemainingCardCountById(remainingCardsId: number): number {
        const entry = this.remainingCardsMap.get(remainingCardsId);
        if (entry) {
            return entry.cardCount;
        } else {
            throw new Error(`Remaining Card Count with ID ${remainingCardsId} not found.`);
        }
    }

    public deleteRemainingCardsById(remainingCardsId: number): void {
        const remainingCards = this.remainingCardsMap.get(remainingCardsId);
        if (remainingCards && this.remainingCardsGroup) {
            this.remainingCardsGroup.remove(remainingCards.remainingCardsMesh.getMesh());
        }
        this.remainingCardsMap.delete(remainingCardsId);
    }

    public deleteRemainingCardsByCardId(cardId: number): void {
        const remainingCardsId = this.findRemainingCardIdByCardId(cardId);
        if (remainingCardsId === null) return;

        const remainingCardsInfo = this.remainingCardsMap.get(remainingCardsId);
        if (remainingCardsInfo) {
            this.remainingCardsMap.delete(remainingCardsId);
        }
    }

    public deleteRemainingCardsMesh(cardId: number): void {
        const remainingCardsId = this.findRemainingCardIdByCardId(cardId);
        if (remainingCardsId === null) return;

        const remainingCardInfo = this.remainingCardsMap.get(remainingCardsId);
        if (remainingCardInfo == null) return;

        const mesh = remainingCardInfo.remainingCardsMesh.getMesh();

        this.meshDestroyer.destroyMesh(mesh);
        this.remainingCardsGroup?.remove(mesh);
    }

    public deleteAll(): void {
        this.remainingCardsMap.clear();
        this.resetRemainingCardsGroup();
    }

    public deleteAllRemainingCardsMesh(): void {
        const remainingCardsIdList = this.findAllRemainingCardsIdList();
        remainingCardsIdList.forEach(remainingCardsId => {
            const remainingCards = this.findRemainingCardsById(remainingCardsId);
            if (remainingCards == null) return;

            const remainingCardsMesh = remainingCards.getMesh();

            this.meshDestroyer.destroyMesh(remainingCardsMesh);
            this.remainingCardsGroup?.remove(remainingCardsMesh);
        });
    }

    public saveRemainingCardsGroup(): void {
        const remainingCardsList = this.findAllRemainingCardsList();
        const numberOfCardsGroup = new THREE.Group();

        remainingCardsList.forEach((remainingCard) => {
            numberOfCardsGroup.add(remainingCard.getMesh());
        });

        this.remainingCardsGroup = numberOfCardsGroup;
    }

    public findRemainingCardsGroup(): THREE.Group {
        if (!this.remainingCardsGroup) {
            throw new Error(`My Deck Number Of Remaining Cards Group not found`);
        }

        return this.remainingCardsGroup;
    }

    public resetRemainingCardsGroup(): void {
        this.remainingCardsGroup = null;
    }

    public saveClonedOriginalRemainingCardsState(): void {
        this.originalRemainingCardsMap.clear();

        const remainingCardsIdList = this.findAllRemainingCardsIdList();
        remainingCardsIdList.forEach(remainingCardsId => {
            const entry = this.remainingCardsMap.get(remainingCardsId);

            if (entry) {
                const originalMesh = entry.remainingCardsMesh.getMesh();
                const clonedMesh = originalMesh.clone(true);
                const clonedPosition = entry.remainingCardsMesh.position.clone ? entry.remainingCardsMesh.position.clone() : entry.remainingCardsMesh.position;

                const clonedWrapper = new MyDeckRemainingCards(clonedMesh, clonedPosition);

                this.originalRemainingCardsMap.set(remainingCardsId, {
                    cardId: entry.cardId,
                    cardCount: entry.cardCount,
                    remainingCardsMesh: clonedWrapper
                });
            } else {
                console.warn(`[WARN] remainingCardsId ${remainingCardsId} not found in remainingCardsMap`);
            }
        });

        // To-do: 확인 후 삭제하기
        console.log(
            `%c[INFO] Original Remaining Cards state cloned and stored`, 'color: #2E9AFE; font-weight: bold;');
        console.log(
            'originalRemainingCardsMap:',
            Array.from(this.originalRemainingCardsMap.entries()).map(([id, data]) => ({
                remainingCardsId: id,
                cardId: data.cardId,
                cardCount: data.cardCount
            }))
        );
    }

    public restoreOriginalRemainingCardsState(): void {
        this.deleteAllRemainingCardsMesh(); // 현재의 모든 mesh를 scene에서 제거

        const originalRemainingCardsIdList = Array.from(this.originalRemainingCardsMap.keys());

        // 기존 remainingCardsMap에서 원본에 없는 key 제거
        const currentRemainingCardsIdList = Array.from(this.remainingCardsMap.keys());
        currentRemainingCardsIdList.forEach(remainingCardsId => {
            if (!this.originalRemainingCardsMap.has(remainingCardsId)) {
                this.remainingCardsMap.delete(remainingCardsId);
            }
        });

        // 원본 상태로 복원
        originalRemainingCardsIdList.forEach(remainingCardsId => {
            const originalRemainingCardsInfo = this.originalRemainingCardsMap.get(remainingCardsId);
            if (originalRemainingCardsInfo) {
                this.remainingCardsMap.set(remainingCardsId, {
                    cardId: originalRemainingCardsInfo.cardId,
                    cardCount: originalRemainingCardsInfo.cardCount,
                    remainingCardsMesh: originalRemainingCardsInfo.remainingCardsMesh
                });

                // scene에 복원된 mesh 추가
                const group = this.remainingCardsGroup;
                if (group) {
                    originalRemainingCardsInfo.remainingCardsMesh.setVisibility(false);
                    group.add(originalRemainingCardsInfo.remainingCardsMesh.getMesh());
                }
            }
        });

        // To-do: 확인 후 없애야 함
        const remainingCardsIdList = this.findAllRemainingCardsIdList();
        const restoredData = remainingCardsIdList.map(remainingCardsId => {
            const data = this.remainingCardsMap.get(remainingCardsId);
            return data ? {
                remainingCardsId,
                cardId: data.cardId,
                cardCount: data.cardCount
            } : { remainingCardsId, cardId: null, cardCount: null };
        });

        console.log(
            `%c[덱 편집 중단 후 다른 덱 버튼을 눌렀을 때] Remaining Cards State restored.`,
            'color: #2E9AFE; font-weight: bold;'
        );
        console.log('복원된 mesh 데이터:', restoredData);
    }

}
