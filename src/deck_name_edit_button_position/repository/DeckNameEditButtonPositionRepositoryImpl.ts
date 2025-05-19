import {Vector2d} from "../../common/math/Vector2d";
import {DeckNameEditButtonPosition} from "../entity/DeckNameEditButtonPosition";
import {DeckNameEditButtonPositionRepository} from "./DeckNameEditButtonPositionRepository";

export class DeckNameEditButtonPositionRepositoryImpl implements DeckNameEditButtonPositionRepository {
    private static instance: DeckNameEditButtonPositionRepositoryImpl;
    private positionMap: Map<number, { deckId: number, position: DeckNameEditButtonPosition }> = new Map(); // position unique id: {deck id: mesh}

    private positionX = - 0.345;
    private initialY = 0.153;
    private incrementY = - 0.075;
    private positionIndex = 0;

    private constructor() {}

    public static getInstance(): DeckNameEditButtonPositionRepositoryImpl {
        if (!DeckNameEditButtonPositionRepositoryImpl.instance) {
            DeckNameEditButtonPositionRepositoryImpl.instance = new DeckNameEditButtonPositionRepositoryImpl();
        }
        return DeckNameEditButtonPositionRepositoryImpl.instance;
    }

    public addDeckNameEditButtonPosition(deckId: number): DeckNameEditButtonPosition {
        if (this.containsDeckIdInMap(deckId) == false) {
            this.positionIndex++;
        }
        const positionX = this.positionX;
        const positionY = this.initialY + (this.positionIndex - 1) * this.incrementY;

        const newPosition = new DeckNameEditButtonPosition(positionX, positionY);
        this.positionMap.set(newPosition.id, { deckId, position: newPosition });

        return newPosition;
    }

    public findPositionByPositionId(positionId: number): DeckNameEditButtonPosition | null {
        const position = this.positionMap.get(positionId);
        if (position) {
            return position.position;
        } else {
            return null;
        }
    }

    public findPositionByDeckId(deckId: number): DeckNameEditButtonPosition | null {
        for (const { deckId: storedDeckId, position } of this.positionMap.values()) {
            if (storedDeckId === deckId) {
                return position;
            }
        }
        return null;
    }

    public findAllPosition(): DeckNameEditButtonPosition[] {
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
        const newPositionMap = new Map<number, { deckId: number, position: DeckNameEditButtonPosition }>();

        for (const [key, { deckId, position }] of this.positionMap.entries()) {
            const newPositionY = this.initialY + (newPositionIndex * this.incrementY);
            position.setPosition(this.positionX, newPositionY);
            newPositionMap.set(key, { deckId, position });
            newPositionIndex++;
        }
        this.positionMap = newPositionMap;
        this.positionIndex = this.positionMap.size; // 인덱스 감소 처리
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
