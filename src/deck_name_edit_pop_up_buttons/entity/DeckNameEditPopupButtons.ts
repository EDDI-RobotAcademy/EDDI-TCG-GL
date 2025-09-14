import * as THREE from 'three';
import {DeckNameEditPopupButtonsType} from "./DeckNameEditPopupButtonsType";
import {IdGenerator} from "../../common/id_generator/IdGenerator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckNameEditPopupButtons {
    id: number;
    mesh: THREE.Mesh;
    public position: Vector2d;
    public type: DeckNameEditPopupButtonsType;
    public width: number;
    public height: number;

    constructor(type: DeckNameEditPopupButtonsType, width: number, height: number, mesh: THREE.Mesh, position: Vector2d) {
        this.id = IdGenerator.generateId("DeckNameEditPopupButtons");
        this.type = type;
        this.width = width;
        this.height = height;
        this.mesh = mesh;
        this.position = position;
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
