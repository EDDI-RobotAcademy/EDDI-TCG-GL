import {SeededRandom} from "./SeededRandom";

// 뽑는 더미다. 맨 앞이 맨 위다.
//
// 순서가 있고 내가 그 순서를 못 정한다. 그래서 재접속할 때 순서까지 되돌려야 한다.
// 순서가 어긋나면 다음에 뽑히는 카드가 달라진다.
export class Deck {
    private cards: number[] = [];

    static of(cards: readonly number[]): Deck {
        const deck = new Deck();
        deck.cards = [...cards];
        return deck;
    }

    seed(cards: readonly number[]): void {
        this.cards = [...cards];
    }

    // 맨 위를 뽑는다. 비었으면 null 이다.
    draw(): number | null {
        if (this.cards.length === 0) return null;
        return this.cards.shift() ?? null;
    }

    // 같은 카드를 위에서부터 최대 몇 장까지 꺼낸다.
    drawMatching(cardId: number, max: number): number[] {
        const removed: number[] = [];
        let i = 0;
        while (i < this.cards.length && removed.length < max) {
            if (this.cards[i] === cardId) {
                removed.push(this.cards.splice(i, 1)[0]);
            } else {
                i++;
            }
        }
        return removed;
    }

    // 몇 번째 것을 꺼낸다.
    removeAt(index: number): number | null {
        if (index < 0 || index >= this.cards.length) return null;
        return this.cards.splice(index, 1)[0];
    }

    // 씨앗을 받아 섞는다. 같은 씨앗이면 같은 순서가 된다.
    shuffle(seed: number): void {
        const random = new SeededRandom(seed);
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = random.nextInt(i + 1);
            const tmp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = tmp;
        }
    }

    getRemainingCount(): number {
        return this.cards.length;
    }

    getCards(): readonly number[] {
        return this.cards;
    }
}
