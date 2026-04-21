import * as THREE from "three";

import { FrameRenderer } from "../../core/renderer/FrameRenderer";
import {
    OpponentLostZonePanelFrame,
    computeOpponentLostZonePanelBounds,
} from "../frame/OpponentLostZonePanelFrame";

interface PanelUserData {
    baseWidth: number;
    baseHeight: number;
}

// Mirrors YourLostZonePanelRendererV2 — a single semi-transparent rectangle positioned
// by bounds derived from screen ratios. Click detection (once wired) uses
// `computeOpponentLostZonePanelBounds`, not raycasting the mesh, so this renderer is
// visual-only and has no interaction logic.
export class OpponentLostZonePanelRendererV2 implements FrameRenderer<OpponentLostZonePanelFrame> {
    public async build(frame: OpponentLostZonePanelFrame): Promise<THREE.Group> {
        const bounds = computeOpponentLostZonePanelBounds(frame, window.innerWidth, window.innerHeight);
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
        frame: OpponentLostZonePanelFrame,
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
        frame: OpponentLostZonePanelFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const userData = group.userData as PanelUserData;
        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;

        const bounds = computeOpponentLostZonePanelBounds(frame, viewportWidth, viewportHeight);
        const targetWidth = bounds.maxX - bounds.minX;
        const targetHeight = bounds.maxY - bounds.minY;

        mesh.scale.set(targetWidth / userData.baseWidth, targetHeight / userData.baseHeight, 1);
        mesh.position.set((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2, 0);
    }
}
