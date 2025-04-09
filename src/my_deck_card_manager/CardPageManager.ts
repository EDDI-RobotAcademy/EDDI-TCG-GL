import {MyDeckCard} from "../my_deck_card/entity/MyDeckCard";

export class CardPageManager {
    private static instance: CardPageManager | null = null;
    private currentPage: number;
    private cardsPerPage: number;

    private constructor(cardsPerPage: number = 8) {
        this.currentPage = 1;
        this.cardsPerPage = cardsPerPage;
    }

    static getInstance(): CardPageManager {
        if (!CardPageManager.instance) {
            CardPageManager.instance = new CardPageManager();
        }
        return CardPageManager.instance;
    }

    public getCurrentPage(): number {
        return this.currentPage;
    }

    public setCurrentPage(page: number): void {
        this.currentPage = page;
    }

    public getTotalPages(cardUniqueIdList: number[]): number {
        return Math.ceil(cardUniqueIdList.length / this.cardsPerPage);
    }

    public resetCurrentPage(): void {
        this.currentPage = 1;
    }

    public findCardIdsForPage(page: number, cardUniqueIdList: number[]): number[] {
        const startIndex = (page - 1) * this.cardsPerPage;
        const endIndex = Math.min(startIndex + this.cardsPerPage, cardUniqueIdList.length);
        const cardIdsInRange = cardUniqueIdList.slice(startIndex, endIndex);

        console.log(`[DEBUG]Current Page: ${page}, Card Unique Id: ${cardIdsInRange}`);
        return cardIdsInRange;

    }

}
