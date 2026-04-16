import * as THREE from "three";

import { FrameRenderer } from "../../core/renderer/FrameRenderer";
import { BackgroundFrame } from "../frame/BackgroundFrame";

interface BackgroundUserData {
    baseWidth: number;
    baseHeight: number;
}

export class BackgroundRendererV2 implements FrameRenderer<BackgroundFrame> {
    public async build(frame: BackgroundFrame): Promise<THREE.Group> {
        const texture = await this.loadTexture(frame.imageSrc);

        const baseWidth = window.innerWidth;
        const baseHeight = window.innerHeight;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
        });
        const geometry = new THREE.PlaneGeometry(baseWidth, baseHeight);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = frame.renderOrder;

        const group = new THREE.Group();
        group.add(mesh);

        const userData: BackgroundUserData = { baseWidth, baseHeight };
        group.userData = userData;

        this.applyFrame(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resize(
        frame: BackgroundFrame,
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
        frame: BackgroundFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const userData = group.userData as BackgroundUserData;
        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;

        const targetWidth = frame.widthPercent * viewportWidth;
        const targetHeight = frame.heightPercent * viewportHeight;

        mesh.scale.set(targetWidth / userData.baseWidth, targetHeight / userData.baseHeight, 1);
        mesh.position.set(frame.xPercent * viewportWidth, frame.yPercent * viewportHeight, 0);
    }

    // Match existing Shape-image texture settings (SRGB + LinearFilter + no mipmaps)
    // so background stays crisp — see src/shape/image/NonBackgroundImage.ts.
    private loadTexture(imageSrc: string): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(
                imageSrc,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    resolve(texture);
                },
                undefined,
                (error) => reject(error),
            );
        });
    }
}
