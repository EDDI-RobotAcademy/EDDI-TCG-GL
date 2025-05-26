import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckNumberOfCardsPosition} from "../entity/MyDeckNumberOfCardsPosition";
import {MyDeckNumberOfCardsPositionRepository} from "./MyDeckNumberOfCardsPositionRepository";

export class MyDeckNumberOfCardsPositionRepositoryImpl implements MyDeckNumberOfCardsPositionRepository {
    private static instance: MyDeckNumberOfCardsPositionRepositoryImpl;
    private positionMap: Map< number, {cardId: number, position: MyDeckNumberOfCardsPosition}> = new Map(); // position Unique ID: {card Id, position}
    private deckToPositionMap: Map< number, number[]> = new Map(); // deck ID: position Unique ID List
    private deckPositionIndexMap: Map<number, number> = new Map();

    private initialX = - 0.192;
    private incrementX = 0.1275;
    private initialY =  - 0.09;
    private incrementY = - 0.34;
    private maxNumbersPerRow = 4;

    private constructor() {}

    public static getInstance(): MyDeckNumberOfCardsPositionRepositoryImpl {
        if (!MyDeckNumberOfCardsPositionRepositoryImpl.instance) {
            MyDeckNumberOfCardsPositionRepositoryImpl.instance = new MyDeckNumberOfCardsPositionRepositoryImpl();
        }
        return MyDeckNumberOfCardsPositionRepositoryImpl.instance;
    }

    public addMyDeckNumberOfCardsPosition(deckId: number, cardId: number): MyDeckNumberOfCardsPosition {
        console.log(`%cdeckID?: ${deckId}, cardId?: ${cardId}`, 'color: #FE2EF7; font-weight: bold;');

        if (!this.deckPositionIndexMap.has(deckId)) {
            this.deckPositionIndexMap.set(deckId, 0);
        }

        const positionIds = this.deckToPositionMap.get(deckId) || [];
        const isCardAlreadyInDeck = positionIds.some(id => this.positionMap.get(id)?.cardId === cardId);

        if (!isCardAlreadyInDeck) {
            const positionIndex = this.deckPositionIndexMap.get(deckId)!;
            const col = positionIndex % this.maxNumbersPerRow;
            const row = Math.floor(positionIndex / this.maxNumbersPerRow);

            const positionX = this.initialX + col * this.incrementX;
            const positionY = this.initialY + row * this.incrementY;

            const position = new MyDeckNumberOfCardsPosition(positionX, positionY);
            this.positionMap.set(position.id, {cardId, position});

            if (!this.deckToPositionMap.has(deckId)) {
                this.deckToPositionMap.set(deckId, []);
            }
            this.deckToPositionMap.get(deckId)!.push(position.id);
            this.deckPositionIndexMap.set(deckId, positionIndex + 1);

            return position;

        } else {
            const existingId = positionIds.find(id => this.positionMap.get(id)?.cardId === cardId)!;
            return this.positionMap.get(existingId)!.position;
        }
    }

    public findPositionByPositionId(positionId: number): MyDeckNumberOfCardsPosition | null {
        return this.positionMap.get(positionId)?.position ?? null;
    }

    public findPositionIdListByDeckId(deckId: number): number[] {
        return this.deckToPositionMap.get(deckId) || [];
    }

    // To-do: 삭제 부분 후에 수정해야 함
    public deleteById(positionId: number): boolean {
        return this.positionMap.delete(positionId);
    }

    public deletePositionByDeckId(deckId: number): void {
        const positionIdList = this.findPositionIdListByDeckId(deckId);
        if (positionIdList) {
            positionIdList.forEach((positionId) => {
                this.positionMap.delete(positionId);
            });
        }
        this.deckToPositionMap.delete(deckId);
    }

    public deleteAll(): void {
        this.positionMap.clear();
        this.deckToPositionMap.clear();
    }

    public count(): number {
        return this.positionMap.size;
    }
}
