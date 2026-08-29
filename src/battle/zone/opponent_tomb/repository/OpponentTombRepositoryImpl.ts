import { OpponentTombRepository } from "./OpponentTombRepository";

// In-memory singleton mirroring YourTombRepositoryImpl. Starts empty — pilot seeds for
// tests; network handler seeds in production.
export class OpponentTombRepositoryImpl implements OpponentTombRepository {
    private static instance: OpponentTombRepositoryImpl | null = null;
    private cards: number[] = [];

    private constructor() {}

    public static getInstance(): OpponentTombRepositoryImpl {
        if (!OpponentTombRepositoryImpl.instance) {
            OpponentTombRepositoryImpl.instance = new OpponentTombRepositoryImpl();
        }
        return OpponentTombRepositoryImpl.instance;
    }

    public addCard(cardId: number): void {
        this.cards.push(cardId);
    }

    public getCards(): readonly number[] {
        return this.cards;
    }

    public clear(): void {
        this.cards = [];
    }
}
