import {Battle} from "../domain/Battle";
import {HandCard} from "../domain/HandCard";
import {FieldCard} from "../domain/FieldCard";
import {CardKind} from "../../card/kind";
import {CardGrade} from "../../card/grade";
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
}

// 전투가 지금 처리하는 카드들. 값으로 다 적히는 것부터 옮겼다.
const SCYTHE = 8;
const MORALE_CONVERT = 35;
const DOOM_CONTRACT = 25;
const DEAD_LANDS = 36;
const SWAMP_OF_DEAD = 20;

// 사용자가 한 일 하나를 받아 끝까지 처리하고, 무슨 일이 일어났는지 차례대로 돌려준다.
//
// 되는지 안 되는지도 여기서 판단한다. 부르는 쪽은 하나만 보내고 돌려받은 것만 본다.
export class BattleCommandHandler {
    constructor(private readonly catalog: CardCatalog) {}

    handle(battle: Battle, command: BattleCommand): BattleEvent[] {
        switch (command.type) {
            case 'drawCard':
                return this.drawCard(battle);
            case 'playCardToField':
                return this.playCardToField(battle, command.battleCardId);
            case 'useCardOnUnit':
                return this.useCardOnUnit(battle, command.battleCardId, command.targetBattleCardId);
            case 'useCardOnField':
                return this.useCardOnField(battle, command.battleCardId, command.side);
            case 'attackUnit':
                return this.attackUnit(battle, command.targetBattleCardId, command.damage);
            case 'attackOpponentMaster':
                return this.attackOpponentMaster(battle, command.damage);
            case 'attackEveryOpponentUnit':
                return this.attackEveryOpponent(battle, command.damage, false);
            case 'attackEveryOpponent':
                return this.attackEveryOpponent(battle, command.damage, true);
        }
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
            0,
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

    // 손패의 카드를 필드 전체에 쓴다.
    private useCardOnField(
        battle: Battle, battleCardId: number, side: 'your' | 'opponent',
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

    /* ── 공격과 스킬 ── */
    //
    // 얼마나 때리는지는 밖에서 온다. 무기 힘과 스킬 값을 어떻게 읽는지는
    // 아직 카드 정보 쪽에 있어서, 전투가 그것까지 정하려면 그 길을 먼저 내야 한다.

    // 상대 유닛 하나를 때린다.
    private attackUnit(battle: Battle, targetId: number, damage: number): BattleEvent[] {
        const target = battle.findOnOpponentField(targetId);
        if (!target) return [{type: 'rejected', reason: '상대 필드에 없는 유닛입니다.'}];
        return this.damageOpponentUnit(battle, target.getBattleCardId(), target.getCardId(), damage);
    }

    // 상대 본체를 때린다.
    private attackOpponentMaster(battle: Battle, damage: number): BattleEvent[] {
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
        battle: Battle, damage: number, withMaster: boolean,
    ): BattleEvent[] {
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
