import {BattleSnapshot} from "./BattleSnapshot";
import {TurnOwner} from "./TurnOwner";
import {Deck} from "./Deck";
import {Tomb} from "./Tomb";
import {LostZone} from "./LostZone";
import {BattleFieldUnit} from "./BattleFieldUnit";
import {Field} from "./Field";
import {FieldCard} from "./FieldCard";
import {Hand} from "./Hand";
import {HandCard} from "./HandCard";
import {Master} from "./Master";

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
    static readonly FIRST_TURN = 1;
    // 내 턴이 시작될 때마다 늘어나는 양
    static readonly FIELD_ENERGY_GAIN_PER_TURN = 1;

    // 전투는 내 턴으로 시작한다. 게임을 연 쪽이 먼저 둔다.
    private turnOwner: TurnOwner = 'your';

    // 몇 번째 턴인가. 상대에게 넘겼다가 다시 내게 돌아오면 한 턴이다.
    private turnNumber: number = Battle.FIRST_TURN;

    // 이번 판에 쓸 수 있는 필드 에너지. 내 턴이 시작될 때마다 하나 는다.
    private fieldEnergy: number = 0;
    private opponentFieldEnergy: number = 0;

    private readonly yourDeck = new Deck();
    private readonly opponentDeck = new Deck();

    private readonly yourTomb = new Tomb();
    private readonly opponentTomb = new Tomb();

    private readonly yourLostZone = new LostZone();
    private readonly opponentLostZone = new LostZone();

    // 필드에 나온 유닛이다. 나온 차례대로 담긴다.
    private deployedUnits: BattleFieldUnit[] = [];

    private readonly yourField = new Field();
    private readonly opponentField = new Field();

    private readonly hand = new Hand();

    private readonly yourMaster = new Master();
    private readonly opponentMaster = new Master();

    // 카드에 붙일 다음 번호. 한 번 쓴 번호는 다시 안 쓴다.
    //
    // 쓰거나 무덤에 간 카드의 번호를 다시 쓰면, 화면이 그 번호로 가리키던 것과
    // 전투가 그 번호로 찾는 것이 서로 다른 카드가 된다.
    private nextCardId: number = 0;

    private constructor(private readonly battleId: number) {}

    // 전투를 새로 시작한다.
    static start(battleId: number): Battle {
        return new Battle(battleId);
    }

    // 적어 둔 것으로부터 전투를 되돌린다. 재접속할 때 쓴다.
    static restore(snapshot: BattleSnapshot): Battle {
        const battle = new Battle(snapshot.battleId);
        battle.turnOwner = snapshot.turnOwner;
        battle.turnNumber = snapshot.turnNumber;
        battle.fieldEnergy = snapshot.fieldEnergy;
        battle.opponentFieldEnergy = snapshot.opponentFieldEnergy;
        battle.yourDeck.seed(snapshot.yourDeckCards);
        battle.opponentDeck.seed(snapshot.opponentDeckCards);
        battle.yourTomb.restoreFrom(snapshot.yourTombCards);
        battle.opponentTomb.restoreFrom(snapshot.opponentTombCards);
        battle.yourLostZone.restoreFrom(snapshot.yourLostZoneCards);
        battle.opponentLostZone.restoreFrom(snapshot.opponentLostZoneCards);
        battle.deployedUnits = snapshot.deployedUnits.map((it) => BattleFieldUnit.restore(it));
        battle.yourField.restoreFrom(snapshot.yourFieldCards);
        battle.opponentField.restoreFrom(snapshot.opponentFieldCards);
        battle.hand.restoreFrom(snapshot.handCards);
        battle.yourMaster.restoreFrom(snapshot.yourMasterHp);
        battle.opponentMaster.restoreFrom(snapshot.opponentMasterHp);
        return battle;
    }

    getId(): number {
        return this.battleId;
    }

    // 카드 하나에 붙일 번호를 준다. 한 번 준 번호는 다시 안 준다.
    issueCardId(): number {
        return this.nextCardId++;
    }

    // 밖에서 번호를 정해 넣은 경우 그 다음부터 주도록 맞춘다.
    private markCardIdUsed(cardId: number): void {
        if (cardId >= this.nextCardId) this.nextCardId = cardId + 1;
    }

    /* ── 턴 ── */

    getTurnOwner(): TurnOwner {
        return this.turnOwner;
    }

    getTurnNumber(): number {
        return this.turnNumber;
    }

    isYourTurn(): boolean {
        return this.turnOwner === 'your';
    }

    // 내 턴을 끝내고 상대에게 넘긴다.
    //
    // 내 턴이 아니면 아무 일도 안 한다. 턴 종료 버튼과 모래시계가 같은 순간에
    // 겹쳐 들어와도 두 번 넘어가지 않는다. 넘어갔으면 true 다.
    endYourTurn(): boolean {
        if (this.turnOwner !== 'your') return false;
        this.turnOwner = 'opponent';
        return true;
    }

    // 상대 턴을 끝내고 내 차례로 돌아온다.
    //
    // 한 바퀴가 끝났으므로 턴이 하나 오르고 필드 에너지가 하나 는다.
    // 상대 턴이 아니면 아무 일도 안 한다. 돌아왔으면 true 다.
    beginYourTurn(): boolean {
        if (this.turnOwner !== 'opponent') return false;
        this.turnOwner = 'your';
        this.turnNumber += 1;
        this.fieldEnergy += Battle.FIELD_ENERGY_GAIN_PER_TURN;
        return true;
    }

    /* ── 필드 에너지 ── */

    getFieldEnergy(): number {
        return this.fieldEnergy;
    }

    setFieldEnergy(next: number): number {
        this.fieldEnergy = Math.max(0, next);
        return this.fieldEnergy;
    }

    // 카드에 붙이거나 할 때 쓴다. 모자라면 안 쓰고 false 다.
    spendFieldEnergy(amount: number): boolean {
        if (amount <= 0 || this.fieldEnergy < amount) return false;
        this.fieldEnergy -= amount;
        return true;
    }

    gainFieldEnergy(amount: number): number {
        if (amount <= 0) return this.fieldEnergy;
        this.fieldEnergy += amount;
        return this.fieldEnergy;
    }

    getOpponentFieldEnergy(): number {
        return this.opponentFieldEnergy;
    }

    setOpponentFieldEnergy(next: number): number {
        this.opponentFieldEnergy = Math.max(0, next);
        return this.opponentFieldEnergy;
    }

    // 상대 필드 에너지를 깎는다. 0 아래로는 안 내려간다. 실제로 깎인 양을 준다.
    drainOpponentFieldEnergy(amount: number): number {
        if (amount <= 0) return 0;
        const before = this.opponentFieldEnergy;
        this.opponentFieldEnergy = Math.max(0, before - amount);
        return before - this.opponentFieldEnergy;
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

    /* ── 로스트 존 ── */
    // 이 판에서 완전히 빠진 카드가 쌓이는 곳이다. 부활하지 못한다.

    sendToYourLostZone(cardId: number): void {
        this.yourLostZone.add(cardId);
    }

    getYourLostZoneCards(): readonly number[] {
        return this.yourLostZone.getCards();
    }

    clearYourLostZone(): void {
        this.yourLostZone.clear();
    }

    sendToOpponentLostZone(cardId: number): void {
        this.opponentLostZone.add(cardId);
    }

    getOpponentLostZoneCards(): readonly number[] {
        return this.opponentLostZone.getCards();
    }

    clearOpponentLostZone(): void {
        this.opponentLostZone.clear();
    }

    /* ── 필드에 나온 유닛 ── */

    // 유닛이 필드에 나온다.
    deployUnit(unit: BattleFieldUnit): void {
        this.deployedUnits.push(unit);
    }

    getDeployedUnits(): readonly BattleFieldUnit[] {
        return this.deployedUnits;
    }

    getDeployedUnitCount(): number {
        return this.deployedUnits.length;
    }

    /* ── 내 필드 ── */

    placeOnYourField(card: FieldCard): void {
        this.markCardIdUsed(card.getBattleCardId());
        this.yourField.place(card);
    }

    findOnYourField(battleCardId: number): FieldCard | null {
        return this.yourField.findById(battleCardId);
    }

    removeFromYourField(battleCardId: number): boolean {
        return this.yourField.removeById(battleCardId);
    }

    getYourFieldCards(): readonly FieldCard[] {
        return this.yourField.getCards();
    }

    getYourFieldCount(): number {
        return this.yourField.count();
    }

    /* ── 상대 필드 ── */

    placeOnOpponentField(card: FieldCard): void {
        this.markCardIdUsed(card.getBattleCardId());
        this.opponentField.place(card);
    }

    findOnOpponentField(battleCardId: number): FieldCard | null {
        return this.opponentField.findById(battleCardId);
    }

    removeFromOpponentField(battleCardId: number): boolean {
        return this.opponentField.removeById(battleCardId);
    }

    getOpponentFieldCards(): readonly FieldCard[] {
        return this.opponentField.getCards();
    }

    getOpponentFieldCount(): number {
        return this.opponentField.count();
    }

    /* ── 손패 ── */
    // 몇 장씩 나눠 보여줄지는 화면이 정한다. 여기는 목록만 준다.

    addToHand(card: HandCard): void {
        this.markCardIdUsed(card.getBattleCardId());
        this.hand.add(card);
    }

    findInHand(battleCardId: number): HandCard | null {
        return this.hand.findById(battleCardId);
    }

    removeFromHand(battleCardId: number): boolean {
        return this.hand.removeById(battleCardId);
    }

    getHandCards(): readonly HandCard[] {
        return this.hand.getCards();
    }

    getHandCount(): number {
        return this.hand.count();
    }

    /* ── 본체 ── */

    getYourMasterHp(): number {
        return this.yourMaster.getHp();
    }

    damageYourMaster(amount: number): number {
        return this.yourMaster.damage(amount);
    }

    isYourMasterDefeated(): boolean {
        return this.yourMaster.isDefeated();
    }

    getOpponentMasterHp(): number {
        return this.opponentMaster.getHp();
    }

    setOpponentMasterHp(next: number): number {
        return this.opponentMaster.setHp(next);
    }

    isOpponentMasterDefeated(): boolean {
        return this.opponentMaster.isDefeated();
    }

    /* ── 유닛이 움직일 수 있는가 ── */

    // 내 유닛이 이번 턴에 움직일 수 있는가.
    //
    // 나온 턴에는 못 움직인다. 나오자마자 때리는 것을 막는 규칙이다.
    canYourUnitAct(battleCardId: number): boolean {
        const unit = this.yourField.findById(battleCardId);
        if (!unit) return false;
        return unit.getDeployedTurn() !== this.turnNumber;
    }

    // 상대 유닛이 이번 턴에 움직일 수 있는가. 얼어 있으면 못 움직인다.
    canOpponentUnitAct(battleCardId: number): boolean {
        const unit = this.opponentField.findById(battleCardId);
        if (!unit) return false;
        return !unit.isFrozen();
    }

    // 지금 상태를 통째로 적는다.
    toSnapshot(): BattleSnapshot {
        return {
            battleId: this.battleId,
            turnOwner: this.turnOwner,
            turnNumber: this.turnNumber,
            fieldEnergy: this.fieldEnergy,
            opponentFieldEnergy: this.opponentFieldEnergy,
            yourDeckCards: [...this.yourDeck.getCards()],
            opponentDeckCards: [...this.opponentDeck.getCards()],
            yourTombCards: [...this.yourTomb.getCards()],
            opponentTombCards: [...this.opponentTomb.getCards()],
            yourLostZoneCards: [...this.yourLostZone.getCards()],
            opponentLostZoneCards: [...this.opponentLostZone.getCards()],
            deployedUnits: this.deployedUnits.map((it) => it.toSnapshot()),
            yourFieldCards: this.yourField.getCards().map((it) => it.toSnapshot()),
            opponentFieldCards: this.opponentField.getCards().map((it) => it.toSnapshot()),
            handCards: this.hand.getCards().map((it) => it.toSnapshot()),
            yourMasterHp: this.yourMaster.getHp(),
            opponentMasterHp: this.opponentMaster.getHp(),
        };
    }
}
