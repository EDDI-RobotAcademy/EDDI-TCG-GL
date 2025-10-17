import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface AlertModalContainerService {
    createAlertModalContainer(type: number, position:Vector2d): Promise<void>;
}