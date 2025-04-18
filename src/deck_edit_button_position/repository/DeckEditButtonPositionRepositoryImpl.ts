import {Vector2d} from "../../common/math/Vector2d";
import {DeckEditButtonPosition} from "../entity/DeckEditButtonPosition";
import {DeckEditButtonPositionRepository} from "./DeckEditButtonPositionRepository";
import {MyDeckButtonPositionRepositoryImpl} from "../../my_deck_button_position/repository/MyDeckButtonPositionRepositoryImpl";

export class DeckEditButtonPositionRepositoryImpl implements DeckEditButtonPositionRepository {
    private static instance: DeckEditButtonPositionRepositoryImpl;
    private positionMap: Map<number, { deckId: number, position: DeckEditButtonPosition }> = new Map(); // position unique id: {deck id: mesh}
    private myDeckButtonPositionRepository: MyDeckButtonPositionRepositoryImpl;

    private positionX = - 0.32;
    private initialY = 0.135;
    private incrementY = - 0.09;
    private positionIndex = 0;

    private constructor() {
        this.myDeckButtonPositionRepository = MyDeckButtonPositionRepositoryImpl.getInstance();
    }

    public static getInstance(): DeckEditButtonPositionRepositoryImpl {
        if (!DeckEditButtonPositionRepositoryImpl.instance) {
            DeckEditButtonPositionRepositoryImpl.instance = new DeckEditButtonPositionRepositoryImpl();
        }
        return DeckEditButtonPositionRepositoryImpl.instance;
    }

    public addDeckEditButtonPosition(deckId: number): DeckEditButtonPosition {
        if (this.containsDeckIdInMap(deckId) == false) {
            this.positionIndex++;
        }
        const positionX = this.positionX;
        const positionY = this.initialY + (this.positionIndex - 1) * this.incrementY;

        const newPosition = new DeckEditButtonPosition(positionX, positionY);
        this.positionMap.set(newPosition.id, { deckId, position: newPosition });

        return newPosition;
    }

    public findPositionByPositionId(positionId: number): DeckEditButtonPosition | null {
        const position = this.positionMap.get(positionId);
        if (position) {
            return position.position;
        } else {
            return null;
        }
    }

    public findPositionByDeckId(deckId: number): DeckEditButtonPosition | null {
        for (const { deckId: storedDeckId, position } of this.positionMap.values()) {
            if (storedDeckId === deckId) {
                return position;
            }
        }
        return null;
    }

    public findAllPosition(): DeckEditButtonPosition[] {
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
        const newPositionMap = new Map<number, { deckId: number, position: DeckEditButtonPosition }>();

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
