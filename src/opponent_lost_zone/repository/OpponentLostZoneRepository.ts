export interface OpponentLostZoneRepository {
    addCard(cardId: number): void;
    getCards(): readonly number[];
    clear(): void;
}
