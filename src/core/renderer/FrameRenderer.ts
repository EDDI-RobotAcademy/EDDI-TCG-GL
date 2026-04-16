import * as THREE from "three";

export interface FrameRenderer<F> {
    build(frame: F): Promise<THREE.Group>;
    resize(frame: F, group: THREE.Group, viewportWidth: number, viewportHeight: number): void;
    dispose(group: THREE.Group): void;
}
