import {Battle} from "../domain/battle/Battle";
import {Master} from "../domain/battle/Master";
import {BattleSnapshot} from "../domain/battle/BattleSnapshot";
import {FieldCardSnapshot} from "../domain/battle/FieldCardSnapshot";
import {HandCardSnapshot} from "../domain/battle/HandCardSnapshot";
import {CardCatalog} from "../domain/ability/CardCatalog";
import {CardRace} from "../../card/race";
import {IdGenerator} from "../../common/id_generator/IdGenerator";

// 확인용 화면이 켜질 때 판에 미리 놓아 두는 것이다.
//
// **게임 규칙이 아니다.** 진짜 대전이면 필드 에너지는 0 에서 시작하고 무덤도 로스트 존도
// 상대 필드도 전부 비어 있다. 여기 적힌 것은 전투 화면을 서버 없이 확인하려고 차려 둔
// 판이다. 무덤에 열두 장을 넣어 둔 것은 팝업의 페이지 넘기기를 보려는 것이고, 상대 필드에
// 유닛을 세워 둔 것은 때릴 상대가 있어야 공격을 볼 수 있어서다.
//
// 네트워크가 붙으면 이 파일을 안 부른다. 서버가 준 것으로 채운다. 그래서 그리는 코드
// 사이사이에 흩어 두지 않고 여기 한곳에 모았다 (지침의 [확인 / 검증 방식] 참고).
//
// **전투 상태를 만지지 않는다. 값만 적는다.** 전에는 판을 넘겨받아 열 군데를 직접 고쳤고,
// 그러려면 전투 화면이 판을 받아 여기로 넘겨 줘야 했다. 그 길로 전투 화면이 판 전체를
// 손에 들었다.
//
// 지금은 판 하나를 통째로 적어 둔 것을 만들어 내놓는다. 그것으로 판을 되돌리는 문은
// 이미 있었다 — 재접속용으로 만들어 둔 것이다. 진짜 대전에서 서버가 보내 주는 것도 같은
// 것이라, 들어오는 문이 하나로 맞는다.

// 손패의 시작 카드.
export const SIMULATION_HAND_CARD_IDS: readonly number[] = [
    2, 19, 93, 26,
    27,
    9,   // 에너지 번 (ITEM)
    25,  // 파멸의 계약 (ITEM)
    35,  // 사기 전환 (ITEM)
    20,  // 망자의 늪 (SUPPORT)
    36,  // 죽음의 대지 (ITEM)
    30,  // 레오닉의 부름 (SUPPORT)
    33,  // 시체 폭발 (ITEM)
];

// 상대 필드의 시작 배치.
//
// 네더 블레이드(19) 를 둘 넣은 것은 죽음의 낫 판정을 보려는 것이다. 신화 등급이 아니면
// 즉사하고 신화면 정해진 만큼만 깎인다. 둘인 것은 같은 대상을 두 번 고르는 카드
// (시체 폭발) 와 패시브가 여럿 겹치는 경우를 보려는 것이다.
export const SIMULATION_OPPONENT_CARD_IDS: readonly number[] = [31, 32, 32, 26, 27, 19, 19];

// 상대 유닛에 미리 붙여 두는 에너지. 에너지 번 판정을 보려고 셋으로 갈라 둔다.
//   하나 붙은 것 — 하나 빠지고 정해진 만큼 맞는다
//   둘 붙은 것   — 다 빠지고 안 맞는다
//   없는 것      — 더 크게 맞는다
export const SIMULATION_OPPONENT_ENERGY: ReadonlyMap<number, number> = new Map([
    [1, 1],
    [3, 2],
]);

// 내 덱. 마흔 장짜리 덱에서 손패로 간 다섯 장을 뺀 나머지다. 앞에서부터 뽑힌다.
const YOUR_DECK: readonly number[] = [
    8, 8, 8,          // 죽음의 낫 x3 (legendary)
    9, 9,             // 에너지 번 x2 (hero)
    25, 25, 25,       // 파멸의 계약 x3 (hero)
    27, 27, 27,       // 영혼 수확자 벨른 x3 (hero)
    151, 151,         // 차갑게 불타는 암흑 에너지 x2 (hero)
    20, 20, 20,       // 망자의 늪 x3 (uncommon)
    2, 2,             // 넘쳐 흐르는 사기 x2 (uncommon, 3 - 1 in hand)
    26, 26,           // 망령 x2 (uncommon, 3 - 1 in hand)
    31, 31, 31,       // 스켈레톤 x3 (common)
    32, 32, 32,       // 스켈레톤 워리어 x3 (common)
    33, 33, 33,       // 시체 폭발 x3 (common)
    35, 35, 35,       // 사기 전환 x3 (common)
    36, 36, 36,       // 죽음의 대지 x3 (common)
    93, 93, 93, 93,   // 일반 에너지 x4 (energy, 5 - 1 in hand)
];

// 상대 덱. 장수만 맞으면 되므로 종류를 고루 넣었다.
const OPPONENT_DECK: readonly number[] = [
    31, 32, 33, 35, 36, 26, 27, 25, 30, 20, 2, 8, 9, 93, 151,
];

// 무덤과 로스트 존에 미리 넣어 두는 열두 장.
//
// 팝업이 한 쪽에 열 장씩 보여 준다. 열두 장이면 두 쪽이 되어 페이지 넘기기를 볼 수 있다.
const TOMB_CARDS: readonly number[] = [31, 32, 33, 35, 36, 26, 27, 25, 30, 20, 2, 8];
const LOST_ZONE_CARDS: readonly number[] = [31, 32, 26, 27, 93, 19, 2, 8, 9, 20, 25, 33];

// 시작 필드 에너지. 진짜 대전이면 0 에서 시작해 턴마다 는다.
const YOUR_FIELD_ENERGY = 19;
const OPPONENT_FIELD_ENERGY = 15;

// 화면이 그린 손패 카드 한 장. 신원은 화면이 만들 때의 번호를 쓴다.
export interface SimulationHandCard {
    readonly battleCardId: number;
    readonly cardId: number;
}

// 화면이 그린 상대 필드 유닛 한 마리.
export interface SimulationOpponentUnit {
    readonly cardId: number;
    readonly energyCount: number;
    readonly raceId: number;
}

// 확인용 판의 시작 상태를 적어 둔 것을 만든다.
//
// 손패와 상대 필드는 화면이 그린 것을 받는다. 신원 번호가 화면이 만든 순서라서다.
// 진짜 대전에서는 그 번호도 서버가 준다.
export function simulationBattleSnapshot(
    catalog: CardCatalog,
    hand: readonly SimulationHandCard[],
    opponentUnits: readonly SimulationOpponentUnit[],
): BattleSnapshot {
    return {
        battleId: IdGenerator.generateId("Battle"),
        turnOwner: 'your',
        turnNumber: Battle.FIRST_TURN,

        fieldEnergy: YOUR_FIELD_ENERGY,
        opponentFieldEnergy: OPPONENT_FIELD_ENERGY,

        yourDeckCards: [...YOUR_DECK],
        opponentDeckCards: [...OPPONENT_DECK],

        yourTombCards: [...TOMB_CARDS],
        opponentTombCards: [...TOMB_CARDS],
        yourLostZoneCards: [...LOST_ZONE_CARDS],
        opponentLostZoneCards: [...LOST_ZONE_CARDS],

        yourFieldCards: [],
        opponentFieldCards: opponentUnits.map(toOpponentFieldCard(catalog)),
        handCards: hand.map(toHandCard),

        // 양쪽 다 꽉 찬 체력으로 시작한다.
        yourMasterHp: Master.START_HP,
        opponentMasterHp: Master.START_HP,

        pendingChoice: null,
    };
}

function toHandCard(card: SimulationHandCard): HandCardSnapshot {
    return {
        battleCardId: card.battleCardId,
        cardId: card.cardId,
        attributeMarkIds: [],
        // 화면 좌표 번호를 안 쓴다.
        positionId: 0,
    };
}

function toOpponentFieldCard(catalog: CardCatalog) {
    return (unit: SimulationOpponentUnit, index: number): FieldCardSnapshot => {
        const hp = catalog.getHp(unit.cardId);
        return {
            // 신원. 이 화면에서는 만들 때의 차례를 쓴다.
            battleCardId: index,
            cardId: unit.cardId,
            attributeMarkIds: [],
            positionId: 0,
            hp: typeof hp === 'number' ? hp : 0,
            // 시작 에너지는 그 카드의 종족으로 붙인다.
            energyByRace: unit.energyCount > 0
                ? [{race: unit.raceId as CardRace, count: unit.energyCount}]
                : [],
            deployedTurn: 0,
            frozen: false,
            freezeImmune: false,
            darkFlame: false,
            coldDarkEnergy: false,
        };
    };
}
