import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckRemainingCardsPosition} from "../entity/MyDeckRemainingCardsPosition";
import {MyDeckRemainingCardsPositionRepository} from "./MyDeckRemainingCardsPositionRepository";

export class MyDeckRemainingCardsPositionRepositoryImpl implements MyDeckRemainingCardsPositionRepository {
    private static instance: MyDeckRemainingCardsPositionRepositoryImpl;
    private positionMap: Map< number, { cardId: number, position: MyDeckRemainingCardsPosition}> = new Map(); // position Unique ID: position
    private searchModePositionMap: Map<number, MyDeckRemainingCardsPosition> = new Map();
    private deckEditModeFilteredPositionMap: Map<number, MyDeckRemainingCardsPosition> = new Map();

    private originalPositionMap: Map<number, { cardId: number, position: MyDeckRemainingCardsPosition }> = new Map();

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

    // 검색용 position
    public findSearchRemainingCardsPosition(searchResultCount: number): MyDeckRemainingCardsPosition[] {
        const positionIdList = this.findPositionIdList();

        // 검색 결과 개수만큼 positionId만 추출
        const limitedPositionIdList = positionIdList.slice(0, searchResultCount);

        // 각 positionId에 해당하는 MyDeckRemainingCardsPosition 가져오기
        const positions: MyDeckRemainingCardsPosition[] = [];
        for (const positionId of limitedPositionIdList) {
            const entry = this.positionMap.get(positionId);
            if (entry) {
                positions.push(entry.position);
            }
        }
        return positions;
    }

    // To-do(later): 소지한 카드도 삭제하는 기능을 추가한다면 position 재정렬 필요
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

    public saveSearchModePosition(cardId: number, position: MyDeckRemainingCardsPosition): void {
        this.searchModePositionMap.set(cardId, position);
    }

    public findSearchModePositionByCardId(cardId: number): MyDeckRemainingCardsPosition | undefined {
        return this.searchModePositionMap.get(cardId);
    }

    public deleteSearchModePositionData(): void {
        this.searchModePositionMap.clear();
    }

    public saveDeckEditModeFilteredPosition(cardId: number, position: MyDeckRemainingCardsPosition): void {
        this.deckEditModeFilteredPositionMap.set(cardId, position);
    }

    public findDeckEditModeFilteredPositionByCardId(cardId: number): MyDeckRemainingCardsPosition | undefined {
        return this.deckEditModeFilteredPositionMap.get(cardId);
    }

    public deleteDeckEditModeFilteredPositionData(): void {
        this.deckEditModeFilteredPositionMap.clear();
    }

    public saveClonedOriginalPositionState(): void {
        this.originalPositionMap.clear();

        const positionIdList = this.findPositionIdList();
        positionIdList.forEach(positionId => {
            const entry = this.positionMap.get(positionId);
            if (entry) {
                const clonedPosition = new MyDeckRemainingCardsPosition(
                    entry.position.getX(),
                    entry.position.getY()
                );

                this.originalPositionMap.set(positionId, {
                    cardId: entry.cardId,
                    position: clonedPosition
                });
            } else {
                console.warn(`[WARN] positionId ${positionId} not found in positionMap`);
            }
        });

        // To-do: 확인 후에 지우기
        console.log(
            `%c[INFO] Original position state cloned`,'color: #2E9AFE; font-weight: bold;'
        );

        console.log(
            'originalRemainingCardsPositionMap:',
            Array.from(this.originalPositionMap.entries()).map(([id, data]) => ({
                positionId: id,
                cardId: data.cardId,
                positionX: data.position.getX(),
                positionY: data.position.getY(),
            }))
        );
    }

    public restoreOriginalPositionState(): void {
        this.positionMap.clear();

        const originalPositionIdList = Array.from(this.originalPositionMap.keys());

        originalPositionIdList.forEach(positionId => {
            const originalPositionInfo = this.originalPositionMap.get(positionId);
            if (originalPositionInfo) {
                this.positionMap.set(positionId, {
                    cardId: originalPositionInfo.cardId,
                    position: originalPositionInfo.position
                });
            }
        });

        // To-do: 확인 후 없애야 함
        const positionIdList = this.findPositionIdList();
        const restoredData = positionIdList.map(positionId => {
            const data = this.positionMap.get(positionId);
            return data ? {
                positionId,
                cardId: data.cardId,
                positionX: data.position.getX(),
                positionY: data.position.getY()
            } : { positionId, cardId: null, position: null };
        });

        console.log(
            `%c[덱 편집 중단 후 다른 덱 버튼을 눌렀을 때] My Deck Remaining Cards restored.`,
            'color: #2E9AFE; font-weight: bold;'
        );
        console.log('복원된 position 데이터:', restoredData);
    }

}
