export interface MyDeckCardMapRepository {
    addMyDeckCard(deckId: number, cardId: number, cardCount: number): void;
}