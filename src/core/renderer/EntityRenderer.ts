import * as THREE from "three";

export interface EntityRenderer<E, F> {
    build(entity: E, frame: F): Promise<THREE.Group>;
    update(entity: E, frame: F, group: THREE.Group): void;
    dispose(group: THREE.Group): void;
}
