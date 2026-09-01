import * as THREE from "three";

import { FrameRenderer } from "../../../../../core/renderer/FrameRenderer";
import { YourFieldAreaFrame } from "../frame/YourFieldAreaFrame";

interface YourFieldAreaUserData {
    baseWidth: number;
    baseHeight: number;
}

export class YourFieldAreaRendererV2 implements FrameRenderer<YourFieldAreaFrame> {
    public async build(frame: YourFieldAreaFrame): Promise<THREE.Group> {
        const baseWidth = window.innerWidth * frame.widthPercent;
        const baseHeight = window.innerHeight * frame.heightPercent;

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

        const userData: YourFieldAreaUserData = { baseWidth, baseHeight };
        group.userData = userData;

        this.applyFrame(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resize(
        frame: YourFieldAreaFrame,
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
                if (Array.isArray(material)) {
                    material.forEach((m) => m.dispose());
                } else {
                    material?.dispose();
                }
            }
        });
        group.clear();
    }

    private applyFrame(
        frame: YourFieldAreaFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const userData = group.userData as YourFieldAreaUserData;
        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;

        const targetWidth = frame.widthPercent * viewportWidth;
        const targetHeight = frame.heightPercent * viewportHeight;

        mesh.scale.set(targetWidth / userData.baseWidth, targetHeight / userData.baseHeight, 1);
        mesh.position.set(frame.xPercent * viewportWidth, frame.yPercent * viewportHeight, 0);
    }
}
