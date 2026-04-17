import * as THREE from "three";
import { BattleFieldConstants } from "../../common/BattleFieldConstants";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

const CWR = BattleFieldConstants.CARD_WIDTH_RATIO;

type WeaponType = 'sword' | 'staff';

export class AttackAnimationV2 {
    private scene: THREE.Scene;
    private animating = false;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public isAnimating(): boolean {
        return this.animating;
    }

    public async playUnitAttack(attackerGroup: THREE.Group, targetGroup: THREE.Group): Promise<void> {
        if (this.animating) return;
        this.animating = true;

        const { mesh: weaponMesh, type: weaponType } = this.findWeaponMesh(attackerGroup);
        if (!weaponMesh) { this.animating = false; return; }

        const cardW = CWR * window.innerWidth;
        const quarterW = cardW / 4;
        const attackerOrigY = attackerGroup.position.y;
        const weaponOrigPos = weaponMesh.position.clone();
        const weaponOrigRot = weaponMesh.rotation.z;

        targetGroup.updateMatrixWorld(true);
        attackerGroup.updateMatrixWorld(true);
        const targetWorld = targetGroup.getWorldPosition(new THREE.Vector3());
        const localTarget = attackerGroup.worldToLocal(targetWorld.clone());
        localTarget.z = 0.5;

        await this.phase1(attackerGroup, weaponMesh, weaponOrigPos, localTarget, weaponOrigRot, attackerOrigY, quarterW, 800);

        if (weaponType === 'staff') {
            this.spawnLightningEffect(targetWorld, cardW);
            await this.phase2Staff(weaponMesh, targetGroup, cardW, 400);
        } else {
            this.spawnSlashEffect(targetWorld);
            await this.phase2Sword(weaponMesh, targetGroup, cardW, 300);
        }

        await this.phase3(attackerGroup, weaponMesh, weaponMesh.position.clone(), weaponOrigPos, weaponMesh.rotation.z, weaponOrigRot, attackerOrigY, 800);

        attackerGroup.position.y = attackerOrigY;
        weaponMesh.position.copy(weaponOrigPos);
        weaponMesh.rotation.z = weaponOrigRot;
        this.animating = false;
    }

    public async playMasterAttack(attackerGroup: THREE.Group, masterGroup: THREE.Group): Promise<void> {
        if (this.animating) return;
        this.animating = true;

        const { mesh: weaponMesh, type: weaponType } = this.findWeaponMesh(attackerGroup);
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

        if (weaponType === 'staff') {
            this.spawnLightningEffect(masterWorld, cardW);
            await this.phase2Master(weaponMesh, cardW, 400);
        } else {
            this.spawnSlashEffect(masterWorld);
            await this.phase2Master(weaponMesh, cardW, 300);
        }

        await this.phase3(attackerGroup, weaponMesh, weaponMesh.position.clone(), weaponOrigPos, weaponMesh.rotation.z, weaponOrigRot, attackerOrigY, 800);

        attackerGroup.position.y = attackerOrigY;
        weaponMesh.position.copy(weaponOrigPos);
        weaponMesh.rotation.z = weaponOrigRot;
        this.animating = false;
    }

    // === Slash effect (sword) ===
    private spawnSlashEffect(targetWorld: THREE.Vector3): void {
        const cardW = CWR * window.innerWidth;
        const slashLen = cardW * 2.5;
        const angle = (Math.random() - 0.5) * Math.PI / 4 + Math.PI / 6;

        const geo = new THREE.PlaneGeometry(slashLen, cardW * 0.15);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv; uniform float u_time;
                void main(){
                    float c=1.0-smoothstep(0.0,0.5,abs(vUv.y-0.5)*2.0);
                    float t=smoothstep(0.0,0.15,vUv.x)*smoothstep(1.0,0.85,vUv.x);
                    float a=c*t*(1.0-u_time);
                    vec3 col=mix(vec3(1.0),vec3(0.3,0.8,1.0),vUv.x);
                    gl_FragColor=vec4(col,a*1.5);
                }`,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(targetWorld.x, targetWorld.y, 2);
        mesh.rotation.z = angle;
        mesh.renderOrder = 10;
        this.scene.add(mesh);
        this.fadeAndDispose(mesh, mat, geo, 400);
    }

    // === Lightning effect (staff) — procedural branching bolts ===
    private spawnLightningEffect(targetWorld: THREE.Vector3, cardW: number): void {
        const strikeCount = 2;
        for (let s = 0; s < strikeCount; s++) {
            setTimeout(() => {
                const startX = targetWorld.x + (Math.random() - 0.5) * cardW * 0.6;
                const startY = targetWorld.y + cardW * 2.5;
                const endX = targetWorld.x + (Math.random() - 0.5) * cardW * 0.3;
                const endY = targetWorld.y;

                // Main trunk + branches
                const segments = this.generateBoltPoints(
                    new THREE.Vector2(startX, startY),
                    new THREE.Vector2(endX, endY),
                    5, cardW * 0.4,
                );
                this.renderBolt(segments, cardW * 0.08, 1.0, 500);

                // Branches
                const branchCount = 2 + Math.floor(Math.random() * 3);
                for (let b = 0; b < branchCount; b++) {
                    const idx = Math.floor(Math.random() * (segments.length - 2)) + 1;
                    const branchStart = segments[idx];
                    const branchEnd = new THREE.Vector2(
                        branchStart.x + (Math.random() - 0.5) * cardW * 0.8,
                        branchStart.y - Math.random() * cardW * 0.6,
                    );
                    const branchSegs = this.generateBoltPoints(branchStart, branchEnd, 3, cardW * 0.15);
                    this.renderBolt(branchSegs, cardW * 0.04, 0.6, 400);
                }

                // Screen flash
                this.spawnScreenFlash(350);

                // Impact flash
                this.spawnImpactFlash(new THREE.Vector3(endX, endY, 2), cardW);
            }, s * 150);
        }
    }

    // Recursive midpoint displacement to generate jagged bolt path
    private generateBoltPoints(start: THREE.Vector2, end: THREE.Vector2, depth: number, displacement: number): THREE.Vector2[] {
        if (depth === 0) return [start, end];
        const mid = new THREE.Vector2(
            (start.x + end.x) / 2 + (Math.random() - 0.5) * displacement,
            (start.y + end.y) / 2 + (Math.random() - 0.5) * displacement * 0.3,
        );
        const left = this.generateBoltPoints(start, mid, depth - 1, displacement * 0.5);
        const right = this.generateBoltPoints(mid, end, depth - 1, displacement * 0.5);
        return [...left.slice(0, -1), ...right];
    }

    // Render bolt segments as glowing line strips
    private renderBolt(points: THREE.Vector2[], thickness: number, brightness: number, duration: number): void {
        const segMat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: { u_time: { value: 0.0 }, u_bright: { value: brightness } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;
                uniform float u_bright;
                void main(){
                    float d = abs(vUv.y - 0.5) * 2.0;
                    float core = (1.0 - smoothstep(0.0, 0.2, d)) * 1.0;
                    float glow = (1.0 - smoothstep(0.0, 1.0, d)) * 0.6;
                    float fade = 1.0 - smoothstep(0.2, 1.0, u_time);
                    vec3 coreCol = vec3(1.0, 1.0, 1.0);
                    vec3 glowCol = vec3(0.3, 0.5, 1.0);
                    vec3 col = coreCol * core + glowCol * glow;
                    float a = (core + glow) * fade * u_bright;
                    gl_FragColor = vec4(col, a);
                }`,
        });

        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i];
            const b = points[i + 1];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            const geo = new THREE.PlaneGeometry(len, thickness);
            const mat = segMat.clone();
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, 2);
            mesh.rotation.z = angle;
            mesh.renderOrder = 10;
            this.scene.add(mesh);
            this.fadeAndDispose(mesh, mat, geo, duration);
        }
    }

    // Brief full-screen white flash
    private spawnScreenFlash(duration: number): void {
        const size = Math.max(window.innerWidth, window.innerHeight) * 2;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `void main(){ gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                uniform float u_time;
                void main(){
                    float a = (1.0 - u_time) * 0.25;
                    gl_FragColor = vec4(0.7, 0.8, 1.0, a);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, 3);
        mesh.renderOrder = 12;
        this.scene.add(mesh);
        this.fadeAndDispose(mesh, mat, geo, duration);
    }

    // Bright radial flash at lightning impact point
    private spawnImpactFlash(pos: THREE.Vector3, cardW: number): void {
        const size = cardW * 1.2;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv; uniform float u_time;
                void main(){
                    float dist = length(vUv - 0.5) * 2.0;
                    float ring = 1.0 - smoothstep(0.0, 0.3 + u_time * 0.7, dist);
                    float flash = ring * (1.0 - u_time);
                    vec3 col = mix(vec3(1.0), vec3(0.3, 0.5, 1.0), dist);
                    gl_FragColor = vec4(col, flash * 1.5);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.renderOrder = 11;
        this.scene.add(mesh);
        this.fadeAndDispose(mesh, mat, geo, 400);
    }

    private fadeAndDispose(mesh: THREE.Mesh, mat: THREE.ShaderMaterial, geo: THREE.BufferGeometry, duration: number): void {
        const start = performance.now();
        const tick = () => {
            const t = Math.min((performance.now() - start) / duration, 1);
            mat.uniforms.u_time.value = t;
            if (t < 1) requestAnimationFrame(tick);
            else { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(tick);
    }

    // === Phase 1: card rises + weapon flies ===
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
                .onUpdate((o: any) => { weapon.position.set(o.x, o.y, o.z); weapon.rotation.z = o.rot; })
                .start();
            new TWEEN.Tween({ y: origY })
                .to({ y: origY + riseAmount }, duration / 2)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((o: any) => { cardGroup.position.y = o.y; })
                .start();
            setTimeout(resolve, duration);
        });
    }

    // === Phase 2 variants ===
    private phase2Sword(weapon: THREE.Mesh, targetGroup: THREE.Group, cardW: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const sp = weapon.position.clone();
            const ep = sp.clone(); ep.x += cardW * 0.8;
            const sr = weapon.rotation.z; const er = sr - Math.PI;
            new TWEEN.Tween({ x: sp.x, y: sp.y, z: sp.z, rot: sr })
                .to({ x: ep.x, y: ep.y, z: ep.z, rot: er }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { weapon.position.set(o.x, o.y, o.z); weapon.rotation.z = o.rot; })
                .start();
            this.shakeGroup(targetGroup, cardW, duration, resolve);
        });
    }

    private phase2Staff(weapon: THREE.Mesh, targetGroup: THREE.Group, cardW: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            // Staff glides across horizontally (no spin, slight float)
            const sp = weapon.position.clone();
            const ep = sp.clone(); ep.x += cardW * 1.0;
            new TWEEN.Tween({ x: sp.x, y: sp.y })
                .to({ x: ep.x, y: sp.y + cardW * 0.1 }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { weapon.position.x = o.x; weapon.position.y = o.y; })
                .start();
            this.shakeGroup(targetGroup, cardW, duration, resolve);
        });
    }

    private phase2Master(weapon: THREE.Mesh, cardW: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const sp = weapon.position.clone();
            const ep = sp.clone(); ep.x += cardW * 0.8;
            const sr = weapon.rotation.z; const er = sr - Math.PI;
            new TWEEN.Tween({ x: sp.x, y: sp.y, z: sp.z, rot: sr })
                .to({ x: ep.x, y: ep.y, z: ep.z, rot: er }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { weapon.position.set(o.x, o.y, o.z); weapon.rotation.z = o.rot; })
                .start();
            this.shakeScene(cardW, duration, resolve);
        });
    }

    private shakeGroup(group: THREE.Group, cardW: number, duration: number, onDone: () => void): void {
        const orig = group.position.clone();
        const steps = 12; const sd = duration / steps;
        const tweens: any[] = [];
        for (let i = 0; i < steps; i++) {
            const nx = orig.x + (Math.random() * 2 - 1) * cardW / 8;
            const ny = orig.y + (Math.random() * 2 - 1) * cardW / 8;
            const t = new TWEEN.Tween(group.position).to({ x: nx, y: ny }, sd).easing(TWEEN.Easing.Quadratic.InOut);
            if (i > 0) tweens[i - 1].chain(t);
            tweens.push(t);
        }
        tweens[steps - 1].chain(new TWEEN.Tween(group.position).to({ x: orig.x, y: orig.y }, sd).easing(TWEEN.Easing.Quadratic.InOut).onComplete(onDone));
        tweens[0].start();
    }

    private shakeScene(cardW: number, duration: number, onDone: () => void): void {
        const orig = this.scene.position.clone();
        const steps = 12; const sd = duration / steps;
        const tweens: any[] = [];
        for (let i = 0; i < steps; i++) {
            const nx = orig.x + (Math.random() * 2 - 1) * cardW / 8;
            const ny = orig.y + (Math.random() * 2 - 1) * cardW / 8;
            const t = new TWEEN.Tween(this.scene.position).to({ x: nx, y: ny }, sd).easing(TWEEN.Easing.Quadratic.InOut);
            if (i > 0) tweens[i - 1].chain(t);
            tweens.push(t);
        }
        tweens[steps - 1].chain(new TWEEN.Tween(this.scene.position).to({ x: orig.x, y: orig.y }, sd).easing(TWEEN.Easing.Quadratic.InOut).onComplete(onDone));
        tweens[0].start();
    }

    // === Phase 3: weapon returns + card descends ===
    private phase3(
        cardGroup: THREE.Group, weapon: THREE.Mesh,
        fromPos: THREE.Vector3, toPos: THREE.Vector3,
        fromRot: number, toRot: number, origY: number, duration: number,
    ): Promise<void> {
        return new Promise(resolve => {
            new TWEEN.Tween({ x: fromPos.x, y: fromPos.y, z: fromPos.z, rot: fromRot })
                .to({ x: toPos.x, y: toPos.y, z: toPos.z, rot: toRot }, duration)
                .easing(TWEEN.Easing.Quadratic.In)
                .onUpdate((o: any) => { weapon.position.set(o.x, o.y, o.z); weapon.rotation.z = o.rot; })
                .start();
            new TWEEN.Tween({ y: cardGroup.position.y })
                .to({ y: origY }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { cardGroup.position.y = o.y; })
                .start();
            setTimeout(resolve, duration);
        });
    }

    // === Weapon finder ===
    private findWeaponMesh(group: THREE.Group): { mesh: THREE.Mesh | null; type: WeaponType } {
        let found: THREE.Mesh | null = null;
        let weaponType: WeaponType = 'sword';
        group.traverse((child) => {
            if (child instanceof THREE.Mesh && !found) {
                if (child.userData.slotType === 'sword') { found = child; weaponType = 'sword'; }
                else if (child.userData.slotType === 'staff') { found = child; weaponType = 'staff'; }
            }
        });
        return { mesh: found, type: weaponType };
    }
}
