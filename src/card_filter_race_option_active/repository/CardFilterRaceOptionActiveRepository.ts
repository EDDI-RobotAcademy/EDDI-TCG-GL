import * as THREE from 'three';
import {CardFilterRaceOptionActive} from "../entity/CardFilterRaceOptionActive";
import {Vector2d} from "../../common/math/Vector2d";
import {CardRace} from "../../card/race";

export interface CardFilterRaceOptionActiveRepository {
    createRaceOption(type: CardRace, position:Vector2d): Promise<CardFilterRaceOptionActive>;
    findRaceOptionByType(type: CardRace): CardFilterRaceOptionActive | null;
    deleteRaceOptionByType(type: CardRace): void;
}