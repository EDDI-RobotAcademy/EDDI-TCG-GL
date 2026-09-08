import {BattleSnapshot} from "./BattleSnapshot";
import {TurnOwner} from "./TurnOwner";

// 전투 한 판이다.
//
// 지금은 흩어져 있는 턴, 덱, 무덤, 로스트 존, 유닛, 필드, 손패가 이 안으로 들어온다.
// 흩어져 있으면 재접속했을 때 그중 하나만 어긋나도 화면과 실제 상태가 달라진다.
// 한 덩어리로 두면 통째로 적고 통째로 되돌린다.
//
// 여기에는 화면에 그려지는 것을 두지 않는다. 적어 둘 수 있는 값만 둔다.
export class Battle {
    // 전투는 내 턴으로 시작한다. 게임을 연 쪽이 먼저 둔다.
    private turnOwner: TurnOwner = 'your';

    private constructor(private readonly battleId: number) {}

    // 전투를 새로 시작한다.
    static start(battleId: number): Battle {
        return new Battle(battleId);
    }

    // 적어 둔 것으로부터 전투를 되돌린다. 재접속할 때 쓴다.
    static restore(snapshot: BattleSnapshot): Battle {
        const battle = new Battle(snapshot.battleId);
        battle.turnOwner = snapshot.turnOwner;
        return battle;
    }

    getId(): number {
        return this.battleId;
    }

    getTurnOwner(): TurnOwner {
        return this.turnOwner;
    }

    setTurnOwner(owner: TurnOwner): void {
        if (this.turnOwner === owner) return;
        const prev = this.turnOwner;
        this.turnOwner = owner;
        console.log(`[turn-state] owner: ${prev} → ${owner}`);
    }

    // 지금 상태를 통째로 적는다.
    toSnapshot(): BattleSnapshot {
        return {
            battleId: this.battleId,
            turnOwner: this.turnOwner,
        };
    }
}
