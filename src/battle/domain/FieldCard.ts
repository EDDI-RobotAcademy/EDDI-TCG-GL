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
        // 필드에 서 있는 동안의 상태다. 손패에 있을 때는 뜻이 없다.
        private hp: number = 0,
        private energyCount: number = 0,
    ) {}

    static restore(snapshot: FieldCardSnapshot): FieldCard {
        return new FieldCard(
            snapshot.battleCardId,
            snapshot.cardId,
            [...snapshot.attributeMarkIds],
            snapshot.positionId,
            snapshot.hp,
            snapshot.energyCount,
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

    getHp(): number {
        return this.hp;
    }

    // 값을 그대로 놓는다. 0 아래로는 안 내려간다.
    setHp(next: number): number {
        this.hp = Math.max(0, next);
        return this.hp;
    }

    isDefeated(): boolean {
        return this.hp <= 0;
    }

    getEnergyCount(): number {
        return this.energyCount;
    }

    setEnergyCount(next: number): number {
        this.energyCount = Math.max(0, next);
        return this.energyCount;
    }

    toSnapshot(): FieldCardSnapshot {
        return {
            battleCardId: this.battleCardId,
            cardId: this.cardId,
            attributeMarkIds: [...this.attributeMarkIds],
            positionId: this.positionId,
            hp: this.hp,
            energyCount: this.energyCount,
        };
    }
}
