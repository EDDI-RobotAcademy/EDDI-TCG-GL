import * as THREE from 'three';
import { BattleFieldConstants } from "../../src/common/BattleFieldConstants";

class CardRenderer {
    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;

    constructor(container: HTMLElement) {
        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(
            -window.innerWidth / 2,
            window.innerWidth / 2,
            window.innerHeight / 2,
            -window.innerHeight / 2,
            0.1,
            1000
        );
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // 색상 보정 제거
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(this.renderer.domElement);

        this.loadCardTexture('resource/battle_field_unit/card/17.webp');
        this.animate();
    }

    private loadCardTexture(imagePath: string) {
        const img = new Image();
        img.src = imagePath;
        img.onload = () => {
            // Canvas 그대로 RGBA 32비트로 사용
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // 🔴 절대 색상 보정 없음 (감마, contrast, brightness 조정 제거)

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearMipmapNearestFilter;
            texture.magFilter = THREE.NearestFilter;
            texture.generateMipmaps = false;
            texture.colorSpace = THREE.DisplayP3ColorSpace; // sRGB 적용하지 않음

            const cardWidth = BattleFieldConstants.CARD_WIDTH_RATIO * window.innerWidth * 4;
            const cardHeight = cardWidth * 1.615;

            const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            const mesh = new THREE.Mesh(geometry, material);

            this.scene.add(mesh);
        };
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    };
}

const root = document.getElementById('app');
if (!root) throw new Error("app element not found");
new CardRenderer(root);
