import * as THREE from 'three';
import {IdGenerator} from "../../../../../common/id_generator/IdGenerator";

export class OpponentFieldCardScene {
    id: number;
    mesh: THREE.Mesh;

    constructor(mesh: THREE.Mesh) {
        this.id = IdGenerator.generateId("OpponentFieldCardScene");
        this.mesh = mesh;
    }

    getId(): number {
        return this.id;
    }

    getMesh(): THREE.Mesh {
        return this.mesh;
    }
}