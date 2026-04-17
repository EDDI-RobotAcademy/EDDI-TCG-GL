import * as THREE from "three";
import { BattleFieldConstants } from "../../common/BattleFieldConstants";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

const CWR = BattleFieldConstants.CARD_WIDTH_RATIO;

export class AttackAnimationV2 {
    private scene: THREE.Scene;
    private animating = false;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public isAnimating(): boolean {
        return this.animating;
    }

    public async playUnitAttack(
        attackerGroup: THREE.Group,
        targetGroup: THREE.Group,
    ): Promise<void> {
        if (this.animating) return;
        this.animating = true;

        const weaponMesh = this.findWeaponMesh(attackerGroup);
        if (!weaponMesh) { this.animating = false; return; }

        const cardW = CWR * window.innerWidth;
        const quarterW = cardW / 4;
        const attackerOrigY = attackerGroup.position.y;
        const weaponOrigPos = weaponMesh.position.clone();
        const weaponOrigRot = weaponMesh.rotation.z;

        // Convert target world position to attacker's local space
        targetGroup.updateMatrixWorld(true);
        attackerGroup.updateMatrixWorld(true);
        const targetWorld = targetGroup.getWorldPosition(new THREE.Vector3());
        const localTarget = attackerGroup.worldToLocal(targetWorld.clone());
        localTarget.z = 0.5;

        await this.phase1(attackerGroup, weaponMesh, weaponOrigPos, localTarget, weaponOrigRot, attackerOrigY, quarterW, 800);

        // Slash effect at target world position
        this.spawnSlashEffect(targetWorld);
        await this.phase2(weaponMesh, targetGroup, cardW, 300);

        await this.phase3(attackerGroup, weaponMesh, weaponMesh.position.clone(), weaponOrigPos, weaponMesh.rotation.z, weaponOrigRot, attackerOrigY, 800);

        // Force exact restore
        attackerGroup.position.y = attackerOrigY;
        weaponMesh.position.copy(weaponOrigPos);
        weaponMesh.rotation.z = weaponOrigRot;

        this.animating = false;
    }

    public async playMasterAttack(
        attackerGroup: THREE.Group,
        masterGroup: THREE.Group,
    ): Promise<void> {
        if (this.animating) return;
        this.animating = true;

        const weaponMesh = this.findWeaponMesh(attackerGroup);
        if (!weaponMesh) { this.animating = false; return; }

        const cardW = CWR * window.innerWidth;
        const quarterW = cardW / 4;
        const attackerOrigY = attackerGroup.position.y;
        const weaponOrigPos = weaponMesh.position.clone();
        const weaponOrigRot = weaponMesh.rotation.z;

        masterGroup.updateMatrixWorld(true);
        attackerGroup.updateMatrixWorld(true);
        const masterWorld = masterGroup.getWorldPosition(new THREE.Vector3());
        const localTarget = attackerGroup.worldToLocal(masterWorld.clone());
        localTarget.z = 0.5;

        await this.phase1(attackerGroup, weaponMesh, weaponOrigPos, localTarget, weaponOrigRot, attackerOrigY, quarterW, 800);

        this.spawnSlashEffect(masterWorld);
        await this.phase2Master(weaponMesh, cardW, 300);

        await this.phase3(attackerGroup, weaponMesh, weaponMesh.position.clone(), weaponOrigPos, weaponMesh.rotation.z, weaponOrigRot, attackerOrigY, 800);

        attackerGroup.position.y = attackerOrigY;
        weaponMesh.position.copy(weaponOrigPos);
        weaponMesh.rotation.z = weaponOrigRot;

        this.animating = false;
    }

    private spawnSlashEffect(targetWorld: THREE.Vector3): void {
        const cardW = CWR * window.innerWidth;
        const slashLen = cardW * 2.5;
        const angle = (Math.random() - 0.5) * Math.PI / 4 + Math.PI / 6;

        const geo = new THREE.PlaneGeometry(slashLen, cardW * 0.15);
        const mat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `
                varying vec2 vUv;
                void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;
                void main() {
                    float centerGlow = 1.0 - smoothstep(0.0, 0.5, abs(vUv.y - 0.5) * 2.0);
                    float tipFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
                    float alpha = centerGlow * tipFade * (1.0 - u_time);
                    vec3 color = mix(vec3(1.0), vec3(0.3, 0.8, 1.0), vUv.x);
                    gl_FragColor = vec4(color, alpha * 1.5);
                }
            `,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(targetWorld.x, targetWorld.y, 2);
        mesh.rotation.z = angle;
        mesh.renderOrder = 10;
        this.scene.add(mesh);

        const start = performance.now();
        const duration = 400;
        const tick = () => {
            const t = Math.min((performance.now() - start) / duration, 1);
            mat.uniforms.u_time.value = t;
            mesh.scale.y = 1 + t * 0.5;
            if (t < 1) requestAnimationFrame(tick);
            else { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(tick);
    }

    // Phase 1: card rises + weapon flies to target (LOCAL coords, no reparent)
    private phase1(
        cardGroup: THREE.Group, weapon: THREE.Mesh,
        from: THREE.Vector3, to: THREE.Vector3,
        fromRot: number, origY: number, riseAmount: number, duration: number,
    ): Promise<void> {
        return new Promise(resolve => {
            const endRot = fromRot + Math.PI * 130 / 180;

            new TWEEN.Tween({ x: from.x, y: from.y, z: from.z, rot: fromRot })
                .to({ x: to.x, y: to.y, z: to.z, rot: endRot }, duration)
                .easing(TWEEN.Easing.Quadratic.In)
                .onUpdate((o: any) => {
                    weapon.position.set(o.x, o.y, o.z);
                    weapon.rotation.z = o.rot;
                })
                .start();

            new TWEEN.Tween({ y: origY })
                .to({ y: origY + riseAmount }, duration / 2)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((o: any) => { cardGroup.position.y = o.y; })
                .start();

            setTimeout(resolve, duration);
        });
    }

    // Phase 2: weapon swings + target shakes
    private phase2(weapon: THREE.Mesh, targetGroup: THREE.Group, cardW: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const startPos = weapon.position.clone();
            const endPos = startPos.clone();
            endPos.x += cardW * 0.8;
            const startRot = weapon.rotation.z;
            const endRot = startRot - Math.PI;

            new TWEEN.Tween({ x: startPos.x, y: startPos.y, z: startPos.z, rot: startRot })
                .to({ x: endPos.x, y: endPos.y, z: endPos.z, rot: endRot }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => {
                    weapon.position.set(o.x, o.y, o.z);
                    weapon.rotation.z = o.rot;
                })
                .start();

            const origPos = targetGroup.position.clone();
            const steps = 12;
            const stepDur = duration / steps;
            const tweens: any[] = [];
            for (let i = 0; i < steps; i++) {
                const nx = origPos.x + (Math.random() * 2 - 1) * cardW / 8;
                const ny = origPos.y + (Math.random() * 2 - 1) * cardW / 8;
                const t = new TWEEN.Tween(targetGroup.position)
                    .to({ x: nx, y: ny }, stepDur)
                    .easing(TWEEN.Easing.Quadratic.InOut);
                if (i > 0) tweens[i - 1].chain(t);
                tweens.push(t);
            }
            tweens[steps - 1].chain(
                new TWEEN.Tween(targetGroup.position)
                    .to({ x: origPos.x, y: origPos.y }, stepDur)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => resolve())
            );
            tweens[0].start();
        });
    }

    // Phase 2 for master: weapon swings + scene shakes
    private phase2Master(weapon: THREE.Mesh, cardW: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const startPos = weapon.position.clone();
            const endPos = startPos.clone();
            endPos.x += cardW * 0.8;
            const startRot = weapon.rotation.z;
            const endRot = startRot - Math.PI;

            new TWEEN.Tween({ x: startPos.x, y: startPos.y, z: startPos.z, rot: startRot })
                .to({ x: endPos.x, y: endPos.y, z: endPos.z, rot: endRot }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => {
                    weapon.position.set(o.x, o.y, o.z);
                    weapon.rotation.z = o.rot;
                })
                .start();

            const origPos = this.scene.position.clone();
            const steps = 12;
            const stepDur = duration / steps;
            const tweens: any[] = [];
            for (let i = 0; i < steps; i++) {
                const nx = origPos.x + (Math.random() * 2 - 1) * cardW / 8;
                const ny = origPos.y + (Math.random() * 2 - 1) * cardW / 8;
                const t = new TWEEN.Tween(this.scene.position)
                    .to({ x: nx, y: ny }, stepDur)
                    .easing(TWEEN.Easing.Quadratic.InOut);
                if (i > 0) tweens[i - 1].chain(t);
                tweens.push(t);
            }
            tweens[steps - 1].chain(
                new TWEEN.Tween(this.scene.position)
                    .to({ x: origPos.x, y: origPos.y }, stepDur)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => resolve())
            );
            tweens[0].start();
        });
    }

    // Phase 3: weapon returns + card descends
    private phase3(
        cardGroup: THREE.Group, weapon: THREE.Mesh,
        fromPos: THREE.Vector3, toPos: THREE.Vector3,
        fromRot: number, toRot: number,
        origY: number, duration: number,
    ): Promise<void> {
        return new Promise(resolve => {
            new TWEEN.Tween({ x: fromPos.x, y: fromPos.y, z: fromPos.z, rot: fromRot })
                .to({ x: toPos.x, y: toPos.y, z: toPos.z, rot: toRot }, duration)
                .easing(TWEEN.Easing.Quadratic.In)
                .onUpdate((o: any) => {
                    weapon.position.set(o.x, o.y, o.z);
                    weapon.rotation.z = o.rot;
                })
                .start();

            const startY = cardGroup.position.y;
            new TWEEN.Tween({ y: startY })
                .to({ y: origY }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { cardGroup.position.y = o.y; })
                .start();

            setTimeout(resolve, duration);
        });
    }

    private findWeaponMesh(group: THREE.Group): THREE.Mesh | null {
        let found: THREE.Mesh | null = null;
        group.traverse((child) => {
            if (child instanceof THREE.Mesh && child.userData.slotType === 'weapon' && !found) {
                found = child;
            }
        });
        return found;
    }
}
