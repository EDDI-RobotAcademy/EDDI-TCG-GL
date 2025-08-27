import {BattleFieldHand} from "../entity/BattleFieldHand";

export interface BattleFieldHandRepository {
    save(cardSceneId: number, positionId: number, attributeMarkIdList: number[], cardId: number): BattleFieldHand;
    findById(id: number): BattleFieldHand | undefined;
    findAllWithPage(currentPage: number, cardsPerPage: number): BattleFieldHand[]
    deleteById(id: number): boolean;
    deleteAll(): void;

    countActiveCards(): number;

    findByCardSceneId(cardSceneId: number): BattleFieldHand | null
    findAttributeMarkIdListByCardSceneId(cardSceneId: number): number[] | null
    findPositionIdByCardSceneId(cardSceneId: number): number | null
    findCardIndexByCardSceneId(cardSceneId: number): number | null
}