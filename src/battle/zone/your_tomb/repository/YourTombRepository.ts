export interface YourTombRepository {
    addCard(cardId: number): void;
    getCards(): readonly number[];
    clear(): void;
}
