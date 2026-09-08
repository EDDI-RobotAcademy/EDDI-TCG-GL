// 무덤이다. 쓰러진 카드가 쌓인다.
//
// 로스트 존과 생김새가 같지만 다른 것이다. 무덤은 부활할 수 있다.
// 부활을 다루는 카드가 붙기 시작하면 이쪽만 바뀐다.
export class Tomb {
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
