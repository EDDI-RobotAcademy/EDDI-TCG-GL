import * as THREE from 'three';

export interface BattleFieldHandPageRepository {
    createPrevButton(): Promise<THREE.Mesh>;
}