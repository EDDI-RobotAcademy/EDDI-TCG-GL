import * as THREE from 'three';
import {MyDeckNumberOfCardsRepository} from './MyDeckNumberOfCardsRepository';
import {MyDeckNumberOfCards} from "../entity/MyDeckNumberOfCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckNumberOfCardsRepositoryImpl implements MyDeckNumberOfCardsRepository {
    private static instance: MyDeckNumberOfCardsRepositoryImpl;
    // number unique id: {card id, card count, number mesh}
    private numberMap: Map<number, { cardId: number, cardCount: number, numberMesh: MyDeckNumberOfCards }> = new Map();
    private deckMap: Map<number, number[]> = new Map(); // deckId: number ID List
    private numberGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private originalNumberMap: Map<number, { cardId: number, cardCount: number, numberMesh: MyDeckNumberOfCards }> = new Map();
    private originalDeckMap: Map<number, number[]> = new Map();

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly NUMBER_WIDTH: number = 0.013

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckNumberOfCardsRepositoryImpl {
        if (!MyDeckNumberOfCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckNumberOfCardsRepositoryImpl.instance = new MyDeckNumberOfCardsRepositoryImpl(textureManager, scene);
        }
        return MyDeckNumberOfCardsRepositoryImpl.instance;
    }

    public async createMyDeckNumberOfCards(deckId: number, cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckNumberOfCards> {
        const texture = await this.textureManager.getTexture('card_count', cardCount);

        if (!texture) {
            throw new Error('My Deck Card Count texture not found.');
        }

        const numberWidth = this.NUMBER_WIDTH * window.innerWidth;
        const numberHeight = numberWidth;

        const numberPositionX = position.getX() * window.innerWidth;
        const numberPositionY = position.getY() * window.innerHeight;

        const numberMesh = MeshGenerator.createMesh(texture, numberWidth, numberHeight, position);
        numberMesh.position.set(numberPositionX, numberPositionY, 0);

        const newNumber = new MyDeckNumberOfCards(numberMesh, position);
        this.numberMap.set(newNumber.id, { cardCount, cardId, numberMesh: newNumber });

        if (!this.deckMap.has(deckId)) {
            this.deckMap.set(deckId, []);
        }
        const numberIdList = this.deckMap.get(deckId)!;
        numberIdList.push(newNumber.id);
        this.deckMap.set(deckId, numberIdList);

        return newNumber;
    }

    public findNumberById(numberId: number): MyDeckNumberOfCards | null {
        return this.numberMap.get(numberId)?.numberMesh ?? null;
    }

    public findCardCountByNumberId(numberId: number): number | null {
        return this.numberMap.get(numberId)?.cardCount ?? null;
    }

    public findNumberByDeckIdAndCardId(deckId: number, cardId: number): MyDeckNumberOfCards | null {
        const numberIdList = this.deckMap.get(deckId);
        if (!numberIdList) {
            return null;
        }

        for (const numberId of numberIdList) {
            const numberEntry = this.numberMap.get(numberId);
            if (numberEntry && numberEntry.cardId === cardId) {
                return numberEntry.numberMesh;
            }
        }
        return null;
    }

    public findNumberIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const numberIdList = this.deckMap.get(deckId);
        if (!numberIdList) {
            return null;
        }

        for (const numberId of numberIdList) {
            const numberEntry = this.numberMap.get(numberId);
            if (numberEntry && numberEntry.cardId === cardId) {
                return numberId;
            }
        }
        return null;
    }

    public findNumberListByDeckId(deckId: number): MyDeckNumberOfCards[] | null {
        const numberIdList = this.deckMap.get(deckId);
        if (numberIdList === undefined) {
            return null;
        }

        const numberList: MyDeckNumberOfCards[] = [];
        numberIdList.forEach((numberId) => {
            const number = this.findNumberById(numberId);
            if (number) {
                numberList.push(number);
            } else {
                console.warn(`[WARN] My Deck Number Of Cards with Unique ID ${numberId} not found in numberMap`);
            }
        });

        return numberList;
    }

    public findNumberIdListByDeckId(deckId: number): number[] {
        return this.deckMap.get(deckId) || [];
    }

    public findDeckIdList(): number[] {
        return Array.from(this.deckMap.keys());
    }

    public findNumberCountByDeckId(deckId: number): number {
        const numberIdList = this.deckMap.get(deckId);
        return numberIdList ? numberIdList.length : 0;
    }

    public saveNumberGroupByDeckId(deckId: number): void {
        const numberIdList = this.deckMap.get(deckId);
        if (!numberIdList) {
            throw new Error(`Deck with ID ${deckId} not found`);
        }

        const numberGroup = new THREE.Group();
        numberIdList.forEach(numberId => {
            const number = this.numberMap.get(numberId);
            if (number) {
                numberGroup.add(number.numberMesh.getMesh());
            } else {
                console.warn(`[WARN] My Deck Number Of Cards with Unique ID ${numberId} not found in numberMap`);
            }
        });

        this.numberGroupMap.set(deckId, numberGroup);
    }

    public findNumberGroupByDeckId(deckId: number): THREE.Group {
        const numberGroup = this.numberGroupMap.get(deckId);
        if (!numberGroup) {
            throw new Error(`My Deck Number Of Cards Group with Deck ID ${deckId} not found`);
        }
        return numberGroup;
    }

    public resetNumberGroup(): void {
        this.numberGroupMap.clear();
    }

    // 특정 덱의 특정 number of cards 삭제
    public deleteNumberByDeckIdAndNumberId(deckId: number, numberId: number): void {
        const numberInfo = this.numberMap.get(numberId);
        if (numberInfo) {
            this.meshDestroyer.destroyMesh(numberInfo.numberMesh.getMesh());

            const group = this.numberGroupMap.get(deckId);
            if (group) {
                group.remove(numberInfo.numberMesh.getMesh());
            }

            this.numberMap.delete(numberId);
        }

        const numberIdList = this.deckMap.get(deckId);
        if (numberIdList) {
            const updatedList = numberIdList.filter(id => id !== numberId);
            this.deckMap.set(deckId, updatedList);

//             if (updatedList.length === 0) {
//                 this.deckMap.delete(deckId);
//             }
        }
    }

    // 모든 정보 삭제
    public deleteAll(): void {
        this.deckMap.clear();
        this.numberMap.clear();
    }

    // 특정 덱 삭제
    public deleteDeckByDeckId(deckId: number): void {
        const group = this.numberGroupMap.get(deckId);
        if (group) {
            this.meshDestroyer.destroyGroup(group);
            this.numberGroupMap.delete(deckId);
        }

        const numberIdList = this.findNumberIdListByDeckId(deckId);
        if (numberIdList) {
            numberIdList.forEach((numberId) => {
                this.numberMap.delete(numberId);
            });
        }
        this.deckMap.delete(deckId);
        const deckIdList = this.findDeckIdList();
        console.log(`%c삭제 후 남은 덱 id 리스트는? ${deckIdList}`, 'color: #FE2EF7; font-weight: bold;');
    }

    public saveClonedOriginalDeckState(deckId: number): void {
        this.originalNumberMap.clear();
        this.originalDeckMap.set(deckId, [...(this.deckMap.get(deckId) || [])]);

        const numberIdList = this.deckMap.get(deckId);
        if (!numberIdList) {
            console.warn(`[WARN] No numberIdList for deck ${deckId}`);
            return;
        }

        numberIdList.forEach(numberId => {
            const entry = this.numberMap.get(numberId);
            if (entry) {
                const originalMesh = entry.numberMesh.getMesh();
                const clonedMesh = originalMesh.clone(true);
                const clonedPosition = entry.numberMesh.position.clone ? entry.numberMesh.position.clone() : entry.numberMesh.position;
                const clonedWrapper = new MyDeckNumberOfCards(clonedMesh, clonedPosition);

                this.originalNumberMap.set(numberId, {
                    cardId: entry.cardId,
                    cardCount: entry.cardCount,
                    numberMesh: clonedWrapper
                });

            } else {
                console.warn(`[WARN] numberId ${numberId} not found in cardMap`);
            }
        });

        // To-do: 확인 후 삭제하기
        console.log(
            `%c[INFO] Original deck state cloned and stored for deckId ${deckId}`, 'color: #2E9AFE; font-weight: bold;');
        console.log(
            'originalNumberMap:',
            Array.from(this.originalNumberMap.entries()).map(([id, data]) => ({
                numberId: id,
                cardId: data.cardId,
                cardCount: data.cardCount
            }))
        );
    }

    public restoreOriginalDeckState(deckId: number): void {
        const originalNumberIdList = this.originalDeckMap.get(deckId);
        if (originalNumberIdList) {
            this.deckMap.set(deckId, [...originalNumberIdList]);
        }

        const numberIdList = this.deckMap.get(deckId);
        if (!numberIdList) return;

        numberIdList.forEach(numberId => {
            const originalNumberInfo = this.originalNumberMap.get(numberId);
            if (originalNumberInfo) {
                const currentNumberInfo = this.numberMap.get(numberId);
                if (currentNumberInfo) {
                    this.meshDestroyer.destroyMesh(currentNumberInfo.numberMesh.getMesh());
                }

                this.numberMap.set(numberId, {
                    cardId: originalNumberInfo.cardId,
                    cardCount: originalNumberInfo.cardCount,
                    numberMesh: originalNumberInfo.numberMesh
                });

                const group = this.numberGroupMap.get(deckId);
                if (group) {
                    originalNumberInfo.numberMesh.setVisibility(false);
                    group.add(originalNumberInfo.numberMesh.getMesh());
                }
            }
        });

        // To-do: 확인 후 없애야 함
        const restoredData = numberIdList.map(numberId => {
            const data = this.numberMap.get(numberId);
            return data ? {
                numberId,
                cardId: data.cardId,
                cardCount: data.cardCount,
                numberMesh: data.numberMesh
            } : { numberId, cardId: null, cardCount: null, numberMesh: null };
        });

        console.log(
            `%c[덱 편집 중단 후 다른 덱 버튼을 눌렀을 때] Deck ${deckId} restored.`,
            'color: #2E9AFE; font-weight: bold;'
        );
        console.log('복원된 mesh 데이터:', restoredData);
    }

}
