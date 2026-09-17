import {Battle} from "../battle/Battle";
import {BattleEvent} from "../flow/BattleEvent";
import {ChoicePick, PendingChoice} from "../battle/PendingChoice";
import {CardCatalog} from "../ability/CardCatalog";

// 카드 한 장의 규칙이다. 카드마다 파일 하나다.
//
// 새 카드를 더할 때 기존 카드의 코드를 안 고치게 하려고 이렇게 나눴다. 전에는 카드를
// 하나 더하면 카드 번호로 갈라지는 자리를 두 군데 고쳐야 했다.

// 카드 규칙이 쓸 수 있는 것이다.
//
// 이 목록이 [카드가 할 수 있는 일] 이다. 처리기를 통째로 넘기면 카드가 아무거나
// 부를 수 있게 되고, 그러면 갈림길을 테이블로 이름만 바꾼 것이 된다.
//
// 새 카드가 여기 없는 것을 필요로 하면 그때 늘린다. 없던 규칙이 실제로 나온 것이므로
// 늘어나는 것이 맞다 (규칙 24). 안 늘리고 카드만 느는 것이 통과다.
export interface CardRuleContext {
    readonly battle: Battle;
    // 카드에 적혀 있는 것 — 종류, 체력, 등급, 종족, 공격력, 스킬
    readonly catalog: CardCatalog;

    // 쓴 카드는 무덤으로 간다.
    spendHandCard(battleCardId: number, cardId: number): BattleEvent[];
    // 상대 유닛을 깎는다. 0 이 되면 쓰러뜨리고 무덤으로 보낸다.
    damageOpponentUnit(battleCardId: number, cardId: number, damage: number): BattleEvent[];
    // 상대 유닛을 쓰러뜨리고 무덤으로 보낸다. 체력과 무관하게 바로 보낼 때 쓴다.
    defeatOpponentUnit(battleCardId: number, cardId: number): BattleEvent[];
    // 상대 본체를 깎는다.
    attackOpponentMaster(damage: number, attackerId?: number): BattleEvent[];
    // 고르라고 기다리기 시작한다.
    beginChoice(choice: PendingChoice): BattleEvent[];
    // 방금 나온 일 중에 이 유닛이 쓰러진 것이 있는가.
    wasDefeated(events: readonly BattleEvent[], battleCardId: number): boolean;
}

// 유닛에 대고 쓸 때 오는 것.
export interface UseOnUnitInput {
    readonly battleCardId: number;
    readonly cardId: number;
    readonly targetBattleCardId: number;
}

// 필드에 쓸 때 오는 것.
export interface UseOnFieldInput {
    readonly battleCardId: number;
    readonly cardId: number;
    readonly side: 'your' | 'opponent';
    readonly pickedDeckIndexes: readonly number[];
    readonly shuffleSeed?: number;
}

// 카드 한 장이 채우는 칸이다.
//
// 안 채운 칸은 그 방식으로 못 쓴다는 뜻이다. 전에 [아직 전투가 처리하지 않는 카드입니다]
// 로 돌려주던 자리가 이것이다.
//
// 칸은 넷이다. 카드마다 칸을 새로 만들기 시작하면 갈림길을 흩어 놓은 것이 되므로,
// 늘릴 때는 [이 카드만 쓰는 칸] 이 아니라 [여러 카드가 쓸 방식] 인지 본다.
export interface CardRule {
    readonly cardId: number;
    // 유닛에 대고 쓴다
    useOnUnit?(ctx: CardRuleContext, input: UseOnUnitInput): BattleEvent[];
    // 필드에 쓴다
    useOnField?(ctx: CardRuleContext, input: UseOnFieldInput): BattleEvent[];
    // 고르기가 다 끝났다
    resolveChoice?(ctx: CardRuleContext, choice: PendingChoice): BattleEvent[];
    // 이 카드가 필드에 나왔다
    onDeploy?(ctx: CardRuleContext, battleCardId: number): BattleEvent[];
    // 지금 고르는 중에 이것을 고르면 얼마 맞나.
    //
    // 고르기를 가진 카드만 채운다. 연출을 시작하기 전에 결과를 알아야 하는 자리가 있어서
    // 필요하다 (R2-105). 아무것도 안 바꾸고 답만 준다.
    choiceDamage?(ctx: CardRuleContext, choice: PendingChoice, pick: ChoicePick): number;
}
