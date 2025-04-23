import {MyDeckCardRepositoryImpl} from "../my_deck_card/repository/MyDeckCardRepositoryImpl";

export class CardStateManager {
    private static instance: CardStateManager | null = null;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;

    // deck ID: [card Unique ID: visible] 형태로 관리
    private deckCardVisibleStateMap: Map<number, Map<number, boolean>> = new Map();

    private constructor() {
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance();
    }

    public static getInstance(): CardStateManager {
        if (!CardStateManager.instance) {
            CardStateManager.instance = new CardStateManager();
        }
        return CardStateManager.instance;
    }

    public initializeCardVisibility(deckId: number): void {
        const cardUniqueIdList = this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
        if (!this.deckCardVisibleStateMap.has(deckId)) {
            const cardVisibility = new Map<number, boolean>();

            cardUniqueIdList.forEach((cardId, index) => {
                if (index < 8) {
                    cardVisibility.set(cardId, true);
                    this.myDeckCardRepository.showCard(cardId);
                } else {
                    cardVisibility.set(cardId, false);
                    this.myDeckCardRepository.hideCard(cardId);
                }
            });
            this.deckCardVisibleStateMap.set(deckId, cardVisibility);
        }
    }

    public setCardVisibility(deckId: number, cardId: number, isVisible: boolean): void {
        const cardVisibility = this.deckCardVisibleStateMap.get(deckId);

        if (cardVisibility) {
            cardVisibility.set(cardId, isVisible);

            if (isVisible == true) {
                this.myDeckCardRepository.showCard(cardId);
            } else {
                this.myDeckCardRepository.hideCard(cardId);
            }

        } else {
            console.warn(`[WARN] Deck ID ${deckId} is not initialized`);
        }
    }

    // 특정 deck 의 cardId의 visible 상태 조회
    public findCardVisibility(deckId: number, cardId: number): boolean {
        const cardVisibility = this.deckCardVisibleStateMap.get(deckId);
        return cardVisibility?.get(cardId) || false; // 기본값은 false
    }

    // 특정 deckId의 모든 카드 visible 상태 변경
    public setAllCardVisibility(deckId: number, isVisible: boolean): void {
        const cardUniqueIdList = this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
        if (!this.deckCardVisibleStateMap.has(deckId)) {
            const cardVisibility = new Map<number, boolean>();

            cardUniqueIdList.forEach((cardId) => {
                cardVisibility.set(cardId, isVisible);

                if (isVisible == true) {
                    this.myDeckCardRepository.showCard(cardId);
                } else {
                    this.myDeckCardRepository.hideCard(cardId);
                }
            });
            this.deckCardVisibleStateMap.set(deckId, cardVisibility);
        }
    }

    // 모든 visible 상태 초기화
    public resetVisibility(): void {
        for (const [deckId, cardVisibilityMap] of this.deckCardVisibleStateMap.entries()) {
            for (const [cardId, _] of cardVisibilityMap.entries()) {
                this.myDeckCardRepository.hideCard(cardId);
            }
        }
        this.deckCardVisibleStateMap.clear();
    }

//     // 특정 deckId에서 visible 상태가 true인 cardId 리스트 반환
//     public getVisibleCards(deckId: number): number[] {
//         const cardVisibility = this.deckCardVisibilityState.get(deckId);
//         if (!cardVisibility) {
//             return [];
//         }
//         return Array.from(cardVisibility.entries())
//             .filter(([_, isVisible]) => isVisible)
//             .map(([cardId]) => cardId);
//     }
}
