import {Battle} from "../domain/Battle";
import {HandCard} from "../domain/HandCard";
import {FieldCard} from "../domain/FieldCard";
import {CardKind} from "../../card/kind";
import {CardGrade} from "../../card/grade";
import {CardRace} from "../../card/race";
import {SkillType} from "../../card/SkillType";
import {findCardAbility} from "../ability/CardAbility";
import {BattleCommand} from "./BattleCommand";
import {BattleEvent} from "./BattleEvent";

// 카드가 어떤 종류이고 체력이 얼마인지를 알려 주는 곳.
//
// 카드에 적혀 있는 것은 판과 무관하다. 전투 상태가 그것까지 들면 판마다 카드 백 장을
// 통째로 적어 두게 된다. 그래서 밖에서 받는다.
export interface CardCatalog {
    getKind(cardId: number): CardKind | null;
    getHp(cardId: number): number;
    getGrade(cardId: number): CardGrade | null;
    getRace(cardId: number): CardRace | null;

    // 카드에 적힌 기본 공격력. 붙은 것이 없을 때의 값이다.
    getAttack(cardId: number): number;

    // 스킬에 적힌 값. 없는 스킬이면 null 이다.
    //
    // damage 는 카드에 적힌 기본 피해다. 지금은 이대로 쓰지만, 붙은 것이 생기면
    // 최종 피해는 규칙이 이 값에서 시작해 계산한다.
    //
    // cost 는 종족별로 필요한 에너지다. 총량으로 보면 [언데드 2 필요 / 휴먼 2 보유] 를
    // 통과시키므로 종족별로 든다.
    getSkill(cardId: number, slot: 1 | 2): CardSkillSpec | null;
}

// 카드에 적힌 스킬 하나.
export interface CardSkillSpec {
    readonly range: SkillType;
    readonly damage: number;
    readonly cost: ReadonlyMap<CardRace, number>;
}

// 전투가 지금 처리하는 카드들. 값으로 다 적히는 것부터 옮겼다.
const SCYTHE = 8;
const MORALE_CONVERT = 35;
const DOOM_CONTRACT = 25;
const DEAD_LANDS = 36;
const SWAMP_OF_DEAD = 20;
const OVERFLOW_MORALE = 2;
const DEATH_ENERGY = 93;
const LEONIK_SUMMON = 30;
const COLD_DARK_ENERGY = 151;

// 사용자가 한 일 하나를 받아 끝까지 처리하고, 무슨 일이 일어났는지 차례대로 돌려준다.
//
// 되는지 안 되는지도 여기서 판단한다. 부르는 쪽은 하나만 보내고 돌려받은 것만 본다.
export class BattleCommandHandler {
    constructor(private readonly catalog: CardCatalog) {}

    // ── 카드에 적힌 값을 보고 정하는 것들 ─────────────────────────────────────
    //
    // 전에는 화면이 카드 데이터를 직접 열어 이것들을 정했다. 도메인이 카드에 뭐가 적혀
    // 있는지 몰랐기 때문이다. 이제 카탈로그로 읽는다.

    // 이 공격이 얼마나 아픈가.
    //
    // 지금은 카드에 적힌 값이 그대로 답이다. 붙은 것이 생기면 여기서 그 값들을 더해
    // 계산하게 된다. 최종값을 어디에 저장하지는 않는다.
    attackDamage(cardId: number, slot: 1 | 2 | null): number {
        if (slot === null) return this.catalog.getAttack(cardId);
        return this.catalog.getSkill(cardId, slot)?.damage ?? 0;
    }

    // 이 공격이 누구를 치는가.
    attackRange(cardId: number, slot: 1 | 2 | null): SkillType {
        if (slot === null) return SkillType.Single;
        return this.catalog.getSkill(cardId, slot)?.range ?? SkillType.Single;
    }

    // 이 스킬을 쓸 만큼 에너지가 붙어 있는가.
    //
    // 종족별로 하나씩 대조해 처음 모자란 종족을 돌려준다. 전부 채웠으면 null 이다.
    // 총량으로 보면 [언데드 2 필요 / 휴먼 2 보유] 를 통과시키므로 반드시 종족별로 본다.
    missingSkillEnergy(
        battle: Battle, battleCardId: number, cardId: number, slot: 1 | 2,
    ): { race: CardRace; need: number; have: number } | null {
        const cost = this.catalog.getSkill(cardId, slot)?.cost;
        if (!cost) return null;
        const unit = battle.findOnYourField(battleCardId);
        for (const [race, need] of cost) {
            const have = unit?.getEnergyOfRace(race) ?? 0;
            if (have < need) return { race, need, have };
        }
        return null;
    }

    // 이 스킬이 얼마를 요구하는가. 화면이 안내 문구에 쓴다.
    skillCost(cardId: number, slot: 1 | 2): ReadonlyMap<CardRace, number> {
        return this.catalog.getSkill(cardId, slot)?.cost ?? new Map();
    }

    handle(battle: Battle, command: BattleCommand): BattleEvent[] {
        switch (command.type) {
            case 'endYourTurn':
                return this.endYourTurn(battle);
            case 'beginYourTurn':
                return this.beginYourTurn(battle);
            case 'drawCard':
                return this.drawCard(battle);
            case 'playCardToField':
                return this.playCardToField(battle, command.battleCardId);
            case 'useCardOnUnit':
                return this.useCardOnUnit(battle, command.battleCardId, command.targetBattleCardId);
            case 'useCardOnField':
                return this.useCardOnField(
                    battle, command.battleCardId, command.side,
                    command.pickedDeckIndexes, command.shuffleSeed,
                );
            case 'attachFieldEnergyToUnit':
                return this.attachFieldEnergyToUnit(
                    battle, command.targetBattleCardId, command.race,
                );
            case 'attackUnit':
                return this.attackUnit(
                    battle, command.attackerBattleCardId,
                    command.targetBattleCardId, command.damage,
                );
            case 'attackOpponentMaster':
                return this.attackOpponentMaster(
                    battle, command.damage, command.attackerBattleCardId,
                );
            case 'attackEveryOpponentUnit':
                return this.attackEveryOpponent(
                    battle, command.damage, false, command.attackerBattleCardId,
                );
            case 'attackEveryOpponent':
                return this.attackEveryOpponent(
                    battle, command.damage, true, command.attackerBattleCardId,
                );
        }
    }

    /* ── 턴 ── */

    // 내 턴을 끝내고 상대에게 넘긴다.
    //
    // 넘어가는 그 자리에서 암흑 화염이 정산된다. 상대 턴이 시작되는 시점이다.
    private endYourTurn(battle: Battle): BattleEvent[] {
        if (!battle.endYourTurn()) {
            return [{type: 'rejected', reason: '내 턴이 아닙니다.'}];
        }

        const events: BattleEvent[] = [{type: 'turnPassed', to: 'opponent'}];
        events.push(...this.settleDarkFlame(battle));
        return events;
    }

    // 상대 턴을 끝내고 내 차례로 돌아온다.
    //
    // 턴이 하나 오르고 필드 에너지가 하나 늘고 한 장 뽑는다.
    // 빙결은 상대 턴 내내 유지되다가 여기서 풀린다.
    private beginYourTurn(battle: Battle): BattleEvent[] {
        const turnBefore = battle.getTurnNumber();
        const energyBefore = battle.getFieldEnergy();
        if (!battle.beginYourTurn()) {
            return [{type: 'rejected', reason: '이미 내 턴입니다.'}];
        }

        const events: BattleEvent[] = [
            {type: 'turnPassed', to: 'your'},
            {type: 'valueChanged', what: 'turnNumber',
             before: turnBefore, after: battle.getTurnNumber()},
            {type: 'valueChanged', what: 'fieldEnergy',
             before: energyBefore, after: battle.getFieldEnergy()},
        ];
        events.push(...this.thawFrozenUnits(battle));
        events.push(...this.drawCard(battle));
        return events;
    }

    // 암흑 화염이 붙은 유닛이 정해진 만큼 깎인다. 0 이 되면 무덤으로 간다.
    private settleDarkFlame(battle: Battle): BattleEvent[] {
        const damage = findCardAbility(COLD_DARK_ENERGY)?.numbers.darkFlameTurnDamage ?? 0;
        if (damage <= 0) return [];

        const events: BattleEvent[] = [];
        // 도는 중에 빠지므로 미리 베껴 둔다.
        for (const unit of [...battle.getOpponentFieldCards()]) {
            if (!unit.hasDarkFlame()) continue;
            events.push(...this.damageOpponentUnit(
                battle, unit.getBattleCardId(), unit.getCardId(), damage,
            ));
        }
        return events;
    }

    // 얼어 있던 유닛이 풀린다. 풀린 유닛은 이번 턴에 다시 안 언다.
    private thawFrozenUnits(battle: Battle): BattleEvent[] {
        const events: BattleEvent[] = [];
        for (const unit of battle.getOpponentFieldCards()) {
            if (!unit.isFrozen()) {
                unit.clearFreezeImmune();
                continue;
            }
            unit.thaw();
            events.push({
                type: 'statusCleared',
                battleCardId: unit.getBattleCardId(),
                what: 'frozen',
            });
        }
        return events;
    }

    // 덱에서 한 장 뽑아 손패에 넣는다.
    private drawCard(battle: Battle): BattleEvent[] {
        const cardId = battle.drawFromYourDeck();
        if (cardId === null) {
            return [{type: 'rejected', reason: '덱에 남은 카드가 없습니다.'}];
        }

        // 신원은 전투가 준다. 한 번 쓴 번호는 다시 안 준다.
        const battleCardId = battle.issueCardId();
        battle.addToHand(new HandCard(battleCardId, cardId, [], 0));

        return [{
            type: 'cardMoved',
            battleCardId,
            cardId,
            from: 'yourDeck',
            to: 'hand',
        }];
    }

    // 손패의 카드를 내 필드에 낸다.
    private playCardToField(battle: Battle, battleCardId: number): BattleEvent[] {
        const handCard = battle.findInHand(battleCardId);
        if (!handCard) {
            return [{type: 'rejected', reason: '손패에 없는 카드입니다.'}];
        }

        const cardId = handCard.getCardId();
        const kind = this.catalog.getKind(cardId);
        if (kind !== CardKind.UNIT) {
            return [{type: 'rejected', reason: '유닛 카드만 필드에 낼 수 있습니다.'}];
        }

        battle.removeFromHand(battleCardId);
        battle.placeOnYourField(new FieldCard(
            battleCardId,
            cardId,
            handCard.getAttributeMarkIds(),
            handCard.getPositionId(),
            this.catalog.getHp(cardId),
            new Map(),
            // 나온 턴을 적어 둔다. 나온 턴에는 못 움직인다
            battle.getTurnNumber(),
        ));

        return [{
            type: 'cardMoved',
            battleCardId,
            cardId,
            from: 'hand',
            to: 'yourField',
        }];
    }

    // 손패의 카드를 유닛 하나에게 쓴다.
    private useCardOnUnit(
        battle: Battle,
        battleCardId: number,
        targetBattleCardId: number,
    ): BattleEvent[] {
        const handCard = battle.findInHand(battleCardId);
        if (!handCard) return [{type: 'rejected', reason: '손패에 없는 카드입니다.'}];

        const cardId = handCard.getCardId();
        const ability = findCardAbility(cardId);
        if (!ability) return [{type: 'rejected', reason: '아직 만들어지지 않은 카드입니다.'}];

        switch (cardId) {
            case SCYTHE:
                return this.useScythe(battle, battleCardId, cardId, targetBattleCardId);
            case MORALE_CONVERT:
                return this.useMoraleConvert(battle, battleCardId, cardId, targetBattleCardId);
            case OVERFLOW_MORALE:
                return this.useOverflowMorale(battle, battleCardId, cardId, targetBattleCardId);
            case DEATH_ENERGY:
                return this.attachEnergyCard(battle, battleCardId, cardId, targetBattleCardId);
            default:
                return [{type: 'rejected', reason: '아직 전투가 처리하지 않는 카드입니다.'}];
        }
    }

    // 죽음의 낫 — 신화 미만이면 즉사, 신화면 정해진 만큼 피해.
    private useScythe(
        battle: Battle, battleCardId: number, cardId: number, targetId: number,
    ): BattleEvent[] {
        const target = battle.findOnOpponentField(targetId);
        if (!target) return [{type: 'rejected', reason: '상대 필드에 없는 유닛입니다.'}];

        const isMythic = this.catalog.getGrade(target.getCardId()) === CardGrade.MYTHICAL;
        const hpBefore = target.getHp();
        const damage = isMythic ? findCardAbility(cardId)!.numbers.mythicDamage : hpBefore;
        const hpAfter = target.setHp(hpBefore - damage);

        const events: BattleEvent[] = [{
            type: 'damaged',
            target: {kind: 'unit', battleCardId: targetId},
            amount: damage, hpBefore, hpAfter,
        }];
        if (hpAfter <= 0) {
            events.push(...this.defeatOpponentUnit(battle, targetId, target.getCardId()));
        }
        events.push(...this.spendHandCard(battle, battleCardId, cardId));
        return events;
    }

    // 사기 전환 — 아군 하나를 무덤으로 보내고 그 체력을 나눈 만큼 필드 에너지를 얻는다.
    private useMoraleConvert(
        battle: Battle, battleCardId: number, cardId: number, targetId: number,
    ): BattleEvent[] {
        const target = battle.findOnYourField(targetId);
        if (!target) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const divisor = findCardAbility(cardId)!.numbers.hpDividedBy;
        const gain = Math.floor(this.catalog.getHp(target.getCardId()) / divisor);

        const before = battle.getFieldEnergy();
        const after = battle.gainFieldEnergy(gain);

        const events: BattleEvent[] = [];
        battle.removeFromYourField(targetId);
        battle.sendToYourTomb(target.getCardId());
        events.push({
            type: 'cardMoved',
            battleCardId: targetId, cardId: target.getCardId(),
            from: 'yourField', to: 'yourTomb',
        });
        if (after !== before) {
            events.push({type: 'valueChanged', what: 'fieldEnergy', before, after});
        }
        events.push(...this.spendHandCard(battle, battleCardId, cardId));
        return events;
    }

    // 넘쳐 흐르는 사기 — 덱에서 정해진 카드를 꺼내 유닛에 붙인다.
    private useOverflowMorale(
        battle: Battle, battleCardId: number, cardId: number, targetId: number,
    ): BattleEvent[] {
        const target = battle.findOnYourField(targetId);
        if (!target) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const n = findCardAbility(cardId)!.numbers;
        const pulled = battle.drawMatchingFromYourDeck(n.pullCardId, n.maxPull);

        const race = this.catalog.getRace(n.pullCardId) ?? CardRace.UNDEAD;
        const events: BattleEvent[] = [];
        for (const energyId of pulled) {
            const countAfter = target.addEnergy(race, 1);
            events.push({type: 'energyAttached', battleCardId: targetId, race, countAfter});
            // 쓴 에너지 카드는 무덤으로 간다.
            battle.sendToYourTomb(energyId);
            events.push({
                type: 'cardMoved', battleCardId: -1, cardId: energyId,
                from: 'yourDeck', to: 'yourTomb',
            });
        }

        events.push(...this.spendHandCard(battle, battleCardId, cardId));
        return events;
    }

    // 에너지 카드를 유닛에 붙인다. 붙는 종족은 그 카드의 종족이다.
    private attachEnergyCard(
        battle: Battle, battleCardId: number, cardId: number, targetId: number,
    ): BattleEvent[] {
        const target = battle.findOnYourField(targetId);
        if (!target) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const n = findCardAbility(cardId)!.numbers;
        const race = this.catalog.getRace(cardId) ?? CardRace.UNDEAD;
        const countAfter = target.addEnergy(race, n.attachEnergy);

        return [
            {type: 'energyAttached', battleCardId: targetId, race, countAfter},
            ...this.spendHandCard(battle, battleCardId, cardId),
        ];
    }

    // 레오닉의 부름 — 덱에서 고른 것을 손패로, 이 카드는 무덤으로, 덱을 섞는다.
    //
    // 무엇을 고를지는 사용자가 정한다. 고른 자리가 함께 온다.
    private useLeonikSummon(
        battle: Battle, battleCardId: number, cardId: number,
        pickedDeckIndexes: readonly number[],
        shuffleSeed?: number,
    ): BattleEvent[] {
        const n = findCardAbility(cardId)!.numbers;
        if (pickedDeckIndexes.length > n.maxPick) {
            return [{type: 'rejected', reason: `${n.maxPick}장까지만 고를 수 있습니다.`}];
        }

        const events: BattleEvent[] = [];
        // 앞에서부터 빼면 뒤엣것의 자리가 밀린다. 뒤에서부터 뺀다.
        const sorted = [...pickedDeckIndexes].sort((a, b) => b - a);
        const pulled: number[] = [];
        for (const index of sorted) {
            const id = battle.removeFromYourDeckAt(index);
            if (id !== null) pulled.push(id);
        }
        // 고른 차례대로 손패에 넣는다.
        for (const id of pulled.reverse()) {
            const newId = battle.issueCardId();
            battle.addToHand(new HandCard(newId, id, [], 0));
            events.push({
                type: 'cardMoved', battleCardId: newId, cardId: id,
                from: 'yourDeck', to: 'hand',
            });
        }

        events.push(...this.spendHandCard(battle, battleCardId, cardId));

        // 고르고 나면 덱을 섞는다. 무엇을 골랐는지가 남은 덱의 순서로 드러나면 안 된다.
        if (shuffleSeed !== undefined) battle.shuffleYourDeck(shuffleSeed);

        return events;
    }

    // 손패의 카드를 필드 전체에 쓴다.
    private useCardOnField(
        battle: Battle, battleCardId: number, side: 'your' | 'opponent',
        pickedDeckIndexes?: readonly number[],
        shuffleSeed?: number,
    ): BattleEvent[] {
        const handCard = battle.findInHand(battleCardId);
        if (!handCard) return [{type: 'rejected', reason: '손패에 없는 카드입니다.'}];

        const cardId = handCard.getCardId();
        const ability = findCardAbility(cardId);
        if (!ability) return [{type: 'rejected', reason: '아직 만들어지지 않은 카드입니다.'}];

        switch (cardId) {
            case DOOM_CONTRACT:
                if (side !== 'opponent') return [{type: 'rejected', reason: '상대 필드에 써야 합니다.'}];
                return this.useDoomContract(battle, battleCardId, cardId);
            case DEAD_LANDS:
                if (side !== 'opponent') return [{type: 'rejected', reason: '상대 필드에 써야 합니다.'}];
                return this.useDeadLands(battle, battleCardId, cardId);
            case SWAMP_OF_DEAD:
                if (side !== 'your') return [{type: 'rejected', reason: '내 필드에 써야 합니다.'}];
                return this.useSwampOfDead(battle, battleCardId, cardId);
            case LEONIK_SUMMON:
                if (side !== 'your') return [{type: 'rejected', reason: '내 필드에 써야 합니다.'}];
                return this.useLeonikSummon(
                    battle, battleCardId, cardId, pickedDeckIndexes ?? [], shuffleSeed,
                );
            default:
                return [{type: 'rejected', reason: '아직 전투가 처리하지 않는 카드입니다.'}];
        }
    }

    // 파멸의 계약 — 상대 유닛 전부와 본체에 피해, 내 덱에서 한 장을 로스트 존으로.
    private useDoomContract(battle: Battle, battleCardId: number, cardId: number): BattleEvent[] {
        const n = findCardAbility(cardId)!.numbers;
        const events: BattleEvent[] = [];

        // 목록이 도는 중에 빠지므로 미리 베껴 둔다.
        for (const unit of [...battle.getOpponentFieldCards()]) {
            const id = unit.getBattleCardId();
            const hpBefore = unit.getHp();
            const hpAfter = unit.setHp(hpBefore - n.damage);
            events.push({
                type: 'damaged',
                target: {kind: 'unit', battleCardId: id},
                amount: n.damage, hpBefore, hpAfter,
            });
            if (hpAfter <= 0) {
                events.push(...this.defeatOpponentUnit(battle, id, unit.getCardId()));
            }
        }

        const masterBefore = battle.getOpponentMasterHp();
        if (masterBefore > 0) {
            const masterAfter = battle.setOpponentMasterHp(masterBefore - n.damage);
            events.push({
                type: 'damaged', target: {kind: 'opponentMaster'},
                amount: n.damage, hpBefore: masterBefore, hpAfter: masterAfter,
            });
            if (masterAfter <= 0) events.push({type: 'defeated', target: {kind: 'opponentMaster'}});
        }

        for (let i = 0; i < n.deckToLostZone; i++) {
            const drawn = battle.drawFromOpponentDeck();
            if (drawn === null) break;
            battle.sendToOpponentLostZone(drawn);
            events.push({
                type: 'cardMoved', battleCardId: -1, cardId: drawn,
                from: 'opponentDeck', to: 'opponentLostZone',
            });
        }

        events.push(...this.spendHandCard(battle, battleCardId, cardId));
        return events;
    }

    // 죽음의 대지 — 상대 필드 에너지를 깎는다.
    private useDeadLands(battle: Battle, battleCardId: number, cardId: number): BattleEvent[] {
        const n = findCardAbility(cardId)!.numbers;
        const before = battle.getOpponentFieldEnergy();
        battle.drainOpponentFieldEnergy(n.fieldEnergyDrain);
        const after = battle.getOpponentFieldEnergy();

        const events: BattleEvent[] = [];
        if (after !== before) {
            events.push({type: 'valueChanged', what: 'opponentFieldEnergy', before, after});
        }
        events.push(...this.spendHandCard(battle, battleCardId, cardId));
        return events;
    }

    // 망자의 늪 — 덱에서 정해진 장수만큼 뽑는다.
    private useSwampOfDead(battle: Battle, battleCardId: number, cardId: number): BattleEvent[] {
        const n = findCardAbility(cardId)!.numbers;
        const events: BattleEvent[] = [];

        for (let i = 0; i < n.drawCount; i++) {
            const drawn = battle.drawFromYourDeck();
            if (drawn === null) break;
            const newId = battle.issueCardId();
            battle.addToHand(new HandCard(newId, drawn, [], 0));
            events.push({
                type: 'cardMoved', battleCardId: newId, cardId: drawn,
                from: 'yourDeck', to: 'hand',
            });
        }

        events.push(...this.spendHandCard(battle, battleCardId, cardId));
        return events;
    }

    // 필드 에너지 하나를 내 유닛에 붙인다.
    //
    // 필드 에너지는 내 턴이 시작될 때마다 하나씩 는 것이고, 그것을 유닛에 옮겨 담는다.
    // 카드를 쓰는 것이 아니므로 손패에서 빠지는 카드가 없다.
    private attachFieldEnergyToUnit(
        battle: Battle, targetId: number, race: CardRace,
    ): BattleEvent[] {
        const target = battle.findOnYourField(targetId);
        if (!target) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const before = battle.getFieldEnergy();
        if (!battle.spendFieldEnergy(1)) {
            return [{type: 'rejected', reason: '쓸 수 있는 필드 에너지가 없습니다.'}];
        }
        const countAfter = target.addEnergy(race, 1);

        return [
            {type: 'valueChanged', what: 'fieldEnergy', before, after: battle.getFieldEnergy()},
            {type: 'energyAttached', battleCardId: targetId, race, countAfter},
        ];
    }

    /* ── 공격과 스킬 ── */
    //
    // 얼마나 때리는지는 밖에서 온다. 무기 힘과 스킬 값을 어떻게 읽는지는
    // 아직 카드 정보 쪽에 있어서, 전투가 그것까지 정하려면 그 길을 먼저 내야 한다.

    // 상대 유닛 하나를 때린다.
    private attackUnit(
        battle: Battle, attackerId: number, targetId: number, damage: number,
    ): BattleEvent[] {
        const blocked = this.blockedReason(battle, attackerId);
        if (blocked) return [{type: 'rejected', reason: blocked}];

        const target = battle.findOnOpponentField(targetId);
        if (!target) return [{type: 'rejected', reason: '상대 필드에 없는 유닛입니다.'}];
        return this.damageOpponentUnit(battle, target.getBattleCardId(), target.getCardId(), damage);
    }

    // 때리는 유닛이 못 움직이면 왜 못 움직이는지를 준다. 움직일 수 있으면 null 이다.
    //
    // 때리는 유닛이 없는 경우도 있다. 카드가 때리는 것이 그렇다. 그때는 안 막는다.
    private blockedReason(battle: Battle, attackerId: number): string | null {
        if (attackerId < 0) return null;
        const attacker = battle.findOnYourField(attackerId);
        if (!attacker) return null;
        if (attacker.isFrozen()) return '얼어 있어 움직일 수 없습니다.';
        if (!battle.canYourUnitAct(attackerId)) return '나온 턴에는 움직일 수 없습니다.';
        return null;
    }

    // 상대 본체를 때린다.
    private attackOpponentMaster(
        battle: Battle, damage: number, attackerId: number = -1,
    ): BattleEvent[] {
        const blocked = this.blockedReason(battle, attackerId);
        if (blocked) return [{type: 'rejected', reason: blocked}];

        const hpBefore = battle.getOpponentMasterHp();
        if (hpBefore <= 0) return [{type: 'rejected', reason: '이미 쓰러진 본체입니다.'}];

        const hpAfter = battle.setOpponentMasterHp(hpBefore - damage);
        const events: BattleEvent[] = [{
            type: 'damaged', target: {kind: 'opponentMaster'},
            amount: damage, hpBefore, hpAfter,
        }];
        if (hpAfter <= 0) events.push({type: 'defeated', target: {kind: 'opponentMaster'}});
        return events;
    }

    // 상대 유닛 전부를 때린다. withMaster 면 본체도 함께 때린다.
    private attackEveryOpponent(
        battle: Battle, damage: number, withMaster: boolean, attackerId: number = -1,
    ): BattleEvent[] {
        const blocked = this.blockedReason(battle, attackerId);
        if (blocked) return [{type: 'rejected', reason: blocked}];

        const events: BattleEvent[] = [];
        // 목록이 도는 중에 빠지므로 미리 베껴 둔다.
        for (const unit of [...battle.getOpponentFieldCards()]) {
            events.push(...this.damageOpponentUnit(
                battle, unit.getBattleCardId(), unit.getCardId(), damage,
            ));
        }
        if (withMaster && battle.getOpponentMasterHp() > 0) {
            events.push(...this.attackOpponentMaster(battle, damage));
        }
        return events;
    }

    // 상대 유닛 하나에 피해를 준다. 쓰러지면 무덤으로 보낸다.
    private damageOpponentUnit(
        battle: Battle, battleCardId: number, cardId: number, damage: number,
    ): BattleEvent[] {
        const unit = battle.findOnOpponentField(battleCardId);
        if (!unit) return [];

        const hpBefore = unit.getHp();
        const hpAfter = unit.setHp(hpBefore - damage);
        const events: BattleEvent[] = [{
            type: 'damaged',
            target: {kind: 'unit', battleCardId},
            amount: damage, hpBefore, hpAfter,
        }];
        if (hpAfter <= 0) {
            events.push(...this.defeatOpponentUnit(battle, battleCardId, cardId));
        }
        return events;
    }

    // 쓴 카드는 무덤으로 간다.
    private spendHandCard(battle: Battle, battleCardId: number, cardId: number): BattleEvent[] {
        battle.removeFromHand(battleCardId);
        battle.sendToYourTomb(cardId);
        return [{type: 'cardMoved', battleCardId, cardId, from: 'hand', to: 'yourTomb'}];
    }

    // 상대 유닛이 쓰러진다. 무덤으로 보내는 것과 필드에서 빼는 것은 한 가지 일이다.
    private defeatOpponentUnit(battle: Battle, battleCardId: number, cardId: number): BattleEvent[] {
        battle.removeFromOpponentField(battleCardId);
        battle.sendToOpponentTomb(cardId);
        return [
            {type: 'defeated', target: {kind: 'unit', battleCardId}},
            {type: 'cardMoved', battleCardId, cardId, from: 'opponentField', to: 'opponentTomb'},
        ];
    }

}
