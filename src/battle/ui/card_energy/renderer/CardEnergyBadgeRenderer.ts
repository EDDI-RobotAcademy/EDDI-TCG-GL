import * as THREE from "three";
import {HandCardFrame} from "../../hand/frame/HandCardFrame";

// 카드 한 장에 붙은 에너지 표기다. 아이콘 하나와 그 위의 숫자 하나.
//
// 둘은 한 덩어리다. 숫자가 아이콘 자리에 맞춰 놓이므로 따로 두면 둘이 어긋난다.
//
// 값은 안 든다. 몇 개인지는 전투가 알고, 여기는 받은 수를 그린다.
export class CardEnergyBadgeRenderer {
    // 아이콘 그림은 한 번만 읽는다. 카드마다 읽으면 같은 그림을 여러 번 읽게 된다.
    private iconTexture: THREE.Texture | null = null;

    // 카드에 붙여 둔 것. 다시 그릴 때 숫자만 갈아 끼운다.
    //
    // 몇 개였는지도 함께 적어 둔다. 창 크기가 바뀌면 아이콘과 숫자를 새 크기로 다시
    // 그려야 하는데, 그때 개수를 밖에서 다시 받지 않아도 되게 한다.
    private attached = new Map<
        THREE.Group, {icon: THREE.Mesh; text: THREE.Mesh; count: number}
    >();

    // 카드에 에너지 표기를 그린다. 이미 있으면 숫자만 바꾼다.
    public async draw(
        cardGroup: THREE.Group, count: number, frame: HandCardFrame,
    ): Promise<void> {
        const userData = cardGroup.userData as {baseCardWidth?: number; baseCardHeight?: number};
        const cardWidth = userData.baseCardWidth ?? 100;
        const cardHeight = userData.baseCardHeight ?? 160;

        const slot = frame.slots.energy;
        const x = slot.offsetXRatio * cardWidth;
        const y = slot.offsetYRatio * cardHeight;
        const textScale = frame.cardWidthRatio * 0.2 * window.innerWidth;

        const existing = this.attached.get(cardGroup);
        if (existing) {
            cardGroup.remove(existing.text);
            existing.text.geometry.dispose();
            (existing.text.material as THREE.MeshBasicMaterial).dispose();
            const text = this.buildCountText(count, x, y, textScale);
            cardGroup.add(text);
            this.attached.set(cardGroup, {icon: existing.icon, text, count});
            return;
        }

        if (!this.iconTexture) {
            this.iconTexture = await this.loadTexture(
                'resource/battle_field_unit/energy/unit_card_energy.png',
            );
        }

        const iconWidth = slot.widthRatio * cardWidth;
        const iconHeight = iconWidth * slot.aspect;
        const icon = new THREE.Mesh(
            new THREE.PlaneGeometry(iconWidth, iconHeight),
            new THREE.MeshBasicMaterial({map: this.iconTexture, transparent: true, opacity: 1}),
        );
        icon.position.set(x, y, 0);
        icon.renderOrder = 2;
        cardGroup.add(icon);

        const text = this.buildCountText(count, x, y, textScale);
        cardGroup.add(text);

        this.attached.set(cardGroup, {icon, text, count});
    }

    // 창 크기가 바뀌었다. 붙어 있는 모든 카드의 아이콘과 숫자를 새 크기로 다시 그린다.
    //
    // 아이콘 크기와 숫자 크기가 카드 크기에서 나오고, 카드는 창 크기를 따라간다. 그래서
    // 카드만 다시 재면 숫자가 옛 크기로 남는다. 작게 만들어 붙이고 키우면 숫자가 안 커졌다.
    public async resizeAll(frame: HandCardFrame): Promise<void> {
        // 도는 중에 지도가 바뀔 수 있으므로 먼저 베껴 둔다.
        const entries = [...this.attached.entries()];
        for (const [cardGroup, held] of entries) {
            // 아이콘은 크기와 자리를 다시 잡고, 숫자는 새로 구워 얹는다.
            this.dispose(cardGroup);
            await this.draw(cardGroup, held.count, frame);
        }
    }

    // 이 카드에 에너지 표기가 붙어 있는가.
    public has(cardGroup: THREE.Group): boolean {
        return this.attached.has(cardGroup);
    }

    public dispose(cardGroup: THREE.Group): void {
        const held = this.attached.get(cardGroup);
        if (!held) return;
        for (const mesh of [held.icon, held.text]) {
            cardGroup.remove(mesh);
            mesh.geometry.dispose();
            (mesh.material as THREE.MeshBasicMaterial).dispose();
        }
        this.attached.delete(cardGroup);
    }

    // 숫자를 그림으로 구워 판에 얹는다.
    private buildCountText(value: number, x: number, y: number, scale: number): THREE.Mesh {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 96px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toString(), canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({map: texture, transparent: true}),
        );
        mesh.position.set(x, y, 0.01);
        mesh.scale.set(scale, scale, 1);
        mesh.renderOrder = 3;
        return mesh;
    }

    // 카드 그림과 같은 설정으로 읽는다. 이 설정이 달라지면 그림이 흐려진다.
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
