import {CardRule, CardRuleContext, UseOnUnitInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";

// 사기 전환
export const MoraleConvertRule: CardRule = {
    cardId: 35,

    useOnUnit(ctx: CardRuleContext, input: UseOnUnitInput): BattleEvent[] {
        const {battleCardId, cardId, targetBattleCardId: targetId} = input;

        const target = ctx.battle.findOnYourField(targetId);
        if (!target) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const divisor = findCardAbility(cardId)!.numbers.hpDividedBy;
        const gain = Math.floor(ctx.catalog.getHp(target.getCardId()) / divisor);

        const before = ctx.battle.getFieldEnergy();
        const after = ctx.battle.gainFieldEnergy(gain);

        const events: BattleEvent[] = [];
        ctx.battle.removeFromYourField(targetId);
        ctx.battle.sendToYourTomb(target.getCardId());
        events.push({
            type: 'cardMoved',
            battleCardId: targetId, cardId: target.getCardId(),
            from: 'yourField', to: 'yourTomb',
        });
        if (after !== before) {
            events.push({type: 'valueChanged', what: 'fieldEnergy', before, after});
        }
        events.push(...ctx.spendHandCard(battleCardId, cardId));
        return events;
    
    },
};
