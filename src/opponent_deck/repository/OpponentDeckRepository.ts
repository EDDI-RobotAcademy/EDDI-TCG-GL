export interface OpponentDeckRepository {
    seed(cards: readonly number[]): void;
    drawCard(): number | null;
    getRemainingCount(): number;
    getCards(): readonly number[];
}
