// 로스트 존이다. 이 판에서 완전히 빠진 카드가 쌓인다.
//
// 무덤과 생김새가 같지만 다른 것이다. 여기 것은 부활하지 못한다.
// 특수한 카드로만 되찾을 수 있고, 그런 카드가 붙기 시작하면 이쪽만 바뀐다.
export class LostZone {
    private cards: number[] = [];

    add(cardId: number): void {
        this.cards.push(cardId);
    }

    getCards(): readonly number[] {
        return this.cards;
    }

    clear(): void {
        this.cards = [];
    }

    // 적어 둔 것으로 되돌린다.
    restoreFrom(cards: readonly number[]): void {
        this.cards = [...cards];
    }
}
