import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckNumberOfSelectedCardsPosition} from "../entity/MyDeckNumberOfSelectedCardsPosition";
import {MyDeckNumberOfSelectedCardsPositionRepository} from "./MyDeckNumberOfSelectedCardsPositionRepository";

export class MyDeckNumberOfSelectedCardsPositionRepositoryImpl implements MyDeckNumberOfSelectedCardsPositionRepository {
    private static instance: MyDeckNumberOfSelectedCardsPositionRepositoryImpl;
    private positionMap: Map< number, {cardId: number, position: MyDeckNumberOfSelectedCardsPosition}> = new Map(); // position Unique ID: {card Id, position}
    private deckToPositionMap: Map< number, number[]> = new Map(); // deck ID: position Unique ID List
    private deckPositionIndexMap: Map<number, number> = new Map();

    private initialX = 0.47;
    private initialY =  0.23;
    private incrementY = - 0.073;

    private constructor() {}

    public static getInstance(): MyDeckNumberOfSelectedCardsPositionRepositoryImpl {
        if (!MyDeckNumberOfSelectedCardsPositionRepositoryImpl.instance) {
            MyDeckNumberOfSelectedCardsPositionRepositoryImpl.instance = new MyDeckNumberOfSelectedCardsPositionRepositoryImpl();
        }
        return MyDeckNumberOfSelectedCardsPositionRepositoryImpl.instance;
    }

    public addMyDeckNumberOfSelectedCardsPosition(deckId: number, cardId: number): MyDeckNumberOfSelectedCardsPosition {
        console.log(`%cdeckID?: ${deckId}, cardId?: ${cardId}`, 'color: #FE2EF7; font-weight: bold;');

        if (!this.deckPositionIndexMap.has(deckId)) {
            this.deckPositionIndexMap.set(deckId, 0);
        }

        const positionIds = this.deckToPositionMap.get(deckId) || [];
        const isCardAlreadyInDeck = positionIds.some(id => this.positionMap.get(id)?.cardId === cardId);

        if (!isCardAlreadyInDeck) {
            const positionIndex = this.deckPositionIndexMap.get(deckId)!;

            const positionX = this.initialX;
            const positionY = this.initialY + positionIndex * this.incrementY;

            const position = new MyDeckNumberOfSelectedCardsPosition(positionX, positionY);
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

    public findPositionByPositionId(positionId: number): MyDeckNumberOfSelectedCardsPosition | null {
        return this.positionMap.get(positionId)?.position ?? null;
    }

    public findPositionIdListByDeckId(deckId: number): number[] {
        return this.deckToPositionMap.get(deckId) || [];
    }

    // To-do: 삭제 부분 후에 수정해야 함
    public deleteById(deckId: number, positionId: number): void {
        this.positionMap.delete(positionId);
        this.deckPositionIndexMap.set(deckId, 0);

        const positionIdList = this.findPositionIdListByDeckId(deckId);
        if (!positionIdList) return;

        const updatedPositionIdList = positionIdList.filter(id => id !== positionId);
        this.deckToPositionMap.set(deckId, updatedPositionIdList);

        for (const id of updatedPositionIdList) {
            const positionIndex = this.deckPositionIndexMap.get(deckId)!;
            const entry = this.positionMap.get(id);
            if (!entry) return;

            const { cardId } = entry;
            const newX = this.initialX;
            const newY = this.initialY + positionIndex * this.incrementY;
            const newPosition = new MyDeckNumberOfSelectedCardsPosition(newX, newY);

            this.positionMap.set(id, { cardId, position: newPosition });
            this.deckPositionIndexMap.set(deckId, positionIndex + 1);
        }
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
