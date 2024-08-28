import {ShopButtonConfig, ShopButtonType} from "./ShopButtonType";
import * as THREE from 'three';

export class ShopButtonConfigList {
    public static readonly buttonConfigs: ShopButtonConfig[] = [
        {
            id: 1,
            type: ShopButtonType.UNDEAD,
            imagePath: '../resource/shop/buttons/draw_undead.png',
            position: new THREE.Vector2(-220, -30)
        },
        {
            id: 2,
            type: ShopButtonType.ALL,
            imagePath: '../resource/shop/buttons/draw_all.png',
            position: new THREE.Vector2(-650, -30)
        },
        {
            id: 3,
            type: ShopButtonType.TRENT,
            imagePath: '../resource/shop/buttons/draw_trent.png',
            position: new THREE.Vector2(210, -30)
        },
        {
            id: 4,
            type: ShopButtonType.HUMAN,
            imagePath: '../resource/shop/buttons/draw_human.png',
            position: new THREE.Vector2(655, -30)
        }
    ];
}