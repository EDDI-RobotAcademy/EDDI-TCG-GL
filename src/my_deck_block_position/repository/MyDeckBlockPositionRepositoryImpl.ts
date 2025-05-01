import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckBlockPosition} from "../entity/MyDeckBlockPosition";
import {MyDeckBlockPositionRepository} from "./MyDeckBlockPositionRepository";

export class MyDeckBlockPositionRepositoryImpl implements MyDeckBlockPositionRepository {
    private static instance: MyDeckBlockPositionRepositoryImpl;
    private positionMap: Map< number, MyDeckBlockPosition> = new Map(); // position Unique ID: position
    private deckToPositionMap: Map< number, number[]> = new Map(); // deck ID: position Unique ID List

    private initialX = 0.37;
    private initialY =  0.23;
    private incrementY = - 0.073;

    private constructor() {}

    public static getInstance(): MyDeckBlockPositionRepositoryImpl {
        if (!MyDeckBlockPositionRepositoryImpl.instance) {
            MyDeckBlockPositionRepositoryImpl.instance = new MyDeckBlockPositionRepositoryImpl();
        }
        return MyDeckBlockPositionRepositoryImpl.instance;
    }

    public addMyDeckBlockPosition(deckId: number, cardIndex: number): MyDeckBlockPosition {
        console.log(`%c [Block] deckID?: ${deckId}, cardIndex?: ${cardIndex}`, 'color: #FE2EF7; font-weight: bold;');

        const positionX = this.initialX;
        const positionY = this.initialY + cardIndex * this.incrementY;

        const position = new MyDeckBlockPosition(positionX, positionY);
        this.positionMap.set(position.id, position);

        if (!this.deckToPositionMap.has(deckId)) {
            this.deckToPositionMap.set(deckId, []);
        }
        const positionIdList = this.deckToPositionMap.get(deckId)!;
        positionIdList.push(position.id);
        this.deckToPositionMap.set(deckId, positionIdList);

        return position;
    }

    public findPositionByPositionId(positionId: number): MyDeckBlockPosition | null {
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
