export interface YourDeckRepository {
    seed(cards: readonly number[]): void;
    drawCard(): number | null;
    // Removes up to `max` cards whose id equals `cardId` in array order (top → bottom).
    // Returns the removed ids so the caller can count what was actually pulled.
    drawMatching(cardId: number, max: number): number[];
    // Removes the card at a specific index in the deck array (top → bottom). Returns
    // the removed cardId, or null if the index is out of range. Used when a card needs
    // to be pulled from a specific position (e.g., a user-picked entry from a popup).
    removeAt(index: number): number | null;
    // In-place Fisher-Yates shuffle of the deck array.
    shuffle(): void;
    getRemainingCount(): number;
    getCards(): readonly number[];
}
