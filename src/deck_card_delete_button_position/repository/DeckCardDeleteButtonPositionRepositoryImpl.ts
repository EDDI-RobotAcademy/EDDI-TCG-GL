import {Vector2d} from "../../common/math/Vector2d";
import {DeckCardDeleteButtonPosition} from "../entity/DeckCardDeleteButtonPosition";
import {DeckCardDeleteButtonPositionRepository} from "./DeckCardDeleteButtonPositionRepository";

export class DeckCardDeleteButtonPositionRepositoryImpl implements DeckCardDeleteButtonPositionRepository {
    private static instance: DeckCardDeleteButtonPositionRepositoryImpl;
    private positionMap: Map< number, {cardId: number, position: DeckCardDeleteButtonPosition}> = new Map(); // position ID: {card Id, position}
    private deckToPositionMap: Map< number, number[]> = new Map(); // deck ID: position ID List
    private deckPositionIndexMap: Map<number, number> = new Map();

    private originalPositionMap: Map<number, { cardId: number, position: DeckCardDeleteButtonPosition }> = new Map();
    private originalDeckToPositionMap: Map<number, number[]> = new Map();
    private originalDeckPositionIndexMap: Map<number, number> = new Map();

    private initialX = 0.43467;
    private initialY =  0.23;
    private incrementY = - 0.073;

    private constructor() {}

    public static getInstance(): DeckCardDeleteButtonPositionRepositoryImpl {
        if (!DeckCardDeleteButtonPositionRepositoryImpl.instance) {
            DeckCardDeleteButtonPositionRepositoryImpl.instance = new DeckCardDeleteButtonPositionRepositoryImpl();
        }
        return DeckCardDeleteButtonPositionRepositoryImpl.instance;
    }

    public addDeckCardDeleteButtonPosition(deckId: number, cardId: number): DeckCardDeleteButtonPosition {
        console.log(`%c [Block] deckID?: ${deckId}, cardId?: ${cardId}`, 'color: #FE2EF7; font-weight: bold;');

        if (!this.deckPositionIndexMap.has(deckId)) {
            this.deckPositionIndexMap.set(deckId, 0);
        }

        const positionIdList = this.deckToPositionMap.get(deckId) || [];
        const isCardAlreadyInDeck = positionIdList.some(id => this.positionMap.get(id)?.cardId === cardId);

        if (!isCardAlreadyInDeck) {
            const positionIndex = this.deckPositionIndexMap.get(deckId)!;
            const positionX = this.initialX;
            const positionY = this.initialY + positionIndex * this.incrementY;

            const position = new DeckCardDeleteButtonPosition(positionX, positionY);
            this.positionMap.set(position.id, {cardId, position});

            if (!this.deckToPositionMap.has(deckId)) {
                this.deckToPositionMap.set(deckId, []);
            }
            this.deckToPositionMap.get(deckId)!.push(position.id);
            this.deckPositionIndexMap.set(deckId, positionIndex + 1);

            return position;

        } else {
            const existingPositionId = positionIdList.find(id => this.positionMap.get(id)?.cardId === cardId)!;
            return this.positionMap.get(existingPositionId)!.position;
        }
    }

    public findPositionByPositionId(positionId: number): DeckCardDeleteButtonPosition | null {
        return this.positionMap.get(positionId)?.position ?? null;
    }

    public findPositionIdListByDeckId(deckId: number): number[] {
        return this.deckToPositionMap.get(deckId) || [];
    }

    // To-do: 삭제 부분 후에 수정해야 함
    public deleteById(deckId: number, positionId: number): void {
        this.positionMap.delete(positionId);
        this.deckPositionIndexMap.set(deckId, 0);

        const positionIdList = this.findPositionIdListByDeckId(deckId);
        if (!positionIdList) return;

        const updatedPositionIdList = positionIdList.filter(id => id !== positionId);
        this.deckToPositionMap.set(deckId, updatedPositionIdList);

        for (const id of updatedPositionIdList) {
            const positionIndex = this.deckPositionIndexMap.get(deckId)!;
            const entry = this.positionMap.get(id);
            if (!entry) return;

            const { cardId } = entry;
            const newX = this.initialX;
            const newY = this.initialY + positionIndex * this.incrementY;
            const newPosition = new DeckCardDeleteButtonPosition(newX, newY);

            this.positionMap.set(id, { cardId, position: newPosition });
            this.deckPositionIndexMap.set(deckId, positionIndex + 1);
        }
    }

    public deletePositionByDeckId(deckId: number): void {
        const positionIdList = this.findPositionIdListByDeckId(deckId);
        if (positionIdList) {
            positionIdList.forEach((positionId) => {
                this.positionMap.delete(positionId);
            });
        }
        this.deckToPositionMap.delete(deckId);
    }

    public deleteAll(): void {
        this.positionMap.clear();
        this.deckToPositionMap.clear();
    }

    public count(): number {
        return this.positionMap.size;
    }

    // 원본 데이터 복제
    public saveClonedOriginalPositionState(deckId: number): void {
        this.originalPositionMap.clear();
        this.originalDeckToPositionMap.clear();

        const positionIdList = this.deckToPositionMap.get(deckId) || [];
        this.originalDeckToPositionMap.set(deckId, [...positionIdList]);

        // deckPositionIndexMap 복제
        const positionIndex = this.deckPositionIndexMap.get(deckId) ?? 0;
        this.originalDeckPositionIndexMap.set(deckId, positionIndex);

        positionIdList.forEach(positionId => {
            const entry = this.positionMap.get(positionId);
            if (entry) {
                const clonedPosition = new DeckCardDeleteButtonPosition(
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
            `%c[INFO] Original position state cloned for deckId ${deckId}`,'color: #2E9AFE; font-weight: bold;'
        );

        console.log(
            'original My Deck Card Delete Button PositionMap:',
            Array.from(this.originalPositionMap.entries()).map(([id, data]) => ({
                positionId: id,
                cardId: data.cardId,
            }))
        );
    }

    public restoreOriginalPositionState(deckId: number): void {
        const originalPositionIdList = this.originalDeckToPositionMap.get(deckId);
        if (originalPositionIdList) {
            this.deckToPositionMap.set(deckId, [...originalPositionIdList]);
        }

        const positionIdList = this.deckToPositionMap.get(deckId);
        if (!positionIdList) return;

        positionIdList.forEach(positionId => {
            const originalPositionInfo = this.originalPositionMap.get(positionId);
            if (originalPositionInfo) {
                this.positionMap.set(positionId, {
                    cardId: originalPositionInfo.cardId,
                    position: originalPositionInfo.position
                });
            }
        });

        // To-do: 확인 후 없애야 함
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
            `%c[덱 편집 중단 후 다른 덱 버튼을 눌렀을 때] Deck ${deckId} restored.`,
            'color: #2E9AFE; font-weight: bold;'
        );
        console.log('복원된 position 데이터:', restoredData);
    }

}
