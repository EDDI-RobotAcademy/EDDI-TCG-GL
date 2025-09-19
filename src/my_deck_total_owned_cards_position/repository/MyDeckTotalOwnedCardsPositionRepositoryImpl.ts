import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckTotalOwnedCardsPosition} from "../entity/MyDeckTotalOwnedCardsPosition";
import {MyDeckTotalOwnedCardsPositionRepository} from "./MyDeckTotalOwnedCardsPositionRepository";

export class MyDeckTotalOwnedCardsPositionRepositoryImpl implements MyDeckTotalOwnedCardsPositionRepository {
    private static instance: MyDeckTotalOwnedCardsPositionRepositoryImpl;
    private positionMap: Map< number, MyDeckTotalOwnedCardsPosition> = new Map(); // position Unique ID: position

    private initialX = - 0.178;
    private incrementX = 0.1275;
    private initialY =  - 0.09;
    private incrementY = - 0.34;
    private maxCardsPerRow = 4;

    private constructor() {}

    public static getInstance(): MyDeckTotalOwnedCardsPositionRepositoryImpl {
        if (!MyDeckTotalOwnedCardsPositionRepositoryImpl.instance) {
            MyDeckTotalOwnedCardsPositionRepositoryImpl.instance = new MyDeckTotalOwnedCardsPositionRepositoryImpl();
        }
        return MyDeckTotalOwnedCardsPositionRepositoryImpl.instance;
    }

    public addMyDeckTotalOwnedCardsPosition(cardId: number, cardIndex: number): MyDeckTotalOwnedCardsPosition {
        console.log(`%c Card ID?: ${cardId}, Card Index?: ${cardIndex}`, 'color: #FE2EF7; font-weight: bold;');
        const col = cardIndex % this.maxCardsPerRow;
        const row = Math.floor(cardIndex / this.maxCardsPerRow);

        const positionX = this.initialX + col * this.incrementX;
        const positionY = this.initialY + row * this.incrementY;

        const position = new MyDeckTotalOwnedCardsPosition(positionX, positionY);
        this.positionMap.set(position.id, position);

        return position;
    }

    public findPositionByPositionId(positionId: number): MyDeckTotalOwnedCardsPosition | null {
        return this.positionMap.get(positionId) || null;
    }

    public findPositionIdList(): number[] {
        return Array.from(this.positionMap.keys());
    }

    // 검색용 position
    public findSearchPosition(searchResultCount: number): MyDeckTotalOwnedCardsPosition[] {
        const positionIdList = this.findPositionIdList();

        // 검색 결과 개수만큼 positionId만 추출
        const limitedPositionIdList = positionIdList.slice(0, searchResultCount);

        // 각 positionId에 해당하는 MyDeckTotalOwnedCardsPosition 가져오기
        const positions: MyDeckTotalOwnedCardsPosition[] = [];
        for (const positionId of limitedPositionIdList) {
            const position = this.positionMap.get(positionId);
            if (position) {
                positions.push(position);
            }
        }
        return positions;
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
