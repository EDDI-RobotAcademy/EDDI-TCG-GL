import * as THREE from 'three';

export enum ShopButtonType {
    ALL = "all",
    UNDEAD = "undead",
    TRENT = "trent",
    HUMAN = "human"
}

export interface ShopButtonConfig {
    id: number;
    type: ShopButtonType;
    imagePath: string;
    position: THREE.Vector2;
}