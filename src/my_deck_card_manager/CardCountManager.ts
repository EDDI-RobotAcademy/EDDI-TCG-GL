import {getCardById} from "../card/utility";

export class CardCountManager {
    private static instance: CardCountManager;
    private clickCardCountMap: Map<number, number> = new Map(); // cardId: cardClickCount
    private gradeIdToClickCardCountMap: Map<number, number> = new Map(); // gradeId: cardClickCount

    private constructor() {}

    public static getInstance(): CardCountManager {
        if (!CardCountManager.instance) {
            CardCountManager.instance = new CardCountManager();
        }
        return CardCountManager.instance;
    }

    public saveRemainingCardCount(cardId: number, cardCount: number): void {
        const existingCardCountInfo = this.clickCardCountMap.get(cardId);

        if (existingCardCountInfo) {
            console.log(`Already Exist Remaining Card Count Info card ID:${cardId}`);
        } else {
            this.clickCardCountMap.set(cardId, cardCount);
            // 제대로 확인 되면 주석 처리
            console.log(`Save Remaining Card Count "Card ID: ${cardId}", "Card Count: ${cardCount}"`);
        }
    }

    public findCardCountByCardId(cardId: number): number | null {
        return this.clickCardCountMap.get(cardId) ?? null;
    }

    public incrementCardClickCount(cardId: number): void {
        const currentCount = this.findCardCountByCardId(cardId);
        if (currentCount !== null) {
            this.clickCardCountMap.set(cardId, currentCount + 1);

            // 확인용
            const numberOfCardIncreased = this.findCardCountByCardId(cardId);
            console.log(`카드(ID: ${cardId}) 클릭 후 카드 수량: ${numberOfCardIncreased}`);
        }
    }

    public decrementCardClickCount(cardId: number): void {
        const currentCount = this.findCardCountByCardId(cardId);
        if (currentCount !== null) {
             this.clickCardCountMap.set( cardId, currentCount - 1);
        }
    }

    // 등급별 카드 개수
    public findGradeCardCount(gradeId: number): number {
        return this.gradeIdToClickCardCountMap.get(gradeId) ?? 0;
    }

    public saveGradCardCount(gradeId: number, count: number): void {
        const existingGradCardCount = this.gradeIdToClickCardCountMap.get(gradeId);
        if (existingGradCardCount) {
            this.gradeIdToClickCardCountMap.set(gradeId, existingGradCardCount + count);

            // 확인용
            const currentCount = this.findGradeCardCount(gradeId);
            console.log(`Save Grade Card Count "Grade ID: ${gradeId}", "Current Count: ${currentCount}"`);
        } else {
            this.gradeIdToClickCardCountMap.set(gradeId, count);
        }
    }

    public incrementGradeCardCount(gradeId: number): void {
        const currentCount = this.findGradeCardCount(gradeId);
        this.gradeIdToClickCardCountMap.set(gradeId, currentCount + 1);

        // 확인용 (나중에 지워야 함)
        const count = this.findGradeCardCount(gradeId);
        console.log(`Current Grade(ID: ${gradeId}) Card Count: ${count}`);
    }

    public decrementGradeCardCount(gradeId: number): void {
        const currentCount = this.findGradeCardCount(gradeId);
        this.gradeIdToClickCardCountMap.set(gradeId, currentCount - 1);
    }

    public findTotalSelectedCardCount(): number {
        const totalCount = Array.from(this.gradeIdToClickCardCountMap.values()).reduce((sum, count) => sum + count, 0);
        console.log(`Current Total Selected Card Count?: ${totalCount}`);
        return totalCount;
    }

    public deleteCardCountByDeckId(deckId: number): void {
        this.clickCardCountMap.delete(deckId);
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
