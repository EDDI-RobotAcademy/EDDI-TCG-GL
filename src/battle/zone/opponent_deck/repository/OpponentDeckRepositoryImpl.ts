import { OpponentDeckRepository } from "./OpponentDeckRepository";

// Singleton mirroring YourDeckRepositoryImpl. Starts EMPTY — callers are responsible
// for seeding it with whatever card list is appropriate for their context:
//
//   * Test/pilot code: seeds with dummy cardIds for exercising logic.
//   * Production: a network handler seeds it with the server-sent deck snapshot (the
//     server is the authority — the client never computes opponent deck contents).
//
// Keeping the repository empty by default means pilot dummy data never leaks into
// production code paths that reuse the same repository.
export class OpponentDeckRepositoryImpl implements OpponentDeckRepository {
    private static instance: OpponentDeckRepositoryImpl | null = null;
    private cards: number[] = [];

    private constructor() {}

    public static getInstance(): OpponentDeckRepositoryImpl {
        if (!OpponentDeckRepositoryImpl.instance) {
            OpponentDeckRepositoryImpl.instance = new OpponentDeckRepositoryImpl();
        }
        return OpponentDeckRepositoryImpl.instance;
    }

    public seed(cards: readonly number[]): void {
        this.cards = [...cards];
    }

    public drawCard(): number | null {
        if (this.cards.length === 0) return null;
        return this.cards.shift() ?? null;
    }

    public getRemainingCount(): number {
        return this.cards.length;
    }

    public getCards(): readonly number[] {
        return this.cards;
    }
}
