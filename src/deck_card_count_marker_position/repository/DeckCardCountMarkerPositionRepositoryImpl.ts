import {Vector2d} from "../../common/math/Vector2d";
import {DeckCardCountMarkerPosition} from "../entity/DeckCardCountMarkerPosition";
import {DeckCardCountMarkerPositionRepository} from "./DeckCardCountMarkerPositionRepository";

export class DeckCardCountMarkerPositionRepositoryImpl implements DeckCardCountMarkerPositionRepository {
    private static instance: DeckCardCountMarkerPositionRepositoryImpl;
    private positionMap: Map< number, {cardId: number, position: DeckCardCountMarkerPosition}> = new Map(); // position ID: {card Id, position}
    private deckToPositionMap: Map< number, number[]> = new Map(); // deck ID: position ID List
    private deckPositionIndexMap: Map<number, number> = new Map();

    private initialX = - 0.202;
    private initialY =  - 0.092;
    private incrementX = 0.1275;
    private incrementY = - 0.34;
    private maxMarkersPerRow = 4;

    private constructor() {}

    public static getInstance(): DeckCardCountMarkerPositionRepositoryImpl {
        if (!DeckCardCountMarkerPositionRepositoryImpl.instance) {
            DeckCardCountMarkerPositionRepositoryImpl.instance = new DeckCardCountMarkerPositionRepositoryImpl();
        }
        return DeckCardCountMarkerPositionRepositoryImpl.instance;
    }

    public addDeckCardCountMarkerPosition(deckId: number, cardId: number): DeckCardCountMarkerPosition {
        console.log(`%c [Block] deckID?: ${deckId}, cardId?: ${cardId}`, 'color: #FE2EF7; font-weight: bold;');

        if (!this.deckPositionIndexMap.has(deckId)) {
            this.deckPositionIndexMap.set(deckId, 0);
        }

        const positionIdList = this.deckToPositionMap.get(deckId) || [];
        const isCardAlreadyInDeck = positionIdList.some(id => this.positionMap.get(id)?.cardId === cardId);

        if (!isCardAlreadyInDeck) {
            const positionIndex = this.deckPositionIndexMap.get(deckId)!;
            const col = positionIndex % this.maxMarkersPerRow;
            const row = Math.floor(positionIndex/ this.maxMarkersPerRow);

            const positionX = this.initialX + col * this.incrementX;
            const positionY = this.initialY + row * this.incrementY;

            const position = new DeckCardCountMarkerPosition(positionX, positionY);
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

    public findPositionByPositionId(positionId: number): DeckCardCountMarkerPosition | null {
        return this.positionMap.get(positionId)?.position ?? null;
    }

    public findPositionIdListByDeckId(deckId: number): number[] {
        return this.deckToPositionMap.get(deckId) || [];
    }

    // To-do: 삭제 부분 후에 수정해야 함
    public deletePositionAndReorder(deckId: number, positionId: number): void {
        this.positionMap.delete(positionId);
        this.deckPositionIndexMap.set(deckId, 0);

        const positionIdList = this.findPositionIdListByDeckId(deckId);
        if (!positionIdList) return;

        const updatedPositionIdList = positionIdList.filter(id => id !== positionId);
        this.deckToPositionMap.set(deckId, updatedPositionIdList);

        for (const id of updatedPositionIdList) {
            const entry = this.positionMap.get(id);
            if (!entry) return;
            const { cardId } = entry;

            const positionIndex = this.deckPositionIndexMap.get(deckId)!;
            const col = positionIndex % this.maxMarkersPerRow;
            const row = Math.floor(positionIndex / this.maxMarkersPerRow);

            const newX = this.initialX + col * this.incrementX;
            const newY = this.initialY + row * this.incrementY;
            const newPosition = new DeckCardCountMarkerPosition(newX, newY);

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
}
