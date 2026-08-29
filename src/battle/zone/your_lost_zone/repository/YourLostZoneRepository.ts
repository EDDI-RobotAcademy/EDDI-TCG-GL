export interface YourLostZoneRepository {
    addCard(cardId: number): void;
    getCards(): readonly number[];
    clear(): void;
}
