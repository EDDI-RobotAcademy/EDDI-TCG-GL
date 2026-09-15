import {FieldCard} from "./FieldCard";
import {FieldCardSnapshot} from "./FieldCardSnapshot";

// 한쪽의 필드다. 놓인 카드가 놓인 차례대로 담긴다.
//
// 순서는 이 목록이 들고 있다. 카드의 신원과는 상관이 없다.
// 필드가 13, 20, 33 일 때 17 이 부활하면 13, 20, 33, 17 이 된다.
// 신원으로 줄을 세우면 나중에 온 17 이 20 보다 앞으로 끼어든다.
//
// 중간 카드가 빠지면 뒤엣것이 당겨진다. 빈 자리를 남기지 않는다.
export class Field {
    private cards: FieldCard[] = [];

    // 카드가 필드에 놓인다. 새로 오는 것은 맨 뒤다.
    place(card: FieldCard): void {
        this.cards.push(card);
    }

    findById(battleCardId: number): FieldCard | null {
        return this.cards.find((it) => it.getBattleCardId() === battleCardId) ?? null;
    }

    removeById(battleCardId: number): boolean {
        const index = this.cards.findIndex((it) => it.getBattleCardId() === battleCardId);
        if (index < 0) return false;
        this.cards.splice(index, 1);
        return true;
    }

    getCards(): readonly FieldCard[] {
        return this.cards;
    }

    count(): number {
        return this.cards.length;
    }

    clear(): void {
        this.cards = [];
    }

    restoreFrom(snapshots: readonly FieldCardSnapshot[]): void {
        this.cards = snapshots.map((it) => FieldCard.restore(it));
    }
}
