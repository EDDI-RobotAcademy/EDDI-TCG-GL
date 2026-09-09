import {FieldCardSnapshot} from "./FieldCardSnapshot";
import {CardRace} from "../../card/race";

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
        // 붙은 에너지. 종족마다 따로 센다.
        //
        // 스킬 비용이 종족별로 정해져 있고, 앞으로 여러 종족을 함께 요구하는 스킬이
        // 나올 수 있어 총량만으로는 판정할 수 없다.
        private energyByRace: Map<CardRace, number> = new Map(),
    ) {}

    static restore(snapshot: FieldCardSnapshot): FieldCard {
        return new FieldCard(
            snapshot.battleCardId,
            snapshot.cardId,
            [...snapshot.attributeMarkIds],
            snapshot.positionId,
            snapshot.hp,
            new Map(snapshot.energyByRace.map((it) => [it.race, it.count])),
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

    // 붙은 에너지의 총량.
    getEnergyCount(): number {
        let total = 0;
        for (const count of this.energyByRace.values()) total += count;
        return total;
    }

    getEnergyOfRace(race: CardRace): number {
        return this.energyByRace.get(race) ?? 0;
    }

    // 한 종족의 에너지를 더한다. 더한 뒤의 그 종족 개수를 준다.
    addEnergy(race: CardRace, amount: number): number {
        const next = Math.max(0, this.getEnergyOfRace(race) + amount);
        this.energyByRace.set(race, next);
        return next;
    }

    // 종족을 안 가리고 앞에서부터 뺀다. 실제로 뺀 양을 준다.
    drainEnergy(amount: number): number {
        let left = amount;
        for (const [race, count] of [...this.energyByRace]) {
            if (left <= 0) break;
            const taken = Math.min(count, left);
            this.energyByRace.set(race, count - taken);
            left -= taken;
        }
        return amount - left;
    }

    toSnapshot(): FieldCardSnapshot {
        return {
            battleCardId: this.battleCardId,
            cardId: this.cardId,
            attributeMarkIds: [...this.attributeMarkIds],
            positionId: this.positionId,
            hp: this.hp,
            energyByRace: [...this.energyByRace].map(([race, count]) => ({race, count})),
        };
    }
}
