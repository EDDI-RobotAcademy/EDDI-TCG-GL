import * as THREE from "three";

import {disposeGroup} from "../../core/lifecycle/DisposableMeshStore";
import {ShopMenuType} from "../entity/ShopMenuType";
import {
    ShopDrawConfirmFrame, confirmBoardImage, YES_IMAGE, NO_IMAGE,
} from "../frame/ShopDrawConfirmFrame";

// 뽑기 확인 화면에서 누른 것.
export type ConfirmPick = 'yes' | 'no';

// 뽑기 화면 둘을 그린다. **THREE 물건을 만드는 것은 여기뿐이다.**
//
// 확인 화면과 결과 화면을 한 렌더러가 든다. 둘이 같은 방식으로 뜨고 사라지고 — 화면 전체를
// 덮는 판 위에 얹히고, 누르면 없어진다. 따로 두면 그 [덮고 얹고 없애기] 를 두 벌 쓴다.
export class ShopDrawRenderer {
    // ── 확인 화면 ───────────────────────────────────────────────────────────────

    public async buildConfirm(
        frame: ShopDrawConfirmFrame, type: ShopMenuType,
    ): Promise<THREE.Group | null> {
        const boardImage = confirmBoardImage(type);
        if (boardImage === null) return null;

        const group = new THREE.Group();
        // 뒤를 덮는다. 이것이 없으면 확인 화면 뒤의 단추가 눌린다.
        group.add(dimPlane(frame.dimOpacity, frame.dimRenderOrder));

        group.add(await imagePlane(boardImage, {
            widthRatio: frame.boardWidthRatio,
            heightRatio: frame.boardHeightRatio,
            xRatio: frame.boardXRatio,
            yRatio: frame.boardYRatio,
            renderOrder: frame.renderOrder,
        }));

        group.add(await imagePlane(YES_IMAGE, {
            widthRatio: frame.buttonWidthRatio,
            heightRatio: frame.buttonHeightRatio,
            xRatio: frame.yesXRatio,
            yRatio: frame.buttonYRatio,
            renderOrder: frame.renderOrder,
            pick: 'yes',
        }));
        group.add(await imagePlane(NO_IMAGE, {
            widthRatio: frame.buttonWidthRatio,
            heightRatio: frame.buttonHeightRatio,
            xRatio: frame.noXRatio,
            yRatio: frame.buttonYRatio,
            renderOrder: frame.renderOrder,
            pick: 'no',
        }));

        this.resizeConfirm(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resizeConfirm(
        frame: ShopDrawConfirmFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        applyPlanes(group, viewportWidth, viewportHeight);
    }

    // 눌린 자리에 예/아니오 단추가 있나. 없으면 null — 그 누름은 그냥 먹는다.
    public hitConfirm(raycaster: THREE.Raycaster, group: THREE.Group): ConfirmPick | null {
        for (const hit of raycaster.intersectObjects(group.children, false)) {
            const pick = (hit.object.userData as {pick?: ConfirmPick}).pick;
            if (pick) return pick;
        }
        return null;
    }

    public dispose(group: THREE.Group): void {
        this.stopBackClock(group);
        disposeGroup(group);
    }

    public stopBackClock(group: THREE.Group): void {
        const state = (group.userData as {backClock?: {running: boolean}}).backClock;
        if (state) state.running = false;
    }
}

// 판 하나가 창 크기에 대해 어떻게 놓이는가. 다시 잴 때 이 값을 읽는다.
interface PlaneUserData {
    // 창 **너비** 에 대한 비율.
    widthRatio: number;
    // 창 **높이** 에 대한 비율.
    heightRatio: number;
    // x 는 창 너비에, y 는 창 높이에 대한 비율.
    xRatio: number;
    yRatio: number;
    baseWidth: number;
    baseHeight: number;
    pick?: ConfirmPick;
}

// 화면 전체를 덮어 뒤를 못 누르게 하는 판.
//
// 창 크기보다 넉넉하게 만든다. 창이 커지면 덮는 판도 커져야 하는데, 배율로 늘리면 가장자리
// 한 줄이 비는 일이 있다.
function dimPlane(opacity: number, renderOrder: number): THREE.Mesh {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity}),
    );
    mesh.renderOrder = renderOrder;
    const userData: PlaneUserData = {
        widthRatio: 1.2, heightRatio: 1.2, xRatio: 0, yRatio: 0,
        baseWidth: 1, baseHeight: 1,
    };
    mesh.userData = userData;
    return mesh;
}

async function imagePlane(
    imageSrc: string,
    spec: {
        widthRatio: number; heightRatio: number;
        xRatio: number; yRatio: number; renderOrder: number;
        pick?: ConfirmPick;
    },
): Promise<THREE.Mesh> {
    const texture = await loadCrisp(imageSrc);
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({map: texture, transparent: true}),
    );
    mesh.renderOrder = spec.renderOrder;
    const userData: PlaneUserData = {
        widthRatio: spec.widthRatio, heightRatio: spec.heightRatio,
        xRatio: spec.xRatio, yRatio: spec.yRatio,
        baseWidth: 1, baseHeight: 1,
        pick: spec.pick,
    };
    mesh.userData = userData;
    return mesh;
}


// 담긴 판 전부를 지금 창 크기에 맞춘다.
function applyPlanes(
    group: THREE.Group, viewportWidth: number, viewportHeight: number,
): void {
    for (const child of group.children) {
        if (!(child instanceof THREE.Mesh)) continue;
        const it = child.userData as PlaneUserData;
        child.scale.set(
            (it.widthRatio * viewportWidth) / it.baseWidth,
            (it.heightRatio * viewportHeight) / it.baseHeight,
            1,
        );
        child.position.set(it.xRatio * viewportWidth, it.yRatio * viewportHeight, 0);
    }
}

// 이 프로젝트의 선명한 기준값. 전투·로비 렌더러와 같다.
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




