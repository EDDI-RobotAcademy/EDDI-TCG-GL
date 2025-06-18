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

}
