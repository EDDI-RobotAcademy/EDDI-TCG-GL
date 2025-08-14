import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckOwnedCardsPosition} from "../entity/MyDeckOwnedCardsPosition";
import {MyDeckOwnedCardsPositionRepository} from "./MyDeckOwnedCardsPositionRepository";

export class MyDeckOwnedCardsPositionRepositoryImpl implements MyDeckOwnedCardsPositionRepository {
    private static instance: MyDeckOwnedCardsPositionRepositoryImpl;
    private positionMap: Map<number, { cardId: number, position: MyDeckOwnedCardsPosition}> = new Map();

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

    public addMyDeckOwnedCardsPosition(cardId: number): MyDeckOwnedCardsPosition {
        if (this.containsCardIdInMap(cardId)) {
            return this.findPositionByCardId(cardId)!;
        }

        const col = this.positionMap.size % this.maxCardsPerRow;
        const row = Math.floor(this.positionMap.size / this.maxCardsPerRow);

        const positionX = this.initialX + col * this.incrementX;
        const positionY = this.initialY + row * this.incrementY;

        const position = new MyDeckOwnedCardsPosition(positionX, positionY);
        this.positionMap.set(position.id, {cardId, position: position})

        return position;
    }

    public findPositionByPositionId(positionId: number): MyDeckOwnedCardsPosition | null {
        return this.positionMap.get(positionId)?.position ?? null;
    }

    public findPositionByCardId(cardId: number): MyDeckOwnedCardsPosition | null {
        for (const { cardId: storedCardId, position } of this.positionMap.values()) {
            if (storedCardId === cardId) {
                return position;
            }
        }
        return null;
    }

    public findPositionIdByCardId(cardId: number): number | null {
        for (const [positionId, { cardId: storedCardId }] of this.positionMap.entries()) {
            if (storedCardId === cardId) {
                return positionId;
            }
        }
        return null;
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

    private containsCardIdInMap(cardId: number): boolean {
        for (const { cardId: storedCardId } of this.positionMap.values()) {
            if (storedCardId === cardId) {
                return true;
            }
        }
        return false;
    }

}
