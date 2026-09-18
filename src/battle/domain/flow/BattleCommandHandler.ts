import {Battle} from "../battle/Battle";
import {HandCard} from "../battle/HandCard";
import {FieldCard} from "../battle/FieldCard";
import {CardKind} from "../../../card/kind";
import {CardGrade} from "../../../card/grade";
import {CardRace} from "../../../card/race";
import {SkillType} from "../../../card/SkillType";
import {findCardAbility} from "../ability/CardAbility";
import {AttackChoice, BattleCommand} from "./BattleCommand";
import {ChoicePick, PendingChoice, isChoiceComplete, remainingPicks} from "../battle/PendingChoice";
import {BattleEvent} from "./BattleEvent";
import {CardRuleContext} from "../card/CardRule";
import {findCardRule} from "../card/CardRegistry";
import {CardCatalog, CardSkillSpec} from "../ability/CardCatalog";
export {CardCatalog, CardSkillSpec};
import {darkFlameTicks, thawFrozenUnits, carryColdDark}
    from "../system/UnitStatusSystem";

export class BattleCommandHandler {
    constructor(private readonly catalog: CardCatalog) {}

    // 고른 공격이 얼마나 아픈가. 필드에 선 유닛에서 카드를 찾아 값을 읽는다.
    private chosenAttackDamage(battle: Battle, attackerId: number, attack: AttackChoice): number {
        const cardId = battle.findOnYourField(attackerId)?.getCardId();
        if (cardId === undefined) return 0;
        return this.attackDamage(cardId, attack === 'general' ? null : attack);
    }

    // 고른 공격이 본체까지 가는가.
    private reachesMaster(battle: Battle, attackerId: number, attack: AttackChoice): boolean {
        const cardId = battle.findOnYourField(attackerId)?.getCardId();
        if (cardId === undefined) return false;
        return this.attackRange(cardId, attack === 'general' ? null : attack) === SkillType.EveryField;
    }

    // 이 공격이 얼마나 아픈가.
    //
    // 지금은 카드에 적힌 값이 그대로 답이다. 붙은 것이 생기면 여기서 그 값들을 더해
    // 계산하게 된다. 최종값을 어디에 저장하지는 않는다.
    //
    // 밖으로 열지 않는다. 열어 두면 화면이 이 값을 받아 명령에 다시 실어 보내는 길이 생긴다.
    private attackDamage(cardId: number, slot: 1 | 2 | null): number {
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
            case 'triggerDeployPassive':
                return this.triggerDeployPassive(battle, command.battleCardId);
            case 'pickChoiceTarget':
                return this.pickChoiceTarget(battle, command.pick);
            case 'cancelChoice':
                return this.cancelChoice(battle);
            case 'attackUnit':
                return this.attackUnit(
                    battle, command.attackerBattleCardId, command.targetBattleCardId,
                    this.chosenAttackDamage(battle, command.attackerBattleCardId, command.attack),
                );
            case 'attackOpponentMaster':
                return this.attackOpponentMaster(
                    battle,
                    this.chosenAttackDamage(battle, command.attackerBattleCardId, command.attack),
                    command.attackerBattleCardId,
                );
            case 'attackEveryOpponent':
                return this.attackEveryOpponent(
                    battle,
                    this.chosenAttackDamage(battle, command.attackerBattleCardId, command.attack),
                    this.reachesMaster(battle, command.attackerBattleCardId, command.attack),
                    command.attackerBattleCardId,
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

        // 고르던 중에 턴이 끝났으면 그만둔다. 아무 일도 안 일어난 것으로 둔다.
        // 전에는 화면이 제 손으로 취소했고 전투는 그런 일이 있었는지도 몰랐다.
        const events: BattleEvent[] = [...this.cancelChoice(battle)];
        events.push({type: 'turnPassed', to: 'opponent'});
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
        events.push(...thawFrozenUnits(battle.getOpponentFieldCards()));
        events.push(...this.drawCard(battle));
        return events;
    }

    // 암흑 화염이 붙은 유닛이 깎인다. 0 이 되면 무덤으로 간다.
    //
    // 누가 얼마 맞는지는 상태 규칙이 낸다. 여기서는 깎기만 한다. 깎는 일에는
    // 쓰러뜨리기와 무덤으로 보내기가 딸려 있고 그것은 맞는 모든 경우에 같다.
    private settleDarkFlame(battle: Battle): BattleEvent[] {
        const events: BattleEvent[] = [];
        // 도는 중에 빠지므로 미리 베껴 둔다.
        for (const tick of darkFlameTicks([...battle.getOpponentFieldCards()])) {
            events.push(...this.damageOpponentUnit(
                battle, tick.battleCardId, tick.cardId, tick.damage,
            ));
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

        const rule = findCardRule(cardId);
        if (!rule?.useOnUnit) {
            return [{type: 'rejected', reason: '아직 전투가 처리하지 않는 카드입니다.'}];
        }
        return rule.useOnUnit(this.ruleContext(battle), {
            battleCardId, cardId, targetBattleCardId,
        });
    }

    // 이 카드가 필드에 나왔다. 나올 때 터지는 것이 있으면 그 카드의 규칙이 돈다.
    private triggerDeployPassive(battle: Battle, battleCardId: number): BattleEvent[] {
        const unit = battle.findOnYourField(battleCardId);
        if (!unit) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const rule = findCardRule(unit.getCardId());
        if (!rule?.onDeploy) return [];
        return rule.onDeploy(this.ruleContext(battle), battleCardId);
    }

    // 카드 규칙이 쓸 수 있는 것을 모아 건넨다.
    //
    // 처리기 자신을 넘기지 않는다. 넘기면 카드가 아무거나 부를 수 있게 되고, 갈림길을
    // 파일로 흩어 놓은 것이 될 뿐이다. 여기 적힌 것이 곧 [카드가 할 수 있는 일] 이다.
    private ruleContext(battle: Battle): CardRuleContext {
        return {
            battle,
            catalog: this.catalog,
            spendHandCard: (id, cardId) => this.spendHandCard(battle, id, cardId),
            damageOpponentUnit: (id, cardId, damage) =>
                this.damageOpponentUnit(battle, id, cardId, damage),
            defeatOpponentUnit: (id, cardId) => this.defeatOpponentUnit(battle, id, cardId),
            attackOpponentMaster: (damage, attackerId) =>
                this.attackOpponentMaster(battle, damage, attackerId),
            beginChoice: (choice) => this.beginChoice(battle, choice),
            wasDefeated: (events, id) => this.wasDefeated(events, id),
        };
    }

    // 고르라고 기다리기 시작한다. 카드 규칙이 부른다.
    private beginChoice(battle: Battle, choice: PendingChoice): BattleEvent[] {
        battle.beginChoice(choice);
        return [{
            type: 'choiceStarted',
            cardId: choice.cardId,
            remaining: remainingPicks(choice),
        }];
    }

    // 하나를 받는다. 다 골랐으면 그 카드의 규칙이 돈다.
    private pickChoiceTarget(battle: Battle, pick: ChoicePick): BattleEvent[] {
        const choice = battle.recordPick(pick);
        if (!choice) return [{type: 'rejected', reason: '지금 고르라고 기다리는 것이 없습니다.'}];

        if (!isChoiceComplete(choice)) {
            return [{
                type: 'choicePicked',
                cardId: choice.cardId,
                remaining: remainingPicks(choice),
            }];
        }

        const events: BattleEvent[] = [{
            type: 'choicePicked', cardId: choice.cardId, remaining: 0,
        }];
        battle.endChoice();
        // 여기서부터는 그 카드의 규칙이다. 손패 카드를 무덤으로 보내는 것도 각 카드가 정한다
        events.push(...this.resolveChoice(battle, choice));
        return events;
    }

    // 고르던 것을 그만둔다. 아무 일도 안 일어난 것으로 둔다.
    private cancelChoice(battle: Battle): BattleEvent[] {
        const was = battle.endChoice();
        if (!was) return [];
        return [{type: 'choiceCancelled', cardId: was.cardId}];
    }

    // 다 고른 뒤 그 카드의 규칙을 돌린다.
    private resolveChoice(battle: Battle, choice: PendingChoice): BattleEvent[] {
        const rule = findCardRule(choice.cardId);
        if (!rule?.resolveChoice) {
            return [{type: 'rejected', reason: '아직 전투가 처리하지 않는 카드입니다.'}];
        }
        return rule.resolveChoice(this.ruleContext(battle), choice);
    }

    // 지금 기다리는 고르기에서 이것을 고르면 쓰러지는가.
    //
    // 연출을 시작하기 전에 알아야 한다. 죽는 일격이면 갈라진 카드를 안 되돌려서, 조각이
    // 흩어진 자리가 그대로 사망이 된다. 연출 뒤에 알면 카드가 깜빡인다.
    wouldDefeat(battle: Battle, pick: ChoicePick): boolean {
        const choice = battle.getPendingChoice();
        if (!choice || pick.kind !== 'opponentUnit') return false;

        const unit = battle.findOnOpponentField(pick.battleCardId);
        if (!unit) return false;

        const rule = findCardRule(choice.cardId);
        if (!rule?.choiceDamage) return false;
        const damage = rule.choiceDamage(this.ruleContext(battle), choice, pick);
        return unit.getHp() - damage <= 0;
    }

    // 낸 유닛의 패시브를 터뜨린다.
    //
    // 지금은 네더 블레이드만 이런 카드다. 첫 패시브가 상대 전원을 치고, 그 결과를 본 뒤에
    // 사용자가 하나를 고르라고 기다린다. 능력이 능력을 부르는 모양이다.
    // 네더 블레이드 둘째 패시브 — 고른 하나를 친다.
    // 시체 폭발을 쓴다. 제물을 받고, 적을 몇 번 더 고르라고 기다리기 시작한다.
    //
    // 제물은 아직 필드에 둔다. 고르는 동안 자리에 서 있어야 하고, 고르다 그만두면
    // 아무 일도 안 일어난 것이 되어야 한다.
    // 시체 폭발 — 아군 언데드를 제물로 바치고 고른 적 둘을 때린다.
    //
    // 제물은 고르는 내내 필드에 서 있다가 여기서 무덤으로 간다. 같은 적을 두 번 골랐으면
    // 그쪽이 두 번 맞는다.
    //
    // 피해량은 카드 능력에 적힌 고정값이다. 제물이 누구든 같다.
    // 카드 설명에는 [제물의 현재 체력만큼] 이라고 적혀 있지만 설명 쪽이 낡았다 (R2-105 에서 확인).
    // 에너지 번 — 상대 유닛에 붙은 에너지를 최대 둘 없앤다.
    //
    // 못 없앤 만큼이 피해가 된다. 둘 다 있으면 피해 없음, 하나면 한 번치, 없으면 두 번치다.
    // 사용자에게 묻는 것은 대상 하나뿐이다. 어느 에너지를 없앨지는 안 묻는다.
    // 죽음의 낫 — 신화 미만이면 즉사, 신화면 정해진 만큼 피해.
    // 사기 전환 — 아군 하나를 무덤으로 보내고 그 체력을 나눈 만큼 필드 에너지를 얻는다.
    // 넘쳐 흐르는 사기 — 덱에서 정해진 카드를 꺼내 유닛에 붙인다.
    // 에너지 카드를 유닛에 붙인다. 붙는 종족은 그 카드의 종족이다.
    // 레오닉의 부름 — 덱에서 고른 것을 손패로, 이 카드는 무덤으로, 덱을 섞는다.
    //
    // 무엇을 고를지는 사용자가 정한다. 고른 자리가 함께 온다.
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

        const rule = findCardRule(cardId);
        if (!rule?.useOnField) {
            return [{type: 'rejected', reason: '아직 전투가 처리하지 않는 카드입니다.'}];
        }
        return rule.useOnField(this.ruleContext(battle), {
            battleCardId, cardId, side,
            pickedDeckIndexes: pickedDeckIndexes ?? [],
            shuffleSeed,
        });
    }

    // 파멸의 계약 — 상대 유닛 전부와 본체에 피해, 내 덱에서 한 장을 로스트 존으로.
    // 죽음의 대지 — 상대 필드 에너지를 깎는다.
    // 망자의 늪 — 덱에서 정해진 장수만큼 뽑는다.
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
            {type: 'energyAttached', battleCardId: targetId, race,
             countAfter, totalAfter: target.getEnergyCount()},
        ];
    }

    /* ── 공격과 스킬 ── */
    // 상대 유닛 하나를 때린다.
    // 차갑게 불타는 암흑 에너지를 지닌 유닛이 때리면 맞은 쪽에 따라붙는다.
    //
    // 암흑 화염은 맞을 때마다 다시 붙는다. 빙결은 방금 풀린 유닛에는 안 붙는다.
    private attackUnit(
        battle: Battle, attackerId: number, targetId: number, damage: number,
    ): BattleEvent[] {
        const blocked = this.blockedReason(battle, attackerId);
        if (blocked) return [{type: 'rejected', reason: blocked}];

        const target = battle.findOnOpponentField(targetId);
        if (!target) return [{type: 'rejected', reason: '상대 필드에 없는 유닛입니다.'}];

        const events = this.damageOpponentUnit(
            battle, target.getBattleCardId(), target.getCardId(), damage,
        );
        // 살아남은 경우에만 따라붙는다. 쓰러졌으면 이미 필드를 떠났다.
        if (!this.wasDefeated(events, targetId)) {
            events.push(...carryColdDark(battle.findOnYourField(attackerId), battle.findOnOpponentField(targetId)));
        }
        return events;
    }

    // 이 일어난 일 묶음에서 그 유닛이 쓰러졌는가.
    private wasDefeated(events: readonly BattleEvent[], battleCardId: number): boolean {
        return events.some(
            (ev) => ev.type === 'defeated'
                && ev.target.kind === 'unit'
                && ev.target.battleCardId === battleCardId,
        );
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
            const id = unit.getBattleCardId();
            const hit = this.damageOpponentUnit(battle, id, unit.getCardId(), damage);
            events.push(...hit);
            // 광역기도 이 유닛의 공격이다. 살아남은 쪽에 따라붙는다.
            if (!this.wasDefeated(hit, id)) {
                events.push(...carryColdDark(battle.findOnYourField(attackerId), battle.findOnOpponentField(id)));
            }
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
