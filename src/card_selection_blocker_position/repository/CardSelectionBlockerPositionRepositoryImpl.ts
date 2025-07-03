import {Vector2d} from "../../common/math/Vector2d";
import {CardSelectionBlockerPosition} from "../entity/CardSelectionBlockerPosition";
import {CardSelectionBlockerPositionRepository} from "./CardSelectionBlockerPositionRepository";

export class CardSelectionBlockerPositionRepositoryImpl implements CardSelectionBlockerPositionRepository {
    private static instance: CardSelectionBlockerPositionRepositoryImpl;
    private positionMap: Map<number, { cardId: number, position: CardSelectionBlockerPosition}> = new Map();

    private initialX = - 0.192;
    private incrementX = 0.1275;
    private initialY =  0.075;
    private incrementY = - 0.34;
    private maxCardsPerRow = 4;

    private constructor() {}

    public static getInstance(): CardSelectionBlockerPositionRepositoryImpl {
        if (!CardSelectionBlockerPositionRepositoryImpl.instance) {
            CardSelectionBlockerPositionRepositoryImpl.instance = new CardSelectionBlockerPositionRepositoryImpl();
        }
        return CardSelectionBlockerPositionRepositoryImpl.instance;
    }

    public addCardSelectionBlockerPosition(cardId: number): CardSelectionBlockerPosition {
        if (this.containsCardIdInMap(cardId)) {
            return this.findPositionByCardId(cardId)!;
        }

        const col = this.positionMap.size % this.maxCardsPerRow;
        const row = Math.floor(this.positionMap.size / this.maxCardsPerRow);

        const positionX = this.initialX + col * this.incrementX;
        const positionY = this.initialY + row * this.incrementY;

        const position = new CardSelectionBlockerPosition(positionX, positionY);
        this.positionMap.set(position.id, {cardId, position: position})

        return position;
    }

    public findPositionByPositionId(positionId: number): CardSelectionBlockerPosition | null {
        return this.positionMap.get(positionId)?.position ?? null;
    }

    public findPositionByCardId(cardId: number): CardSelectionBlockerPosition | null {
        for (const { cardId: storedCardId, position } of this.positionMap.values()) {
            if (storedCardId === cardId) {
                return position;
            }
        }
        return null;
    }

    public findPositionIdByCardId(cardId: number): number | null {
        for (const [positionId, { cardId: storedCardId }] of this.positionMap.entries()) {
            if (storedCardId === cardId) {
                return positionId;
            }
        }
        return null;
    }

    public findPositionIdList(): number[] {
        return Array.from(this.positionMap.keys());
    }

    public deleteById(positionId: number): void {
        this.positionMap.delete(positionId);

        let newPositionIndex = 0;
        const updatedPositionMap = new Map<number, { cardId: number, position: CardSelectionBlockerPosition }>();

        for (const [key, { cardId, position }] of this.positionMap.entries()) {
            const col = this.positionMap.size % this.maxCardsPerRow;
            const row = Math.floor(this.positionMap.size / this.maxCardsPerRow);

            const newPositionX = this.initialX + col * this.incrementX;
            const newPositionY = this.initialY + row * this.incrementY;

            position.setPosition(newPositionX, newPositionY);
            updatedPositionMap.set(key, { cardId, position });

            newPositionIndex++;
        }

        this.positionMap = updatedPositionMap;
    }

    public deleteByCardId(cardId: number): void {
        const positionId = this.findPositionIdByCardId(cardId);
        if (positionId == null) return;

        this.deleteById(positionId);
    }

    public deleteAll(): void {
        this.positionMap.clear();
    }

    public count(): number {
        return this.positionMap.size;
    }

    private containsCardIdInMap(cardId: number): boolean {
        for (const { cardId: storedCardId } of this.positionMap.values()) {
            if (storedCardId === cardId) {
                return true;
            }
        }
        return false;
    }
}
