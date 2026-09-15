import {HandCardSnapshot} from "./HandCardSnapshot";

// 손패에 든 카드 한 장이다.
//
// 필드에 놓인 카드와 같은 모양이지만 다른 것이다. 손패는 상대가 못 본다.
// 상대의 손패를 뒤지거나 버리게 하는 카드가 붙으면 이쪽만 바뀐다.
export class HandCard {
    constructor(
        private readonly battleCardId: number,
        private readonly cardId: number,
        private attributeMarkIds: number[],
        // 화면 좌표 덩어리를 찾는 열쇠다. 도메인 값이 아니다.
        // 필드 카드도 같은 것을 들고 있다. 함께 걷어낸다. R2-61
        private readonly positionId: number,
    ) {}

    static restore(snapshot: HandCardSnapshot): HandCard {
        return new HandCard(
            snapshot.battleCardId,
            snapshot.cardId,
            [...snapshot.attributeMarkIds],
            snapshot.positionId,
        );
    }

    getBattleCardId(): number {
        return this.battleCardId;
    }

    getCardId(): number {
        return this.cardId;
    }

    getAttributeMarkIds(): number[] {
        return this.attributeMarkIds;
    }

    setAttributeMarkIds(ids: number[]): void {
        this.attributeMarkIds = ids;
    }

    getPositionId(): number {
        return this.positionId;
    }

    toSnapshot(): HandCardSnapshot {
        return {
            battleCardId: this.battleCardId,
            cardId: this.cardId,
            attributeMarkIds: [...this.attributeMarkIds],
            positionId: this.positionId,
        };
    }
}
