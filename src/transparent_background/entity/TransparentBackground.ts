import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {IdGenerator} from "../../common/id_generator/IdGenerator";

export class TransparentBackground {
    id: number;
    mesh: THREE.Mesh;
    width: number = 0;
    height: number = 0;
    position: THREE.Vector2 = new THREE.Vector2(0, 0);

    constructor(mesh: THREE.Mesh, width: number, height: number, position: THREE.Vector2) {
        this.id = IdGenerator.generateId("TransparentBackground");
        this.mesh = mesh;
        this.width = width;
        this.height = height;
        this.position = position;
        this.mesh.visible = false;
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getVisibility(): boolean {
        return this.mesh.visible;
    }

    public setVisibility(state: boolean): void {
        this.mesh.visible = state;
    }

}
