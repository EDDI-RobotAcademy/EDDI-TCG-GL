import * as THREE from 'three';
import {CardFilterRaceOptionInactive} from "../entity/CardFilterRaceOptionInactive";
import {Vector2d} from "../../common/math/Vector2d";
import {CardRace} from "../../card/race";

export interface CardFilterRaceOptionInactiveRepository {
    createRaceOption(type: CardRace, position:Vector2d): Promise<CardFilterRaceOptionInactive>;
    findRaceOptionByType(type: CardRace): CardFilterRaceOptionInactive | null;
    deleteRaceOptionByType(type: CardRace): void;
}