import * as THREE from 'three';
import {IdGenerator} from "../../../../common/id_generator/IdGenerator";

export class BattleFieldCardScene {
    id: number;
    mesh: THREE.Mesh;

    constructor(mesh: THREE.Mesh) {
        this.id = IdGenerator.generateId("BattleFieldCardScene");
        this.mesh = mesh;
    }

    getId(): number {
        return this.id;
    }

    getMesh(): THREE.Mesh {
        return this.mesh;
    }
}