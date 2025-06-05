import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckRemainingOutOfTotalSlashPosition} from "../entity/MyDeckRemainingOutOfTotalSlashPosition";
import {MyDeckRemainingOutOfTotalSlashPositionRepository} from "./MyDeckRemainingOutOfTotalSlashPositionRepository";

export class MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl implements MyDeckRemainingOutOfTotalSlashPositionRepository {
    private static instance: MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl;
    private positionMap: Map< number, MyDeckRemainingOutOfTotalSlashPosition> = new Map(); // position Unique ID: position

    private initialX = - 0.192;
    private incrementX = 0.1275;
    private initialY =  - 0.09;
    private incrementY = - 0.34;
    private maxCardsPerRow = 4;

    private constructor() {}

    public static getInstance(): MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl {
        if (!MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl.instance) {
            MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl.instance = new MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl();
        }
        return MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl.instance;
    }

    public addSlashPosition(cardId: number, cardIndex: number): MyDeckRemainingOutOfTotalSlashPosition {
        console.log(`%c Card ID?: ${cardId}, Card Index?: ${cardIndex}`, 'color: #FE2EF7; font-weight: bold;');
        const col = cardIndex % this.maxCardsPerRow;
        const row = Math.floor(cardIndex / this.maxCardsPerRow);

        const positionX = this.initialX + col * this.incrementX;
        const positionY = this.initialY + row * this.incrementY;

        const position = new MyDeckRemainingOutOfTotalSlashPosition(positionX, positionY);
        this.positionMap.set(position.id, position);

        return position;
    }

    public findPositionByPositionId(positionId: number): MyDeckRemainingOutOfTotalSlashPosition | null {
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
