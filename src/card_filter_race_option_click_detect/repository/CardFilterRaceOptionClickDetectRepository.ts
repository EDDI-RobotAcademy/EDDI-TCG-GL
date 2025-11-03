import * as THREE from "three";
import {CardFilterRaceOptionInactive} from "../../card_filter_race_option_inactive/entity/CardFilterRaceOptionInactive";

export interface CardFilterRaceOptionClickDetectRepository {
    isOptionClicked(clickPoint: { x: number; y: number },
        optionList: CardFilterRaceOptionInactive[],
        camera: THREE.Camera): any | null;
}