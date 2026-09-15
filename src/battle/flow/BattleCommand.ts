import {CardRace} from "../../card/race";
import {ChoicePick} from "../domain/PendingChoice";

// 사용자가 하는 일.
//
// 하나만 보낸다. 여러 줄로 나눠 시키지 않는다.
// 되는지 안 되는지는 전투 상태가 판단한다.
//
export type BattleCommand =
    // 내 턴을 끝내고 상대에게 넘긴다
    | {type: 'endYourTurn'}
    // 상대 턴을 끝내고 내 차례로 돌아온다
    | {type: 'beginYourTurn'}
    // 덱에서 한 장 뽑아 손패에 넣는다
    | {type: 'drawCard'}
    // 손패의 카드를 내 필드에 낸다
    | {type: 'playCardToField'; battleCardId: number}
    // 손패의 카드를 유닛 하나에게 쓴다
    | {type: 'useCardOnUnit'; battleCardId: number; targetBattleCardId: number}
    // 손패의 카드를 필드 전체에 쓴다
    // pickedDeckIndexes 는 덱에서 고르는 카드에만 온다. 무엇을 고를지는 사용자가 정한다
    | {
        type: 'useCardOnField';
        battleCardId: number;
        side: 'your' | 'opponent';
        pickedDeckIndexes?: readonly number[];
        // 덱을 섞는 카드에만 온다. 도메인 안에서는 무작위를 못 쓰므로 씨앗을 받는다
        shuffleSeed?: number;
    }
    // 필드 에너지 하나를 내 유닛에 붙인다. 어느 종족으로 붙일지는 사용자가 고른다
    | {type: 'attachFieldEnergyToUnit'; targetBattleCardId: number; race: CardRace}
    // 내 유닛으로 상대 유닛 하나를 때린다
    | {type: 'attackUnit'; attackerBattleCardId: number; targetBattleCardId: number; attack: AttackChoice}
    // 내 유닛으로 상대 본체를 때린다
    | {type: 'attackOpponentMaster'; attackerBattleCardId: number; attack: AttackChoice}
    // 낸 유닛의 패시브를 터뜨린다.
    //
    // 네더 블레이드는 나오면 첫 패시브가 저절로 터지고, 그 결과를 본 뒤에 사용자가
    // 하나를 고른다. 그래서 [내는 것] 과 [패시브] 를 나눠 보낸다
    | {type: 'triggerDeployPassive'; battleCardId: number}
    // 고르라고 기다리는 중에 하나를 골랐다.
    //
    // 무엇을 고르는 중인지는 전투가 안다. 화면은 무엇을 골랐는지만 보낸다
    | {type: 'pickChoiceTarget'; pick: ChoicePick}
    // 고르는 중에 그만둔다. 턴이 끝날 때 쓴다
    | {type: 'cancelChoice'}
    // 내 유닛의 스킬로 상대 전부를 때린다.
    // 본체까지 가는지는 카드에 적힌 범위가 정하므로 여기서 나누지 않는다
    | {type: 'attackEveryOpponent'; attackerBattleCardId: number; attack: AttackChoice};

// 사용자가 액티브 패널에서 고른 것. 일반 공격이거나 스킬 하나다.
//
// 얼마나 아픈지와 누구를 치는지는 여기 안 담는다. 카드에 적힌 값에서 전투 상태가 정한다.
export type AttackChoice = 'general' | 1 | 2;
