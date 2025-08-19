import * as THREE from "three";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

export class FirstSkillAnimation {
    private static instance: FirstSkillAnimation;

    private scene!: THREE.Scene;
    private readonly CARD_WIDTH: number = 0.06493506493
    private readonly CARD_HEIGHT: number = this.CARD_WIDTH * 1.615

    private readonly OPPONENT_START_X: number = 0.4605885
    private readonly OPPONENT_START_Y: number = 0.1920103

    private readonly OPPONENT_END_X: number = 0.5410156
    private readonly OPPONENT_END_Y: number = 0.0476804

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

    public async targetingSkillToOpponent(
        yourCardGroup: THREE.Group,
    ): Promise<void> {
        await this.yourCardToSkillPanel(yourCardGroup, 1000);

        // await this.useSkillEffectToTarget(weaponMesh, opponentCardGroup, halfWidth, halfHeight, 300);

        await this.returnYourCardFromSkillPanel(yourCardGroup, 1000);
    }

    public async targetingSkillToOpponentMaster(

    ): Promise<void> {

    }

    private async yourCardToSkillPanel(
        cardGroup: THREE.Group,
        duration: number
    ): Promise<void> {
        return new Promise(resolve => {
            const originPos = cardGroup.position.clone();

            // 화면 기준으로 스킬 패널 위치 (예시: 화면 하단 중앙)
            const destX = 0;
            const destY = -window.innerHeight * 0.25;
            const destPos = new THREE.Vector3(destX, destY, originPos.z + 1);

            new TWEEN.Tween({
                x: originPos.x,
                y: originPos.y,
                z: originPos.z
            })
                .to(
                    { x: destPos.x, y: destPos.y, z: destPos.z },
                    duration
                )
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((obj: { x: number; y: number; z: number }) => {
                    cardGroup.position.set(obj.x, obj.y, obj.z);
                })
                .onComplete(() => resolve())
                .start();
        });
    }

    // 카드 원위치 복귀
    private async returnYourCardFromSkillPanel(
        cardGroup: THREE.Group,
        duration: number
    ): Promise<void> {
        return new Promise(resolve => {
            const destPos = cardGroup.userData.originPos as THREE.Vector3 ?? new THREE.Vector3(0, 0, 0);

            new TWEEN.Tween({
                x: cardGroup.position.x,
                y: cardGroup.position.y,
                z: cardGroup.position.z
            })
                .to(
                    { x: destPos.x, y: destPos.y, z: destPos.z },
                    duration
                )
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((obj: { x: number; y: number; z: number }) => {
                    cardGroup.position.set(obj.x, obj.y, obj.z);
                })
                .onComplete(() => resolve())
                .start();
        });
    }

}
