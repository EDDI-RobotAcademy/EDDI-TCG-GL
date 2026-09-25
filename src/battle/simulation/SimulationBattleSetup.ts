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

// 대전을 시작할 때 손패로 받는 장수.
export const OPENING_HAND_SIZE = 5;

// **판을 비운 채로 시작한다.** 진짜 대전이 그렇다 — 필드 에너지 0, 무덤도 로스트 존도
// 상대 필드도 비어 있고, 손에는 덱에서 뽑은 다섯 장뿐이다.
//
// `true` 로 바꾸면 전에 쓰던 **차려 둔 판**이 돌아온다. 그 판은 화면을 확인하려고 만든
// 것이라 실제 대전과 다르다.
//
//   무덤·로스트 존 열두 장   팝업의 페이지 넘기기를 보려고
//   상대 유닛 일곱          때릴 상대가 있어야 공격을 볼 수 있어서
//   필드 에너지 19 / 15     에너지가 드는 카드를 바로 내 보려고
//
// 공격·무덤 팝업·에너지 붙이기를 확인할 때만 켠다. **확인이 끝나면 다시 false 로.**
export const USE_CHECK_BOARD = false;

// 카드 동작을 볼 때 쓰는 붙박이 손패.
//
// **평소에는 null 이다.** 무작위 다섯 장을 받는 것이 실제 동작이다.
//
// 여기에 카드 번호를 적어 넣으면 섞지 않고 그것을 그대로 손에 쥔다. 특정 카드를 확인할
// 때 쓴다 — 무작위로 받으면 보고 싶은 카드가 손에 안 들어와 여러 번 들락거려야 한다.
// 아래 열두 장이 전에 쓰던 것이다. 확인이 끝나면 **다시 null 로 되돌린다.**
//
//   [2, 19, 93, 26, 27,
//    9,   // 에너지 번 (ITEM)
//    25,  // 파멸의 계약 (ITEM)
//    35,  // 사기 전환 (ITEM)
//    20,  // 망자의 늪 (SUPPORT)
//    36,  // 죽음의 대지 (ITEM)
//    30,  // 레오닉의 부름 (SUPPORT)
//    33]  // 시체 폭발 (ITEM)
export const FIXED_OPENING_HAND: readonly number[] | null = null;

// 상대 필드의 시작 배치.
//
// 네더 블레이드(19) 를 둘 넣은 것은 죽음의 낫 판정을 보려는 것이다. 신화 등급이 아니면
// 즉사하고 신화면 정해진 만큼만 깎인다. 둘인 것은 같은 대상을 두 번 고르는 카드
// (시체 폭발) 와 패시브가 여럿 겹치는 경우를 보려는 것이다.
const CHECK_BOARD_OPPONENT_CARD_IDS: readonly number[] = [31, 32, 32, 26, 27, 19, 19];
export const SIMULATION_OPPONENT_CARD_IDS: readonly number[] =
    USE_CHECK_BOARD ? CHECK_BOARD_OPPONENT_CARD_IDS : [];

// 상대 유닛에 미리 붙여 두는 에너지. 에너지 번 판정을 보려고 셋으로 갈라 둔다.
//   하나 붙은 것 — 하나 빠지고 정해진 만큼 맞는다
//   둘 붙은 것   — 다 빠지고 안 맞는다
//   없는 것      — 더 크게 맞는다
export const SIMULATION_OPPONENT_ENERGY: ReadonlyMap<number, number> = new Map([
    [1, 1],
    [3, 2],
]);

// 내 덱 쉰한 장. **손패로 갈 것까지 여기 다 들어 있다.**
//
// 전에는 [손패 열두 장] 과 [덱 서른아홉 장] 을 따로 적어 두었다. 이제 대전을 시작할 때
// 이 덱을 섞어 다섯 장을 뽑아 손에 쥐므로, 나눠 적을 이유가 없어졌다.
//
// 쉰한 장인 것은 전에 나뉘어 있던 둘을 그대로 합친 값이다. 실제 덱이 몇 장이어야 하는지는
// 덱 짜기가 정할 일이다 (R2-146).
const YOUR_FULL_DECK: readonly number[] = [
    2, 19, 93, 26, 27, 9, 25, 35, 20, 36, 30, 33,   // 전에 손패에 있던 열두 장
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

// 대전을 시작할 때 덱을 섞어 손패를 뽑는다.
//
// **여기서 섞는 것은 서버가 붙으면 서버가 한다.** 도메인은 무작위를 못 쓰고(순수해야 한다),
// 화면은 규칙을 돌리면 안 된다. 그래서 판을 차리는 이 자리가 맡는다 — 네트워크가 붙으면
// 이 함수를 안 부르고 서버가 준 것을 그대로 쓴다.
//
// 돌려주는 것은 **값 둘**이다. 손에 쥘 카드 번호와 남은 덱. 판을 만지지 않는다.
export interface OpeningDeal {
    readonly hand: readonly number[];
    readonly deck: readonly number[];
}

export function dealOpeningHand(): OpeningDeal {
    if (FIXED_OPENING_HAND !== null) {
        // 붙박이 손패를 쓸 때도 덱에서는 빼 준다. 안 빼면 같은 카드가 두 장이 된다.
        return {hand: [...FIXED_OPENING_HAND], deck: withoutOnce(YOUR_FULL_DECK, FIXED_OPENING_HAND)};
    }
    const shuffled = shuffled52(YOUR_FULL_DECK);
    return {
        hand: shuffled.slice(0, OPENING_HAND_SIZE),
        deck: shuffled.slice(OPENING_HAND_SIZE),
    };
}

// 고른 카드만 덱에서 새로 받아 온다 (멀리건).
//
// **돌려 넣고 섞은 뒤에 뽑는다.** 그래서 방금 버린 카드가 다시 올 수도 있다 — 그게 맞다.
// 안 섞고 덱 맨 위에서 뽑으면 [버리면 반드시 다른 카드] 가 되어, 버릴수록 이득이 된다.
//
// 바뀐 카드는 **있던 자리에 그대로** 꽂는다. 자리가 흐트러지면 무엇이 바뀌었는지 못 본다.
//
// 여기도 값만 다룬다. 판을 만지지 않는다.
export function applyMulligan(deal: OpeningDeal, indexes: readonly number[]): OpeningDeal {
    if (indexes.length === 0) return deal;

    const hand = [...deal.hand];
    const returned = indexes.map((at) => hand[at]);
    const shuffled = shuffled52([...deal.deck, ...returned]);

    indexes.forEach((at, k) => { hand[at] = shuffled[k]; });
    return {hand, deck: shuffled.slice(indexes.length)};
}

// 피셔-예이츠. 뒤에서부터 앞으로 한 칸씩 자리를 바꾼다.
//
// 앞에서부터 바꾸거나 두 자리를 아무렇게나 골라 바꾸면 **자리마다 나올 확률이 달라진다.**
// 눈으로는 섞인 것처럼 보여서 틀려도 모른다.
function shuffled52(cards: readonly number[]): number[] {
    const out = [...cards];
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

// 같은 번호가 여러 장 있을 수 있다. **번호마다 한 장씩만** 뺀다.
function withoutOnce(cards: readonly number[], remove: readonly number[]): number[] {
    const out = [...cards];
    for (const id of remove) {
        const at = out.indexOf(id);
        if (at >= 0) out.splice(at, 1);
    }
    return out;
}

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
const YOUR_FIELD_ENERGY = USE_CHECK_BOARD ? 19 : 0;
const OPPONENT_FIELD_ENERGY = USE_CHECK_BOARD ? 15 : 0;

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
    // 손패로 다섯 장을 뽑고 남은 덱. `dealOpeningHand` 가 같이 내놓은 것을 그대로 넣는다.
    deck: readonly number[],
): BattleSnapshot {
    return {
        battleId: IdGenerator.generateId("Battle"),
        turnOwner: 'your',
        turnNumber: Battle.FIRST_TURN,

        fieldEnergy: YOUR_FIELD_ENERGY,
        opponentFieldEnergy: OPPONENT_FIELD_ENERGY,

        yourDeckCards: [...deck],
        opponentDeckCards: [...OPPONENT_DECK],

        yourTombCards: USE_CHECK_BOARD ? [...TOMB_CARDS] : [],
        opponentTombCards: USE_CHECK_BOARD ? [...TOMB_CARDS] : [],
        yourLostZoneCards: USE_CHECK_BOARD ? [...LOST_ZONE_CARDS] : [],
        opponentLostZoneCards: USE_CHECK_BOARD ? [...LOST_ZONE_CARDS] : [],

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
