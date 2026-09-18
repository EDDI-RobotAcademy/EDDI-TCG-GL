import {CardRule, CardRuleContext, ReadOnlyCardContext} from "../CardRule";
import {BattleEvent} from "../../flow/BattleEvent";
import {ChoicePick, PendingChoice} from "../../battle/PendingChoice";
import {findCardAbility} from "../../ability/CardAbility";
import {carryColdDark} from "../../system/UnitStatusSystem";

// 네더 블레이드
const NETHER_BLADE = 19;

export const NetherBladeRule: CardRule = {
    cardId: 19,

    onDeploy(ctx: CardRuleContext, battleCardId: number): BattleEvent[] {
        const n = findCardAbility(NETHER_BLADE)!.numbers;
        const events: BattleEvent[] = [];

        // 첫 패시브 — 상대 유닛 전부. 본체는 안 친다.
        for (const target of [...ctx.battle.getOpponentFieldCards()]) {
            const id = target.getBattleCardId();
            const hit = ctx.damageOpponentUnit(id, target.getCardId(), n.passive1Damage);
            events.push(...hit);
            // 패시브도 이 유닛의 공격이다. 살아남은 쪽에 따라붙는다.
            if (!ctx.wasDefeated(hit, id)) {
                events.push(...carryColdDark(ctx.battle.findOnYourField(battleCardId), ctx.battle.findOnOpponentField(id)));
            }
        }

        // 둘째 패시브 — 남은 것 중 하나를 고르라고 기다린다.
        // 칠 것이 아무것도 없으면 묻지 않는다.
        const hasUnit = ctx.battle.getOpponentFieldCount() > 0;
        const hasMaster = ctx.battle.getOpponentMasterHp() > 0;
        if (!hasUnit && !hasMaster) return events;

        events.push(...ctx.beginChoice({
            cardId: NETHER_BLADE,
            // 손패에서 온 카드가 아니다. 이미 필드에 선 유닛의 능력이다
            sourceBattleCardId: -1,
            actorBattleCardId: battleCardId,
            target: 'opponentUnitOrMaster',
            need: 1,
            picked: [],
        }));
        return events;
    
    },

    resolveChoice(ctx: CardRuleContext, choice: PendingChoice): BattleEvent[] {

        const damage = findCardAbility(NETHER_BLADE)!.numbers.passive2Damage;
        const pick = choice.picked[0];
        if (!pick) return [];

        if (pick.kind === 'opponentMaster') {
            if (ctx.battle.getOpponentMasterHp() <= 0) return [];
            return ctx.attackOpponentMaster(damage);
        }

        const unit = ctx.battle.findOnOpponentField(pick.battleCardId);
        if (!unit) return [];
        const events = ctx.damageOpponentUnit(pick.battleCardId, unit.getCardId(), damage,
        );
        if (!ctx.wasDefeated(events, pick.battleCardId)) {
            events.push(...carryColdDark(ctx.battle.findOnYourField(choice.actorBattleCardId),
                                    ctx.battle.findOnOpponentField(pick.battleCardId)));
        }
        return events;
    },

    choiceDamage(_ctx: ReadOnlyCardContext, _choice: PendingChoice, _pick: ChoicePick): number {
        return findCardAbility(NETHER_BLADE)!.numbers.passive2Damage;
    },
};
