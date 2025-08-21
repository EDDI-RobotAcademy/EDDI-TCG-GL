import * as THREE from "three";
import {SkillPanelAnimator} from "../../skill_panel_animator/SkillPanelAnimator";

export class SecondSkillAnimation {
    private static instance: SecondSkillAnimation;
    private scene!: THREE.Scene;

    private constructor() {}

    public static getInstance(): SecondSkillAnimation {
        if (!SecondSkillAnimation.instance) {
            SecondSkillAnimation.instance = new SecondSkillAnimation();
        }
        return SecondSkillAnimation.instance;
    }

    public setScene(scene: THREE.Scene) {
        this.scene = scene;
    }

    public async targetingSkillToOpponent(yourCardGroup: THREE.Group): Promise<void> {
        await SkillPanelAnimator.playSkillSequence(
            yourCardGroup,
            async () => {
                // (추후) 스킬 이펙트 처리
                // await this.useSkillEffectToTarget(...);
            },
            1000
        );

        // 카드, 무기 원본 좌표 갱신
        yourCardGroup.userData.originPos = yourCardGroup.position.clone();

        yourCardGroup.children.forEach(child => {
            child.userData.originPos = child.getWorldPosition(new THREE.Vector3());
        });

        this.scene.traverse(obj => {
            if (obj.userData?.isWeapon) {
                obj.userData.originPos = obj.getWorldPosition(new THREE.Vector3());
            }
        });
    }

    public async targetingSkillToOpponentMaster(yourCardGroup: THREE.Group): Promise<void> {
        await SkillPanelAnimator.playSkillSequence(
            yourCardGroup,
            async () => {
                // (추후) 스킬 이펙트 처리
                // await this.useSkillEffectToTarget(...);
            },
            1000
        );

        // 카드, 무기 원본 좌표 갱신
        yourCardGroup.userData.originPos = yourCardGroup.position.clone();

        yourCardGroup.children.forEach(child => {
            child.userData.originPos = child.getWorldPosition(new THREE.Vector3());
        });

        this.scene.traverse(obj => {
            if (obj.userData?.isWeapon) {
                obj.userData.originPos = obj.getWorldPosition(new THREE.Vector3());
            }
        });
    }

    public async skillToEveryOpponentFieldUnit(yourCardGroup: THREE.Group): Promise<void> {
        await SkillPanelAnimator.playSkillSequence(
            yourCardGroup,
            async () => {
                // (추후) 스킬 이펙트 처리
                // await this.useSkillEffectToTarget(...);
            },
            1000
        );

        // 카드, 무기 원본 좌표 갱신
        yourCardGroup.userData.originPos = yourCardGroup.position.clone();

        yourCardGroup.children.forEach(child => {
            child.userData.originPos = child.getWorldPosition(new THREE.Vector3());
        });

        this.scene.traverse(obj => {
            if (obj.userData?.isWeapon) {
                obj.userData.originPos = obj.getWorldPosition(new THREE.Vector3());
            }
        });
    }
}
