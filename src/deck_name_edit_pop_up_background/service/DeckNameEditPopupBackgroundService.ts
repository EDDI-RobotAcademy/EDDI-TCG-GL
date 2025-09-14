import * as THREE from 'three';

export interface DeckNameEditPopupBackgroundService {
    createDeckNameEditPopupBackground(): Promise<THREE.Mesh | null>;
}