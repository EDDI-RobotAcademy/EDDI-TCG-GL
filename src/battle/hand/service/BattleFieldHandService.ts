import * as THREE from 'three';

export interface BattleFieldHandService {
    createHand(cardId: number): Promise<THREE.Group>;
}