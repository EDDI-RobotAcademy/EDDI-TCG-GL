import * as THREE from "three";

import {disposeGroup} from "../../core/lifecycle/DisposableMeshStore";
import {FrameRenderer} from "../../core/renderer/FrameRenderer";
import {ShopMenuFrame} from "../frame/ShopMenuFrame";
import {ShopMenuType} from "../entity/ShopMenuType";

// 상점에서 누를 수 있는 것을 그린다. **THREE 물건을 만드는 것은 여기뿐이다.**
//
// 그림이 있는 것은 그림으로, 없는 것은 **안 보이는 판**으로 그린다. 배경에 이미 글자가
// 그려져 있는 자리(로비, 내 카드)가 그렇다 — 그림을 또 그리면 겹친다.
//
// 안 보이는 것도 창 크기를 따라가야 한다. 안 그러면 그림은 제자리에 있는데 누르는 자리만
// 처음 크기에 남는다. 이 저장소에서 가장 자주 난 버그다.
interface ItemUserData {
    readonly shopMenuType: ShopMenuType;
    readonly baseWidth: number;
    readonly baseHeight: number;
}

export class ShopMenuRenderer implements FrameRenderer<ShopMenuFrame> {
    public async build(frame: ShopMenuFrame): Promise<THREE.Group> {
        const group = new THREE.Group();

        for (const item of frame.items) {
            const baseWidth = item.widthRatio * window.innerWidth;
            const baseHeight = item.heightRatio * window.innerHeight;

            const material = item.imageSrc !== null
                ? new THREE.MeshBasicMaterial({
                    map: await loadCrisp(item.imageSrc), transparent: true,
                })
                // 안 보이지만 광선에는 걸린다.
                : new THREE.MeshBasicMaterial({transparent: true, opacity: 0});

            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(baseWidth, baseHeight), material,
            );
            mesh.renderOrder = item.renderOrder;
            const userData: ItemUserData = {
                shopMenuType: item.type, baseWidth, baseHeight,
            };
            mesh.userData = userData;
            group.add(mesh);
        }

        this.applyFrame(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resize(
        frame: ShopMenuFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        this.applyFrame(frame, group, viewportWidth, viewportHeight);
    }

    public dispose(group: THREE.Group): void {
        disposeGroup(group);
    }

    // 눌린 자리에 무엇이 있나. 없으면 null.
    public hitTest(raycaster: THREE.Raycaster, group: THREE.Group): ShopMenuType | null {
        for (const hit of raycaster.intersectObjects(group.children, false)) {
            const userData = hit.object.userData as Partial<ItemUserData>;
            if (userData.shopMenuType) return userData.shopMenuType;
        }
        return null;
    }

    private applyFrame(
        frame: ShopMenuFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        frame.items.forEach((item, index) => {
            const mesh = group.children[index] as THREE.Mesh | undefined;
            if (!mesh) return;
            const userData = mesh.userData as ItemUserData;

            const width = item.widthRatio * viewportWidth;
            const height = item.heightRatio * viewportHeight;
            mesh.scale.set(width / userData.baseWidth, height / userData.baseHeight, 1);
            mesh.position.set(item.xRatio * viewportWidth, item.yRatio * viewportHeight, 0);
        });
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
