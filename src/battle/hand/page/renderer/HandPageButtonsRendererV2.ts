import * as THREE from "three";

import { FrameRenderer } from "../../../../core/renderer/FrameRenderer";
import { Vector2d } from "../../../../common/math/Vector2d";
import {
    HandPageButtonSpec,
    HandPageButtonsFrame,
} from "../frame/HandPageButtonsFrame";

interface ButtonEntry {
    spec: HandPageButtonSpec;
    mesh: THREE.Mesh;
    baseWidth: number;
    baseHeight: number;
}

interface HandPageButtonsUserData {
    entries: ButtonEntry[];
}

// Pair of static THREE.Plane meshes for prev / next. Pilot E renders them as decorative
// (no click handling — legacy uses LeftClickDetectServiceImpl.handleYourHandPrevButtonClick,
// which is out of scope until Pilot F).
export class HandPageButtonsRendererV2 implements FrameRenderer<HandPageButtonsFrame> {
    public async build(frame: HandPageButtonsFrame): Promise<THREE.Group> {
        const group = new THREE.Group();
        const entries: ButtonEntry[] = [];

        const prevEntry = await this.buildButton(frame.prev, frame.renderOrder, 'prev');
        group.add(prevEntry.mesh);
        entries.push(prevEntry);

        const nextEntry = await this.buildButton(frame.next, frame.renderOrder, 'next');
        group.add(nextEntry.mesh);
        entries.push(nextEntry);

        const userData: HandPageButtonsUserData = { entries };
        group.userData = userData;

        this.applyLayout(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resize(
        frame: HandPageButtonsFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        this.applyLayout(frame, group, viewportWidth, viewportHeight);
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

    private async buildButton(spec: HandPageButtonSpec, renderOrder: number, buttonType: string): Promise<ButtonEntry> {
        const texture = await this.loadTexture(spec.imageSrc);
        const w = window.innerWidth;
        const h = window.innerHeight;

        const baseWidth = Math.abs(spec.endXPercent - spec.startXPercent) * w;
        const baseHeight = Math.abs(spec.endYPercent - spec.startYPercent) * h;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
        });
        const geometry = new THREE.PlaneGeometry(baseWidth, baseHeight);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = renderOrder;
        mesh.userData.buttonType = buttonType;

        return { spec, mesh, baseWidth, baseHeight };
    }

    private applyLayout(
        frame: HandPageButtonsFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const { entries } = group.userData as HandPageButtonsUserData;
        for (const entry of entries) {
            const center = this.computeCenter(entry.spec, viewportWidth, viewportHeight);
            const width = Math.abs(entry.spec.endXPercent - entry.spec.startXPercent) * viewportWidth;
            const height = Math.abs(entry.spec.endYPercent - entry.spec.startYPercent) * viewportHeight;

            entry.mesh.scale.set(width / entry.baseWidth, height / entry.baseHeight, 1);
            entry.mesh.position.set(center.getX(), center.getY(), 0);
        }
    }

    private computeCenter(
        spec: HandPageButtonSpec,
        viewportWidth: number,
        viewportHeight: number,
    ): Vector2d {
        // Screen-percent (top-left origin) → world coords (centered): (p - 0.5) for X, (0.5 - p) for Y.
        const startX = (spec.startXPercent - 0.5) * viewportWidth;
        const startY = (0.5 - spec.startYPercent) * viewportHeight;
        const endX = (spec.endXPercent - 0.5) * viewportWidth;
        const endY = (0.5 - spec.endYPercent) * viewportHeight;
        return new Vector2d((startX + endX) / 2, (startY + endY) / 2);
    }

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
