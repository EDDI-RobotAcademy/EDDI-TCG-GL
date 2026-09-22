import {CardGrade} from "../../../card/grade";
import {CardRace} from "../../../card/race";
import {AbilityTarget} from "./AbilityTarget";

// 카드 한 장의 능력을 값으로 적은 것이다.
//
// 전에는 이 숫자들이 확인용 화면 파일 하나에 흩어져 있었다. 카드를 더할 때마다
// 그 파일이 커졌다. 여기에 적으면 카드를 더하는 일이 값을 적는 일이 된다.
//
// 다만 여기 있는 것은 [무엇을 고르는가] 와 [얼마인가] 뿐이다. [무엇이 일어나는가] 는
// 아직 화면 쪽에 있다. 옮기려면 화면이 제 상태를 전투로 넘기는 일이 먼저다.
export interface CardAbility {
    readonly cardId: number;
    readonly name: string;
    readonly target: AbilityTarget;
    // 고르는 종족이 정해진 경우에만 쓴다
    readonly targetRace?: CardRace;
    // 카드마다 쓰는 숫자. 이름은 카드 설명에서 따온다
    readonly numbers: Readonly<Record<string, number>>;
    // 등급으로 갈리는 카드에서 쓴다
    readonly grade?: CardGrade;
    // 값 하나로 다 적히지 않는 카드다. 왜 안 되는지 적어 둔다.
    // R2-85 에서 넷을 열어 보고 둘로 줄었다. 남은 둘은 전투가 고르기를 기다려야 한다
    readonly notFullyData?: string;
}

// 만들어진 카드 열두 장이다. R2-58 판정표를 그대로 옮겼다.
export const CARD_ABILITIES: readonly CardAbility[] = [
    {
        cardId: 8,
        name: '죽음의 낫',
        target: AbilityTarget.OPPONENT_UNIT,
        numbers: {mythicDamage: 30},
    },
    {
        cardId: 9,
        name: '에너지 번',
        target: AbilityTarget.OPPONENT_UNIT,
        numbers: {perMissingEnergyDamage: 10},
    },
    {
        cardId: 35,
        name: '사기 전환',
        target: AbilityTarget.ALLY_UNIT,
        numbers: {hpDividedBy: 5},
    },
    {
        cardId: 2,
        name: '넘쳐 흐르는 사기',
        target: AbilityTarget.ALLY_UNIT,
        numbers: {pullCardId: 93, maxPull: 2},
    },
    {
        cardId: 93,
        name: '죽음의 에너지',
        target: AbilityTarget.ALLY_UNIT,
        numbers: {attachEnergy: 1},
    },
    {
        cardId: 151,
        name: '차갑게 불타는 암흑 에너지',
        target: AbilityTarget.ALLY_UNIT,
        numbers: {attachEnergy: 1, darkFlameTurnDamage: 5},
    },
    {
        cardId: 20,
        name: '망자의 늪',
        target: AbilityTarget.YOUR_FIELD,
        numbers: {drawCount: 3},
    },
    {
        cardId: 25,
        name: '파멸의 계약',
        target: AbilityTarget.OPPONENT_FIELD,
        numbers: {damage: 15, deckToLostZone: 1},
    },
    {
        cardId: 36,
        name: '죽음의 대지',
        target: AbilityTarget.OPPONENT_FIELD,
        numbers: {fieldEnergyDrain: 2},
    },
    {
        cardId: 30,
        name: '레오닉의 부름',
        target: AbilityTarget.YOUR_FIELD,
        numbers: {maxPick: 2},
        grade: CardGrade.HERO,
    },
    {
        cardId: 33,
        name: '시체 폭발',
        target: AbilityTarget.ALLY_UNIT_OF_RACE,
        targetRace: CardRace.UNDEAD,
        // 고른 적 하나당 이만큼. 제물이 누구든 같다.
        //
        // 카드 설명에는 [해당 유닛의 현재 체력 만큼] 이라고 적혀 있지만, 정해진 규칙은
        // 이 고정값이다. 설명 쪽이 낡았다. 설명을 보고 고치지 말 것.
        numbers: {damage: 10, picks: 2},
        notFullyData: '제물을 고른 뒤 적을 두 번 더 고른다. 전투가 고르기를 기다려야 한다',
    },
    {
        cardId: 19,
        name: '마검의 지배자 네더 블레이드',
        target: AbilityTarget.NONE,
        numbers: {passive1Damage: 10, passive2Damage: 20},
        notFullyData: '첫 패시브가 일어난 뒤에 고른다. 전투가 고르기를 기다려야 한다',
    },
];

export function findCardAbility(cardId: number): CardAbility | null {
    return CARD_ABILITIES.find((it) => it.cardId === cardId) ?? null;
}

// 카드를 집었을 때 무엇에 테두리를 칠지 정하는 데 쓴다.
// 겨냥 방식으로 카드 번호를 모아 주던 것이 여기 있었다. 부르는 곳이 없어져 지웠다
// (R2-128). 손패에서 쓸 수 있는 카드를 표시하는 일에 쓰려던 것인데, 카드 번호 목록은
// 그 일에 맞는 모양이 아니다 — 전투 화면의 [손패에서 지금 쓸 수 있는 카드 표시] 주석에
// 무엇이 맞는 모양인지 적어 두었다.
