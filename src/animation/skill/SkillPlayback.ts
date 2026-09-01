import * as THREE from "three";

import { CardSkillMotion } from "../motion/CardSkillMotion";

// 스킬 한 번을 화면에 재생한다.
//
//   카드를 스킬 자리로 옮긴다  →  효과가 돈다  →  카드를 되돌린다
//
// 카드가 어디로 가는지는 CardSkillMotion 이 안다. 효과가 무엇인지는 부르는 쪽이 넘긴다.
//
// 이 파일은 게임 규칙을 모른다. 누가 썼는지, 행동을 소모했는지, 몇 번째 스킬인지 모른다.
// 스킬을 쓰면 그 유닛이 더 행동하지 못한다는 규칙은 전투 상태에 속하므로 여기 붙이지 않는다.
// 재생을 건너뛰거나 속도를 바꿔도 게임 규칙이 흔들리지 않아야 한다.
//
// 이 파일이 바뀌는 이유는 재생 구성이 달라질 때뿐이다.
// 이동 뒤에 멈춤을 넣거나 효과를 둘 연달아 재생하는 식의 변경이 여기 온다.
export class SkillPlayback {
    public static async play(
        cardGroup: THREE.Group,
        effectCallback?: () => Promise<void>,
        duration: number = 1000
    ): Promise<void> {
        await CardSkillMotion.moveToSkillPosition(cardGroup, duration);

        if (effectCallback) {
            await effectCallback();
        }

        await CardSkillMotion.returnToOrigin(cardGroup, duration);
    }
}
