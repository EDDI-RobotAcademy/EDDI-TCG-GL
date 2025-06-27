import * as THREE from 'three';
import {MyDeckNumberOfSelectedCardsRepository} from './MyDeckNumberOfSelectedCardsRepository';
import {MyDeckNumberOfSelectedCards} from "../entity/MyDeckNumberOfSelectedCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckNumberOfSelectedCardsRepositoryImpl implements MyDeckNumberOfSelectedCardsRepository {
    private static instance: MyDeckNumberOfSelectedCardsRepositoryImpl;
    // number unique id: {card id, card count, number mesh}
    private numberMap: Map<number, { cardId: number, cardCount: number, numberMesh: MyDeckNumberOfSelectedCards }> = new Map();
    private deckMap: Map<number, number[]> = new Map(); // deckId: number ID List
    private numberGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly NUMBER_WIDTH: number = 0.015

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckNumberOfSelectedCardsRepositoryImpl {
        if (!MyDeckNumberOfSelectedCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckNumberOfSelectedCardsRepositoryImpl.instance = new MyDeckNumberOfSelectedCardsRepositoryImpl(textureManager, scene);
        }
        return MyDeckNumberOfSelectedCardsRepositoryImpl.instance;
    }

    public async createMyDeckNumberOfSelectedCards(deckId: number, cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckNumberOfSelectedCards> {
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

        const newNumber = new MyDeckNumberOfSelectedCards(numberMesh, position);
        this.numberMap.set(newNumber.id, { cardCount, cardId, numberMesh: newNumber });

        if (!this.deckMap.has(deckId)) {
            this.deckMap.set(deckId, []);
        }
        const numberIdList = this.deckMap.get(deckId)!;
        numberIdList.push(newNumber.id);
        this.deckMap.set(deckId, numberIdList);

        return newNumber;
    }

    public findNumberById(numberId: number): MyDeckNumberOfSelectedCards | null {
        return this.numberMap.get(numberId)?.numberMesh ?? null;
    }

    public findCardCountByNumberId(numberId: number): number | null {
        return this.numberMap.get(numberId)?.cardCount ?? null;
    }

    public findNumberByDeckIdAndCardId(deckId: number, cardId: number): MyDeckNumberOfSelectedCards | null {
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

    public findNumberListByDeckId(deckId: number): MyDeckNumberOfSelectedCards[] | null {
        const numberIdList = this.deckMap.get(deckId);
        if (numberIdList === undefined) {
            return null;
        }

        const numberList: MyDeckNumberOfSelectedCards[] = [];
        numberIdList.forEach((numberId) => {
            const number = this.findNumberById(numberId);
            if (number) {
                numberList.push(number);
            } else {
                console.warn(`[WARN] My Deck Number Of Selected Cards with Unique ID ${numberId} not found in numberMap`);
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
            throw new Error(`Number ID List with Deck ID ${deckId} not found`);
        }

        const numberGroup = new THREE.Group();
        numberIdList.forEach(numberId => {
            const number = this.numberMap.get(numberId);
            if (number) {
                numberGroup.add(number.numberMesh.getMesh());
            } else {
                console.warn(`[WARN] My Deck Number Of Selected Cards with Unique ID ${numberId} not found in numberMap`);
            }
        });

        this.numberGroupMap.set(deckId, numberGroup);
    }

    public findNumberGroupByDeckId(deckId: number): THREE.Group {
        const numberGroup = this.numberGroupMap.get(deckId);
        if (!numberGroup) {
            throw new Error(`My Deck Number Of Selected Cards Group with Deck ID ${deckId} not found`);
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
//         console.log(`%c삭제 후 남은 덱 id 리스트는? ${deckIdList}`, 'color: #FE2EF7; font-weight: bold;');
    }

}
