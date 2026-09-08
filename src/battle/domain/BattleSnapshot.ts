import {TurnOwner} from "./TurnOwner";
import {BattleFieldUnitSnapshot} from "./BattleFieldUnitSnapshot";

// 전투 한 판의 상태를 통째로 적어 둔 것이다.
//
// 재접속했을 때 이것 하나만 있으면 전투를 그대로 되돌릴 수 있어야 한다.
// 그래서 화면에 그려지는 것은 여기에 들어오지 않는다. 값만 들어온다.
//
// 필드와 손패가 R2-55 부터 하나씩 여기에 붙는다.
export interface BattleSnapshot {
    readonly battleId: number;
    readonly turnOwner: TurnOwner;
    // 덱은 순서가 그대로여야 한다. 순서가 어긋나면 다음에 뽑히는 카드가 달라진다.
    readonly yourDeckCards: readonly number[];
    readonly opponentDeckCards: readonly number[];
    // 무덤은 쌓인 차례가 그대로여야 한다. 부활하는 카드가 몇 번째 것을 가리킬 수 있다.
    readonly yourTombCards: readonly number[];
    readonly opponentTombCards: readonly number[];
    // 로스트 존도 차례가 그대로여야 한다. 되찾는 카드가 몇 번째 것을 가리킬 수 있다.
    readonly yourLostZoneCards: readonly number[];
    readonly opponentLostZoneCards: readonly number[];
    // 필드에 나온 유닛. 나온 차례가 그대로여야 한다.
    readonly deployedUnits: readonly BattleFieldUnitSnapshot[];
}
