import * as THREE from "three";

import {SideScrollAreaDetectRepository} from "./SideScrollAreaDetectRepository";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";

export class SideScrollAreaDetectRepositoryImpl implements SideScrollAreaDetectRepository {
    private static instance: SideScrollAreaDetectRepositoryImpl;
    private isMakeDeckScrollEnabledMap: Map<number, boolean> = new Map(); // scrollAreaId: enable
    private isMyCardScrollEnabledMap: Map<number, boolean> = new Map(); // scrollAreaId, enable
    private isMyCardScrollEnabled: boolean = false;
    private raycaster = new THREE.Raycaster();

    public static getInstance(): SideScrollAreaDetectRepositoryImpl {
        if (!SideScrollAreaDetectRepositoryImpl.instance) {
            SideScrollAreaDetectRepositoryImpl.instance = new SideScrollAreaDetectRepositoryImpl();
        }
        return SideScrollAreaDetectRepositoryImpl.instance;
    }

    public isSideScrollAreaDetect(
        clickPoint: { x: number; y: number }, sideScrollAreaList: SideScrollArea[], camera: THREE.Camera): any | null {
            const { x, y } = clickPoint;

            const normalizedMouse = new THREE.Vector2(
                (x / window.innerWidth) * 2 - 1,
                -(y / window.innerHeight) * 2 + 1
            );

            this.raycaster.setFromCamera(normalizedMouse, camera);

            const meshes = sideScrollAreaList.map(sideScrollArea => sideScrollArea.getMesh());
            const intersects = this.raycaster.intersectObjects(meshes);

            if (intersects.length > 0) {
                const intersectedMesh = intersects[0].object;
                const detectedArea = sideScrollAreaList.find(
                    area => area.getMesh() === intersectedMesh
                );

                if (detectedArea) {
                    console.log('Detect Make Deck Side Scroll Area!')
                    return detectedArea;
                }
            }
            return null;
        }

    public setMyCardScrollEnabled(enable: boolean): void {
        this.isMyCardScrollEnabled = enable;
    }

    public setMakeDeckScrollEnabled(id: number, enable: boolean): void {
        this.isMakeDeckScrollEnabledMap.set(id, enable);
    }

    public setMyDeckScrollEnabled(id: number, enable: boolean): void {
        this.isMyCardScrollEnabledMap.set(id, enable);
    }

    public findMyCardScrollEnabled(): boolean {
        return this.isMyCardScrollEnabled;
    }

    public findMyDeckScrollEnabledById(areaId: number): boolean {
        return this.isMyCardScrollEnabledMap.get(areaId) ?? false;
    }

    public findMakeDeckScrollEnabledById(areaId: number): boolean {
        return this.isMakeDeckScrollEnabledMap.get(areaId) ?? false;
    }

}