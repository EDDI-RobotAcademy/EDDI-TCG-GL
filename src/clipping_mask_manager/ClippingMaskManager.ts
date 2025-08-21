import * as THREE from "three";
import {SideScrollArea} from "../side_scroll_area/entity/SideScrollArea";

export class ClippingMaskManager {
    private static instance: ClippingMaskManager;
    private clippingPlanesMap: Map<number, THREE.Plane[]> = new Map();
    private raycaster = new THREE.Raycaster();
    private renderer: THREE.WebGLRenderer | null = null;;

    private constructor() {}

    public static getInstance(): ClippingMaskManager {
        if (!ClippingMaskManager.instance) {
            ClippingMaskManager.instance = new ClippingMaskManager();
        }
        return ClippingMaskManager.instance;
    }

    public setRenderer(renderer: THREE.WebGLRenderer): void {
        this.renderer = renderer;
        this.renderer.localClippingEnabled = true;
    }

    public setClippingPlanes(sideScrollArea: SideScrollArea): THREE.Plane[] {
        if (!sideScrollArea) {
            console.error("SideScrollArea is null. Clipping planes cannot be set.");
            return [];
        }

        const sideScrollAreaX = sideScrollArea.position.x;
        const sideScrollAreaY = sideScrollArea.position.y;
        const sideScrollAreaWidth = sideScrollArea.width;
        const sideScrollAreaHeight = sideScrollArea.height;

        if (sideScrollAreaWidth !== null && sideScrollAreaHeight !== null) {
            const clippingPlanes = [
                new THREE.Plane(new THREE.Vector3(-1, 0, 0),  sideScrollAreaX + sideScrollAreaWidth / 2),
                new THREE.Plane(new THREE.Vector3(1, 0, 0), - (sideScrollAreaX - sideScrollAreaWidth / 2)),
                new THREE.Plane(new THREE.Vector3(0, -1, 0), sideScrollAreaY + sideScrollAreaHeight / 2),
                new THREE.Plane(new THREE.Vector3(0, 1, 0), -(sideScrollAreaY - sideScrollAreaHeight / 2)),
            ];
            return clippingPlanes;
        }
        return [];
    }

    public applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => {
                if (material instanceof THREE.Material) {
                    material.clippingPlanes = clippingPlanes;
                }
            });
        } else if (mesh.material instanceof THREE.Material) {
            mesh.material.clippingPlanes = clippingPlanes;
        }
    }

    public isMeshVisible(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): boolean {
        if (!mesh.geometry) return false;

        const positionAttribute = mesh.geometry.getAttribute("position");
        const vector = new THREE.Vector3();

        for (let i = 0; i < positionAttribute.count; i++) {
            vector.fromBufferAttribute(positionAttribute, i);
            mesh.localToWorld(vector);

            // 이 정점이 모든 plane 안쪽에 있는지 확인
            for (const plane of clippingPlanes) {
                if (plane.distanceToPoint(vector) < 0) {
                    // 하나라도 plane 바깥이면 -> 이 mesh는 보이지 않음
                    return false;
                }
            }
        }
        // 모든 정점이 내부에 있으면 보임
        return true;
    }


}
