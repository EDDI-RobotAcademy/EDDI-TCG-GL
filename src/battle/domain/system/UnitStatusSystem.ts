import {FieldCard} from "../battle/FieldCard";
import {findCardAbility} from "../ability/CardAbility";
import {BattleEvent} from "../flow/BattleEvent";

// 유닛에 붙은 상태를 훑는 규칙이다.
//
// 카드를 안 본다. 필드에 선 유닛이 지닌 표시만 보고 돈다. 어느 카드를 썼든 표시가
// 붙어 있으면 돌고, 안 붙어 있으면 안 돈다.
//
// 그래서 카드 한 장씩 처리하는 곳과 성격이 다르다. 카드 처리는 [죽음의 낫을 쓰면
// 이렇게 된다] 이고, 여기는 [암흑 화염이 붙어 있으면 턴마다 이렇게 된다] 다.
// 카드가 백 장 이백 장 늘어도 여기는 안 늘고, 새 상태가 생길 때만 는다.

// 차갑게 불타는 암흑 에너지. 암흑 화염이 턴마다 깎는 양이 이 카드에 적혀 있다.
const COLD_DARK_ENERGY = 151;

// 암흑 화염이 붙은 유닛 하나가 이번 턴에 받을 몫이다.
export interface DarkFlameTick {
    readonly battleCardId: number;
    readonly cardId: number;
    readonly damage: number;
}

// 암흑 화염이 붙은 유닛과 각자 깎일 양을 낸다.
//
// 여기서 깎지 않는다. 깎는 일에는 쓰러뜨리기와 무덤으로 보내기가 딸려 있고, 그것은
// 암흑 화염만의 일이 아니라 맞는 모든 경우에 같다. 그래서 부르는 쪽에 둔다.
export function darkFlameTicks(units: readonly FieldCard[]): DarkFlameTick[] {
    const damage = findCardAbility(COLD_DARK_ENERGY)?.numbers.darkFlameTurnDamage ?? 0;
    if (damage <= 0) return [];

    return units
        .filter((unit) => unit.hasDarkFlame())
        .map((unit) => ({
            battleCardId: unit.getBattleCardId(),
            cardId: unit.getCardId(),
            damage,
        }));
}

// 얼어 있던 유닛을 푼다.
//
// 푼 유닛은 이번 턴에 다시 안 언다. 안 그러면 얼리는 카드를 쥔 쪽이 상대를 한 번도
// 못 움직이게 묶어 둘 수 있다.
export function thawFrozenUnits(units: readonly FieldCard[]): BattleEvent[] {
    const events: BattleEvent[] = [];
    for (const unit of units) {
        if (!unit.isFrozen()) {
            unit.clearFreezeImmune();
            continue;
        }
        unit.thaw();
        events.push({
            type: 'statusCleared',
            battleCardId: unit.getBattleCardId(),
            what: 'frozen',
        });
    }
    return events;
}

// 차갑게 불타는 암흑 에너지를 지닌 유닛이 때리면 맞은 쪽에 암흑 화염과 빙결이 따라붙는다.
//
// 한 번 붙이고 끝이 아니라 그 유닛이 때릴 때마다 따라붙는다. 그래서 때리는 카드마다
// 따로 적지 않고 여기 한 곳에 둔다.
export function carryColdDark(
    attacker: FieldCard | null,
    target: FieldCard | null,
): BattleEvent[] {
    if (!attacker?.hasColdDarkEnergy()) return [];
    if (!target) return [];

    target.setDarkFlame(true);
    const froze = target.freeze();
    return [{
        type: 'coldDarkCarried',
        battleCardId: target.getBattleCardId(),
        darkFlame: true,
        frozen: froze,
    }];
}
