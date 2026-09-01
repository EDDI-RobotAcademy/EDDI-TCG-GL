import {YourFieldRepository} from "./YourFieldRepository";
import {YourField} from "../entity/YourField";

export class YourFieldRepositoryImpl implements YourFieldRepository {
    private static instance: YourFieldRepositoryImpl;
    private cardMap: Map<number, YourField> = new Map();

    private constructor() {}

    public static getInstance(): YourFieldRepositoryImpl {
        if (!YourFieldRepositoryImpl.instance) {
            YourFieldRepositoryImpl.instance = new YourFieldRepositoryImpl();
        }
        return YourFieldRepositoryImpl.instance;
    }

    count(): number {
        return this.cardMap.size;
    }

    save(cardSceneId: number, positionId: number, attributeMarkIdList: number[], cardId: number): YourField {
        const existingCard = Array.from(this.cardMap.values()).find(card => card.cardSceneId === cardSceneId && card.positionId === positionId);
        if (existingCard) {
            existingCard.attributeMarkIdList = attributeMarkIdList;
            return existingCard;
        }

        const newCard = new YourField(cardSceneId, positionId, attributeMarkIdList, cardId);
        this.cardMap.set(newCard.id, newCard);

        return newCard;
    }

    findById(id: number): YourField | undefined {
        return this.cardMap.get(id);
    }

    findAll(): YourField[] {
        return Array.from(this.cardMap.values());
    }

    deleteById(id: number): boolean {
        return this.cardMap.delete(id);
    }

    deleteAll(): void {
        this.cardMap.clear();
    }

    findByCardSceneId(cardSceneId: number): YourField | null {
        const hand = Array.from(this.cardMap.values()).find(hand => hand.cardSceneId === cardSceneId);
        return hand || null;
    }

    findAttributeMarkIdListByCardSceneId(cardSceneId: number): number[] | null {
        const hand = this.findByCardSceneId(cardSceneId);
        if (hand instanceof YourField) {
            console.log(`BattleFieldHandRepositoryImpl findAttributeMarkIdListByCardSceneId() -> hand.attributeMarkIdList: ${hand.attributeMarkIdList}`)
        }

        return hand ? hand.attributeMarkIdList : null;
    }

    findPositionIdByCardSceneId(cardSceneId: number): number | null {
        const hand = this.findByCardSceneId(cardSceneId);
        if (hand) {
            console.log(`BattleFieldHandRepositoryImpl findPositionIdByCardSceneId() -> hand.positionId: ${hand.positionId}`);
            return hand.positionId;
        }
        return null;
    }
}
