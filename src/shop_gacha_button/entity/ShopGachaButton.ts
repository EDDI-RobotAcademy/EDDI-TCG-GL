import * as THREE from 'three';
import { ShopGachaButtonPosition } from "../../shop_gacha_button_position/entity/ShopGachaButtonPosition";

export class ShopGachaButton {
    private mesh: THREE.Mesh | null = null;

    constructor(
        readonly id: number,
        readonly race: string,
        readonly position: ShopGachaButtonPosition
    ) {}

    setMesh(mesh: THREE.Mesh) {
        this.mesh = mesh;
        this.updatePosition();
    }

    getMesh(): THREE.Mesh | null {
        return this.mesh;
    }

    private updatePosition() {
        if (this.mesh) {
            const x = this.position.getX() * window.innerWidth;
            const y = this.position.getY() * window.innerHeight;
            this.mesh.position.set(x, y, 1);
        }
    }

    adjustPosition() {
        this.updatePosition();
    }
} 