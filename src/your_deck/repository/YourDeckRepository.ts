export interface YourDeckRepository {
    seed(cards: readonly number[]): void;
    drawCard(): number | null;
    // Removes up to `max` cards whose id equals `cardId` in array order (top → bottom).
    // Returns the removed ids so the caller can count what was actually pulled.
    drawMatching(cardId: number, max: number): number[];
    getRemainingCount(): number;
    getCards(): readonly number[];
}
