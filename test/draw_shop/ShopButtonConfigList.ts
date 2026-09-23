// 이 시나리오만 쓰는 설정이다.
//
// 앱의 상점 화면은 값·그리기·다루기가 갈린 새 방식으로 바뀌었다 (R2-133). 이 시나리오는
// 상점을 따로 다시 만든 것이고 (`TCGJustTestShopView`), 앱에 없는 것도 들고 있다 —
// 뽑기 고르는 화면, 예/아니오 단추. 그래서 지우지 않고, 쓰던 설정만 여기로 옮겼다.

import {ShopButtonConfig, ShopButtonType} from "./ShopButtonType";
import * as THREE from 'three';

export class ShopButtonConfigList {
    public static readonly buttonConfigs: ShopButtonConfig[] = [
        {
            id: 1,
            type: ShopButtonType.ALL,
            imagePath: 'resource/shop/buttons/draw_all.png',
            position: new THREE.Vector2(-650, -30)//all
        },
        {
            id: 2,
            type: ShopButtonType.HUMAN,
            imagePath: 'resource/shop/buttons/draw_human.png',
            position: new THREE.Vector2(655, -30)//human
        },
        {
            id: 3,
            type: ShopButtonType.TRENT,
            imagePath: 'resource/shop/buttons/draw_trent.png',
            position: new THREE.Vector2(210, -30)//trent
        },
        {
            id: 4,
            type: ShopButtonType.UNDEAD,
            imagePath: 'resource/shop/buttons/draw_human.png',
            position: new THREE.Vector2(-220, -30)//undead
        }
    ];
}