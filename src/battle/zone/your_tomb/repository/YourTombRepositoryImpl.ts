import { YourTombRepository } from "./YourTombRepository";

// In-memory singleton mirroring YourLostZoneRepositoryImpl. Starts empty — callers seed
// it (pilot for tests; network handler in production).
export class YourTombRepositoryImpl implements YourTombRepository {
    private static instance: YourTombRepositoryImpl | null = null;
    private cards: number[] = [];

    private constructor() {}

    public static getInstance(): YourTombRepositoryImpl {
        if (!YourTombRepositoryImpl.instance) {
            YourTombRepositoryImpl.instance = new YourTombRepositoryImpl();
        }
        return YourTombRepositoryImpl.instance;
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
