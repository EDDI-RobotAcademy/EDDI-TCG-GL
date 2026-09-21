import {CardPresentation} from "./CardPresentation";

import {ScythePresentation} from "./presentation/item/008_scythe";
import {EnergyBurnPresentation} from "./presentation/item/009_energy_burn";
import {DoomContractPresentation} from "./presentation/item/025_doom_contract";
import {DeadLandsPresentation} from "./presentation/item/036_dead_lands";
import {MoraleConvertPresentation} from "./presentation/item/035_morale_convert";
import {OverflowMoralePresentation} from "./presentation/support/002_overflow_morale";
import {DeathEnergyPresentation} from "./presentation/energy/093_death_energy";
import {ColdDarkEnergyPresentation} from "./presentation/energy/151_cold_dark_energy";
import {SwampOfDeadPresentation} from "./presentation/support/020_swamp_of_dead";
import {CorpseExplosionPresentation} from "./presentation/item/033_corpse_explosion";
import {NetherBladePresentation} from "./presentation/unit/019_nether_blade";
import {LeonikSummonPresentation} from "./presentation/support/030_leonik_summon";

// 화면에서 쓰는 법을 아는 카드의 명부다.
//
// 카드를 새로 만들면 파일 하나를 놓고 여기 한 줄을 더한다. 여기 한 줄이 느는 것은
// 카드 번호로 갈라지는 자리가 느는 것과 다르다 (규칙 24).
//
// 여기 없는 카드는 아직 옮기지 않은 것이다. 화면의 옛 갈림길이 받는다.
const PRESENTATIONS: readonly CardPresentation[] = [
    ScythePresentation,
    EnergyBurnPresentation,
    DoomContractPresentation,
    DeadLandsPresentation,
    MoraleConvertPresentation,
    OverflowMoralePresentation,
    DeathEnergyPresentation,
    ColdDarkEnergyPresentation,
    SwampOfDeadPresentation,
    CorpseExplosionPresentation,
    NetherBladePresentation,
    LeonikSummonPresentation,
];

const BY_CARD_ID = new Map<number, CardPresentation>(
    PRESENTATIONS.map((it) => [it.cardId, it]),
);

export function findCardPresentation(cardId: number): CardPresentation | null {
    return BY_CARD_ID.get(cardId) ?? null;
}
