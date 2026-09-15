// 카드를 쓸 때 무엇을 고르는가.
//
// 만들어진 카드 열두 장에서 여섯 가지가 나왔다. 남은 여든여덟 장에서
// 새 방식이 나오면 여기에 더한다.
export enum AbilityTarget {
    // 고르지 않는다. 등장하면 저절로 일어난다
    NONE = 'NONE',
    // 상대 유닛 하나
    OPPONENT_UNIT = 'OPPONENT_UNIT',
    // 내 필드 유닛 하나
    ALLY_UNIT = 'ALLY_UNIT',
    // 내 필드 유닛 하나. 종족이 정해져 있다
    ALLY_UNIT_OF_RACE = 'ALLY_UNIT_OF_RACE',
    // 내 필드 전체
    YOUR_FIELD = 'YOUR_FIELD',
    // 상대 필드 전체
    OPPONENT_FIELD = 'OPPONENT_FIELD',
}
