import * as THREE from 'three';
import { Shape } from '../Shape';

export class NonBackgroundImage extends Shape {
    private textureInitialized: boolean = false;
    private textureId: THREE.Texture | null = null;
    private mesh: THREE.Mesh | null = null;
    private imageSrc?: string;
    private renderOrder: number;
    private widthRatio: number;
    private heightRatio: number;

    constructor(
        width: number,
        height: number,
        local_translation: THREE.Vector2 = new THREE.Vector2(0, 0),
        global_translation: THREE.Vector2 = new THREE.Vector2(0, 0),
        color: THREE.Color = new THREE.Color(1, 1, 1),
        opacity: number = 1,
        drawBorder: boolean = false,
        isVisible: boolean = true,
        renderOrder: number = 0
    ) {
        super(width, height, local_translation, global_translation, color, opacity, drawBorder, isVisible);
        this.renderOrder = renderOrder;
        this.widthRatio = 1;
        this.heightRatio = 1;
    }

    public createNonBackgroundImage(
        imageSrc: string,
        widthRatio: number,
        heightRatio: number,
        callback?: () => void
    ): void {
        this.widthRatio = widthRatio;
        this.heightRatio = heightRatio;
        this.imageSrc = imageSrc;
        this.loadTexture(callback);
    }

    public createNonBackgroundImageWithTexture(
        texture: THREE.Texture,
        widthRatio: number,
        heightRatio: number
    ): void {
        this.widthRatio = widthRatio;
        this.heightRatio = heightRatio;
        this.textureId = texture;
        this.textureInitialized = true;
    }

    public loadTexture(callback?: () => void): void {
        if (!this.imageSrc) return;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(this.imageSrc, (texture) => {
            this.textureId = texture;
            this.textureInitialized = true;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;

            if (callback) {
                callback();
            }
        });
    }

    public draw(scene: THREE.Scene): void {
        if (!this.textureInitialized || !this.textureId) {
            console.log('Texture not initialized');
            return;
        }

        if (!this.mesh) {
            const material = new THREE.MeshBasicMaterial({
                map: this.textureId,
                transparent: true,
                opacity: this.getOpacity(),
            });

            const geometry = new THREE.PlaneGeometry(this.getWidth(), this.getHeight());
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.renderOrder = this.renderOrder;
            this.mesh.position.set(this.getLocalTranslation().x, this.getLocalTranslation().y, 0);
        }

        if (!scene.children.includes(this.mesh)) {
            scene.add(this.mesh);
        }
    }

    public setWidthRatio(widthRatio: number): void {
        this.widthRatio = widthRatio;
    }

    public setHeightRatio(heightRatio: number): void {
        this.heightRatio = heightRatio;
    }

    public getMesh(): THREE.Mesh {
        return <THREE.Mesh>this.mesh;
    }

    public setTexture(texture: THREE.Texture): void {
        this.textureId = texture;
        this.textureInitialized = true;
    }

    public setScale(scaleX: number, scaleY: number): void {
        if (this.mesh) {
            this.mesh.scale.set(scaleX, scaleY, 1);
        }
    }

    public setPosition(x: number, y: number): void {
        this.getLocalTranslation().set(x, y);
        if (this.mesh) {
            this.mesh.position.set(x, y, 0);
        }
    }
}
