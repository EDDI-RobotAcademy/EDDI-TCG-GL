import * as THREE from 'three';
import {IdGenerator} from "../../../../../common/id_generator/IdGenerator";
import {MarkSceneType} from "../../../../card/attribute_mark_scene/entity/MarkSceneType";

export class OpponentFieldCardAttributeMarkScene {
    id: number;
    mesh: THREE.Mesh;
    markSceneType: MarkSceneType;
    renderingOrder: number;

    constructor(mesh: THREE.Mesh, markSceneType: MarkSceneType, renderingOrder: number = 0) {
        this.id = IdGenerator.generateId("OpponentFieldCardAttributeMarkScene");
        this.mesh = mesh;
        this.renderingOrder = renderingOrder;
        this.markSceneType = markSceneType
    }

    getId(): number {
        return this.id;
    }

    getMesh(): THREE.Mesh {
        return this.mesh;
    }

    getMarkSceneType(): MarkSceneType {
        return this.markSceneType;
    }

    getRenderingOrder(): number {
        return this.renderingOrder;
    }
}