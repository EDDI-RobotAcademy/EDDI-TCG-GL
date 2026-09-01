import * as THREE from 'three';

export interface OpponentFieldService {
    createFieldUnit(cardId: number): Promise<THREE.Group>;
}