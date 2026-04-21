import * as THREE from "three";

import { FrameRenderer } from "../../core/renderer/FrameRenderer";
import {
    YourLostZonePanelFrame,
    computeYourLostZonePanelBounds,
} from "../frame/YourLostZonePanelFrame";

interface PanelUserData {
    baseWidth: number;
    baseHeight: number;
}

// Small semi-transparent rectangle at the bottom-left. Clickable: hit-testing is done by
// the pilot using `computeYourLostZonePanelBounds`, so this renderer has no interaction
// logic of its own.
export class YourLostZonePanelRendererV2 implements FrameRenderer<YourLostZonePanelFrame> {
    public async build(frame: YourLostZonePanelFrame): Promise<THREE.Group> {
        const bounds = computeYourLostZonePanelBounds(frame, window.innerWidth, window.innerHeight);
        const baseWidth = bounds.maxX - bounds.minX;
        const baseHeight = bounds.maxY - bounds.minY;

        const material = new THREE.MeshBasicMaterial({
            color: frame.color,
            opacity: frame.opacity,
            transparent: true,
        });
        const geometry = new THREE.PlaneGeometry(baseWidth, baseHeight);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = frame.renderOrder;

        const group = new THREE.Group();
        group.add(mesh);

        const userData: PanelUserData = { baseWidth, baseHeight };
        group.userData = userData;

        this.applyFrame(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resize(
        frame: YourLostZonePanelFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        this.applyFrame(frame, group, viewportWidth, viewportHeight);
    }

    public dispose(group: THREE.Group): void {
        group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry?.dispose();
                const material = object.material;
                if (Array.isArray(material)) material.forEach((m) => m.dispose());
                else material?.dispose();
            }
        });
        group.clear();
    }

    private applyFrame(
        frame: YourLostZonePanelFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const userData = group.userData as PanelUserData;
        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;

        const bounds = computeYourLostZonePanelBounds(frame, viewportWidth, viewportHeight);
        const targetWidth = bounds.maxX - bounds.minX;
        const targetHeight = bounds.maxY - bounds.minY;

        mesh.scale.set(targetWidth / userData.baseWidth, targetHeight / userData.baseHeight, 1);
        mesh.position.set((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2, 0);
    }
}
