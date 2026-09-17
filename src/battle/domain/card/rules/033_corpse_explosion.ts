import {CardRule, CardRuleContext, UseOnUnitInput} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {ChoicePick, PendingChoice} from "../../battle/PendingChoice";
import {findCardAbility} from "../../ability/CardAbility";

// 시체 폭발
export const CorpseExplosionRule: CardRule = {
    cardId: 33,

    useOnUnit(ctx: CardRuleContext, input: UseOnUnitInput): BattleEvent[] {
        const {battleCardId, cardId, targetBattleCardId: targetId} = input;

        const sacrificed = ctx.battle.findOnYourField(targetId);
        if (!sacrificed) return [{type: 'rejected', reason: '내 필드에 없는 유닛입니다.'}];

        const race = ctx.catalog.getRace(sacrificed.getCardId());
        const ability = findCardAbility(cardId)!;
        if (race !== ability.targetRace) {
            return [{type: 'rejected', reason: '제물로 바칠 수 없는 유닛입니다.'}];
        }

        return ctx.beginChoice({
            cardId,
            sourceBattleCardId: battleCardId,
            actorBattleCardId: targetId,
            target: 'opponentUnitOrMaster',
            need: ability.numbers.picks,
            picked: [],
        });
    
    },

    resolveChoice(ctx: CardRuleContext, choice: PendingChoice): BattleEvent[] {

        const damage = findCardAbility(choice.cardId)!.numbers.damage;
        const events: BattleEvent[] = [];

        // 제물을 무덤으로 보낸다.
        const sacrificed = ctx.battle.findOnYourField(choice.actorBattleCardId);
        if (sacrificed) {
            ctx.battle.removeFromYourField(choice.actorBattleCardId);
            ctx.battle.sendToYourTomb(sacrificed.getCardId());
            events.push({
                type: 'cardMoved',
                battleCardId: choice.actorBattleCardId,
                cardId: sacrificed.getCardId(),
                from: 'yourField', to: 'yourTomb',
            });
        }

        for (const pick of choice.picked) {
            if (pick.kind === 'opponentMaster') {
                if (ctx.battle.getOpponentMasterHp() > 0) {
                    events.push(...ctx.attackOpponentMaster(damage));
                }
                continue;
            }
            const unit = ctx.battle.findOnOpponentField(pick.battleCardId);
            if (!unit) continue;   // 앞의 발에 이미 쓰러졌다
            events.push(...ctx.damageOpponentUnit(pick.battleCardId, unit.getCardId(), damage,
            ));
        }

        events.push(...ctx.spendHandCard(choice.sourceBattleCardId, choice.cardId));
        return events;
    },

    choiceDamage(_ctx: CardRuleContext, choice: PendingChoice, _pick: ChoicePick): number {
        return findCardAbility(choice.cardId)!.numbers.damage;
    },
};
