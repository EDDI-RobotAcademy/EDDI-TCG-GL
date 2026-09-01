import * as THREE from "three";
import {SkillPlayback} from "../../../animation/skill/SkillPlayback";
import {NetherBladeFirstPassiveEffect} from "../../../animation/nether_blade/NetherBladeFirstPassiveEffect";

// Card-ID gate: 마검의 지배자 네더 블레이드. When this card is the attacker, the
// first-skill panel sequence dispatches the dedicated charge-aura + violet
// gather + AoE slash effect inside its effect callback.
const NETHER_BLADE_CARD_ID = 19;

export class FirstSkillAnimation {
    private static instance: FirstSkillAnimation;
    private scene!: THREE.Scene;

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

    // attackerCardId is used to gate per-card skill effects (e.g. Nether Blade's
    // violet charge → AoE slash). targetX / targetY land the slash on the chosen
    // opponent. Both are optional so the existing call sites that don't have a
    // specific effect to fire still work unchanged.
    public async targetingSkillToOpponent(
        yourCardGroup: THREE.Group,
        attackerCardId?: number,
        targetX?: number,
        targetY?: number,
    ): Promise<void> {
        await SkillPlayback.play(
            yourCardGroup,
            this.buildEffectCallback(yourCardGroup, attackerCardId, targetX, targetY),
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

    public async targetingSkillToOpponentMaster(
        yourCardGroup: THREE.Group,
        attackerCardId?: number,
        targetX?: number,
        targetY?: number,
    ): Promise<void> {
        await SkillPlayback.play(
            yourCardGroup,
            this.buildEffectCallback(yourCardGroup, attackerCardId, targetX, targetY),
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

    // Picks the right per-card effect for the attacker's first skill. Returns
    // undefined when there is nothing to play, in which case the panel sequence
    // just animates the card up and back without a stall.
    private buildEffectCallback(
        yourCardGroup: THREE.Group,
        attackerCardId: number | undefined,
        targetX: number | undefined,
        targetY: number | undefined,
    ): (() => Promise<void>) | undefined {
        if (attackerCardId === NETHER_BLADE_CARD_ID) {
            return async () => {
                const canvas = document.querySelector('canvas') as HTMLElement | null;
                if (!canvas) {
                    console.warn('Nether Blade first-skill effect: canvas not found, skipping visuals.');
                    return;
                }
                const originPos = yourCardGroup.getWorldPosition(new THREE.Vector3());
                const targetPos = (targetX != null && targetY != null)
                    ? new THREE.Vector3(targetX, targetY, originPos.z)
                    : new THREE.Vector3(originPos.x + 240, originPos.y, originPos.z);
                const effect = new NetherBladeFirstPassiveEffect(this.scene);
                await effect.play(originPos, [targetPos], canvas, () => { /* per-strike SFX hook */ });
            };
        }
        return undefined;
    }
}
