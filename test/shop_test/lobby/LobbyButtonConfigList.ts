import {LobbyButtonConfig, LobbyButtonType} from "./LobbyButtonType";
import * as THREE from 'three';

export class LobbyButtonConfigList {
    public static readonly buttonConfigs: LobbyButtonConfig[] = [
        {
            id: 1,
            type: LobbyButtonType.OneVsOne,
            imagePath: '../resource/main_lobby/buttons/entrance_game_button.png',
            position: new THREE.Vector2(-400, -200)
        },
        {
            id: 2,
            type: LobbyButtonType.MyCards,
            imagePath: '../resource/main_lobby/buttons/my_card_button.png',
            position: new THREE.Vector2(-400, -80)
        },
        {
            id: 3,
            type: LobbyButtonType.Shop,
            imagePath: '../resource/main_lobby/buttons/shop_button.png',
            position: new THREE.Vector2(-400, 40)
        },
        {
            id: 4,
            type: LobbyButtonType.Test,
            imagePath: '../resource/main_lobby/buttons/test_button.png',
            position: new THREE.Vector2(-400, 160)
        }
    ];
}