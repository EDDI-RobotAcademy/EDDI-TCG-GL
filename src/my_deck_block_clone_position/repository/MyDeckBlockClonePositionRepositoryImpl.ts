import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckBlockClonePosition} from "../entity/MyDeckBlockClonePosition";
import {MyDeckBlockClonePositionRepository} from "./MyDeckBlockClonePositionRepository";

export class MyDeckBlockClonePositionRepositoryImpl implements MyDeckBlockClonePositionRepository {
    private static instance: MyDeckBlockClonePositionRepositoryImpl;
    private positionMap: Map< number, MyDeckBlockClonePosition> = new Map(); // card ID: position
    private positionIndex: number = 0;

    private initialX = 0.37;
    private initialY =  0.23;
    private incrementY = - 0.073;

    private constructor() {}

    public static getInstance(): MyDeckBlockClonePositionRepositoryImpl {
        if (!MyDeckBlockClonePositionRepositoryImpl.instance) {
            MyDeckBlockClonePositionRepositoryImpl.instance = new MyDeckBlockClonePositionRepositoryImpl();
        }
        return MyDeckBlockClonePositionRepositoryImpl.instance;
    }

    public addClonePosition(cardId: number): MyDeckBlockClonePosition {
        console.log(`%c [Clone Position] Card ID?: ${cardId}`, 'color: #FE2EF7; font-weight: bold;');

        if (this.containsCardIdInMap(cardId) == false) {
            this.positionIndex++;
        }

        const positionX = this.initialX;
        const positionY = this.initialY + (this.positionIndex - 1) * this.incrementY;

        const position = new MyDeckBlockClonePosition(positionX, positionY);
        this.positionMap.set(cardId, position);

        return position;
    }

    public findPositionByCardId(cardId: number): MyDeckBlockClonePosition | null {
        return this.positionMap.get(cardId) ?? null;
    }

    public findCardIdList(): number [] | null {
        return Array.from(this.positionMap.keys());
    }

    public deleteByCardId(cardId: number): void {
        this.positionMap.delete(cardId);
        this.positionIndex = 0;

        const cardIdList = this.findCardIdList();
        if (cardIdList == null) return;

        for (const id of cardIdList) {
            this.positionIndex++;

            const newX = this.initialX;
            const newY = this.initialY + (this.positionIndex - 1) * this.incrementY;
            const newPosition = new MyDeckBlockClonePosition(newX, newY);

            this.positionMap.set(id, newPosition);
        }
    }

    public deleteAll(): void {
        this.positionMap.clear();
        this.positionIndex = 0;
    }

    public containsCardIdInMap(cardId: number): boolean {
        return this.positionMap.has(cardId);
    }

    public count(): number {
        return this.positionMap.size;
    }
}
