import * as THREE from "three";
import {MyDeckButtonEffect} from "../../my_deck_button_effect/entity/MyDeckButtonEffect";

export interface MyDeckButtonEffectHoverDetectRepository {
    isMyDeckButtonEffectHover(hoverPoint: { x: number; y: number },
        effectList: MyDeckButtonEffect[],
        camera: THREE.Camera): any | null;
}