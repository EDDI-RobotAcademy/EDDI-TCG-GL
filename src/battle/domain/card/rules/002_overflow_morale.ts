import {CardRule, CardRuleContext, UseOnUnitInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";
import {CardRace} from "../../../../card/race";

// 넘쳐 흐르는 사기
export const OverflowMoraleRule: CardRule = {
    cardId: 2,

    useOnUnit(ctx: CardRuleContext, input: UseOnUnitInput): BattleEvent[] {
        const {battleCardId, cardId, targetBattleCardId: targetId} = input;

        const target = ctx.battle.findOnYourField(targetId);
        if (!target) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const n = findCardAbility(cardId)!.numbers;
        const pulled = ctx.battle.drawMatchingFromYourDeck(n.pullCardId, n.maxPull);

        const race = ctx.catalog.getRace(n.pullCardId) ?? CardRace.UNDEAD;
        const events: BattleEvent[] = [];
        for (const energyId of pulled) {
            const countAfter = target.addEnergy(race, 1);
            events.push({
                type: 'energyAttached', battleCardId: targetId, race,
                countAfter, totalAfter: target.getEnergyCount(),
            });
            // 쓴 에너지 카드는 무덤으로 간다.
            ctx.battle.sendToYourTomb(energyId);
            events.push({
                type: 'cardMoved', battleCardId: -1, cardId: energyId,
                from: 'yourDeck', to: 'yourTomb',
            });
        }

        events.push(...ctx.spendHandCard(battleCardId, cardId));
        return events;
    
    },
};
