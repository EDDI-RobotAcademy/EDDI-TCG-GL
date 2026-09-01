import * as THREE from 'three';

export interface BattleFieldHandPageService {
    createPrevButton(): Promise<THREE.Mesh>;
    createNextButton(): Promise<THREE.Mesh>;
}