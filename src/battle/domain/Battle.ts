import {BattleSnapshot} from "./BattleSnapshot";
import {TurnOwner} from "./TurnOwner";
import {Deck} from "./Deck";
import {Tomb} from "./Tomb";

// 전투 한 판이다.
//
// 지금은 흩어져 있는 턴, 덱, 무덤, 로스트 존, 유닛, 필드, 손패가 이 안으로 들어온다.
// 흩어져 있으면 재접속했을 때 그중 하나만 어긋나도 화면과 실제 상태가 달라진다.
// 한 곳에 모으면 통째로 적고 통째로 되돌린다.
//
// 밖에서는 이것만 잡는다. 안에 있는 턴이나 덱을 따로 잡을 길을 내지 않는다.
// 길을 내면 그것을 쓰는 쪽에 규칙이 생기고, 규칙이 여기저기 흩어진다.
//
// 여기에는 화면에 그려지는 것을 두지 않는다. 적어 둘 수 있는 값만 둔다.
export class Battle {
    // 전투는 내 턴으로 시작한다. 게임을 연 쪽이 먼저 둔다.
    private turnOwner: TurnOwner = 'your';

    private readonly yourDeck = new Deck();
    private readonly opponentDeck = new Deck();

    private readonly yourTomb = new Tomb();
    private readonly opponentTomb = new Tomb();

    private constructor(private readonly battleId: number) {}

    // 전투를 새로 시작한다.
    static start(battleId: number): Battle {
        return new Battle(battleId);
    }

    // 적어 둔 것으로부터 전투를 되돌린다. 재접속할 때 쓴다.
    static restore(snapshot: BattleSnapshot): Battle {
        const battle = new Battle(snapshot.battleId);
        battle.turnOwner = snapshot.turnOwner;
        battle.yourDeck.seed(snapshot.yourDeckCards);
        battle.opponentDeck.seed(snapshot.opponentDeckCards);
        battle.yourTomb.restoreFrom(snapshot.yourTombCards);
        battle.opponentTomb.restoreFrom(snapshot.opponentTombCards);
        return battle;
    }

    getId(): number {
        return this.battleId;
    }

    /* ── 턴 ── */

    getTurnOwner(): TurnOwner {
        return this.turnOwner;
    }

    setTurnOwner(owner: TurnOwner): void {
        if (this.turnOwner === owner) return;
        const prev = this.turnOwner;
        this.turnOwner = owner;
        console.log(`[turn-state] owner: ${prev} → ${owner}`);
    }

    /* ── 내 덱 ── */

    seedYourDeck(cards: readonly number[]): void {
        this.yourDeck.seed(cards);
    }

    drawFromYourDeck(): number | null {
        return this.yourDeck.draw();
    }

    drawMatchingFromYourDeck(cardId: number, max: number): number[] {
        return this.yourDeck.drawMatching(cardId, max);
    }

    removeFromYourDeckAt(index: number): number | null {
        return this.yourDeck.removeAt(index);
    }

    // 씨앗은 밖에서 받는다. 적어 두면 같은 순서를 다시 만들 수 있다.
    shuffleYourDeck(seed: number): void {
        this.yourDeck.shuffle(seed);
    }

    getYourDeckRemainingCount(): number {
        return this.yourDeck.getRemainingCount();
    }

    getYourDeckCards(): readonly number[] {
        return this.yourDeck.getCards();
    }

    /* ── 상대 덱 ── */
    // 상대 덱은 뽑기와 보기만 있다. 상대 덱을 뒤지는 카드가 아직 없다.

    seedOpponentDeck(cards: readonly number[]): void {
        this.opponentDeck.seed(cards);
    }

    drawFromOpponentDeck(): number | null {
        return this.opponentDeck.draw();
    }

    getOpponentDeckRemainingCount(): number {
        return this.opponentDeck.getRemainingCount();
    }

    getOpponentDeckCards(): readonly number[] {
        return this.opponentDeck.getCards();
    }

    /* ── 무덤 ── */
    // 무덤은 쓰러진 카드가 쌓이는 곳이다. 부활할 수 있다.

    sendToYourTomb(cardId: number): void {
        this.yourTomb.add(cardId);
    }

    getYourTombCards(): readonly number[] {
        return this.yourTomb.getCards();
    }

    clearYourTomb(): void {
        this.yourTomb.clear();
    }

    sendToOpponentTomb(cardId: number): void {
        this.opponentTomb.add(cardId);
    }

    getOpponentTombCards(): readonly number[] {
        return this.opponentTomb.getCards();
    }

    clearOpponentTomb(): void {
        this.opponentTomb.clear();
    }

    // 지금 상태를 통째로 적는다.
    toSnapshot(): BattleSnapshot {
        return {
            battleId: this.battleId,
            turnOwner: this.turnOwner,
            yourDeckCards: [...this.yourDeck.getCards()],
            opponentDeckCards: [...this.opponentDeck.getCards()],
            yourTombCards: [...this.yourTomb.getCards()],
            opponentTombCards: [...this.opponentTomb.getCards()],
        };
    }
}
