import {CardRule, CardRuleContext, UseOnFieldInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";

// 죽음의 대지
export const DeadLandsRule: CardRule = {
    cardId: 36,

    useOnField(ctx: CardRuleContext, input: UseOnFieldInput): BattleEvent[] {
        const {battleCardId, cardId, side, pickedDeckIndexes, shuffleSeed} = input;
        // 어느 쪽 필드에 써야 하는지는 이 카드의 규칙이다.
        if (side !== 'opponent') return [{type: 'rejected', reason: '상대 필드에 써야 합니다.'}];

        const n = findCardAbility(cardId)!.numbers;
        const before = ctx.battle.getOpponentFieldEnergy();
        ctx.battle.drainOpponentFieldEnergy(n.fieldEnergyDrain);
        const after = ctx.battle.getOpponentFieldEnergy();

        const events: BattleEvent[] = [];
        if (after !== before) {
            events.push({type: 'valueChanged', what: 'opponentFieldEnergy', before, after});
        }
        events.push(...ctx.spendHandCard(battleCardId, cardId));
        return events;
    
    },
};
