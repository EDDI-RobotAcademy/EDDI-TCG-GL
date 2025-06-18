import * as THREE from 'three';
import {SideScrollAreaType} from "../entity/SideScrollAreaType";

export interface SideScrollAreaService {
    createSideScrollArea(
        type: SideScrollAreaType, areaId: number, name: string, width: number, height: number, position: THREE.Vector2
    ): Promise<THREE.Mesh | null>;
}