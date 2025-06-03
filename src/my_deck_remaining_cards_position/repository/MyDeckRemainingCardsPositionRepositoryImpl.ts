import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckRemainingCardsPosition} from "../entity/MyDeckRemainingCardsPosition";
import {MyDeckRemainingCardsPositionRepository} from "./MyDeckRemainingCardsPositionRepository";

export class MyDeckRemainingCardsPositionRepositoryImpl implements MyDeckRemainingCardsPositionRepository {
    private static instance: MyDeckRemainingCardsPositionRepositoryImpl;
    private positionMap: Map< number, { cardId: number, position: MyDeckRemainingCardsPosition}> = new Map(); // position Unique ID: position

    private initialX = - 0.205;
    private incrementX = 0.1275;
    private initialY =  - 0.09;
    private incrementY = - 0.34;
    private maxCardsPerRow = 4;
    private positionIndex = 0;

    private constructor() {}

    public static getInstance(): MyDeckRemainingCardsPositionRepositoryImpl {
        if (!MyDeckRemainingCardsPositionRepositoryImpl.instance) {
            MyDeckRemainingCardsPositionRepositoryImpl.instance = new MyDeckRemainingCardsPositionRepositoryImpl();
        }
        return MyDeckRemainingCardsPositionRepositoryImpl.instance;
    }

    public addMyDeckRemainingCardsPosition(cardId: number): MyDeckRemainingCardsPosition {
        if (this.containsCardIdInMap(cardId) == false) {
            this.positionIndex++;
        }

        const col = (this.positionIndex - 1) % this.maxCardsPerRow;
        const row = Math.floor((this.positionIndex - 1)/ this.maxCardsPerRow);

        const positionX = this.initialX + col * this.incrementX;
        const positionY = this.initialY + row * this.incrementY;

        const position = new MyDeckRemainingCardsPosition(positionX, positionY);
        this.positionMap.set(position.id, {cardId, position: position});

        return position;
    }

    public findPositionByPositionId(positionId: number): MyDeckRemainingCardsPosition | null {
        return this.positionMap.get(positionId)?.position ?? null;
    }

    public findPositionByCardId(cardId: number): MyDeckRemainingCardsPosition | null {
        for (const { cardId: storedCardId, position } of this.positionMap.values()) {
            if (storedCardId === cardId) {
                return position;
            }
        }
        return null;
    }

    public findPositionIdList(): number[] {
        return Array.from(this.positionMap.keys());
    }

    public findAllPositionList(): MyDeckRemainingCardsPosition[] {
        return Array.from(this.positionMap.values()).map(({ position }) => position);
    }

    // To-do: 삭제 부분 후에 수정해야 함(재정렬 필요)
    public deleteById(positionId: number): boolean {
        return this.positionMap.delete(positionId);
    }

    public deleteAll(): void {
        this.positionMap.clear();
    }

    public containsCardIdInMap(cardId: number): boolean {
        for (const { cardId: storedCardId } of this.positionMap.values()) {
            if (storedCardId === cardId) {
                return true;
            }
        }
        return false;
    }

    public count(): number {
        return this.positionMap.size;
    }
}
