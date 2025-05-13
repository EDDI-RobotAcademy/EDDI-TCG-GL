import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckOwnedCardsPosition} from "../entity/MyDeckOwnedCardsPosition";
import {MyDeckOwnedCardsPositionRepository} from "./MyDeckOwnedCardsPositionRepository";

export class MyDeckOwnedCardsPositionRepositoryImpl implements MyDeckOwnedCardsPositionRepository {
    private static instance: MyDeckOwnedCardsPositionRepositoryImpl;
    private positionMap: Map< number, MyDeckOwnedCardsPosition> = new Map(); // position Unique ID: position

    private initialX = - 0.192;
    private incrementX = 0.1275;
    private initialY =  0.075;
    private incrementY = - 0.34;
    private maxCardsPerRow = 4;

    private constructor() {}

    public static getInstance(): MyDeckOwnedCardsPositionRepositoryImpl {
        if (!MyDeckOwnedCardsPositionRepositoryImpl.instance) {
            MyDeckOwnedCardsPositionRepositoryImpl.instance = new MyDeckOwnedCardsPositionRepositoryImpl();
        }
        return MyDeckOwnedCardsPositionRepositoryImpl.instance;
    }

    public addMyDeckOwnedCardsPosition(cardId: number, cardIndex: number): MyDeckOwnedCardsPosition {
        console.log(`%c Card ID?: ${cardId}, Card Index?: ${cardIndex}`, 'color: #FE2EF7; font-weight: bold;');
        const col = cardIndex % this.maxCardsPerRow;
        const row = Math.floor(cardIndex / this.maxCardsPerRow);

        const positionX = this.initialX + col * this.incrementX;
        const positionY = this.initialY + row * this.incrementY;

        const position = new MyDeckOwnedCardsPosition(positionX, positionY);
        this.positionMap.set(position.id, position);

        return position;
    }

    public findPositionByPositionId(positionId: number): MyDeckOwnedCardsPosition | null {
        return this.positionMap.get(positionId) || null;
    }

    public findPositionIdList(): number[] {
        return Array.from(this.positionMap.keys());
    }

    // To-do: 삭제 부분 후에 수정해야 함(재정렬 필요)
    public deleteById(positionId: number): boolean {
        return this.positionMap.delete(positionId);
    }

    public deleteAll(): void {
        this.positionMap.clear();
    }

    public count(): number {
        return this.positionMap.size;
    }
}
