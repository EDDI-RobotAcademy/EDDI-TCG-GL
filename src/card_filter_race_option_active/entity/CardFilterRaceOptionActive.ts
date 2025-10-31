import * as THREE from 'three';
import {IdGenerator} from "../../common/id_generator/IdGenerator";
import {Vector2d} from "../../common/math/Vector2d";
import {CardRace} from "../../card/race";

export class CardFilterRaceOptionActive {
    id: number;
    type: CardRace;
    mesh: THREE.Mesh;
    position: Vector2d;
    width: number;
    height: number;

    constructor(type: CardRace, width: number, height: number, mesh: THREE.Mesh, position: Vector2d) {
        this.id = IdGenerator.generateId("CardFilterRaceOptionActive");
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
