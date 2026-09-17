import {CardRule} from "./CardRule";

import {OverflowMoraleRule}  from "./rules/002_overflow_morale";
import {ScytheRule}          from "./rules/008_scythe";
import {EnergyBurnRule}      from "./rules/009_energy_burn";
import {NetherBladeRule}     from "./rules/019_nether_blade";
import {SwampOfDeadRule}     from "./rules/020_swamp_of_dead";
import {DoomContractRule}    from "./rules/025_doom_contract";
import {LeonikSummonRule}    from "./rules/030_leonik_summon";
import {CorpseExplosionRule} from "./rules/033_corpse_explosion";
import {MoraleConvertRule}   from "./rules/035_morale_convert";
import {DeadLandsRule}       from "./rules/036_dead_lands";
import {DeathEnergyRule}     from "./rules/093_death_energy";
import {ColdDarkEnergyRule}  from "./rules/151_cold_dark_energy";

// 만들어진 카드의 명부다.
//
// 카드를 새로 만들면 파일 하나를 놓고 여기 한 줄을 더한다. 그 밖의 파일은 안 고친다.
// 여기 한 줄이 느는 것은 갈림길이 느는 것과 다르다. 어느 카드인지 보고 갈라지는 자리가
// 안 늘어야 통과다 (규칙 24).
//
// 여기 없는 카드는 전투가 아직 처리하지 않는 카드다.
const RULES: readonly CardRule[] = [
    OverflowMoraleRule,
    ScytheRule,
    EnergyBurnRule,
    NetherBladeRule,
    SwampOfDeadRule,
    DoomContractRule,
    LeonikSummonRule,
    CorpseExplosionRule,
    MoraleConvertRule,
    DeadLandsRule,
    DeathEnergyRule,
    ColdDarkEnergyRule,
];

const BY_CARD_ID = new Map<number, CardRule>(RULES.map((it) => [it.cardId, it]));

export function findCardRule(cardId: number): CardRule | null {
    return BY_CARD_ID.get(cardId) ?? null;
}
