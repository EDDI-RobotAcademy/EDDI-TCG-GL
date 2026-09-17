import {CardRule, CardRuleContext, UseOnUnitInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";

// 한 번에 빨아낼 수 있는 최대 개수
const MAX_DRAIN = 2;

// 에너지 번
export const EnergyBurnRule: CardRule = {
    cardId: 9,

    useOnUnit(ctx: CardRuleContext, input: UseOnUnitInput): BattleEvent[] {
        const {battleCardId, cardId, targetBattleCardId: targetId} = input;

        const target = ctx.battle.findOnOpponentField(targetId);
        if (!target) return [{type: 'rejected', reason: '상대 필드에 없는 유닛입니다.'}];

        const perMissing = findCardAbility(cardId)!.numbers.perMissingEnergyDamage;

        const energyBefore = target.getEnergyCount();
        const drained = Math.min(MAX_DRAIN, energyBefore);
        const energyAfter = energyBefore - drained;
        if (drained > 0) target.drainEnergy(drained);

        const events: BattleEvent[] = [];
        if (drained > 0) {
            events.push({
                type: 'energyDrained', battleCardId: targetId,
                amount: drained, countAfter: energyAfter,
            });
        }

        const damage = (MAX_DRAIN - drained) * perMissing;
        if (damage > 0) {
            events.push(...ctx.damageOpponentUnit(targetId, target.getCardId(), damage));
        }

        events.push(...ctx.spendHandCard(battleCardId, cardId));
        return events;
    
    },
};
