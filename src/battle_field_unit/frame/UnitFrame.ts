import { Vector2d } from "../../common/math/Vector2d";
import { Frame } from "../../core/frame/Frame";
import { SlotSpec } from "../../core/frame/SlotSpec";

export const UNIT_SLOT_IDS = {
    WEAPON: 'weapon',
    HP: 'hp',
    ENERGY: 'energy',
    RACE: 'race',
} as const;

export interface UnitFrame extends Frame {
    readonly slots: {
        readonly weapon: SlotSpec;
        readonly hp: SlotSpec;
        readonly energy: SlotSpec;
        readonly race: SlotSpec;
    };
}

export function createDefaultUnitFrame(cardWidth: number = 120): UnitFrame {
    return {
        rootWidth: cardWidth,
        rootAspect: 1.615,
        slots: {
            weapon: {
                id: UNIT_SLOT_IDS.WEAPON,
                anchor: 'BR',
                offset: new Vector2d(-8, 8),
                widthRatio: 0.63,
                aspect: 1.651,
                renderOrder: 2,
            },
            hp: {
                id: UNIT_SLOT_IDS.HP,
                anchor: 'BL',
                offset: new Vector2d(0, 13),
                widthRatio: 0.33,
                aspect: 1.651,
                renderOrder: 2,
            },
            energy: {
                id: UNIT_SLOT_IDS.ENERGY,
                anchor: 'TL',
                offset: new Vector2d(0, 0),
                widthRatio: 0.39,
                aspect: 1.618,
                renderOrder: 2,
            },
            race: {
                id: UNIT_SLOT_IDS.RACE,
                anchor: 'TR',
                offset: new Vector2d(0, 0),
                widthRatio: 0.4,
                aspect: 1,
                renderOrder: 2,
            },
        },
    };
}
