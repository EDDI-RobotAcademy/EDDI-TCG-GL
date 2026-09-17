import {CardRule, CardRuleContext, UseOnUnitInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {findCardAbility} from "../../ability/CardAbility";
import {CardRace} from "../../../../card/race";

// 차갑게 불타는 암흑 에너지
export const ColdDarkEnergyRule: CardRule = {
    cardId: 151,

    useOnUnit(ctx: CardRuleContext, input: UseOnUnitInput): BattleEvent[] {
        const {battleCardId, cardId, targetBattleCardId: targetId} = input;

        const target = ctx.battle.findOnYourField(targetId);
        if (!target) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const n = findCardAbility(cardId)!.numbers;
        const race = ctx.catalog.getRace(cardId) ?? CardRace.UNDEAD;
        const countAfter = target.addEnergy(race, n.attachEnergy);

        // 차갑게 불타는 암흑 에너지는 에너지 하나를 붙이는 데서 끝나지 않는다.
        // 이 유닛이 앞으로 때릴 때마다 맞은 쪽에 암흑 화염과 빙결이 따라붙는다.
        target.setColdDarkEnergy(true);

        return [
            {type: 'energyAttached', battleCardId: targetId, race, countAfter},
            ...ctx.spendHandCard(battleCardId, cardId),
        ];
    
    },
};
