import * as THREE from "three";

import { createCardSkillPositionFrame } from "../skill/frame/CardSkillPositionFrame";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

// 카드를 스킬 자리로 옮겼다가 되돌린다. 아무것도 그리지 않는다.
//
// 효과가 무엇인지, 언제 도는지 모른다. 그것은 SkillPlayback 이 정한다.
// 이 파일이 바뀌는 이유는 카드가 어디로 얼마나 빨리 가는지가 달라질 때뿐이다.
export class CardSkillMotion {
    // 파일을 읽을 때 한 번 잰다. 창 크기를 바꿔도 다시 재지 않는다.
    private static readonly SLOT = createCardSkillPositionFrame(window.innerHeight);
    private static readonly SKILL_POSITION_X = CardSkillMotion.SLOT.x;
    private static readonly SKILL_POSITION_Y = CardSkillMotion.SLOT.y;

    // 카드를 스킬 자리로 옮긴다. 원위치는 userData.originPos 에 남긴다.
    public static async moveToSkillPosition(cardGroup: THREE.Group, duration: number): Promise<void> {
        return new Promise(resolve => {
            if (!cardGroup.userData.originPos) {
                cardGroup.userData.originPos = cardGroup.position.clone();
            }

            const originPos = cardGroup.position.clone();
            const destPos = new THREE.Vector3(
                this.SKILL_POSITION_X,
                this.SKILL_POSITION_Y,
                originPos.z + 1
            );

            const tweenObj = { x: originPos.x, y: originPos.y, z: originPos.z };

            new TWEEN.Tween(tweenObj)
                .to({ x: destPos.x, y: destPos.y, z: destPos.z }, duration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(() => {
                    cardGroup.position.set(tweenObj.x, tweenObj.y, tweenObj.z);
                })
                .onComplete(() => resolve())
                .start();
        });
    }

    // 카드를 원위치로 되돌린다.
    public static async returnToOrigin(cardGroup: THREE.Group, duration: number): Promise<void> {
        return new Promise(resolve => {
            const originPos = cardGroup.userData.originPos as THREE.Vector3;
            if (!originPos) return resolve();

            const tweenObj = { x: cardGroup.position.x, y: cardGroup.position.y, z: cardGroup.position.z };

            new TWEEN.Tween(tweenObj)
                .to({ x: originPos.x, y: originPos.y, z: originPos.z }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                    cardGroup.position.set(tweenObj.x, tweenObj.y, tweenObj.z);
                })
                .onComplete(() => resolve())
                .start();
        });
    }
}
