import * as THREE from "three";

export class MeshDestroyer {
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public destroyMesh(mesh: THREE.Mesh): void {
        this.scene.remove(mesh);

        if (mesh.geometry) mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
        } else {
            mesh.material.dispose();
        }
    }

    public destroyGroup(group: THREE.Group): void {
        group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                this.destroyMesh(object);
            }
        });
        this.scene.remove(group);
    }

    public destroyMultiple(meshes: THREE.Object3D[]): void {
        for (const mesh of meshes) {
            if (mesh instanceof THREE.Mesh) {
                this.destroyMesh(mesh);
            } else if (mesh instanceof THREE.Group) {
                this.destroyGroup(mesh);
            } else {
                this.scene.remove(mesh);
            }
        }
    }
}
