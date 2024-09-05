import * as THREE from "three";
import {Vector2d} from "../common/math/Vector2d";

export class MeshGenerator {
    static createMesh(texture: THREE.Texture, width: number, height: number, position: Vector2d): THREE.Mesh {
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.getX(), position.getY(), 0);
        return mesh;
    }
}