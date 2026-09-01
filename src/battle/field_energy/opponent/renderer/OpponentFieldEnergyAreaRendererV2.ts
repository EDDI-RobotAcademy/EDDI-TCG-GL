import * as THREE from "three";

import { FrameRenderer } from "../../../../core/renderer/FrameRenderer";
import {
    OpponentFieldEnergyAreaFrame,
    computeOpponentFieldEnergyBounds,
} from "../frame/OpponentFieldEnergyAreaFrame";

// Renders the opponent field-energy shaded area as a single PlaneGeometry positioned
// at the 180°-around-screen-centre mirror of the player's Field Energy HUD. Same
// build/resize/dispose shape as OpponentTombPanelRendererV2.
export class OpponentFieldEnergyAreaRendererV2
    implements FrameRenderer<OpponentFieldEnergyAreaFrame>
{
    public async build(frame: OpponentFieldEnergyAreaFrame): Promise<THREE.Group> {
        const group = new THREE.Group();
        const mesh = this.buildMesh(frame, window.innerWidth, window.innerHeight);
        group.add(mesh);
        return group;
    }

    public resize(
        frame: OpponentFieldEnergyAreaFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;
        mesh.geometry?.dispose();
        const replacement = this.buildMesh(frame, viewportWidth, viewportHeight);
        mesh.geometry = replacement.geometry;
        mesh.position.copy(replacement.position);
    }

    public dispose(group: THREE.Group): void {
        group.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.geometry?.dispose();
                const mat = obj.material;
                if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
                else mat?.dispose();
            }
        });
        group.clear();
    }

    private buildMesh(
        frame: OpponentFieldEnergyAreaFrame,
        viewportWidth: number,
        viewportHeight: number,
    ): THREE.Mesh {
        const b = computeOpponentFieldEnergyBounds(frame, viewportWidth, viewportHeight);
        const geometry = new THREE.PlaneGeometry(b.width, b.height);
        const material = new THREE.MeshBasicMaterial({
            color: frame.color,
            opacity: frame.opacity,
            transparent: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(b.centerX, b.centerY, 0);
        mesh.renderOrder = frame.renderOrder;
        return mesh;
    }
}
