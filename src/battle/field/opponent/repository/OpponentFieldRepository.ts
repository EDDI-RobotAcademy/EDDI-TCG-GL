import {OpponentField} from "../entity/OpponentField";

export interface OpponentFieldRepository {
    count(): number
    save(cardSceneId: number, positionId: number, attributeMarkIdList: number[], cardId: number): OpponentField;
    findById(id: number): OpponentField | undefined;
    findAll(): OpponentField[];
    deleteById(id: number): boolean;
    deleteAll(): void;
    findByCardSceneId(cardSceneId: number): OpponentField | null
    findAttributeMarkIdListByCardSceneId(cardSceneId: number): number[] | null
    findPositionIdByCardSceneId(cardSceneId: number): number | null
}