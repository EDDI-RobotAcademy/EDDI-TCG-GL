import * as THREE from "three";

import {disposeGroup, markOwnedTexture} from "../../core/lifecycle/DisposableMeshStore";
import {FrameRenderer} from "../../core/renderer/FrameRenderer";
import {RaidPlaceholderFrame} from "../frame/RaidPlaceholderFrame";

// 레이드 화면의 글자를 그린다. **THREE 물건을 만드는 것은 여기뿐이다.**
//
// 글자 크기를 창 높이에 대한 비율로 낸다. 글자를 그려 둔 판의 크기는 만들 때 한 번 재고,
// 다시 잴 때는 그 값에 대한 배율만 바꾼다 — 창 크기가 바뀔 때마다 글자를 다시 그리면
// 그때마다 판을 새로 만들게 된다.
interface TextUserData {
    readonly baseWidth: number;
    readonly baseHeight: number;
}

export class RaidPlaceholderRenderer implements FrameRenderer<RaidPlaceholderFrame> {
    public async build(frame: RaidPlaceholderFrame): Promise<THREE.Group> {
        const group = new THREE.Group();
        group.add(this.textMesh(frame.title, 96, frame.renderOrder));
        group.add(this.textMesh(frame.message, 40, frame.renderOrder));
        this.applyFrame(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resize(
        frame: RaidPlaceholderFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        this.applyFrame(frame, group, viewportWidth, viewportHeight);
    }

    public dispose(group: THREE.Group): void {
        disposeGroup(group);
    }

    private applyFrame(
        frame: RaidPlaceholderFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        const rows = [
            {yRatio: frame.titleYRatio, heightRatio: frame.titleHeightRatio},
            {yRatio: frame.messageYRatio, heightRatio: frame.messageHeightRatio},
        ];
        rows.forEach((row, index) => {
            const mesh = group.children[index] as THREE.Mesh | undefined;
            if (!mesh) return;
            const userData = mesh.userData as TextUserData;

            const height = row.heightRatio * viewportHeight;
            const scale = height / userData.baseHeight;
            mesh.scale.set(scale, scale, 1);
            mesh.position.set(0, row.yRatio * viewportHeight, 0);
        });
    }

    private textMesh(text: string, fontPx: number, renderOrder: number): THREE.Mesh {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        ctx.font = `bold ${fontPx}px Arial`;
        const width = Math.ceil(ctx.measureText(text).width) + fontPx;
        canvas.width = width;
        canvas.height = Math.ceil(fontPx * 1.6);

        // 크기를 바꾸면 그리는 상태가 지워지므로 다시 세운다.
        const drawCtx = canvas.getContext('2d')!;
        drawCtx.font = `bold ${fontPx}px Arial`;
        drawCtx.fillStyle = '#ffffff';
        drawCtx.textAlign = 'center';
        drawCtx.textBaseline = 'middle';
        drawCtx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = markOwnedTexture(new THREE.CanvasTexture(canvas));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(canvas.width, canvas.height),
            new THREE.MeshBasicMaterial({
                map: texture, transparent: true, depthWrite: false, alphaTest: 0.05,
            }),
        );
        mesh.renderOrder = renderOrder;
        const userData: TextUserData = {baseWidth: canvas.width, baseHeight: canvas.height};
        mesh.userData = userData;
        return mesh;
    }
}
