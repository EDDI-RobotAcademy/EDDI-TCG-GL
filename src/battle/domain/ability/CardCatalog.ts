import {CardKind} from "../../../card/kind";
import {CardGrade} from "../../../card/grade";
import {CardRace} from "../../../card/race";
import {SkillType} from "../../../card/SkillType";

// 카드가 어떤 종류이고 체력이 얼마인지를 알려 주는 곳.
//
// 카드에 적혀 있는 것은 판과 무관하다. 전투 상태가 그것까지 들면 판마다 카드 백 장을
// 통째로 적어 두게 된다. 그래서 밖에서 받는다.
export interface CardCatalog {
    getKind(cardId: number): CardKind | null;
    getHp(cardId: number): number;
    getGrade(cardId: number): CardGrade | null;
    getRace(cardId: number): CardRace | null;

    // 카드에 적힌 기본 공격력. 붙은 것이 없을 때의 값이다.
    getAttack(cardId: number): number;

    // 스킬에 적힌 값. 없는 스킬이면 null 이다.
    //
    // damage 는 카드에 적힌 기본 피해다. 지금은 이대로 쓰지만, 붙은 것이 생기면
    // 최종 피해는 규칙이 이 값에서 시작해 계산한다.
    //
    // cost 는 종족별로 필요한 에너지다. 총량으로 보면 [언데드 2 필요 / 휴먼 2 보유] 를
    // 통과시키므로 종족별로 든다.
    getSkill(cardId: number, slot: 1 | 2): CardSkillSpec | null;
}

// 카드에 적힌 스킬 하나.
export interface CardSkillSpec {
    readonly range: SkillType;
    readonly damage: number;
    readonly cost: ReadonlyMap<CardRace, number>;
}



// 사용자가 한 일 하나를 받아 끝까지 처리하고, 무슨 일이 일어났는지 차례대로 돌려준다.
//
// 되는지 안 되는지도 여기서 판단한다. 부르는 쪽은 하나만 보내고 돌려받은 것만 본다.
