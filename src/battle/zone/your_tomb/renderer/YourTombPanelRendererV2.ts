import * as THREE from "three";

import { FrameRenderer } from "../../../../core/renderer/FrameRenderer";
import {
    YourTombPanelFrame,
    computeYourTombGeometry,
} from "../frame/YourTombPanelFrame";

// Renders the tombstone-shaped click panel — a rectangle body with a half-ellipse arch on
// top. Built from THREE.Shape:
//   bottom-left → bottom-right → top-right → absellipse arc (top-right → apex → top-left)
//     → bottom-left
//
// Vertices are world-space (derived from computeYourTombGeometry). Mesh sits at origin.
//
// Click detection is done in the pilot via isPointInsideYourTomb — this renderer is
// visual-only.
export class YourTombPanelRendererV2 implements FrameRenderer<YourTombPanelFrame> {
    public async build(frame: YourTombPanelFrame): Promise<THREE.Group> {
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
        frame: YourTombPanelFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;
        // Rebuild geometry — tomb vertices depend on both viewport width AND height (arc
        // stretches vertically), so uniform scaling would distort the arch.
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
        frame: YourTombPanelFrame,
        viewportWidth: number,
        viewportHeight: number,
    ): THREE.ShapeGeometry {
        const g = computeYourTombGeometry(frame, viewportWidth, viewportHeight);

        const shape = new THREE.Shape();
        // Start at rectangle bottom-left; walk counter-clockwise in world y-up so the
        // ShapeGeometry triangulator produces front-facing triangles.
        shape.moveTo(g.rectMinX, g.rectMinY);                       // bottom-left
        shape.lineTo(g.rectMaxX, g.rectMinY);                       // bottom-right
        shape.lineTo(g.rectMaxX, g.rectMaxY);                       // up to arc springline, right side
        // Arc from right-spring (angle 0 at arcCenter) CCW through apex (π/2) to
        // left-spring (π). absellipse signature: (cx, cy, xRadius, yRadius, startAng,
        // endAng, clockwise, rotation). CCW wanted → clockwise = false.
        shape.absellipse(
            g.arcCenterX, g.rectMaxY,
            g.arcSemiA,   g.arcSemiB,
            0, Math.PI,
            false,
            0,
        );
        shape.lineTo(g.rectMinX, g.rectMinY);                       // down the left side back to start
        shape.closePath();

        return new THREE.ShapeGeometry(shape);
    }
}
