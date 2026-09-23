import * as THREE from "three";

import {disposeGroup, markOwnedTexture} from "../../core/lifecycle/DisposableMeshStore";
import {FrameRenderer} from "../../core/renderer/FrameRenderer";
import {LobbyMenuFrame} from "../frame/LobbyMenuFrame";
import {LobbyMenuType} from "../entity/LobbyMenuType";

// 로비 메뉴 단추를 그린다. **THREE 물건을 만드는 것은 여기뿐이다.**
//
// 그림을 제 손으로 읽는다. 전에는 그림 창구를 지났는데, 그 창구가 밉맵을 켜서 글자가
// 뭉개졌다 (R2-130 에서 창구를 고쳤지만, 전투 렌더러와 같은 방식으로 두어 다음에 또
// 창구가 바뀌어도 로비가 흔들리지 않게 한다).
//
// 단추가 어느 메뉴인지는 덩어리에 적어 둔다. 누른 것을 찾을 때 그 표를 읽는다 — 화면이
// 순서 번호를 따로 들고 있지 않아도 된다.
interface ButtonUserData {
    readonly lobbyMenuType: LobbyMenuType;
    readonly baseWidth: number;
    readonly baseHeight: number;
}

export class LobbyMenuRenderer implements FrameRenderer<LobbyMenuFrame> {
    public async build(frame: LobbyMenuFrame): Promise<THREE.Group> {
        const group = new THREE.Group();

        for (const button of frame.buttons) {
            // 그림이 있으면 그림으로, 없으면 글자로 그린다. 크기와 자리는 같다.
            const texture = button.imageSrc !== null
                ? await loadCrisp(button.imageSrc)
                : drawLabel(button.label ?? '');
            const baseWidth = button.widthRatio * window.innerWidth;
            const baseHeight = button.heightRatio * window.innerHeight;

            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(baseWidth, baseHeight),
                new THREE.MeshBasicMaterial({map: texture, transparent: true}),
            );
            mesh.renderOrder = button.renderOrder;
            const userData: ButtonUserData = {
                lobbyMenuType: button.type, baseWidth, baseHeight,
            };
            mesh.userData = userData;
            group.add(mesh);
        }

        this.applyFrame(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resize(
        frame: LobbyMenuFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        this.applyFrame(frame, group, viewportWidth, viewportHeight);
    }

    public dispose(group: THREE.Group): void {
        disposeGroup(group);
    }

    // 눌린 자리에 어느 단추가 있나. 없으면 null.
    //
    // 찾는 일이 그리는 쪽에 있다. 무엇이 어디에 그려져 있는지는 여기만 안다.
    public hitTest(raycaster: THREE.Raycaster, group: THREE.Group): LobbyMenuType | null {
        for (const hit of raycaster.intersectObjects(group.children, false)) {
            const userData = hit.object.userData as Partial<ButtonUserData>;
            if (userData.lobbyMenuType) return userData.lobbyMenuType;
        }
        return null;
    }

    private applyFrame(
        frame: LobbyMenuFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        frame.buttons.forEach((button, index) => {
            const mesh = group.children[index] as THREE.Mesh | undefined;
            if (!mesh) return;
            const userData = mesh.userData as ButtonUserData;

            const width = button.widthRatio * viewportWidth;
            const height = button.heightRatio * viewportHeight;
            mesh.scale.set(width / userData.baseWidth, height / userData.baseHeight, 1);
            mesh.position.set(
                button.xRatio * viewportWidth,
                button.yRatio * viewportHeight,
                0,
            );
        });
    }
}

// 이 프로젝트의 선명한 기준값. 전투 렌더러와 같다.
function loadCrisp(imageSrc: string): Promise<THREE.Texture> {
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

// 그림이 아직 없는 메뉴를 글자로 그린다.
//
// 그림이 생기면 이 함수를 부르는 일이 없어진다. 지우지 않고 남겨 둔다 — 새 메뉴를 붙일
// 때마다 그림보다 글자가 먼저 나오고, 그때 다시 필요하다.
//
// 글자가 있는 만큼만 칠하지 않고 단추 크기만큼 옅은 판을 깔아, 그림 단추와 눌리는 자리가
// 같게 보이게 한다.
function drawLabel(text: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = markOwnedTexture(new THREE.CanvasTexture(canvas));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
}
