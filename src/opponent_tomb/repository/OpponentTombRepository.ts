export interface OpponentTombRepository {
    addCard(cardId: number): void;
    getCards(): readonly number[];
    clear(): void;
}
