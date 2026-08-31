import * as THREE from "three";
import { ActivePanelFrame, ActivePanelButtonSpec } from "../frame/ActivePanelFrame";

interface PanelUserData {
    buttons: THREE.Mesh[];
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

        const userData: PanelUserData = { buttons };
        group.userData = userData;
        return group;
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
        group.removeFromParent();
        group.clear();
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
