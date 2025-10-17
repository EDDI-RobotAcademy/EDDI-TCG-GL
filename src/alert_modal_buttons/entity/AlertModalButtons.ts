import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {IdGenerator} from "../../common/id_generator/IdGenerator";
import {AlertModalButtonsType} from "./AlertModalButtonsType";

export class AlertModalButtons {
    id: number;
    type: AlertModalButtonsType;
    mesh: THREE.Mesh;
    width: number;
    height: number;
    position: Vector2d;

    constructor(type: AlertModalButtonsType, mesh: THREE.Mesh, width: number, height: number, position: Vector2d) {
        this.id = IdGenerator.generateId("AlertModalButtons");
        this.type = type;
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
