import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {IdGenerator} from "../../common/id_generator/IdGenerator";

export class MyDeckCardName {
    id: number;
    isVisible: boolean;
    mesh: THREE.Mesh;
    position: Vector2d;
    width: number;
    height: number;

    constructor(mesh: THREE.Mesh, position: Vector2d, width: number, height: number) {
        this.id = IdGenerator.generateId("MyDeckCardName");
        this.isVisible = true;
        this.mesh = mesh;
        this.position = position;
        this.mesh.visible = true;
        this.width = width;
        this.height = height;
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public getVisibility(): boolean {
        return this.isVisible;
    }

    public setVisibility(state: boolean): void {
        this.isVisible = state;
        this.mesh.visible = state;
    }

}
