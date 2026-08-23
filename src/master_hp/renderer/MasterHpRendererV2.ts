import * as THREE from "three";

import { FrameRenderer } from "../../core/renderer/FrameRenderer";
import {
    MasterHpFrame,
    computeMasterHpBounds,
    resolveMasterHpImageSrc,
} from "../frame/MasterHpFrame";

// 메인 캐릭터 HP 표기. 숫자는 hp/{n}.png 이미지 자체에 새겨져 있으므로 렌더러는
// HP가 바뀔 때마다 텍스처만 갈아 끼운다.
//
// 텍스처는 TextureManager를 거치지 않고 직접 로드한다 — SRGBColorSpace + LinearFilter +
// generateMipmaps:false 가 이 프로젝트의 선명한 기준값이고, TextureManager의
// LinearSRGB + mipmap 설정은 TCG 픽셀 아트를 흐리게 만든다 (CLAUDE.md 규칙 3).
export class MasterHpRendererV2 implements FrameRenderer<MasterHpFrame> {
    public async build(frame: MasterHpFrame): Promise<THREE.Group> {
        const group = new THREE.Group();
        const texture = await this.loadTexture(resolveMasterHpImageSrc(frame, frame.maxHp));

        const bounds = computeMasterHpBounds(frame, window.innerWidth, window.innerHeight);
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(bounds.width, bounds.height),
            new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
        );
        mesh.position.set(bounds.centerX, bounds.centerY, 0);
        mesh.renderOrder = frame.renderOrder;
        group.add(mesh);
        (group.userData as { currentHp: number }).currentHp = frame.maxHp;
        return group;
    }

    // HP가 실제로 바뀐 경우에만 텍스처를 교체한다. 같은 값으로 반복 호출해도
    // 로딩이 다시 돌지 않는다.
    public async setHp(group: THREE.Group, frame: MasterHpFrame, hp: number): Promise<void> {
        const userData = group.userData as { currentHp?: number };
        const next = Math.max(0, Math.round(hp));
        if (userData.currentHp === next) return;
        userData.currentHp = next;

        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;
        const material = mesh.material as THREE.MeshBasicMaterial;
        const previous = material.map;
        material.map = await this.loadTexture(resolveMasterHpImageSrc(frame, next));
        material.needsUpdate = true;
        previous?.dispose();
    }

    public resize(
        frame: MasterHpFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;
        const bounds = computeMasterHpBounds(frame, viewportWidth, viewportHeight);
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(bounds.width, bounds.height);
        mesh.position.set(bounds.centerX, bounds.centerY, 0);
    }

    public dispose(group: THREE.Group): void {
        for (const child of group.children) {
            if (!(child instanceof THREE.Mesh)) continue;
            child.geometry.dispose();
            const material = child.material as THREE.MeshBasicMaterial;
            material.map?.dispose();
            material.dispose();
        }
        group.clear();
    }

    private loadTexture(src: string): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(src, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                resolve(texture);
            }, undefined, reject);
        });
    }
}
