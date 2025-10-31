import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface CardFilterGradeOptionInactiveService {
    createCardFilterGradeOptionInactive(type: number, position:Vector2d): Promise<void>;
}