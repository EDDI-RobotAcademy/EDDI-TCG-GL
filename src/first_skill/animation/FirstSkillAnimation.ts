import * as THREE from "three";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

export class FirstSkillAnimation {
    private static instance: FirstSkillAnimation;
    private scene!: THREE.Scene;

    private readonly SKILL_PANEL_X = 0;
    private readonly SKILL_PANEL_Y = (0.5 - 0.78221649) * window.innerHeight; // 원래 y 그대로

    private constructor() {}

    public static getInstance(): FirstSkillAnimation {
        if (!FirstSkillAnimation.instance) {
            FirstSkillAnimation.instance = new FirstSkillAnimation();
        }
        return FirstSkillAnimation.instance;
    }

    public setScene(scene: THREE.Scene) {
        this.scene = scene;
    }

    public async targetingSkillToOpponent(yourCardGroup: THREE.Group): Promise<void> {
        // 1. 카드 스킬 패널로 이동
        await this.yourCardToSkillPanel(yourCardGroup, 1000);

        // 2. (추후) 스킬 이펙트 처리
        // await this.useSkillEffectToTarget(...);

        // 3. 카드 원위치 복귀
        await this.returnYourCardFromSkillPanel(yourCardGroup, 1000);

        yourCardGroup.userData.originPos = yourCardGroup.position.clone();

        // 모든 child의 월드 좌표 저장 (무기 포함)
        yourCardGroup.children.forEach(child => {
            child.userData.originPos = child.getWorldPosition(new THREE.Vector3());
        });

        // 씬에 남아 있는 무기도 반드시 갱신
        // this.scene.traverse(obj => {
        //     if (obj.userData && obj.userData.isWeapon) {
        //         obj.userData.originPos = obj.getWorldPosition(new THREE.Vector3());
        //     }
        // });

        this.scene.traverse(obj => {
            if (obj.userData?.isWeapon) {
                obj.userData.originPos = obj.getWorldPosition(new THREE.Vector3());
            }
        });
    }

    private async yourCardToSkillPanel(cardGroup: THREE.Group, duration: number): Promise<void> {
        return new Promise(resolve => {
            // 원래 위치 저장
            if (!cardGroup.userData.originPos) {
                cardGroup.userData.originPos = cardGroup.position.clone();
            }

            const originPos = cardGroup.position.clone();
            console.log(`cardGroup.position: ${JSON.stringify(cardGroup.position)}`)

            // 절대 좌표 기준 스킬 패널 위치
            const destPos = new THREE.Vector3(
                this.SKILL_PANEL_X,
                this.SKILL_PANEL_Y,
                originPos.z + 1
            );

            console.log(`[yourCardToSkillPanel] origin: (${originPos.x.toFixed(2)}, ${originPos.y.toFixed(2)}, ${originPos.z.toFixed(2)})`);
            console.log(`[yourCardToSkillPanel] dest:   (${destPos.x.toFixed(2)}, ${destPos.y.toFixed(2)}, ${destPos.z.toFixed(2)})`);

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

    private async returnYourCardFromSkillPanel(cardGroup: THREE.Group, duration: number): Promise<void> {
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

    public async targetingSkillToOpponentMaster(

    ): Promise<void> {

    }
}
