import {FieldCardSnapshot} from "./FieldCardSnapshot";

// 필드에 놓인 카드 한 장이다.
//
// 신원은 이 카드가 누구인가다. 전투 내내 안 바뀌고, 줄 세우는 데 쓰지 않는다.
// 몇 번째에 놓여 있는가는 Field 가 목록으로 들고 있다.
export class FieldCard {
    constructor(
        private readonly battleCardId: number,
        private readonly cardId: number,
        private attributeMarkIds: number[],
        // 화면 좌표 덩어리를 찾는 열쇠다. 도메인 값이 아니다.
        // 손패도 같은 방식이라 함께 걷어내야 한다. R2-57 에서 본다.
        private readonly positionId: number,
    ) {}

    static restore(snapshot: FieldCardSnapshot): FieldCard {
        return new FieldCard(
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

    toSnapshot(): FieldCardSnapshot {
        return {
            battleCardId: this.battleCardId,
            cardId: this.cardId,
            attributeMarkIds: [...this.attributeMarkIds],
            positionId: this.positionId,
        };
    }
}
