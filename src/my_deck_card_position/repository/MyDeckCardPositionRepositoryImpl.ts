import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckCardPosition} from "../entity/MyDeckCardPosition";
import {MyDeckCardPositionRepository} from "./MyDeckCardPositionRepository";

export class MyDeckCardPositionRepositoryImpl implements MyDeckCardPositionRepository {
    private static instance: MyDeckCardPositionRepositoryImpl;
    private positionMap: Map< number, MyDeckCardPosition> = new Map(); // position Unique ID: position
    private deckToPositionMap: Map< number, number[]> = new Map(); // deck ID: position Unique ID List

    private initialX = - 0.1125;
    private incrementX = 0.163;
    private initialY =  0.1629;
    private incrementY = - 0.421;
    private maxCardsPerRow = 4;
    private cardsPerPage = 8;

    private constructor() {}

    public static getInstance(): MyDeckCardPositionRepositoryImpl {
        if (!MyDeckCardPositionRepositoryImpl.instance) {
            MyDeckCardPositionRepositoryImpl.instance = new MyDeckCardPositionRepositoryImpl();
        }
        return MyDeckCardPositionRepositoryImpl.instance;
    }

    public addMyDeckCardPosition(deckId: number, cardIndex: number): MyDeckCardPosition {
        const positionInPage = (cardIndex) % this.cardsPerPage
        const row = Math.floor(positionInPage / this.maxCardsPerRow);
        const col = (cardIndex) % this.maxCardsPerRow;

        const positionX = this.initialX + col * this.incrementX;
        const positionY = this.initialY + row * this.incrementY;

        const position = new MyDeckCardPosition(positionX, positionY);
        this.positionMap.set(position.id, position);

        if (!this.deckToPositionMap.has(deckId)) {
            this.deckToPositionMap.set(deckId, []);
        }
        const positionIdList = this.deckToPositionMap.get(deckId)!;
        positionIdList.push(position.id);
        this.deckToPositionMap.set(deckId, positionIdList);

        return position;
    }

    public findPositionByPositionId(positionId: number): MyDeckCardPosition | null {
        return this.positionMap.get(positionId) || null;
    }

    public findPositionIdListByDeckId(deckId: number): number[] {
        return this.deckToPositionMap.get(deckId) || [];
    }


    // To-do: 삭제 부분 후에 수정해야 함
    deleteById(positionId: number): boolean {
        return this.positionMap.delete(positionId);
    }

    deletePositionByDeckId(deckId: number): void {
        this.deckToPositionMap.delete(deckId);
    }

    deleteAll(): void {
        this.positionMap.clear();
        this.deckToPositionMap.clear();
    }

    count(): number {
        return this.positionMap.size;
    }
}
