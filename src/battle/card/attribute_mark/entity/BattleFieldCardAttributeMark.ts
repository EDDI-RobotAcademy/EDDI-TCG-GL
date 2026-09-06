import {IdGenerator} from "../../../../common/id_generator/IdGenerator";
import {BattleFieldCardAttributeMarkStatus} from "./BattleFieldCardAttributeMarkStatus";

export class BattleFieldCardAttributeMark {
    id: number;
    status: BattleFieldCardAttributeMarkStatus;
    attributeMarkSceneId: number
    attributeMarkPositionId: number

    constructor(status: BattleFieldCardAttributeMarkStatus = BattleFieldCardAttributeMarkStatus.HAND, attributeMarkSceneId: number, attributeMarkPositionId: number) {
        this.id = IdGenerator.generateId("BattleFieldCardAttributeMark");
        this.status = status;
        this.attributeMarkSceneId = attributeMarkSceneId;
        this.attributeMarkPositionId = attributeMarkPositionId
    }

    getId(): number {
        return this.id;
    }
}