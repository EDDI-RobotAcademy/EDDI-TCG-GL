import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {AlertModalButtonsType} from "./AlertModalButtonsType";

export interface ButtonConfig {
    type: AlertModalButtonsType;
    position: Vector2d;
}

export class AlertModalButtonsConfigList {
    public buttonConfigs: ButtonConfig[] = [
        {
            type: AlertModalButtonsType.UNMATCHED_CARD,
            position: new Vector2d(0, -108 / 1080)
        },
        {
            type: AlertModalButtonsType.INCOMPLETE_DECK,
            position: new Vector2d(0, -128 / 1080)
        },
    ];
}
