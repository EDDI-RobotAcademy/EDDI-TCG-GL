import { BattleFieldUnit } from "../entity/BattleFieldUnit";
import { LegacyNonBackgroundImage } from "../../../shape/image/LegacyNonBackgroundImage";

export interface BattleFieldUnitEntry {
    unit: BattleFieldUnit;
    card: LegacyNonBackgroundImage | null;
    weapon: LegacyNonBackgroundImage | null;
    hp: LegacyNonBackgroundImage | null;
    energy: LegacyNonBackgroundImage | null;
    race: LegacyNonBackgroundImage | null;
}