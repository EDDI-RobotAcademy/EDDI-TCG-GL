import { YourLostZoneRepository } from "./YourLostZoneRepository";

// In-memory singleton — cards pushed here in insertion order.
export class YourLostZoneRepositoryImpl implements YourLostZoneRepository {
    private static instance: YourLostZoneRepositoryImpl | null = null;
    private cards: number[] = [];

    private constructor() {}

    public static getInstance(): YourLostZoneRepositoryImpl {
        if (!YourLostZoneRepositoryImpl.instance) {
            YourLostZoneRepositoryImpl.instance = new YourLostZoneRepositoryImpl();
        }
        return YourLostZoneRepositoryImpl.instance;
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
