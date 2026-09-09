import {CardRace} from "../../card/race";

// 전투에서 무슨 일이 일어났는가.
//
// 사용자가 한 일 하나에 이것이 여럿 나온다. 일어난 차례대로 나온다.
// 화면은 이것만 보고 그린다. 지금 상태를 다시 읽지 않는다.
//
// 지금 상태만 보면 [상대 유닛이 넷이다] 는 알아도 [3번이 베여 쓰러졌다] 는 모른다.
// 무엇이 달라졌는지를 모르면 어떤 연출을 틀지 못 고른다.
export type BattleEvent =
    // 할 수 없다. 왜 안 되는지가 함께 온다
    | {type: 'rejected'; reason: string}
    // 카드가 어디에서 어디로 갔다
    | {type: 'cardMoved'; battleCardId: number; cardId: number; from: CardPlace; to: CardPlace}
    // 무엇이 얼마나 다쳤다
    | {type: 'damaged'; target: DamageTarget; amount: number; hpBefore: number; hpAfter: number}
    // 무엇이 쓰러졌다
    | {type: 'defeated'; target: DamageTarget}
    // 값이 이만큼 바뀌었다
    | {type: 'valueChanged'; what: ChangedValue; before: number; after: number}
    // 유닛에 에너지가 붙었다
    | {type: 'energyAttached'; battleCardId: number; race: CardRace; countAfter: number}
    // 턴이 넘어갔다
    | {type: 'turnPassed'; to: 'your' | 'opponent'}
    // 유닛에 붙어 있던 것이 풀렸다
    | {type: 'statusCleared'; battleCardId: number; what: UnitStatus};

// 카드가 있을 수 있는 자리
export type CardPlace = 'yourDeck' | 'opponentDeck' | 'hand' | 'yourField' | 'opponentField'
    | 'yourTomb' | 'opponentTomb' | 'yourLostZone' | 'opponentLostZone';

// 피해를 입을 수 있는 것
export type DamageTarget =
    | {kind: 'unit'; battleCardId: number}
    | {kind: 'yourMaster'}
    | {kind: 'opponentMaster'};

// 종족은 카드 쪽에 있는 것을 그대로 쓴다
export type {CardRace} from "../../card/race";

// 유닛에 붙는 것
export type UnitStatus = 'frozen' | 'darkFlame';

// 숫자로 세는 것
export type ChangedValue = 'turnNumber' | 'fieldEnergy' | 'opponentFieldEnergy';
