import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {AlertModalContainerType} from "./AlertModalContainerType";

export interface ContainerConfig {
    type: AlertModalContainerType;
    position: Vector2d;
}

export class AlertModalContainerConfigList {
    public containerConfigs: ContainerConfig[] = [
        {
            type: AlertModalContainerType.UNMATCHED_CARD,
            position: new Vector2d(0, 0)
        },
        {
            type: AlertModalContainerType.INCOMPLETE_DECK,
            position: new Vector2d(0, 0)
        },
    ];
}
