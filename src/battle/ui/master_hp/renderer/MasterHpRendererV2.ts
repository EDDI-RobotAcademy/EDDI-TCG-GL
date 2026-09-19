import * as THREE from "three";

import { FrameRenderer } from "../../../../core/renderer/FrameRenderer";
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
    //
    // 연출 둘이 겹치면 각자 자기가 들고 있던 값으로 부른다. 뒤늦게 도착한 쪽이 더 오래된
    // 값을 들고 있으면 숫자가 되돌아간다. 실제로 그런 일이 있었다 — 네더 블레이드 단일기
    // 중에 파멸의 계약을 쓰면 계약의 피해만 보였다.
    //
    // 본체 체력은 줄기만 한다. 그래서 내려가는 쪽만 그린다. 회복하는 카드가 생기면 이
    // 규칙을 다시 봐야 한다.
    public async setHp(group: THREE.Group, frame: MasterHpFrame, hp: number): Promise<void> {
        const userData = group.userData as { currentHp?: number };
        const next = Math.max(0, Math.round(hp));
        const shown = userData.currentHp;
        if (shown !== undefined && next >= shown) return;
        userData.currentHp = next;

        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;

        const texture = await this.loadTexture(resolveMasterHpImageSrc(frame, next));
        // 그림을 읽는 동안 더 낮은 값이 들어왔으면 이 그림은 이미 낡은 것이다.
        if (userData.currentHp !== next) {
            texture.dispose();
            return;
        }

        const material = mesh.material as THREE.MeshBasicMaterial;
        const previous = material.map;
        material.map = texture;
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
