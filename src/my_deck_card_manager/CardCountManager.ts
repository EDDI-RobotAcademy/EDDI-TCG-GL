import {getCardById} from "../card/utility";

export class CardCountManager {
    private static instance: CardCountManager;
    // 남은 카드 개수(선택 가능한 카드 개수)
    private remainingCardCountMap: Map<number, number> = new Map(); // cardId: cardClickCount
    // 덱별 카드 개수(사용자가 덱을 만들기 위해 선택한 카드 개수)
    private selectedCardCountMap: Map<number, { cardId: number, count: number }[]> = new Map(); // deckId: {cardId: card Count}
    // 등급별 카드 개수
    private cardCountByGradeMap: Map<number, { gradeId: number, count: number }[]> = new Map(); // deckId: {gradeId: card Count}

    private originalRemainingCardCountMap: Map<number, number> = new Map();
    private originalSelectedCardCountMap: Map<number, { cardId: number, count: number }[]> = new Map();
    private originalCardCountByGradMap: Map<number, { gradeId: number, count: number }[]> = new Map();

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
            // To-do: 제대로 확인 되면 주석 처리
            console.log(`Save Remaining Card Count "Card ID: ${cardId}", "Card Count: ${cardCount}"`);
        }
    }

    public findRemainingCardCountByCardId(cardId: number): number | null {
        return this.remainingCardCountMap.get(cardId) ?? null;
    }

    public findRemainingCardIdList(): number[] {
        return Array.from(this.remainingCardCountMap.keys());
    }

    public addRemainingCardCount(cardId: number, count: number): void {
        const currentCount = this.findRemainingCardCountByCardId(cardId);
        if (currentCount !== null) {
            this.remainingCardCountMap.set(cardId, currentCount + count);
        }

        // To-do: 확인용 나중에 없애야 함
        const newCardCount = this.findRemainingCardCountByCardId(cardId);
        console.log(`%c 덱 삭제 후 남은 카드(Card ID: ${cardId}) 수량: ${newCardCount}`, 'color: #ff0033; font-weight: bold;');
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
             const numberOfCards = this.findRemainingCardCountByCardId(cardId);
             console.log(`남은 카드(ID: ${cardId}) 클릭 후 카드 수량: ${numberOfCards}`);
        }
    }

    // 덱별 카드 개수
    public findSelectedCardCountByDeck(deckId: number, cardId: number): number {
        const cardCountList = this.selectedCardCountMap.get(deckId);
        if (!cardCountList) return 0;

        const cardCountEntry = cardCountList.find(entry => entry.cardId === cardId);
        return cardCountEntry ? cardCountEntry.count : 0;
    }

    public findSelectedCardIdListByDeck(deckId: number): number[] {
        const cardList = this.selectedCardCountMap.get(deckId);
        if (!cardList) return [];

        return cardList.map(entry => entry.cardId);
    }

    public saveSelectedCardCountByDeck(deckId: number, cardId: number, count: number): void {
        const existingCardCountList = this.selectedCardCountMap.get(deckId);
        if (existingCardCountList) {
            const cardEntry = existingCardCountList.find(entry => entry.cardId === cardId);
            if (cardEntry) {
                cardEntry.count = count;
            } else {
                existingCardCountList.push({cardId: cardId, count: count});
            }
        } else {
            this.selectedCardCountMap.set(deckId, [{ cardId: cardId, count: count }]);
        }
    }

    public incrementSelectedCardCountByDeck(deckId: number, cardId: number): void {
        const cardList = this.selectedCardCountMap.get(deckId);
        if (cardList) {
            const cardEntry = cardList.find(entry => entry.cardId === cardId);
            if (cardEntry) {
                cardEntry.count += 1;
            } else {
                cardList.push({ cardId, count: 1 });
            }
        } else {
            this.selectedCardCountMap.set(deckId, [{ cardId, count: 1 }]);
        }

        // 확인용 (나중에 지워야 함)
        const count = this.findSelectedCardCountByDeck(deckId, cardId);
        console.log(`선택한 카드 개수 증가 Deck ID: ${deckId}, Card ID: ${cardId}, Card Count: ${count}`);
    }

    public decrementSelectedCardCountByDeck(deckId: number, cardId: number): void {
        const cardList = this.selectedCardCountMap.get(deckId);
        if (cardList == null) return;

        const cardEntry = cardList.find(entry => entry.cardId === cardId);
        if (cardEntry && cardEntry.count > 0) {
            cardEntry.count -= 1;
        }

        // 선택한 카드 삭제 후에 남은 개수가 0인 경우에 대한 처리
        const count = this.findSelectedCardCountByDeck(deckId, cardId);
        if (count == 0) {
            const updatedList = cardList.filter(entry => entry.cardId !== cardId);
            if (updatedList.length > 0) {
                this.selectedCardCountMap.set(deckId, updatedList);
            } else {
                // 해당 덱에 카드가 하나도 없으면 전체 삭제
                this.selectedCardCountMap.delete(deckId);
            }
        }
        console.log(`선택한 카드 개수 감소 Deck ID: ${deckId}, Card ID: ${cardId}, Card Count: ${count}`);
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
        const gradeInfo = this.cardCountByGradeMap.get(deckId);
        if (gradeInfo) {
            const gradeEntry = gradeInfo.find(entry => entry.gradeId === gradeId);
            if (gradeEntry) {
                gradeEntry.count += 1;
            } else {
                gradeInfo.push({ gradeId, count: 1 });
            }
        } else {
            this.cardCountByGradeMap.set(deckId, [{ gradeId, count: 1 }]);
        }

        // 확인용 (나중에 지워야 함)
        const count = this.findCardCountByGrade(deckId, gradeId);
        console.log(`등급별 카드 개수 증가 Deck ID: ${deckId}, Grade ID: ${gradeId}, Card Count: ${count}`);
    }

    public decrementCardCountByGrade(deckId: number, gradeId: number): void {
        const gradeInfo = this.cardCountByGradeMap.get(deckId);
        if (gradeInfo) {
            const gradeEntry = gradeInfo.find(entry => entry.gradeId === gradeId);
            if (gradeEntry && gradeEntry.count > 0) {
                gradeEntry.count -= 1;
            }
        }

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
        this.selectedCardCountMap.delete(deckId);
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

    // 남은 카드 개수 복제
    public cloneRemainingCardCount(): void {
        this.originalRemainingCardCountMap = new Map(
            Array.from(this.remainingCardCountMap.entries()).map(([cardId, count]) => [cardId, count])
        );
        console.log("remainingCardCountMap -> originalRemainingCardCountMap 복제 완료");
    }

    // 덱별 카드 개수 복제
    public cloneSelectedCardCount(): void {
        this.originalSelectedCardCountMap = new Map(
            Array.from(this.selectedCardCountMap.entries()).map(([deckId, cardList]) => [
                deckId,
                cardList.map(entry => ({ ...entry })) // 깊은 복제
            ])
        );
        console.log("selectedCardCountMap -> originalSelectedCardCountMap 복제 완료");
    }

    // 등급별 카드 개수 복제
    public cloneCardCountByGrade(): void {
        this.originalCardCountByGradMap = new Map(
            Array.from(this.cardCountByGradeMap.entries()).map(([deckId, gradeList]) => [
                deckId,
                gradeList.map(entry => ({ ...entry })) // 깊은 복제
            ])
        );
        console.log("cardCountByGradeMap -> originalCardCountByGradMap 복제 완료");
    }

    // 남은 카드 개수 복원
    public restoreRemainingCardCount(): void {
        this.remainingCardCountMap = new Map(
            Array.from(this.originalRemainingCardCountMap.entries()).map(([cardId, count]) => [cardId, count])
        );
        console.log("originalRemainingCardCountMap -> remainingCardCountMap 복원 완료");
    }

    // 덱별 카드 개수 복원
    public restoreSelectedCardCount(): void {
        this.selectedCardCountMap = new Map(
            Array.from(this.originalSelectedCardCountMap.entries()).map(([deckId, cardList]) => [
                deckId,
                cardList.map(entry => ({ ...entry })) // 깊은 복제
            ])
        );
        console.log("originalSelectedCardCountMap -> selectedCardCountMap 복원 완료");
    }

    // 등급별 카드 개수 복원
    public restoreCardCountByGrade(): void {
        this.cardCountByGradeMap = new Map(
            Array.from(this.originalCardCountByGradMap.entries()).map(([deckId, gradeList]) => [
                deckId,
                gradeList.map(entry => ({ ...entry })) // 깊은 복제
            ])
        );
        console.log("originalCardCountByGradMap -> cardCountByGradeMap 복원 완료");
    }


}
