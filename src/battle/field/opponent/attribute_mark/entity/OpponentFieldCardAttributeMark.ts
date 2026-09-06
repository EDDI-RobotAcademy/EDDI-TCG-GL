import {IdGenerator} from "../../../../../common/id_generator/IdGenerator";
import {OpponentFieldCardAttributeMarkStatus} from "./OpponentFieldCardAttributeMarkStatus";

export class OpponentFieldCardAttributeMark {
    id: number;
    status: OpponentFieldCardAttributeMarkStatus;
    attributeMarkSceneId: number
    attributeMarkPositionId: number

    constructor(status: OpponentFieldCardAttributeMarkStatus = OpponentFieldCardAttributeMarkStatus.HAND, attributeMarkSceneId: number, attributeMarkPositionId: number) {
        this.id = IdGenerator.generateId("OpponentFieldCardAttributeMark");
        this.status = status;
        this.attributeMarkSceneId = attributeMarkSceneId;
        this.attributeMarkPositionId = attributeMarkPositionId
    }

    getId(): number {
        return this.id;
    }
}