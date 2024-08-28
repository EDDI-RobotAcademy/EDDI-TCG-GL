import * as THREE from 'three';

export class TransparentRectangle {
    private mesh: THREE.Mesh;
    private id: string;

    constructor(position: THREE.Vector2, width: number, height: number, color: number = 0x888888, opacity: number = 0.5, id: string) {
        this.id = id;

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });

        console.log('position:', position)

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, 0);
    }

    public getId(): string {
        return this.id;
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public getWidth(): number {
        return (this.mesh.geometry as THREE.PlaneGeometry).parameters.width;
    }

    public getHeight(): number {
        return (this.mesh.geometry as THREE.PlaneGeometry).parameters.height;
    }

    // Scene에 사각형을 추가
    public addToScene(scene: THREE.Scene): void {
        scene.add(this.mesh);
    }

    // Scene에서 사각형 제거
    public removeFromScene(scene: THREE.Scene): void {
        scene.remove(this.mesh);
    }

    // 위치 변경
    public setPosition(position: THREE.Vector2): void {
        this.mesh.position.set(position.x, position.y, 0);
    }

    // 크기 변경
    public setScale(scaleX: number, scaleY: number): void {
        this.mesh.scale.set(scaleX, scaleY, 1);
    }

    // 색상 변경
    public setColor(color: number): void {
        (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);
    }

    // 투명도 변경
    public setOpacity(opacity: number): void {
        (this.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
}
