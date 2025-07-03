import * as THREE from 'three';
import {DeckMakePopupButtonsType} from "./DeckMakePopupButtonsType";
import {IdGenerator} from "../../common/id_generator/IdGenerator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckMakePopupButtons {
    id: number;
    mesh: THREE.Mesh;
    public position: Vector2d;
    public type: DeckMakePopupButtonsType;
    public width: number;
    public height: number;

    constructor(type: DeckMakePopupButtonsType, width: number, height: number, mesh: THREE.Mesh, position: Vector2d) {
        this.id = IdGenerator.generateId("DeckMakePopupButtons");
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
