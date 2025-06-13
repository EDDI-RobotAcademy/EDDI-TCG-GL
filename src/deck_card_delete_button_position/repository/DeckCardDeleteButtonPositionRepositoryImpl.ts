import {Vector2d} from "../../common/math/Vector2d";
import {DeckCardDeleteButtonPosition} from "../entity/DeckCardDeleteButtonPosition";
import {DeckCardDeleteButtonPositionRepository} from "./DeckCardDeleteButtonPositionRepository";

export class DeckCardDeleteButtonPositionRepositoryImpl implements DeckCardDeleteButtonPositionRepository {
    private static instance: DeckCardDeleteButtonPositionRepositoryImpl;
    private positionMap: Map< number, {cardId: number, position: DeckCardDeleteButtonPosition}> = new Map(); // position ID: {card Id, position}
    private deckToPositionMap: Map< number, number[]> = new Map(); // deck ID: position ID List
    private deckPositionIndexMap: Map<number, number> = new Map();

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
    public deleteById(positionId: number): boolean {
        return this.positionMap.delete(positionId);
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
}
