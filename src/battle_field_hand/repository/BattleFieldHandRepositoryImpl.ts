import {BattleFieldHandRepository} from "./BattleFieldHandRepository";
import {BattleFieldHand} from "../entity/BattleFieldHand";

export class BattleFieldHandRepositoryImpl implements BattleFieldHandRepository {
    private static instance: BattleFieldHandRepositoryImpl;
    private cardMap: Map<number, BattleFieldHand> = new Map();

    private constructor() {}

    public static getInstance(): BattleFieldHandRepositoryImpl {
        if (!BattleFieldHandRepositoryImpl.instance) {
            BattleFieldHandRepositoryImpl.instance = new BattleFieldHandRepositoryImpl();
        }
        return BattleFieldHandRepositoryImpl.instance;
    }

    save(cardSceneId: number, positionId: number, attributeMarkIdList: number[], cardId: number): BattleFieldHand {
        const existingCard = Array.from(this.cardMap.values()).find(card => card.cardSceneId === cardSceneId && card.positionId === positionId);
        if (existingCard) {
            existingCard.attributeMarkIdList = attributeMarkIdList;
            return existingCard;
        }

        const newCard = new BattleFieldHand(cardSceneId, positionId, attributeMarkIdList, cardId);
        this.cardMap.set(newCard.id, newCard);

        return newCard;
    }

    findById(id: number): BattleFieldHand | undefined {
        const hand = this.cardMap.get(id);
        return hand && hand.cardId !== -1 ? hand : undefined;
    }

    findAll(): BattleFieldHand[] {
        return Array.from(this.cardMap.values()).filter(hand => hand.cardId !== -1);
    }

    deleteById(id: number): boolean {
        const hand = this.cardMap.get(id);
        if (hand) {
            hand.cardId = -1; // 인덱스 유지, cardId를 -1로 설정
            return true;
        }
        return false;
    }

    deleteAll(): void {
        this.cardMap.forEach(hand => hand.cardId = -1); // 전체 삭제 시 모든 카드의 cardId를 -1로 변경
    }

    countActiveCards(): number {
        return Array.from(this.cardMap.values())
            .filter(hand => hand.cardId !== -1)
            .length;
    }

    findByCardSceneId(cardSceneId: number): BattleFieldHand | null {
        const hand = Array.from(this.cardMap.values()).find(hand => hand.cardSceneId === cardSceneId && hand.cardId !== -1);
        return hand || null;
    }

    findAttributeMarkIdListByCardSceneId(cardSceneId: number): number[] | null {
        const hand = this.findByCardSceneId(cardSceneId);
        return hand ? hand.attributeMarkIdList : null;
    }

    findPositionIdByCardSceneId(cardSceneId: number): number | null {
        const hand = this.findByCardSceneId(cardSceneId);
        return hand ? hand.positionId : null;
    }

    findCardIndexByCardSceneId(cardSceneId: number): number | null {
        console.log("==== cardMap 전체 상태 ====");
        this.cardMap.forEach((value, key) => {
            console.log(`key: ${key}, value:`, value);
        });
        console.log("===========================");

        // const cardArray = Array.from(this.cardMap.values()).filter(card => card.cardId !== -1);
        // console.log("유효한 카드 배열:", cardArray);

        const cardArray = Array.from(this.cardMap.values())

        const index = cardArray.findIndex(card => card.cardSceneId === cardSceneId);
        console.log(`찾는 cardSceneId: ${cardSceneId}, 찾은 index: ${index}`);

        return index !== -1 ? index : null;
    }
}
