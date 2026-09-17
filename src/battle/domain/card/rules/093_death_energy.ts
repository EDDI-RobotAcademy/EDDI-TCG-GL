import {CardRule, CardRuleContext, UseOnUnitInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";
import {CardRace} from "../../../../card/race";

// 죽음의 에너지
export const DeathEnergyRule: CardRule = {
    cardId: 93,

    useOnUnit(ctx: CardRuleContext, input: UseOnUnitInput): BattleEvent[] {
        const {battleCardId, cardId, targetBattleCardId: targetId} = input;

        const target = ctx.battle.findOnYourField(targetId);
        if (!target) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const n = findCardAbility(cardId)!.numbers;
        const race = ctx.catalog.getRace(cardId) ?? CardRace.UNDEAD;
        const countAfter = target.addEnergy(race, n.attachEnergy);

        return [
            {type: 'energyAttached', battleCardId: targetId, race, countAfter},
            ...ctx.spendHandCard(battleCardId, cardId),
        ];
    
    },
};
