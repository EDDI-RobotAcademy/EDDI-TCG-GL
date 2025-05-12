import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckCardNamePosition} from "../entity/MyDeckCardNamePosition";
import {MyDeckCardNamePositionRepository} from "./MyDeckCardNamePositionRepository";

export class MyDeckCardNamePositionRepositoryImpl implements MyDeckCardNamePositionRepository {
    private static instance: MyDeckCardNamePositionRepositoryImpl;
    private positionMap: Map< number, MyDeckCardNamePosition> = new Map(); // position Unique ID: position
    private deckToPositionMap: Map< number, number[]> = new Map(); // deck ID: position Unique ID List

    private initialX = 0.385;
    private initialY =  0.23;
    private incrementY = - 0.073;

    private constructor() {}

    public static getInstance(): MyDeckCardNamePositionRepositoryImpl {
        if (!MyDeckCardNamePositionRepositoryImpl.instance) {
            MyDeckCardNamePositionRepositoryImpl.instance = new MyDeckCardNamePositionRepositoryImpl();
        }
        return MyDeckCardNamePositionRepositoryImpl.instance;
    }

    public addMyDeckCardNamePosition(deckId: number, cardIndex: number): MyDeckCardNamePosition {
        console.log(`%c [Card Name] deckID?: ${deckId}, cardIndex?: ${cardIndex}`, 'color: #FE2EF7; font-weight: bold;');

        const positionX = this.initialX;
        const positionY = this.initialY + cardIndex * this.incrementY;

        const position = new MyDeckCardNamePosition(positionX, positionY);
        this.positionMap.set(position.id, position);

        if (!this.deckToPositionMap.has(deckId)) {
            this.deckToPositionMap.set(deckId, []);
        }
        const positionIdList = this.deckToPositionMap.get(deckId)!;
        positionIdList.push(position.id);
        this.deckToPositionMap.set(deckId, positionIdList);

        return position;
    }

    public findPositionByPositionId(positionId: number): MyDeckCardNamePosition | null {
        return this.positionMap.get(positionId) || null;
    }

    public findPositionIdListByDeckId(deckId: number): number[] {
        return this.deckToPositionMap.get(deckId) || [];
    }

    // To-do: 삭제 부분 후에 수정해야 함
    public deleteById(positionId: number): void {
        this.positionMap.delete(positionId);
    }

    public deletePositionByDeckId(deckId: number): void {
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
