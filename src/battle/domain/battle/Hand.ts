import {HandCard} from "./HandCard";
import {HandCardSnapshot} from "./HandCardSnapshot";

// 손패다. 든 카드가 든 차례대로 담긴다.
//
// 순서는 이 목록이 들고 있다. 카드의 신원과 상관이 없다.
// 한 장을 내면 뒤엣것이 당겨진다. 빈 자리를 남기지 않는다.
//
// 몇 장씩 나눠 보여줄지는 화면이 정한다. 여기는 목록만 준다.
export class Hand {
    private cards: HandCard[] = [];

    add(card: HandCard): void {
        this.cards.push(card);
    }

    findById(battleCardId: number): HandCard | null {
        return this.cards.find((it) => it.getBattleCardId() === battleCardId) ?? null;
    }

    removeById(battleCardId: number): boolean {
        const index = this.cards.findIndex((it) => it.getBattleCardId() === battleCardId);
        if (index < 0) return false;
        this.cards.splice(index, 1);
        return true;
    }

    getCards(): readonly HandCard[] {
        return this.cards;
    }

    count(): number {
        return this.cards.length;
    }

    clear(): void {
        this.cards = [];
    }

    restoreFrom(snapshots: readonly HandCardSnapshot[]): void {
        this.cards = snapshots.map((it) => HandCard.restore(it));
    }
}
