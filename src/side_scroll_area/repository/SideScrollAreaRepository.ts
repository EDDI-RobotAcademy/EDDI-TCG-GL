import * as THREE from 'three';
import {SideScrollArea} from "../entity/SideScrollArea";
import {SideScrollAreaType} from "../entity/SideScrollAreaType";

export interface SideScrollAreaRepository {
    createSideScrollArea(
        type: SideScrollAreaType, areaId: number, name: string, width: number, height: number, position: THREE.Vector2
    ): Promise<SideScrollArea>;
}