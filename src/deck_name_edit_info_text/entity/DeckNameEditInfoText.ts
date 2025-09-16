import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {IdGenerator} from "../../common/id_generator/IdGenerator";

export class DeckNameEditInfoText {
    id: number;
    mesh: THREE.Mesh;
    position: Vector2d;
    width: number;
    height: number;

    constructor(mesh: THREE.Mesh, position: Vector2d, width: number, height: number) {
        this.id = IdGenerator.generateId("DeckNameEditInfoText");
        this.mesh = mesh;
        this.position = position;
        this.width = width; // canvas 가로
        this.height = height; // canvas 높이
        this.mesh.visible = false;
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
