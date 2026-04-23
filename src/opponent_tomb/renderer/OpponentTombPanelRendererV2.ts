import * as THREE from "three";

import { FrameRenderer } from "../../core/renderer/FrameRenderer";
import {
    OpponentTombPanelFrame,
    computeOpponentTombGeometry,
} from "../frame/OpponentTombPanelFrame";

// Renders the opponent tombstone as a right-side-up tomb (rect + UPWARD arc), mirroring
// YourTombPanelRendererV2's path. The 180°-around-own-centroid rotation applied to the
// frame values means the shape sits at the top-right of the screen with the arc pointing
// UP, so the drawing path is identical to Your Tomb's.
//
// CCW path in world y-up:
//   bottom-left → bottom-right → top-right (arc springline, right) →
//   absellipse(0 → π, CCW) upper half-ellipse through apex →
//   top-left (arc springline, left) → close to bottom-left.
export class OpponentTombPanelRendererV2 implements FrameRenderer<OpponentTombPanelFrame> {
    public async build(frame: OpponentTombPanelFrame): Promise<THREE.Group> {
        const geometry = this.buildTombGeometry(frame, window.innerWidth, window.innerHeight);

        const material = new THREE.MeshBasicMaterial({
            color: frame.color,
            opacity: frame.opacity,
            transparent: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = frame.renderOrder;
        mesh.position.set(0, 0, 0);

        const group = new THREE.Group();
        group.add(mesh);
        return group;
    }

    public resize(
        frame: OpponentTombPanelFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;
        mesh.geometry?.dispose();
        mesh.geometry = this.buildTombGeometry(frame, viewportWidth, viewportHeight);
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

    private buildTombGeometry(
        frame: OpponentTombPanelFrame,
        viewportWidth: number,
        viewportHeight: number,
    ): THREE.ShapeGeometry {
        const g = computeOpponentTombGeometry(frame, viewportWidth, viewportHeight);

        const shape = new THREE.Shape();
        shape.moveTo(g.rectMinX, g.rectMinY);                       // bottom-left
        shape.lineTo(g.rectMaxX, g.rectMinY);                       // bottom-right
        shape.lineTo(g.rectMaxX, g.rectMaxY);                       // up to arc springline, right
        // Upper half-ellipse from right (angle 0) CCW through apex (π/2) to left (π).
        shape.absellipse(
            g.arcCenterX, g.rectMaxY,
            g.arcSemiA,   g.arcSemiB,
            0, Math.PI,
            false,
            0,
        );
        shape.lineTo(g.rectMinX, g.rectMinY);                       // down to bottom-left
        shape.closePath();

        return new THREE.ShapeGeometry(shape);
    }
}
