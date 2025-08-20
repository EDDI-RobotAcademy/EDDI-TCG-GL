import * as THREE from "three";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

export class SkillPanelAnimator {
    private static readonly SKILL_PANEL_X = 0;
    private static readonly SKILL_PANEL_Y = (0.5 - 0.78221649) * window.innerHeight;

    /**
     * 스킬 사용 전체 시퀀스 실행
     */
    public static async playSkillSequence(
        cardGroup: THREE.Group,
        effectCallback?: () => Promise<void>,
        duration: number = 1000
    ): Promise<void> {
        await this.moveToSkillPanel(cardGroup, duration);

        if (effectCallback) {
            await effectCallback();
        }

        await this.returnFromSkillPanel(cardGroup, duration);

        // 원본 좌표 갱신 (자기 자신 + 자식들)
        cardGroup.userData.originPos = cardGroup.position.clone();
        cardGroup.children.forEach(child => {
            child.userData.originPos = child.getWorldPosition(new THREE.Vector3());
        });

        // 무기 좌표 갱신 (부모 그룹 기준)
        cardGroup.parent?.traverse(obj => {
            if (obj.userData?.isWeapon) {
                obj.userData.originPos = obj.getWorldPosition(new THREE.Vector3());
            }
        });
    }

    /**
     * 카드 스킬 패널로 이동
     */
    private static async moveToSkillPanel(cardGroup: THREE.Group, duration: number): Promise<void> {
        return new Promise(resolve => {
            if (!cardGroup.userData.originPos) {
                cardGroup.userData.originPos = cardGroup.position.clone();
            }

            const originPos = cardGroup.position.clone();
            const destPos = new THREE.Vector3(
                this.SKILL_PANEL_X,
                this.SKILL_PANEL_Y,
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

    /**
     * 카드 원위치로 복귀
     */
    private static async returnFromSkillPanel(cardGroup: THREE.Group, duration: number): Promise<void> {
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