import { YourDeckRepository } from "./YourDeckRepository";

// Singleton in-memory draw pile. Draw order is the array order: shift() pulls from the top.
export class YourDeckRepositoryImpl implements YourDeckRepository {
    private static instance: YourDeckRepositoryImpl | null = null;
    private cards: number[] = [];

    private constructor() {}

    public static getInstance(): YourDeckRepositoryImpl {
        if (!YourDeckRepositoryImpl.instance) {
            YourDeckRepositoryImpl.instance = new YourDeckRepositoryImpl();
        }
        return YourDeckRepositoryImpl.instance;
    }

    public seed(cards: readonly number[]): void {
        this.cards = [...cards];
    }

    public drawCard(): number | null {
        if (this.cards.length === 0) return null;
        return this.cards.shift() ?? null;
    }

    public drawMatching(cardId: number, max: number): number[] {
        const removed: number[] = [];
        let i = 0;
        while (i < this.cards.length && removed.length < max) {
            if (this.cards[i] === cardId) {
                removed.push(this.cards.splice(i, 1)[0]);
            } else {
                i++;
            }
        }
        return removed;
    }

    public getRemainingCount(): number {
        return this.cards.length;
    }

    public getCards(): readonly number[] {
        return this.cards;
    }
}
