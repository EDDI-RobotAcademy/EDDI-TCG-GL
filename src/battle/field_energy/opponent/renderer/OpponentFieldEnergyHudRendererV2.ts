import * as THREE from "three";

import { FrameRenderer } from "../../../../core/renderer/FrameRenderer";
import {
    OpponentFieldEnergyAreaFrame,
    computeOpponentFieldEnergyBounds,
} from "../frame/OpponentFieldEnergyAreaFrame";

// 상대 필드 에너지 패널과 그 위의 숫자를 캔버스 안에 그린다.
//
// 내 쪽 패널은 화면 위에 얹는 조각(DOM)이다. 그렇게 만들면 캔버스 안에서 아무리
// 나중에 그려도 그 조각을 넘지 못해, 죽음의 대지 같은 연출이 패널 뒤에서 돈다.
// 상대 쪽은 연출의 과녁이라 패널이 캔버스 안에 있어야 연출이 그 앞에서 보인다.
//
// 자리와 크기는 OpponentFieldEnergyAreaFrame 이 이미 재고 있으므로 그대로 쓴다.
// 그래서 보이지 않는 판정용 네모와 눈에 보이는 패널이 항상 같은 자리에 있다.
//
// 이 파일이 바뀌는 이유는 패널이 어떻게 생겼는지가 달라질 때뿐이다.
export class OpponentFieldEnergyHudRendererV2
    implements FrameRenderer<OpponentFieldEnergyAreaFrame>
{
    private static readonly IMAGE_SRC = 'resource/battle_field/field_energy/field_energy_button.png';

    // 연출이 이 앞에서 돌아야 한다. 죽음의 대지가 495 부터 쓰므로 그보다 낮게 둔다.
    private static readonly PANEL_RENDER_ORDER = 45;
    private static readonly LABEL_RENDER_ORDER = 46;

    // DOM 쪽과 같은 값. 화면 높이 1080 을 기준으로 글자 크기를 잰다.
    private static readonly BASE_VIEWPORT_HEIGHT = 1080;
    private static readonly BASE_FONT_SIZE = 48;
    // 글자 크기의 이만큼 세로 가운데보다 아래에 숫자를 놓는다.
    // DOM 쪽 계산과 같다. top = (패널높이 - 글자높이) / 2 + 글자크기 * 0.1
    private static readonly LABEL_VERTICAL_OFFSET_RATIO = 0.1;

    private energy: number;

    constructor(initialEnergy: number = 0) {
        this.energy = initialEnergy;
    }

    public setEnergy(value: number): void {
        this.energy = value;
    }

    public async build(frame: OpponentFieldEnergyAreaFrame): Promise<THREE.Group> {
        const group = new THREE.Group();
        const w = window.innerWidth;
        const h = window.innerHeight;
        const b = computeOpponentFieldEnergyBounds(frame, w, h);

        const texture = await this.loadTexture(OpponentFieldEnergyHudRendererV2.IMAGE_SRC);
        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(b.width, b.height),
            new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
        );
        panel.renderOrder = OpponentFieldEnergyHudRendererV2.PANEL_RENDER_ORDER;
        panel.name = 'panel';
        group.add(panel);

        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(b.width, b.height),
            new THREE.MeshBasicMaterial({ map: this.makeLabelTexture(b.width, b.height, h), transparent: true }),
        );
        label.renderOrder = OpponentFieldEnergyHudRendererV2.LABEL_RENDER_ORDER;
        label.name = 'label';
        label.position.z = 0.001;
        group.add(label);

        group.position.set(b.centerX, b.centerY, 0);
        return group;
    }

    // 숫자가 바뀌면 글자 그림만 다시 만든다.
    public refresh(frame: OpponentFieldEnergyAreaFrame, group: THREE.Group,
                   viewportWidth: number, viewportHeight: number): void {
        const b = computeOpponentFieldEnergyBounds(frame, viewportWidth, viewportHeight);
        const label = group.getObjectByName('label') as THREE.Mesh | undefined;
        if (!label) return;
        const material = label.material as THREE.MeshBasicMaterial;
        material.map?.dispose();
        material.map = this.makeLabelTexture(b.width, b.height, viewportHeight);
        material.needsUpdate = true;
    }

    public resize(frame: OpponentFieldEnergyAreaFrame, group: THREE.Group,
                  viewportWidth: number, viewportHeight: number): void {
        const b = computeOpponentFieldEnergyBounds(frame, viewportWidth, viewportHeight);
        for (const name of ['panel', 'label']) {
            const mesh = group.getObjectByName(name) as THREE.Mesh | undefined;
            if (!mesh) continue;
            mesh.geometry?.dispose();
            mesh.geometry = new THREE.PlaneGeometry(b.width, b.height);
        }
        group.position.set(b.centerX, b.centerY, 0);
        this.refresh(frame, group, viewportWidth, viewportHeight);
    }

    // 연출이 흔들 때 쓴다. 자리를 옮기는 것이 아니라 그 자리에서 떨게 한다.
    public setOffset(group: THREE.Group, dx: number, dy: number): void {
        group.userData.shakeOffset = { dx, dy };
        const base = group.userData.basePosition as { x: number; y: number } | undefined;
        if (!base) {
            group.userData.basePosition = { x: group.position.x, y: group.position.y };
            return this.setOffset(group, dx, dy);
        }
        group.position.set(base.x + dx, base.y + dy, group.position.z);
    }

    // 0 은 멀쩡한 상태, 1 은 균열이 열릴 때, 2 는 부서지는 순간이다.
    // DOM 쪽에서 밝기와 붉은 기로 주던 느낌을 색을 섞어 낸다.
    public setDamageLevel(group: THREE.Group, level: 0 | 1 | 2): void {
        const tint = level === 0 ? 0xffffff : level === 1 ? 0x9a6a6a : 0x7a4a4a;
        for (const name of ['panel', 'label']) {
            const mesh = group.getObjectByName(name) as THREE.Mesh | undefined;
            if (!mesh) continue;
            (mesh.material as THREE.MeshBasicMaterial).color.setHex(tint);
        }
    }

    public dispose(group: THREE.Group): void {
        group.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.geometry?.dispose();
                const material = obj.material as THREE.MeshBasicMaterial;
                material.map?.dispose();
                material.dispose();
            }
        });
        group.clear();
    }

    // 카드 그림과 같은 설정으로 읽는다. TextureManager 를 쓰면 흐릿해진다.
    private loadTexture(src: string): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(
                src,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    resolve(texture);
                },
                undefined,
                reject,
            );
        });
    }

    // 숫자를 그린 그림을 만든다. 캔버스에는 글자를 직접 못 쓰기 때문이다.
    private makeLabelTexture(widthWorld: number, heightWorld: number, viewportHeight: number): THREE.CanvasTexture {
        const scale = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(widthWorld * scale));
        canvas.height = Math.max(1, Math.round(heightWorld * scale));

        const ctx = canvas.getContext('2d')!;
        const fontSize =
            (viewportHeight / OpponentFieldEnergyHudRendererV2.BASE_VIEWPORT_HEIGHT) *
            OpponentFieldEnergyHudRendererV2.BASE_FONT_SIZE * scale;

        ctx.font = `bold ${fontSize}px 'Inter','Roboto','Helvetica','Arial',sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const x = canvas.width / 2;
        // 글자 크기 기준이다. 패널 높이 기준으로 재면 훨씬 아래로 내려간다.
        const y = canvas.height / 2 +
            fontSize * OpponentFieldEnergyHudRendererV2.LABEL_VERTICAL_OFFSET_RATIO;

        // DOM 쪽 글자 그림자와 같게 흰 그림자를 먼저 깔고 어두운 글자를 얹는다.
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(String(this.energy), x, y + 1 * scale);
        ctx.fillStyle = '#222';
        ctx.fillText(String(this.energy), x, y);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        return texture;
    }
}
