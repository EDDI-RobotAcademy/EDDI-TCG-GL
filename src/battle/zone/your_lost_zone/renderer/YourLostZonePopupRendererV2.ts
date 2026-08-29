import * as THREE from "three";

import { HandCard } from "../../../../battle_field_hand/entity/HandCard";
import { HandCardFrame, createDefaultHandCardFrame } from "../../../../battle_field_hand/frame/HandCardFrame";
import { HandCardRendererV2 } from "../../../../battle_field_hand/renderer/HandCardRendererV2";

import {
    YourLostZonePopupFrame,
    computeYourLostZonePopupBounds,
} from "../frame/YourLostZonePopupFrame";

interface PopupUserData {
    baseWidth: number;
    baseHeight: number;
}

// Centered popup: semi-opaque dark background + grid of FULLY-composed ally cards.
// Reuses HandCardRendererV2 so each card shows its weapon/staff, HP, race, and energy
// slots — not a flat image. Rebuilt from scratch on every open so the card set stays
// in sync with the repository.
export class YourLostZonePopupRendererV2 {
    constructor(
        private readonly cardRenderer: HandCardRendererV2 = new HandCardRendererV2(),
        private readonly handCardFrame: HandCardFrame = createDefaultHandCardFrame(),
    ) {}

    public async build(
        frame: YourLostZonePopupFrame,
        cards: readonly HandCard[],
    ): Promise<THREE.Group> {
        const bounds = computeYourLostZonePopupBounds(frame, window.innerWidth, window.innerHeight);
        const baseWidth = bounds.width;
        const baseHeight = bounds.height;

        const group = new THREE.Group();

        // Background plate — covers the popup area, semi-opaque dark.
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: frame.backgroundColor,
            opacity: frame.backgroundOpacity,
            transparent: true,
        });
        const bgGeometry = new THREE.PlaneGeometry(baseWidth, baseHeight);
        const bg = new THREE.Mesh(bgGeometry, bgMaterial);
        bg.renderOrder = frame.renderOrder;
        bg.position.set(bounds.centerX, bounds.centerY, 0);
        group.add(bg);

        const cols = Math.max(1, frame.cardColumns);
        // Children in HandCardRendererV2 use renderOrder 1 (body), 2 (slots), 3 (text).
        // Bump every card mesh above the popup background (frame.renderOrder = 600).
        const roBump = frame.renderOrder + 10;

        if (cards.length > 0) {
            const pad = frame.innerPaddingRatio * baseWidth;
            const gapX = frame.cardGapXRatio;
            const gapY = frame.cardGapYRatio;

            // Cards render at the SAME native size as hand cards — no grid-fit scaling.
            const cw = window.innerWidth * this.handCardFrame.cardWidthRatio;
            const ch = cw * this.handCardFrame.cardAspect;

            const stepX = cw * (1 + gapX);
            const stepY = ch * (1 + gapY);

            // Center the FULL `cols` row span around the popup's centerX so left- and right-
            // side margins are equal when a row is completely filled.
            const originX = bounds.centerX - ((cols - 1) * stepX) / 2;

            // Center by the page CAPACITY (rowsPerPage), not the actual row count — so a
            // partially-filled last page keeps its row 1 at the same y as full pages, instead
            // of floating into the middle of the popup.
            const pageRows = Math.max(1, frame.rowsPerPage);
            const originY = bounds.centerY + ((pageRows - 1) * stepY) / 2;

            for (let i = 0; i < cards.length; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const cx = originX + col * stepX;
                const cy = originY - row * stepY;
                if (cy - ch / 2 < bounds.minY + pad) break;  // no vertical room for another row

                const cardGroup = await this.cardRenderer.build(cards[i], this.handCardFrame);
                cardGroup.position.set(cx, cy, 0);
                cardGroup.traverse((obj) => {
                    if (obj instanceof THREE.Mesh) obj.renderOrder += roBump;
                });
                group.add(cardGroup);
            }
        }

        // ── Prev / Next pagination buttons. Tagged via userData.buttonType so the pilot's
        // mousedown handler can raycast them and swap pages. Positioned at centerY (exactly
        // between rows 1 and 2 when both rows are centered) and ±xOffset from centerX.
        const btnW = frame.pageButton.widthRatio * window.innerWidth;
        const btnH = frame.pageButton.heightRatio * window.innerHeight;
        const btnOffX = frame.pageButton.xOffsetFromCenterRatio * bounds.width;

        const prevMesh = await this.buildButton(frame.pageButton.prevImage, btnW, btnH, roBump + 1, 'prev');
        prevMesh.position.set(bounds.centerX - btnOffX, bounds.centerY, 0);
        group.add(prevMesh);

        const nextMesh = await this.buildButton(frame.pageButton.nextImage, btnW, btnH, roBump + 1, 'next');
        nextMesh.position.set(bounds.centerX + btnOffX, bounds.centerY, 0);
        group.add(nextMesh);

        const userData: PopupUserData = { baseWidth, baseHeight };
        group.userData = userData;
        return group;
    }

    private async buildButton(
        imageSrc: string,
        width: number,
        height: number,
        renderOrder: number,
        buttonType: 'prev' | 'next',
    ): Promise<THREE.Mesh> {
        const texture = await this.loadTexture(imageSrc);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = renderOrder;
        mesh.userData.buttonType = buttonType;
        return mesh;
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
}
