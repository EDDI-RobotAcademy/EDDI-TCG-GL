import * as THREE from "three";
import {SkillPanelAnimator} from "../../skill_panel_animator/SkillPanelAnimator";
import {NetherBladeFirstPassiveEffect} from "../../animation/nether_blade/NetherBladeFirstPassiveEffect";

// Per-card hooks for the second-skill panel sequence. When the attacker's cardId
// matches a registered card, the effect callback runs the dedicated visuals
// inside the skill panel sequence (between the panel-up and panel-return moves).
const NETHER_BLADE_CARD_ID = 19;

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

    public async targetingSkillToOpponent(
        yourCardGroup: THREE.Group,
        attackerCardId?: number,
        targetX?: number,
        targetY?: number,
    ): Promise<void> {
        await SkillPanelAnimator.playSkillSequence(
            yourCardGroup,
            this.buildSingleTargetCallback(yourCardGroup, attackerCardId, targetX, targetY),
            1000
        );
        this.refreshOriginPositions(yourCardGroup);
    }

    public async targetingSkillToOpponentMaster(
        yourCardGroup: THREE.Group,
        attackerCardId?: number,
        targetX?: number,
        targetY?: number,
    ): Promise<void> {
        await SkillPanelAnimator.playSkillSequence(
            yourCardGroup,
            this.buildSingleTargetCallback(yourCardGroup, attackerCardId, targetX, targetY),
            1000
        );
        this.refreshOriginPositions(yourCardGroup);
    }

    public async skillToEveryOpponentFieldUnit(
        yourCardGroup: THREE.Group,
        attackerCardId?: number,
        targetWorldPositions?: readonly THREE.Vector3[],
    ): Promise<void> {
        console.log(`[SecondSkillAnimation] AOE entry — attackerCardId=${attackerCardId}, hasTargets=${!!targetWorldPositions?.length}`);
        await SkillPanelAnimator.playSkillSequence(
            yourCardGroup,
            this.buildAoeCallback(yourCardGroup, attackerCardId, targetWorldPositions),
            1000
        );
        this.refreshOriginPositions(yourCardGroup);
    }

    // ── Per-attacker effect dispatch ─────────────────────────────────────────

    private buildSingleTargetCallback(
        yourCardGroup: THREE.Group,
        attackerCardId: number | undefined,
        targetX: number | undefined,
        targetY: number | undefined,
    ): (() => Promise<void>) | undefined {
        if (attackerCardId === NETHER_BLADE_CARD_ID) {
            return async () => {
                const canvas = this.findCanvas();
                if (!canvas) return;
                const originPos = yourCardGroup.getWorldPosition(new THREE.Vector3());
                const targetPos = (targetX != null && targetY != null)
                    ? new THREE.Vector3(targetX, targetY, originPos.z)
                    : new THREE.Vector3(originPos.x + 240, originPos.y, originPos.z);
                const effect = new NetherBladeFirstPassiveEffect(this.scene);
                await effect.play(originPos, [targetPos], canvas, () => {});
            };
        }
        return undefined;
    }

    private buildAoeCallback(
        yourCardGroup: THREE.Group,
        attackerCardId: number | undefined,
        targetWorldPositions: readonly THREE.Vector3[] | undefined,
    ): (() => Promise<void>) | undefined {
        console.log(`[SecondSkillAnimation] buildAoeCallback — attackerCardId=${attackerCardId} (need ${NETHER_BLADE_CARD_ID})`);
        if (attackerCardId === NETHER_BLADE_CARD_ID) {
            return async () => {
                console.log('[SecondSkillAnimation] AOE callback firing — Nether Blade matched');
                try {
                    const canvas = this.findCanvas();
                    if (!canvas) return;
                    const originPos = yourCardGroup.getWorldPosition(new THREE.Vector3());
                    console.log(`[SecondSkillAnimation] originPos=(${originPos.x.toFixed(0)}, ${originPos.y.toFixed(0)}, ${originPos.z.toFixed(0)})`);

                    // If the handler couldn't supply real opponent positions, lay out a
                    // 5-target fan in front of the caster so the AoE still reads as a
                    // wide radial sweep rather than a single slash.
                    const targets: THREE.Vector3[] = (targetWorldPositions && targetWorldPositions.length > 0)
                        ? targetWorldPositions.map(v => v.clone())
                        : this.fanTargets(originPos, 5, 280, 320);

                    const effect = new NetherBladeFirstPassiveEffect(this.scene);
                    await effect.play(originPos, targets, canvas, () => { /* per-strike SFX */ });
                    console.log('[SecondSkillAnimation] AOE effect completed');
                } catch (err) {
                    console.error('[SecondSkillAnimation] AOE effect failed:', err);
                }
            };
        }
        console.log('[SecondSkillAnimation] No callback — cardId did not match');
        return undefined;
    }

    private fanTargets(
        origin: THREE.Vector3, count: number, radius: number, spreadDegrees: number,
    ): THREE.Vector3[] {
        const out: THREE.Vector3[] = [];
        const spread = (spreadDegrees * Math.PI) / 180;
        const step = count > 1 ? spread / (count - 1) : 0;
        const start = -spread / 2;
        for (let i = 0; i < count; i++) {
            const a = start + step * i;
            out.push(new THREE.Vector3(
                origin.x + Math.cos(a) * radius,
                origin.y + Math.sin(a) * radius,
                origin.z,
            ));
        }
        return out;
    }

    private findCanvas(): HTMLElement | null {
        const c = document.querySelector('canvas') as HTMLElement | null;
        if (!c) console.warn('SecondSkillAnimation: canvas not found, skipping visuals.');
        return c;
    }

    private refreshOriginPositions(yourCardGroup: THREE.Group): void {
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
