import * as THREE from "three";
import {BattleFieldCardAttributeMarkScene} from "../../battle_field_card_attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";
import {OpponentFieldCardScene} from "../../opponent_field_card_scene/entity/OpponentFieldCardScene";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

export class GeneralAttackAnimation {
    private static instance: GeneralAttackAnimation;

    private scene!: THREE.Scene;
    private readonly CARD_WIDTH: number = 0.06493506493
    private readonly CARD_HEIGHT: number = this.CARD_WIDTH * 1.615

    private readonly OPPONENT_START_X: number = 0.4605885
    private readonly OPPONENT_START_Y: number = 0.1920103

    private readonly OPPONENT_END_X: number = 0.5410156
    private readonly OPPONENT_END_Y: number = 0.0476804

    private constructor() {}

    public static getInstance(): GeneralAttackAnimation {
        if (!GeneralAttackAnimation.instance) {
            GeneralAttackAnimation.instance = new GeneralAttackAnimation();
        }
        return GeneralAttackAnimation.instance;
    }

    public setScene(scene: THREE.Scene) {
        this.scene = scene;
    }

    /** 일반 유닛 공격 */
    public async attackWithWeapon(
        weaponScene: BattleFieldCardAttributeMarkScene,
        cardGroup: THREE.Group,
        opponentCardGroup: THREE.Group,
        opponentScene: OpponentFieldCardScene
    ): Promise<void> {
        const weaponMesh = weaponScene.getMesh();
        const targetMesh = opponentScene.getMesh();

        // 월드 좌표 보장
        weaponMesh.updateMatrixWorld(true);
        targetMesh.updateMatrixWorld(true);

        const originPos = weaponMesh.getWorldPosition(new THREE.Vector3());
        const originRot = weaponMesh.rotation.z;

        const halfWidth = this.CARD_WIDTH * window.innerWidth / 2;
        const halfHeight = this.CARD_HEIGHT * window.innerWidth / 2;

        const targetPos = targetMesh
            .getWorldPosition(new THREE.Vector3())   // 월드
            .add(new THREE.Vector3(-halfWidth, 0, 0.5));

        // 1) 무기를 상대 근처로 이동
        await this.yoursWeaponToOpponent(
            weaponMesh, cardGroup, originPos,
            targetPos.clone().add(new THREE.Vector3(0, 0, 0.5)), 1000
        );

        // 2) 좌우 휘두르기
        await this.attackOpponentUnitLeftToRightWithWeapon(
            weaponMesh, opponentCardGroup, halfWidth, halfHeight, 300
        );

        // 3) 무기 복귀
        const curWorld = weaponMesh.getWorldPosition(new THREE.Vector3());
        await this.returnWeaponFromOpponent(
            weaponMesh, cardGroup, curWorld, originPos, weaponMesh.rotation.z, originRot, 1000
        );
    }

    /** 본체 공격 */
    public async attackOpponentMasterWithWeapon(
        weaponScene: BattleFieldCardAttributeMarkScene,
        cardGroup: THREE.Group
    ): Promise<void> {
        const weaponMesh = weaponScene.getMesh();
        const originPos = weaponMesh.position.clone();
        const originRot = weaponMesh.rotation.z;

        const startX = (this.OPPONENT_START_X - 0.5) * window.innerWidth;
        const startY = (0.5 - this.OPPONENT_START_Y) * window.innerHeight;
        const endX = (this.OPPONENT_END_X - 0.5) * window.innerWidth;
        const endY = (0.5 - this.OPPONENT_END_Y) * window.innerHeight;

        const width = endX - startX;
        const height = endY - startY;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const targetPos = new THREE.Vector3(startX, startY + height / 2, 0.5);

        // 1) 무기를 상대 근처로 이동
        await this.yoursWeaponToOpponent(weaponMesh, cardGroup, originPos, targetPos.clone().add(new THREE.Vector3(0, 0, 0.5)), 1000);

        // 2) 좌우 휘두르기
        await this.attackOpponentMasterLeftToRightWithWeapon(weaponMesh, halfWidth, halfHeight, 300);

        // 3) 무기 복귀
        await this.returnWeaponFromOpponent(weaponMesh, cardGroup, weaponMesh.position.clone(), originPos, weaponMesh.rotation.z, originRot, 1000);
    }

    // =====================================================
    // === 내부 애니메이션 로직 =============================
    // =====================================================

    private yoursWeaponToOpponent(weaponMesh: THREE.Mesh, cardGroup: THREE.Group, originPos: THREE.Vector3, targetPos: THREE.Vector3, duration: number): Promise<void> {
        return new Promise(resolve => {
            const startRot = weaponMesh.rotation.z;
            const endRot = startRot + Math.PI * 130 / 180;
            const startY = cardGroup.position.y;
            const quarterWidth = this.CARD_WIDTH * window.innerWidth / 4;

            const weaponTween = new TWEEN.Tween({ x: originPos.x, y: originPos.y, z: originPos.z, rot: startRot })
                .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z, rot: endRot }, duration)
                .easing(TWEEN.Easing.Quadratic.In)
                .onUpdate((obj: any) => {
                    weaponMesh.position.set(obj.x, obj.y, obj.z);
                    weaponMesh.rotation.z = obj.rot;
                });

            const cardUp = new TWEEN.Tween({ y: startY })
                .to({ y: startY + quarterWidth }, duration / 2)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((obj: any) => cardGroup.position.y = obj.y);

            weaponTween.start();
            cardUp.start();

            setTimeout(() => resolve(), duration);
        });
    }

    private attackOpponentUnitLeftToRightWithWeapon(mesh: THREE.Mesh, opponentCardGroup: THREE.Group, halfWidth: number, halfHeight: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const startRot = mesh.rotation.z;
            const endRot = startRot - Math.PI;
            const originPos = mesh.position.clone();
            const targetPos = originPos.clone();
            targetPos.x += halfWidth * 1.25;

            const weaponTween = new TWEEN.Tween({ x: originPos.x, y: originPos.y, z: originPos.z, rot: startRot })
                .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z, rot: endRot }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((obj: any) => {
                    mesh.position.set(obj.x, obj.y, obj.z);
                    mesh.rotation.z = obj.rot;
                });

            const steps = 12;
            const singleDuration = duration / steps;
            const originalPosition = opponentCardGroup.position.clone();
            const tweens = [];

            for (let i = 0; i < steps; i++) {
                const nextPos = new THREE.Vector3(
                    originalPosition.x + (Math.random() * 2 - 1) * halfWidth / 4,
                    originalPosition.y + (Math.random() * 2 - 1) * halfHeight / 4,
                    originalPosition.z
                );

                const t = new TWEEN.Tween(opponentCardGroup.position)
                    .to({ x: nextPos.x, y: nextPos.y }, singleDuration)
                    .easing(TWEEN.Easing.Quadratic.InOut);

                if (i > 0) tweens[i - 1].chain(t);
                tweens.push(t);
            }

            tweens[steps - 1].chain(new TWEEN.Tween(opponentCardGroup.position)
                .to({ x: originalPosition.x, y: originalPosition.y }, singleDuration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => resolve())
            );

            weaponTween.start();
            tweens[0].start();
        });
    }

    private attackOpponentMasterLeftToRightWithWeapon(mesh: THREE.Mesh, halfWidth: number, halfHeight: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const startRot = mesh.rotation.z;
            const endRot = startRot - Math.PI;
            const originPos = mesh.position.clone();
            const targetPos = originPos.clone();
            targetPos.x += halfWidth * 1.25;

            const weaponTween = new TWEEN.Tween({ x: originPos.x, y: originPos.y, z: originPos.z, rot: startRot })
                .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z, rot: endRot }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((obj: any) => {
                    mesh.position.set(obj.x, obj.y, obj.z);
                    mesh.rotation.z = obj.rot;
                });

            const steps = 12;
            const singleDuration = duration / steps;
            const originalPosition = this.scene.position.clone();
            const tweens = [];

            for (let i = 0; i < steps; i++) {
                const nextPos = new THREE.Vector3(
                    originalPosition.x + (Math.random() * 2 - 1) * halfWidth / 4,
                    originalPosition.y + (Math.random() * 2 - 1) * halfHeight / 4,
                    originalPosition.z
                );

                const t = new TWEEN.Tween(this.scene.position)
                    .to({ x: nextPos.x, y: nextPos.y }, singleDuration)
                    .easing(TWEEN.Easing.Quadratic.InOut);

                if (i > 0) tweens[i - 1].chain(t);
                tweens.push(t);
            }

            tweens[steps - 1].chain(new TWEEN.Tween(this.scene.position)
                .to({ x: originalPosition.x, y: originalPosition.y }, singleDuration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => resolve())
            );

            weaponTween.start();
            tweens[0].start();
        });
    }

    private returnWeaponFromOpponent(weaponMesh: THREE.Mesh, cardGroup: THREE.Group, fromPos: THREE.Vector3, toPos: THREE.Vector3, fromRot: number, toRot: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const weaponObj = { x: fromPos.x, y: fromPos.y, z: fromPos.z, rot: fromRot };
            const quarterWidth = this.CARD_WIDTH * window.innerWidth / 4;

            const weaponTween = new TWEEN.Tween(weaponObj)
                .to({ x: toPos.x, y: toPos.y, z: toPos.z, rot: toRot }, duration)
                .easing(TWEEN.Easing.Quadratic.In)
                .onUpdate(() => {
                    weaponMesh.position.set(weaponObj.x, weaponObj.y, weaponObj.z);
                    weaponMesh.rotation.z = weaponObj.rot;
                });

            const startY = cardGroup.position.y;
            const cardDown = new TWEEN.Tween({ y: startY })
                .to({ y: startY - quarterWidth }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((obj: any) => cardGroup.position.y = obj.y);

            weaponTween.start();
            cardDown.start();

            setTimeout(() => resolve(), duration);
        });
    }
}
