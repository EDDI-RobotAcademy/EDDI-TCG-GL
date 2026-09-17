import {CardRule, CardRuleContext, UseOnUnitInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";
import {CardGrade} from "../../../../card/grade";

// 죽음의 낫
export const ScytheRule: CardRule = {
    cardId: 8,

    useOnUnit(ctx: CardRuleContext, input: UseOnUnitInput): BattleEvent[] {
        const {battleCardId, cardId, targetBattleCardId: targetId} = input;

        const target = ctx.battle.findOnOpponentField(targetId);
        if (!target) return [{type: 'rejected', reason: '상대 필드에 없는 유닛입니다.'}];

        const isMythic = ctx.catalog.getGrade(target.getCardId()) === CardGrade.MYTHICAL;
        const hpBefore = target.getHp();
        const damage = isMythic ? findCardAbility(cardId)!.numbers.mythicDamage : hpBefore;
        const hpAfter = target.setHp(hpBefore - damage);

        const events: BattleEvent[] = [{
            type: 'damaged',
            target: {kind: 'unit', battleCardId: targetId},
            amount: damage, hpBefore, hpAfter,
        }];
        if (hpAfter <= 0) {
            events.push(...ctx.defeatOpponentUnit(targetId, target.getCardId()));
        }
        events.push(...ctx.spendHandCard(battleCardId, cardId));
        return events;
    
    },
};
