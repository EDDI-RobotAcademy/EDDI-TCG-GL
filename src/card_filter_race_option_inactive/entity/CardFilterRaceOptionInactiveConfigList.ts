import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {CardRace} from "../../card/race";

export interface RaceOptionConfig {
    type: CardRace;
    position: Vector2d;
}

export class CardFilterRaceOptionInactiveConfigList {
    public raceOptionConfigs: RaceOptionConfig[] = [
        {
            type: CardRace.HUMAN,
            position: new Vector2d(-0.017, 0.168)
        },
        {
            type: CardRace.UNDEAD,
            position: new Vector2d(0.018, 0.168)
        },
        {
            type: CardRace.TRENT,
            position: new Vector2d(0.053, 0.168)
        },
    ];
}
