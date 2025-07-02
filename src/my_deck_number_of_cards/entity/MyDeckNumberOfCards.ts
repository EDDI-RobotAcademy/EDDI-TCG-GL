import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {IdGenerator} from "../../common/id_generator/IdGenerator";

export class MyDeckNumberOfCards {
    id: number;
    mesh: THREE.Mesh;
    position: Vector2d;

    constructor(mesh: THREE.Mesh, position: Vector2d) {
        this.id = IdGenerator.generateId("MyDeckNumberOfCards");
        this.mesh = mesh;
        this.position = position;
        this.mesh.visible = true;
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public getVisibility(): boolean {
        return this.mesh.visible;
    }

    public setVisibility(state: boolean): void {
        this.mesh.visible = state;
    }

}
