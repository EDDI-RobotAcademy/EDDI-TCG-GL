import {CardRule, CardRuleContext, UseOnFieldInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";

// 파멸의 계약
export const DoomContractRule: CardRule = {
    cardId: 25,

    useOnField(ctx: CardRuleContext, input: UseOnFieldInput): BattleEvent[] {
        const {battleCardId, cardId, side, pickedDeckIndexes, shuffleSeed} = input;
        // 어느 쪽 필드에 써야 하는지는 이 카드의 규칙이다.
        if (side !== 'opponent') return [{type: 'rejected', reason: '상대 필드에 써야 합니다.'}];

        const n = findCardAbility(cardId)!.numbers;
        const events: BattleEvent[] = [];

        // 목록이 도는 중에 빠지므로 미리 베껴 둔다.
        for (const unit of [...ctx.battle.getOpponentFieldCards()]) {
            const id = unit.getBattleCardId();
            const hpBefore = unit.getHp();
            const hpAfter = unit.setHp(hpBefore - n.damage);
            events.push({
                type: 'damaged',
                target: {kind: 'unit', battleCardId: id},
                amount: n.damage, hpBefore, hpAfter,
            });
            if (hpAfter <= 0) {
                events.push(...ctx.defeatOpponentUnit(id, unit.getCardId()));
            }
        }

        const masterBefore = ctx.battle.getOpponentMasterHp();
        if (masterBefore > 0) {
            const masterAfter = ctx.battle.setOpponentMasterHp(masterBefore - n.damage);
            events.push({
                type: 'damaged', target: {kind: 'opponentMaster'},
                amount: n.damage, hpBefore: masterBefore, hpAfter: masterAfter,
            });
            if (masterAfter <= 0) events.push({type: 'defeated', target: {kind: 'opponentMaster'}});
        }

        for (let i = 0; i < n.deckToLostZone; i++) {
            const drawn = ctx.battle.drawFromOpponentDeck();
            if (drawn === null) break;
            ctx.battle.sendToOpponentLostZone(drawn);
            events.push({
                type: 'cardMoved', battleCardId: -1, cardId: drawn,
                from: 'opponentDeck', to: 'opponentLostZone',
            });
        }

        events.push(...ctx.spendHandCard(battleCardId, cardId));
        return events;
    
    },
};
