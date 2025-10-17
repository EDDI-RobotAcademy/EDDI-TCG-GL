import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface AlertModalButtonsService {
    createAlertModalButtons(type: number, position:Vector2d): Promise<void>;
}