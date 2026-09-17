import {CardRule, CardRuleContext, UseOnFieldInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";
import {HandCard} from "../../battle/HandCard";

// 망자의 늪
export const SwampOfDeadRule: CardRule = {
    cardId: 20,

    useOnField(ctx: CardRuleContext, input: UseOnFieldInput): BattleEvent[] {
        const {battleCardId, cardId, side, pickedDeckIndexes, shuffleSeed} = input;
        // 어느 쪽 필드에 써야 하는지는 이 카드의 규칙이다.
        if (side !== 'your') return [{type: 'rejected', reason: '내 필드에 써야 합니다.'}];

        const n = findCardAbility(cardId)!.numbers;
        const events: BattleEvent[] = [];

        for (let i = 0; i < n.drawCount; i++) {
            const drawn = ctx.battle.drawFromYourDeck();
            if (drawn === null) break;
            const newId = ctx.battle.issueCardId();
            ctx.battle.addToHand(new HandCard(newId, drawn, [], 0));
            events.push({
                type: 'cardMoved', battleCardId: newId, cardId: drawn,
                from: 'yourDeck', to: 'hand',
            });
        }

        events.push(...ctx.spendHandCard(battleCardId, cardId));
        return events;
    
    },
};
