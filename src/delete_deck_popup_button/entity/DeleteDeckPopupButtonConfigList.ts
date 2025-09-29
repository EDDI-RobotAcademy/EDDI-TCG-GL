import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {DeleteDeckPopupButtonType} from "./DeleteDeckPopupButtonType";

export interface ButtonConfig {
    id: number;
    position: Vector2d;
}

export class DeleteDeckPopupButtonConfigList {
    public buttonConfigs: ButtonConfig[] = [
        {
            id: DeleteDeckPopupButtonType.CANCEL,
            position: new Vector2d(-126 / 1920, -115 / 1080)
        },
        {
            id: DeleteDeckPopupButtonType.DELETE,
            position: new Vector2d(126 / 1920, -115 / 1080)
        },
    ];
}
