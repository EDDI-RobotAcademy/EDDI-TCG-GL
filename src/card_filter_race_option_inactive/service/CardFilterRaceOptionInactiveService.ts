import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface CardFilterRaceOptionInactiveService {
    createCardFilterRaceOptionInactive(type: number, position:Vector2d): Promise<void>;
}