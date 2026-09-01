import {OpponentField} from "../entity/OpponentField";
import {OpponentFieldRepository} from "./OpponentFieldRepository";

// 31, 32, 26, 27, 19
export class OpponentFieldRepositoryImpl implements OpponentFieldRepository {
    private static instance: OpponentFieldRepositoryImpl;
    private cardMap: Map<number, OpponentField> = new Map();

    private constructor() {}

    public static getInstance(): OpponentFieldRepositoryImpl {
        if (!OpponentFieldRepositoryImpl.instance) {
            OpponentFieldRepositoryImpl.instance = new OpponentFieldRepositoryImpl();
        }
        return OpponentFieldRepositoryImpl.instance;
    }

    count(): number {
        return this.cardMap.size;
    }

    save(cardSceneId: number, positionId: number, attributeMarkIdList: number[], cardId: number): OpponentField {
        const existingCard = Array.from(this.cardMap.values()).find(card => card.cardSceneId === cardSceneId && card.positionId === positionId);
        if (existingCard) {
            existingCard.attributeMarkIdList = attributeMarkIdList;
            return existingCard;
        }

        const newCard = new OpponentField(cardSceneId, positionId, attributeMarkIdList, cardId);
        this.cardMap.set(newCard.id, newCard);

        return newCard;
    }

    findById(id: number): OpponentField | undefined {
        return this.cardMap.get(id);
    }

    findAll(): OpponentField[] {
        return Array.from(this.cardMap.values());
    }

    deleteById(id: number): boolean {
        return this.cardMap.delete(id);
    }

    deleteAll(): void {
        this.cardMap.clear();
    }

    findByCardSceneId(cardSceneId: number): OpponentField | null {
        const opponentFieldCard = Array.from(this.cardMap.values()).find(opponentFieldCard => opponentFieldCard.cardSceneId === cardSceneId);
        return opponentFieldCard || null;
    }

    findAttributeMarkIdListByCardSceneId(cardSceneId: number): number[] | null {
        const opponentFieldCard = this.findByCardSceneId(cardSceneId);
        if (opponentFieldCard instanceof OpponentField) {
            console.log(`BattleFieldHandRepositoryImpl findAttributeMarkIdListByCardSceneId() -> hand.attributeMarkIdList: ${opponentFieldCard.attributeMarkIdList}`)
        }

        return opponentFieldCard ? opponentFieldCard.attributeMarkIdList : null;
    }

    findPositionIdByCardSceneId(cardSceneId: number): number | null {
        const opponentFieldCard = this.findByCardSceneId(cardSceneId);
        if (opponentFieldCard) {
            console.log(`BattleFieldHandRepositoryImpl findPositionIdByCardSceneId() -> hand.positionId: ${opponentFieldCard.positionId}`);
            return opponentFieldCard.positionId;
        }
        return null;
    }
}
