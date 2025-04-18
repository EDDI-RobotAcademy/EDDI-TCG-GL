import * as THREE from 'three';

export interface DeleteDeckPopupWindowService {
    createDeleteDeckPopupWindow(): Promise<THREE.Mesh | null>;
}