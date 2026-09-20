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
    private attached = new Map<THREE.Group, {icon: THREE.Mesh; text: THREE.Mesh}>();

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
        // 숫자 크기는 **만들 때의 카드 너비** 에서 낸다. 지금 창 너비를 보면 안 된다.
        //
        // 카드는 다시 그리지 않고 겹째 늘어난다. 이 숫자는 그 겹의 자식이라 자동으로 따라
        // 늘어나므로, 창 너비를 또 보면 두 번 늘어난다. 작은 창에서 붙이고 키우면 숫자가
        // 안 커졌고, 다시 재게 하니 이번엔 지나치게 커졌다. 아이콘은 처음부터 카드 너비를
        // 봐서 맞았다.
        const textScale = 0.2 * cardWidth;

        const existing = this.attached.get(cardGroup);
        if (existing) {
            cardGroup.remove(existing.text);
            existing.text.geometry.dispose();
            (existing.text.material as THREE.MeshBasicMaterial).dispose();
            const text = this.buildCountText(count, x, y, textScale);
            cardGroup.add(text);
            this.attached.set(cardGroup, {icon: existing.icon, text});
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

        this.attached.set(cardGroup, {icon, text});
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
