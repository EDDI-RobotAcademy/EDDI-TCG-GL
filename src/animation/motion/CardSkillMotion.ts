import * as THREE from "three";

import { createCardSkillPositionFrame } from "../skill/frame/CardSkillPositionFrame";
import { CardMoveEasing, moveCard } from "./CardMove";

// 카드를 스킬 자리로 옮겼다가 되돌린다. 아무것도 그리지 않는다.
//
// 효과가 무엇인지, 언제 도는지 모른다. 그것은 SkillPlayback 이 정한다.
// 이 파일이 바뀌는 이유는 카드가 어디로 얼마나 빨리 가는지가 달라질 때뿐이다.
//
// 옮기는 일 자체는 moveCard 가 한다. 여기는 어디로 갈지와 어떤 곡선으로 갈지만 정한다.
export class CardSkillMotion {

    // 카드를 스킬 자리로 옮긴다. 원위치는 userData.originPos 에 남긴다.
    public static async moveToSkillPosition(cardGroup: THREE.Group, duration: number): Promise<void> {
        if (!cardGroup.userData.originPos) {
            cardGroup.userData.originPos = cardGroup.position.clone();
        }

        // 갈 때마다 잰다. 파일을 읽을 때 한 번 재면 창 크기를 바꾼 뒤 옛 자리로 간다.
        const slot = createCardSkillPositionFrame(window.innerHeight);

        return moveCard(
            cardGroup,
            {
                x: slot.x,
                y: slot.y,
                z: cardGroup.position.z + 1,
            },
            duration,
            CardMoveEasing.out,
        );
    }

    // 카드를 원위치로 되돌린다.
    public static async returnToOrigin(cardGroup: THREE.Group, duration: number): Promise<void> {
        const originPos = cardGroup.userData.originPos as THREE.Vector3;
        if (!originPos) return;

        return moveCard(
            cardGroup,
            { x: originPos.x, y: originPos.y, z: originPos.z },
            duration,
            CardMoveEasing.inOut,
        );
    }
}
