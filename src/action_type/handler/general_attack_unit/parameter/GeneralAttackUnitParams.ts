import * as THREE from "three";

export interface GeneralAttackUnitParams {
    selectedYourFieldCard: any;
    opponentFieldCardScene: any;
    weaponScene: any;
    scene: THREE.Scene;
    // 필요하면 다른 필드 추가
}