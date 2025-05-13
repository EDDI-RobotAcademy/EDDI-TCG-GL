export interface MyDeckOwnedCardsMapRepository {
    findCurrentMyDeckOwnedCardsMap(): Map<number, number>;
    addMyDeckOwnedCards(cardId: number, cardCount: number): void;
    getCardIdList(): number[];
    getCardCountList(): number[];
}