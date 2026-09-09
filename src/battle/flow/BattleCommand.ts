// 사용자가 하는 일.
//
// 하나만 보낸다. 여러 줄로 나눠 시키지 않는다.
// 되는지 안 되는지는 전투 상태가 판단한다.
//
// 공격과 스킬은 R2-67 에 붙는다.
export type BattleCommand =
    // 덱에서 한 장 뽑아 손패에 넣는다
    | {type: 'drawCard'}
    // 손패의 카드를 내 필드에 낸다
    | {type: 'playCardToField'; battleCardId: number}
    // 손패의 카드를 유닛 하나에게 쓴다
    | {type: 'useCardOnUnit'; battleCardId: number; targetBattleCardId: number}
    // 손패의 카드를 필드 전체에 쓴다
    | {type: 'useCardOnField'; battleCardId: number; side: 'your' | 'opponent'};
