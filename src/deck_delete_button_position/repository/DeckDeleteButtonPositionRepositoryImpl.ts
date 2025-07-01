import {Vector2d} from "../../common/math/Vector2d";
import {DeckDeleteButtonPosition} from "../entity/DeckDeleteButtonPosition";
import {DeckDeleteButtonPositionRepository} from "./DeckDeleteButtonPositionRepository";

export class DeckDeleteButtonPositionRepositoryImpl implements DeckDeleteButtonPositionRepository {
    private static instance: DeckDeleteButtonPositionRepositoryImpl;
    private positionMap: Map<number, { deckId: number, position: DeckDeleteButtonPosition }> = new Map(); // position unique id: {deck id: mesh}

    private positionX = - 0.31;
    private initialY = 0.153;
    private incrementY = - 0.075;

    private constructor() {}

    public static getInstance(): DeckDeleteButtonPositionRepositoryImpl {
        if (!DeckDeleteButtonPositionRepositoryImpl.instance) {
            DeckDeleteButtonPositionRepositoryImpl.instance = new DeckDeleteButtonPositionRepositoryImpl();
        }
        return DeckDeleteButtonPositionRepositoryImpl.instance;
    }

    public addDeckDeleteButtonPosition(deckId: number): DeckDeleteButtonPosition {
        if (this.containsDeckIdInMap(deckId)) {
            this.findPositionByPositionId(deckId)!;
        }
        const positionX = this.positionX;
        const positionY = this.initialY + this.positionMap.size * this.incrementY;

        const newPosition = new DeckDeleteButtonPosition(positionX, positionY);
        this.positionMap.set(newPosition.id, { deckId, position: newPosition });

        return newPosition;
    }

    public findPositionByPositionId(positionId: number): DeckDeleteButtonPosition | null {
        return this.positionMap.get(positionId)?.position ?? null;
    }

    public findPositionByDeckId(deckId: number): DeckDeleteButtonPosition | null {
        for (const { deckId: storedDeckId, position } of this.positionMap.values()) {
            if (storedDeckId === deckId) {
                return position;
            }
        }
        return null;
    }

    public findAllPosition(): DeckDeleteButtonPosition[] {
        return Array.from(this.positionMap.values()).map(({ position }) => position);
    }

    public findPositionIdByDeckId(deckId: number): number | null {
        for (const [positionId, { deckId: storedDeckId }] of this.positionMap.entries()) {
            if (storedDeckId === deckId) {
                return positionId;
            }
        }
        return null;
    }

    public deleteAll(): void {
        this.positionMap.clear();
    }

    public deleteByPositionId(positionId: number): void {
        this.positionMap.delete(positionId);

        let newPositionIndex = 0;
        const newPositionMap = new Map<number, { deckId: number, position: DeckDeleteButtonPosition }>();

        for (const [key, { deckId, position }] of this.positionMap.entries()) {
            const newPositionY = this.initialY + (newPositionIndex * this.incrementY);
            position.setPosition(this.positionX, newPositionY);
            newPositionMap.set(key, { deckId, position });
            newPositionIndex++;
        }
        this.positionMap = newPositionMap;
    }

    public count(): number {
        return this.positionMap.size;
    }

    private containsDeckIdInMap(deckId: number): boolean {
        for (const { deckId: storedDeckId } of this.positionMap.values()) {
            if (storedDeckId === deckId) {
                return true;
            }
        }
        return false;
    }
}
