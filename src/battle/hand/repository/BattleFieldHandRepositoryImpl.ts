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
        return hand;
    }

    findAllWithPage(currentPage: number, cardsPerPage: number): BattleFieldHand[] {
        // 유효한 카드 배열 생성
        const validCards = Array.from(this.cardMap.values());

        // 페이지네이션 처리
        const startIndex = (currentPage - 1) * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;

        return validCards.slice(startIndex, endIndex);
    }

    // 손패에서 진짜로 지운다.
    //
    // 전에는 지우지 않고 cardId 를 -1 로 바꿔 묘비만 남겼다. 화면 저장소가 자리
    // 순번을 열쇠로 쓰고 있어서, 손패도 같은 자리에 구멍을 남겨야 둘이 맞았다.
    // 이제 화면 저장소가 카드 번호를 열쇠로 쓰므로 맞출 필요가 없다.
    deleteById(id: number): boolean {
        return this.cardMap.delete(id);
    }

    deleteAll(): void {
        this.cardMap.clear();
    }

    countActiveCards(): number {
        return this.cardMap.size;
    }

    findByCardSceneId(cardSceneId: number): BattleFieldHand | null {
        const hand = Array.from(this.cardMap.values()).find(hand => hand.cardSceneId === cardSceneId);
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
}
