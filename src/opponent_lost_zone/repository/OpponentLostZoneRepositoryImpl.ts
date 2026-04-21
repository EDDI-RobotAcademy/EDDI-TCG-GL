import { OpponentLostZoneRepository } from "./OpponentLostZoneRepository";

// In-memory singleton mirroring YourLostZoneRepositoryImpl.
export class OpponentLostZoneRepositoryImpl implements OpponentLostZoneRepository {
    private static instance: OpponentLostZoneRepositoryImpl | null = null;
    private cards: number[] = [];

    private constructor() {}

    public static getInstance(): OpponentLostZoneRepositoryImpl {
        if (!OpponentLostZoneRepositoryImpl.instance) {
            OpponentLostZoneRepositoryImpl.instance = new OpponentLostZoneRepositoryImpl();
        }
        return OpponentLostZoneRepositoryImpl.instance;
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
