// 전투가 지금 무엇을 고르라고 기다리는 중인가.
//
// 카드 중에는 한 번 쓰고 끝나지 않는 것이 있다. 시체 폭발은 제물을 고른 뒤 적을 두 번 더
// 고르게 하고, 네더 블레이드는 첫 패시브가 터진 다음 남은 것 중 하나를 고르게 한다.
//
// 전에는 이것을 화면이 혼자 들고 있었다. 그래서 고르는 중에 턴이 끝나면 화면이 제 손으로
// 취소했고, 전투는 그런 일이 있었는지도 몰랐다. 저장하면 고르던 것이 통째로 사라졌다.
//
// 이제 전투가 든다. 무엇을 기다리는지, 몇 개를 더 받아야 하는지, 지금까지 무엇을 받았는지.
export interface PendingChoice {
    // 이 고르기를 만든 카드. 다 고르면 이 카드의 규칙이 돈다
    readonly cardId: number;
    // 그 카드를 손패에서 가리키는 번호. 다 끝나고 무덤으로 보낼 때 쓴다
    readonly sourceBattleCardId: number;
    // 고르기를 시작한 유닛. 시체 폭발의 제물, 네더 블레이드의 낸 유닛
    readonly actorBattleCardId: number;
    // 무엇을 고르라고 하는가
    readonly target: ChoiceTarget;
    // 몇 개를 받아야 끝나는가
    readonly need: number;
    // 지금까지 받은 것. 같은 것을 두 번 고를 수 있으므로 중복을 안 거른다
    readonly picked: readonly ChoicePick[];
}

// 고를 수 있는 것의 갈래.
export type ChoiceTarget =
    // 상대 유닛 하나 또는 상대 본체
    | 'opponentUnitOrMaster';

// 고른 것 하나.
export type ChoicePick =
    | {readonly kind: 'opponentUnit'; readonly battleCardId: number}
    | {readonly kind: 'opponentMaster'};

// 하나를 더 받는다. 원래 것은 안 고치고 새 것을 돌려준다.
export function withPick(choice: PendingChoice, pick: ChoicePick): PendingChoice {
    return {...choice, picked: [...choice.picked, pick]};
}

// 다 골랐는가.
export function isChoiceComplete(choice: PendingChoice): boolean {
    return choice.picked.length >= choice.need;
}

// 몇 개를 더 골라야 하는가.
export function remainingPicks(choice: PendingChoice): number {
    return Math.max(0, choice.need - choice.picked.length);
}
