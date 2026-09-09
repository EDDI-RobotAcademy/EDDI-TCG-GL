// 카드를 격자로 늘어놓고 페이지를 넘기는 팝업을 그린다.
import {disposeGroup} from "../../../core/lifecycle/DisposableMeshStore";
//
// 여러 화면이 쓰는 부품이다. 특정 화면의 것이 아니다.
//   내 로스트존, 상대 로스트존, 내 무덤, 상대 무덤, 레오닉의 부름(내 덱에서 고르기)
//   해골 군주 레오닉(#17)을 구현하면 상대 핸드 보기가 더해진다
//
// 도메인을 모른다. 배치 값과 카드 목록만 받아 그린다.
// 카드를 고르는 동작은 이 파일 밖에 있다.
//
// 화면마다 다르게 그려야 할 것이 생기면 이 부품을 나누지 말고,
// 그 화면의 팝업을 따로 만들어 이 부품을 쓰게 한다.

import * as THREE from "three";

import { CardFace } from "../../hand/entity/CardFace";
import { HandCardFrame, createDefaultHandCardFrame } from "../../hand/frame/HandCardFrame";
import { HandCardRendererV2 } from "../../hand/renderer/HandCardRendererV2";

import {
    CardGridPopupFrame,
    computeCardGridPopupBounds,
} from "../frame/CardGridPopupFrame";

interface PopupUserData {
    baseWidth: number;
    baseHeight: number;
}

// Centered popup: semi-opaque dark background + grid of FULLY-composed ally cards.
// Reuses HandCardRendererV2 so each card shows its weapon/staff, HP, race, and energy
// slots — not a flat image. Rebuilt from scratch on every open so the card set stays
// in sync with the repository.
export class CardGridPopupRenderer {
    constructor(
        private readonly cardRenderer: HandCardRendererV2 = new HandCardRendererV2(),
        private readonly handCardFrame: HandCardFrame = createDefaultHandCardFrame(),
    ) {}

    public async build(
        frame: CardGridPopupFrame,
        cards: readonly CardFace[],
    ): Promise<THREE.Group> {
        const bounds = computeCardGridPopupBounds(frame, window.innerWidth, window.innerHeight);
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

            // Cards render at the SAME native size as hand cards, so the popup's cards match
            // the ones in hand. That size comes from the viewport WIDTH only, while the popup
            // box height comes from the viewport HEIGHT — so a short window leaves a box too
            // short for the rows, and the bottom row falls outside and never gets built.
            //
            // Only in that case do the cards shrink, just enough for the page's rows to fit.
            // At normal window shapes fitScale stays 1 and nothing changes.
            const nativeCw = window.innerWidth * this.handCardFrame.cardWidthRatio;
            const nativeCh = nativeCw * this.handCardFrame.cardAspect;

            const pageRowsForFit = Math.max(1, frame.rowsPerPage);
            const neededHeight = nativeCh * (1 + (pageRowsForFit - 1) * (1 + gapY));
            const availableHeight = Math.max(0, bounds.height - 2 * pad);
            // 창을 아주 낮추면 안쪽 여백만으로 상자가 다 차서 남는 높이가 0 이 된다.
            // 그때 카드가 0 이 되지 않게 바닥을 둔다.
            const fitScale = neededHeight > 0 && availableHeight < neededHeight
                ? Math.max(0.2, availableHeight / neededHeight)
                : 1;

            const cw = nativeCw * fitScale;
            const ch = nativeCh * fitScale;

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
                // 카드 안의 것은 전부 카드 가운데를 기준으로 놓이므로 통째로 줄여도 어긋나지 않는다.
                if (fitScale !== 1) cardGroup.scale.setScalar(fitScale);
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
        disposeGroup(group);
    }
}
