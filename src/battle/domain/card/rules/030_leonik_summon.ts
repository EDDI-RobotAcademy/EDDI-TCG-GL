import {CardRule, CardRuleContext, UseOnFieldInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";
import {HandCard} from "../../battle/HandCard";

// 레오닉의 부름
export const LeonikSummonRule: CardRule = {
    cardId: 30,

    useOnField(ctx: CardRuleContext, input: UseOnFieldInput): BattleEvent[] {
        const {battleCardId, cardId, side, pickedDeckIndexes, shuffleSeed} = input;
        // 어느 쪽 필드에 써야 하는지는 이 카드의 규칙이다.
        if (side !== 'your') return [{type: 'rejected', reason: '내 필드에 써야 합니다.'}];

        const n = findCardAbility(cardId)!.numbers;
        if (pickedDeckIndexes.length > n.maxPick) {
            return [{type: 'rejected', reason: `${n.maxPick}장까지만 고를 수 있습니다.`}];
        }

        const events: BattleEvent[] = [];
        // 앞에서부터 빼면 뒤엣것의 자리가 밀린다. 뒤에서부터 뺀다.
        const sorted = [...pickedDeckIndexes].sort((a, b) => b - a);
        const pulled: number[] = [];
        for (const index of sorted) {
            const id = ctx.battle.removeFromYourDeckAt(index);
            if (id !== null) pulled.push(id);
        }
        // 고른 차례대로 손패에 넣는다.
        for (const id of pulled.reverse()) {
            const newId = ctx.battle.issueCardId();
            ctx.battle.addToHand(new HandCard(newId, id, [], 0));
            events.push({
                type: 'cardMoved', battleCardId: newId, cardId: id,
                from: 'yourDeck', to: 'hand',
            });
        }

        events.push(...ctx.spendHandCard(battleCardId, cardId));

        // 고르고 나면 덱을 섞는다. 무엇을 골랐는지가 남은 덱의 순서로 드러나면 안 된다.
        if (shuffleSeed !== undefined) ctx.battle.shuffleYourDeck(shuffleSeed);

        return events;
    
    },
};
