import * as THREE from 'three';
import {MyDeckNumberOfCardsRepository} from './MyDeckNumberOfCardsRepository';
import {MyDeckNumberOfCards} from "../entity/MyDeckNumberOfCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

export class MyDeckNumberOfCardsRepositoryImpl implements MyDeckNumberOfCardsRepository {
    private static instance: MyDeckNumberOfCardsRepositoryImpl;
    // number unique id: {card id, card count, number mesh}
    private numberMap: Map<number, { cardId: number, cardCount: number, numberMesh: MyDeckNumberOfCards }> = new Map();
    private deckMap: Map<number, number[]> = new Map(); // deckId: number ID List
    private textureManager: TextureManager;
    private numberGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private readonly NUMBER_WIDTH: number = 0.013

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckNumberOfCardsRepositoryImpl {
        if (!MyDeckNumberOfCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckNumberOfCardsRepositoryImpl.instance = new MyDeckNumberOfCardsRepositoryImpl(textureManager);
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
        this.numberMap.delete(numberId);

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

}
