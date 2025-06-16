import {getCardById} from "../card/utility";

export class CardCountManager {
    private static instance: CardCountManager;
    // 남은 카드 개수(선택 가능한 카드 개수)
    private remainingCardCountMap: Map<number, number> = new Map(); // cardId: cardClickCount
    // 덱별 카드 개수
    private cardCountMap: Map<number, { cardId: number, count: number }[]> = new Map(); // deckId: {cardId: card Count}
    // 등급별 카드 개수
    private cardCountByGradeMap: Map<number, { gradeId: number, count: number }[]> = new Map(); // deckId: {gradeId: card Count}

    private constructor() {}

    public static getInstance(): CardCountManager {
        if (!CardCountManager.instance) {
            CardCountManager.instance = new CardCountManager();
        }
        return CardCountManager.instance;
    }

    // 사용 가능한 카드 개수(덱 만들고 남은 카드 개수)
    public saveRemainingCardCount(cardId: number, cardCount: number): void {
        const existingCardCountInfo = this.remainingCardCountMap.get(cardId);

        if (existingCardCountInfo) {
            console.log(`Already Exist Remaining Card Count Info card ID:${cardId}`);
        } else {
            this.remainingCardCountMap.set(cardId, cardCount);
            // 제대로 확인 되면 주석 처리
            console.log(`Save Remaining Card Count "Card ID: ${cardId}", "Card Count: ${cardCount}"`);
        }
    }

    public findRemainingCardCountByCardId(cardId: number): number | null {
        return this.remainingCardCountMap.get(cardId) ?? null;
    }

    public incrementRemainingCardCount(cardId: number): void {
        const currentCount = this.findRemainingCardCountByCardId(cardId);
        if (currentCount !== null) {
            this.remainingCardCountMap.set(cardId, currentCount + 1);

            // 확인용
            const numberOfCardIncreased = this.findRemainingCardCountByCardId(cardId);
            console.log(`남은 카드(ID: ${cardId}) 클릭 후 카드 수량: ${numberOfCardIncreased}`);
        }
    }

    public decrementRemainingCardCount(cardId: number): void {
        const currentCount = this.findRemainingCardCountByCardId(cardId);
        if (currentCount !== null) {
             this.remainingCardCountMap.set( cardId, currentCount - 1);

             // 확인용
             const numberOfCardIncreased = this.findRemainingCardCountByCardId(cardId);
             console.log(`남은 카드(ID: ${cardId}) 클릭 후 카드 수량: ${numberOfCardIncreased}`);
        }
    }

    // 덱별 카드 개수
    public findCardCountByDeck(deckId: number, cardId: number): number {
        const cardCountList = this.cardCountMap.get(deckId);
        if (!cardCountList) return 0;

        const cardCountEntry = cardCountList.find(entry => entry.cardId === cardId);
        return cardCountEntry ? cardCountEntry.count : 0;
    }

    public saveCardCountByDeck(deckId: number, cardId: number, count: number): void {
        const existingCardCountList = this.cardCountMap.get(deckId);
        if (existingCardCountList) {
            const cardEntry = existingCardCountList.find(entry => entry.cardId === cardId);
            if (cardEntry) {
                cardEntry.count += count;
            } else {
                existingCardCountList.push({cardId: cardId, count: count});
            }
        } else {
            this.cardCountMap.set(deckId, [{ cardId: cardId, count: count }]);
        }
    }

    public incrementCardCountByDeck(deckId: number, cardId: number): void {
        const currentCount = this.findCardCountByDeck(deckId, cardId);
        this.cardCountMap.set(deckId, [{ cardId: cardId, count: currentCount + 1 }]);

        // 확인용 (나중에 지워야 함)
        const count = this.findCardCountByDeck(deckId, cardId);
        console.log(`카드 개수 증가 Deck ID: ${deckId}, Card ID: ${cardId}, Card Count: ${count}`);
    }

    public decrementCardCountByDeck(deckId: number, cardId: number): void {
        const currentCount = this.findCardCountByDeck(deckId, cardId);
        this.cardCountMap.set(deckId, [{ cardId: cardId, count: currentCount - 1 }]);

        // 확인용 (나중에 지워야 함)
        const count = this.findCardCountByDeck(deckId, cardId);
        console.log(`카드 개수 감소 Deck ID: ${deckId}, Card ID: ${cardId}, Card Count: ${count}`);
    }

    // 등급별 카드 개수
    public findCardCountByGrade(deckId: number, gradeId: number): number {
        const gradeCountList = this.cardCountByGradeMap.get(deckId);
        if (!gradeCountList) return 0;

        const gradeCountEntry = gradeCountList.find(entry => entry.gradeId === gradeId);
        return gradeCountEntry ? gradeCountEntry.count : 0;
    }

    public saveGradeCardCount(deckId: number, gradeId: number, count: number): void {
        const existingGradeCountList = this.cardCountByGradeMap.get(deckId);
        if (existingGradeCountList) {
            const gradeEntry = existingGradeCountList.find(entry => entry.gradeId === gradeId);
            if (gradeEntry) {
                gradeEntry.count += count;
            } else {
                existingGradeCountList.push({gradeId: gradeId, count: count});
            }
        } else {
            this.cardCountByGradeMap.set(deckId, [{ gradeId: gradeId, count: count }]);
        }
    }

    public incrementCardCountByGrade(deckId: number, gradeId: number): void {
        const currentCount = this.findCardCountByGrade(deckId, gradeId);
        this.cardCountByGradeMap.set(deckId, [{ gradeId: gradeId, count: currentCount + 1 }]);

        // 확인용 (나중에 지워야 함)
        const count = this.findCardCountByGrade(deckId, gradeId);
        console.log(`등급별 카드 개수 증가 Deck ID: ${deckId}, Grade ID: ${gradeId}, Card Count: ${count}`);
    }

    public decrementCardCountByGrade(deckId: number, gradeId: number): void {
        const currentCount = this.findCardCountByGrade(deckId, gradeId);
        this.cardCountByGradeMap.set(deckId, [{ gradeId: gradeId, count: currentCount - 1 }]);

        // 확인용 (나중에 지워야 함)
        const count = this.findCardCountByGrade(deckId, gradeId);
        console.log(`등급별 카드 개수 감소 Deck ID: ${deckId}, Grade ID: ${gradeId}, Card Count: ${count}`);
    }

    public findTotalSelectedCardCount(deckId: number): number {
        const gradeCountList = this.cardCountByGradeMap.get(deckId);
        if (!gradeCountList) return 0;

        const totalCount = gradeCountList.reduce((sum, info) => sum + info.count, 0);
        console.log(`Deck ID: ${deckId}, Total Selected Card Count: ${totalCount}`);

        return totalCount;
    }

    public deleteCardCount(deckId: number): void {
        this.cardCountByGradeMap.delete(deckId);
        this.cardCountMap.delete(deckId);
    }

    public getMaxClickCountByGrade(gradeId: number): number {
        switch (gradeId) {
            case 1: return 15;  // 일반 (15장)
            case 2: return 12;  // 언커먼 (12장)
            case 3: return 9;   // 영웅 (9장)
            case 4: return 3;   // 전설 (3장)
            case 5: return 1;   // 신화 (1장)
            default:
                console.warn(`[WARN] Unknown grade "${gradeId}"`);
                return 0;
        }
    }

}
