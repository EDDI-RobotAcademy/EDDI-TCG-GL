import * as THREE from "three";
import {disposeGroup} from "../../../core/lifecycle/DisposableMeshStore";
import { ActivePanelFrame, ActivePanelButtonSpec } from "../frame/ActivePanelFrame";

interface PanelUserData {
    buttons: THREE.Mesh[];
    background: THREE.Mesh;
}

export class ActivePanelRendererV2 {
    public async build(
        frame: ActivePanelFrame,
        clickPos: { x: number; y: number },
        buttonSpecs: ActivePanelButtonSpec[],
    ): Promise<THREE.Group> {
        const group = new THREE.Group();
        const w = window.innerWidth;
        const btnW = frame.buttonWidthRatio * w;
        const btnH = frame.buttonHeightRatio * w;
        const gap = frame.buttonGapRatio * w;
        const padding = btnW * 0.15;

        const totalHeight = buttonSpecs.length * btnH + (buttonSpecs.length - 1) * gap;
        const startY = clickPos.y + totalHeight / 2 - btnH / 2;

        // Background panel (semi-transparent dark plate behind the buttons)
        const bgW = btnW + padding * 2;
        const bgH = totalHeight + padding * 2;
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a2e,
            opacity: 0.85,
            transparent: true,
        });
        const bgGeometry = new THREE.PlaneGeometry(bgW, bgH);
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        bgMesh.position.set(clickPos.x, clickPos.y, 0.4);
        bgMesh.renderOrder = frame.renderOrder - 1;
        group.add(bgMesh);

        const buttons: THREE.Mesh[] = [];

        for (let i = 0; i < buttonSpecs.length; i++) {
            const spec = buttonSpecs[i];
            const texture = await this.loadTexture(spec.imageSrc);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 1,
            });
            const geometry = new THREE.PlaneGeometry(btnW, btnH);
            const mesh = new THREE.Mesh(geometry, material);

            const btnY = startY - i * (btnH + gap);
            mesh.position.set(clickPos.x, btnY, 0.5);
            mesh.renderOrder = frame.renderOrder;
            mesh.userData.buttonType = spec.type;

            group.add(mesh);
            buttons.push(mesh);
        }

        const userData: PanelUserData = { buttons, background: bgMesh };
        group.userData = userData;
        return group;
    }

    // 창 크기가 바뀌었을 때. 버튼 크기가 창 너비에서 나오므로 크기와 자리를 다시 잡는다.
    //
    // 어디에 설지는 밖에서 받는다. 이 패널은 처음에 우클릭한 자리에 뜨는데, 창이 바뀌면
    // 그 카드가 다른 자리로 가기 때문에 카드를 따라온 자리를 화면이 재서 준다.
    //
    // 그림은 그대로 두고 크기와 자리만 고친다. 다시 만들면 누를 것이 통째로 바뀌어
    // 열려 있는 패널을 누르던 중에 놓친다.
    public resize(
        frame: ActivePanelFrame,
        group: THREE.Group,
        anchor: { x: number; y: number },
        viewportWidth: number,
    ): void {
        const { buttons, background } = group.userData as PanelUserData;
        if (buttons.length === 0) return;

        const btnW = frame.buttonWidthRatio * viewportWidth;
        const btnH = frame.buttonHeightRatio * viewportWidth;
        const gap = frame.buttonGapRatio * viewportWidth;
        const padding = btnW * 0.15;

        const totalHeight = buttons.length * btnH + (buttons.length - 1) * gap;
        const startY = anchor.y + totalHeight / 2 - btnH / 2;

        background.geometry?.dispose();
        background.geometry = new THREE.PlaneGeometry(btnW + padding * 2, totalHeight + padding * 2);
        background.position.set(anchor.x, anchor.y, 0.4);

        for (let i = 0; i < buttons.length; i++) {
            const mesh = buttons[i];
            mesh.geometry?.dispose();
            mesh.geometry = new THREE.PlaneGeometry(btnW, btnH);
            mesh.position.set(anchor.x, startY - i * (btnH + gap), 0.5);
        }
    }

    public dispose(group: THREE.Group): void {
        disposeGroup(group);
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
