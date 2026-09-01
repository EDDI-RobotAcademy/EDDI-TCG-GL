import {IdGenerator} from "../../../../common/id_generator/IdGenerator";

export class OpponentField {
    id: number;
    cardSceneId: number;
    positionId: number;
    attributeMarkIdList: number[];

    cardId: number

    constructor(cardSceneId: number, positionId: number, attributeMarkIdList: number[], cardId: number) {
        this.id = IdGenerator.generateId("OpponentField");
        this.cardSceneId = cardSceneId;
        this.positionId = positionId;
        this.attributeMarkIdList = attributeMarkIdList;

        this.cardId = cardId
    }

    getId(): number {
        return this.id;
    }

    getCardSceneId(): number {
        return this.cardSceneId;
    }

    getPositionId(): number {
        return this.positionId;
    }

    getAttributeMarkIdList(): number[] {
        return this.attributeMarkIdList;
    }

    getCardId(): number {
        return this.cardId;
    }
}
