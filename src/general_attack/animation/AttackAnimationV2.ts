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

    // Unified entry — routes to weapon animation or skill projectile based on attackType
    public async playAttack(
        attackerGroup: THREE.Group,
        targetGroup: THREE.Group,
        attackType: string = 'general',
    ): Promise<void> {
        if (this.animating) return;

        if (attackType.startsWith('skill')) {
            await this.playSkillProjectile(attackerGroup, targetGroup, attackType);
        } else {
            await this.playWeaponAttack(attackerGroup, targetGroup);
        }
    }

    // === Weapon-based attack (general / basic) ===
    private async playWeaponAttack(attackerGroup: THREE.Group, targetGroup: THREE.Group): Promise<void> {
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
        const isMaster = !targetGroup.userData.baseCardWidth || targetGroup.children.length <= 1;

        await this.phase1(attackerGroup, weaponMesh, weaponOrigPos, localTarget, weaponOrigRot, attackerOrigY, quarterW, 800);

        if (weaponType === 'staff') {
            this.spawnLightningEffect(targetWorld, cardW);
            if (isMaster) await this.phase2Master(weaponMesh, cardW, 400);
            else await this.phase2Staff(weaponMesh, targetGroup, cardW, 400);
        } else {
            this.spawnSlashEffect(targetWorld);
            if (isMaster) await this.phase2Master(weaponMesh, cardW, 300);
            else await this.phase2Sword(weaponMesh, targetGroup, cardW, 300);
        }

        await this.phase3(attackerGroup, weaponMesh, weaponMesh.position.clone(), weaponOrigPos, weaponMesh.rotation.z, weaponOrigRot, attackerOrigY, 800);

        attackerGroup.position.y = attackerOrigY;
        weaponMesh.position.copy(weaponOrigPos);
        weaponMesh.rotation.z = weaponOrigRot;
        this.animating = false;
    }

    // === Skill projectile (shadow ball, etc.) ===
    private async playSkillProjectile(
        attackerGroup: THREE.Group,
        targetGroup: THREE.Group,
        skillType: string,
    ): Promise<void> {
        this.animating = true;
        const cardW = CWR * window.innerWidth;

        // Legacy: card moves to skill panel position (center-bottom, near ally base)
        // SkillPanelAnimator.SKILL_PANEL_X = 0, SKILL_PANEL_Y = (0.5 - 0.78221649) * h
        const skillPanelX = 0;
        const skillPanelY = (0.5 - 0.78221649) * window.innerHeight;

        const origPos = attackerGroup.position.clone();

        targetGroup.updateMatrixWorld(true);
        const targetWorld = targetGroup.getWorldPosition(new THREE.Vector3());

        // Phase 1: Card moves to skill panel position (1000ms)
        await this.moveCardTo(attackerGroup, skillPanelX, skillPanelY, origPos.z + 1, 1000);

        // Phase 2: Charge shadow ball at skill panel position
        attackerGroup.updateMatrixWorld(true);
        const castWorld = attackerGroup.getWorldPosition(new THREE.Vector3());

        const orbSize = cardW * 1.6;
        const orb = this.createShadowBallMesh(orbSize);
        orb.position.set(castWorld.x, castWorld.y + cardW * 0.6, 3);
        this.scene.add(orb);

        await this.animateShadowBallCharge(orb, orbSize, 500);

        // Phase 3: Shadow ball accelerates toward target
        await this.animateShadowBallFlight(orb, targetWorld, cardW, 700);

        // Impact — explosion
        this.scene.remove(orb);
        orb.geometry.dispose();
        (orb.material as THREE.ShaderMaterial).dispose();

        this.spawnShadowBallExplosion(targetWorld, cardW);
        // Master → scene shake, unit → card shake only
        const isMaster = targetGroup.children.length <= 1;
        if (isMaster) {
            this.shakeScenePromise(cardW, 500);
        } else {
            this.shakeGroupPromise(targetGroup, cardW, 500);
        }
        await this.delay(600);

        // Phase 4: Card returns to original position (1000ms)
        await this.moveCardTo(attackerGroup, origPos.x, origPos.y, origPos.z, 1000);
        attackerGroup.position.copy(origPos);

        this.animating = false;
    }

    private moveCardTo(group: THREE.Group, x: number, y: number, z: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const from = { x: group.position.x, y: group.position.y, z: group.position.z };
            new TWEEN.Tween(from)
                .to({ x, y, z }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => { group.position.set(from.x, from.y, from.z); })
                .onComplete(() => resolve())
                .start();
        });
    }

    private cardRise(group: THREE.Group, origY: number, amount: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            new TWEEN.Tween({ y: origY }).to({ y: origY + amount }, duration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((o: any) => { group.position.y = o.y; }).start();
            setTimeout(resolve, duration);
        });
    }

    private cardDescend(group: THREE.Group, origY: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            new TWEEN.Tween({ y: group.position.y }).to({ y: origY }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { group.position.y = o.y; }).start();
            setTimeout(resolve, duration);
        });
    }

    private createShadowBallMesh(size: number): THREE.Mesh {
        const geo = new THREE.PlaneGeometry(size, size);
        // Normal blending for OPAQUE dark mass, not additive (light)
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            uniforms: { u_time: { value: 0.0 }, u_scale: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;
                uniform float u_scale;
                void main(){
                    vec2 c = vUv - 0.5;
                    float dist = length(c) * 2.0;
                    float angle = atan(c.y, c.x);

                    // Solid opaque dark core — the "mass" of darkness
                    float solidCore = 1.0 - smoothstep(0.0, 0.55 * u_scale, dist);

                    // Dark shell with subtle purple veins
                    float shell = smoothstep(0.35 * u_scale, 0.55 * u_scale, dist) * (1.0 - smoothstep(0.55 * u_scale, 0.7 * u_scale, dist));
                    float veins = sin(angle * 8.0 + u_time * 4.0) * 0.5 + 0.5;
                    veins *= sin(angle * 5.0 - u_time * 6.0 + dist * 12.0) * 0.5 + 0.5;

                    // Outer dark aura (semi-transparent dark haze)
                    float aura = (1.0 - smoothstep(0.5 * u_scale, 1.0, dist)) * 0.6;

                    // Distortion ripple on surface
                    float ripple = sin(dist * 20.0 - u_time * 10.0) * 0.15 * shell;

                    // Colors — all DARK tones
                    vec3 coreCol = vec3(0.01, 0.0, 0.02);  // near-black
                    vec3 shellCol = mix(vec3(0.08, 0.0, 0.15), vec3(0.15, 0.0, 0.25), veins + ripple);
                    vec3 auraCol = vec3(0.05, 0.0, 0.1);

                    vec3 col = coreCol * solidCore + shellCol * shell + auraCol * aura;

                    // Alpha: core is fully opaque, shell nearly so, aura fades
                    float a = (solidCore * 1.0 + shell * 0.9 + aura * 0.5) * u_scale;

                    // Outer edge: faint purple glow ring (additive feel via color boost)
                    float edgeRing = smoothstep(0.6 * u_scale, 0.75 * u_scale, dist) * (1.0 - smoothstep(0.75 * u_scale, 0.9 * u_scale, dist));
                    col += vec3(0.2, 0.0, 0.4) * edgeRing * 0.5;

                    gl_FragColor = vec4(col, a);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.renderOrder = 10;
        return mesh;
    }

    private animateShadowBallCharge(orb: THREE.Mesh, finalSize: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const mat = orb.material as THREE.ShaderMaterial;
            const start = performance.now();
            const tick = () => {
                const t = Math.min((performance.now() - start) / duration, 1);
                mat.uniforms.u_time.value += 0.05;
                mat.uniforms.u_scale.value = t;
                orb.scale.set(0.3 + t * 0.7, 0.3 + t * 0.7, 1);
                // Dark wisps being sucked into the orb during charge
                if (Math.random() < 0.5) {
                    this.spawnDarkWisp(orb.position.clone(), finalSize * (1.5 + Math.random()), true);
                }
                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });
    }

    private animateShadowBallFlight(
        orb: THREE.Mesh, to: THREE.Vector3,
        cardW: number, duration: number,
    ): Promise<void> {
        return new Promise(resolve => {
            const mat = orb.material as THREE.ShaderMaterial;
            const startPos = orb.position.clone();
            const endPos = new THREE.Vector3(to.x, to.y, 3);
            const start = performance.now();
            const tick = () => {
                const elapsed = performance.now() - start;
                const t = Math.min(elapsed / duration, 1);
                const eased = t * t * t;
                orb.position.lerpVectors(startPos, endPos, eased);
                mat.uniforms.u_time.value += 0.08;
                // Dark trail + ambient wisps during flight
                if (Math.random() < 0.7) {
                    this.spawnShadowTrail(orb.position.clone(), cardW * 0.3);
                }
                if (Math.random() < 0.4) {
                    this.spawnDarkWisp(orb.position.clone(), cardW * 0.8, false);
                }
                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });
    }

    // Dark wisp — either sucked toward center (charge) or drifts outward (flight)
    private spawnDarkWisp(center: THREE.Vector3, radius: number, inward: boolean): void {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius * (0.5 + Math.random() * 0.5);
        const startX = center.x + Math.cos(angle) * (inward ? dist : dist * 0.2);
        const startY = center.y + Math.sin(angle) * (inward ? dist : dist * 0.2);
        const endX = center.x + Math.cos(angle) * (inward ? 0 : dist);
        const endY = center.y + Math.sin(angle) * (inward ? 0 : dist);

        const wSize = radius * (0.3 + Math.random() * 0.3);
        const geo = new THREE.PlaneGeometry(wSize, wSize);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv; uniform float u_time;
                void main(){
                    float d = length(vUv - 0.5) * 2.0;
                    float a = (1.0 - smoothstep(0.0, 1.0, d)) * (1.0 - u_time) * 0.55;
                    gl_FragColor = vec4(0.04, 0.0, 0.08, a);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(startX, startY, center.z - 0.1);
        mesh.renderOrder = 9;
        this.scene.add(mesh);

        const startT = performance.now();
        const dur = 350;
        const tick = () => {
            const t = Math.min((performance.now() - startT) / dur, 1);
            mat.uniforms.u_time.value = t;
            mesh.position.x = startX + (endX - startX) * t;
            mesh.position.y = startY + (endY - startY) * t;
            mesh.scale.set(1 - t * 0.3, 1 - t * 0.3, 1);
            if (t < 1) requestAnimationFrame(tick);
            else { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(tick);
    }

    private spawnShadowTrail(pos: THREE.Vector3, size: number): void {
        const geo = new THREE.PlaneGeometry(size * 1.5, size * 1.5);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv; uniform float u_time;
                void main(){
                    float d = length(vUv - 0.5) * 2.0;
                    float a = (1.0 - smoothstep(0.0, 0.8, d)) * (1.0 - u_time) * 0.7;
                    vec3 col = vec3(0.03, 0.0, 0.06);
                    gl_FragColor = vec4(col, a);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.position.x += (Math.random() - 0.5) * size;
        mesh.position.y += (Math.random() - 0.5) * size;
        mesh.renderOrder = 9;
        this.scene.add(mesh);
        this.fadeAndDispose(mesh, mat, geo, 300);
    }

    private spawnShadowBallExplosion(pos: THREE.Vector3, cardW: number): void {
        // 1. Dark opaque blast core (normal blending — DARK, not light)
        const coreSize = cardW * 4.5;
        const coreGeo = new THREE.PlaneGeometry(coreSize, coreSize);
        const coreMat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv; uniform float u_time;
                void main(){
                    float dist = length(vUv - 0.5) * 2.0;
                    float expand = u_time * 0.8;
                    float darkBlast = (1.0 - smoothstep(0.0, 0.3 + expand, dist)) * (1.0 - u_time);
                    vec3 col = vec3(0.02, 0.0, 0.04);
                    gl_FragColor = vec4(col, darkBlast * 0.9);
                }`,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(pos.x, pos.y, 2.5);
        coreMesh.renderOrder = 10;
        this.scene.add(coreMesh);
        this.fadeAndDispose(coreMesh, coreMat, coreGeo, 600);

        // 2. Purple shockwave ring (additive)
        const ringSize = cardW * 6.0;
        const ringGeo = new THREE.PlaneGeometry(ringSize, ringSize);
        const ringMat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv; uniform float u_time;
                void main(){
                    float dist = length(vUv - 0.5) * 2.0;
                    float ringPos = u_time * 0.9;
                    float ring = smoothstep(ringPos - 0.08, ringPos, dist) * (1.0 - smoothstep(ringPos, ringPos + 0.08, dist));
                    float a = ring * (1.0 - u_time) * 0.8;
                    gl_FragColor = vec4(0.3, 0.0, 0.6, a);
                }`,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(pos.x, pos.y, 2.6);
        ringMesh.renderOrder = 11;
        this.scene.add(ringMesh);
        this.fadeAndDispose(ringMesh, ringMat, ringGeo, 700);

        // 3. Dark debris particles (larger, more, opaque dark)
        for (let i = 0; i < 18; i++) {
            const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.4;
            const speed = cardW * (1.5 + Math.random() * 1.2);
            const pSize = cardW * (0.2 + Math.random() * 0.15);
            const pGeo = new THREE.PlaneGeometry(pSize, pSize);
            const pMat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false,
                uniforms: { u_time: { value: 0.0 } },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
                fragmentShader: `
                    varying vec2 vUv; uniform float u_time;
                    void main(){
                        float d = length(vUv-0.5)*2.0;
                        float a = (1.0-smoothstep(0.0,0.8,d))*(1.0-u_time)*0.85;
                        gl_FragColor = vec4(0.04, 0.0, 0.08, a);
                    }`,
            });
            const pMesh = new THREE.Mesh(pGeo, pMat);
            pMesh.position.set(pos.x, pos.y, 2.5);
            pMesh.renderOrder = 10;
            this.scene.add(pMesh);

            const startP = performance.now();
            const dur = 500;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;
            const ox = pos.x; const oy = pos.y;
            const tickP = () => {
                const tp = Math.min((performance.now() - startP) / dur, 1);
                pMat.uniforms.u_time.value = tp;
                pMesh.position.x = ox + dx * tp * tp;
                pMesh.position.y = oy + dy * tp * tp;
                pMesh.scale.set(1 + tp * 0.5, 1 + tp * 0.5, 1);
                if (tp < 1) requestAnimationFrame(tickP);
                else { this.scene.remove(pMesh); pGeo.dispose(); pMat.dispose(); }
            };
            requestAnimationFrame(tickP);
        }

        // 4. Screen darkening flash (NOT bright — the screen DIMS)
        const flashSize = Math.max(window.innerWidth, window.innerHeight) * 2;
        const flashGeo = new THREE.PlaneGeometry(flashSize, flashSize);
        const flashMat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `void main(){ gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `uniform float u_time; void main(){ gl_FragColor=vec4(0.0, 0.0, 0.0, (1.0-u_time)*0.5); }`,
        });
        const flashMesh = new THREE.Mesh(flashGeo, flashMat);
        flashMesh.position.set(0, 0, 4);
        flashMesh.renderOrder = 13;
        this.scene.add(flashMesh);
        this.fadeAndDispose(flashMesh, flashMat, flashGeo, 500);
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

    // === Lightning effect (staff) ===
    private spawnLightningEffect(targetWorld: THREE.Vector3, cardW: number): void {
        const strikeCount = 2;
        for (let s = 0; s < strikeCount; s++) {
            setTimeout(() => {
                const startX = targetWorld.x + (Math.random() - 0.5) * cardW * 0.6;
                const startY = targetWorld.y + cardW * 2.5;
                const endX = targetWorld.x + (Math.random() - 0.5) * cardW * 0.3;
                const endY = targetWorld.y;
                const segments = this.generateBoltPoints(new THREE.Vector2(startX, startY), new THREE.Vector2(endX, endY), 5, cardW * 0.4);
                this.renderBolt(segments, cardW * 0.08, 1.0, 500);
                const branchCount = 2 + Math.floor(Math.random() * 3);
                for (let b = 0; b < branchCount; b++) {
                    const idx = Math.floor(Math.random() * (segments.length - 2)) + 1;
                    const bs = segments[idx];
                    const be = new THREE.Vector2(bs.x + (Math.random() - 0.5) * cardW * 0.8, bs.y - Math.random() * cardW * 0.6);
                    this.renderBolt(this.generateBoltPoints(bs, be, 3, cardW * 0.15), cardW * 0.04, 0.6, 400);
                }
                this.spawnScreenFlash(350);
                this.spawnImpactFlash(new THREE.Vector3(endX, endY, 2), cardW);
            }, s * 150);
        }
    }

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

    private renderBolt(points: THREE.Vector2[], thickness: number, brightness: number, duration: number): void {
        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i]; const b = points[i + 1];
            const dx = b.x - a.x; const dy = b.y - a.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const geo = new THREE.PlaneGeometry(len, thickness);
            const mat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false, depthTest: false,
                blending: THREE.AdditiveBlending,
                uniforms: { u_time: { value: 0.0 }, u_bright: { value: brightness } },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
                fragmentShader: `
                    varying vec2 vUv; uniform float u_time; uniform float u_bright;
                    void main(){
                        float d=abs(vUv.y-0.5)*2.0;
                        float core=(1.0-smoothstep(0.0,0.2,d));
                        float glow=(1.0-smoothstep(0.0,1.0,d))*0.6;
                        float fade=1.0-smoothstep(0.2,1.0,u_time);
                        vec3 col=vec3(1.0)*core+vec3(0.3,0.5,1.0)*glow;
                        gl_FragColor=vec4(col,(core+glow)*fade*u_bright);
                    }`,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, 2);
            mesh.rotation.z = Math.atan2(dy, dx);
            mesh.renderOrder = 10;
            this.scene.add(mesh);
            this.fadeAndDispose(mesh, mat, geo, duration);
        }
    }

    private spawnScreenFlash(duration: number): void {
        const size = Math.max(window.innerWidth, window.innerHeight) * 2;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `void main(){ gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `uniform float u_time; void main(){ gl_FragColor=vec4(0.7,0.8,1.0,(1.0-u_time)*0.25); }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, 3); mesh.renderOrder = 12;
        this.scene.add(mesh);
        this.fadeAndDispose(mesh, mat, geo, duration);
    }

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
                    float dist=length(vUv-0.5)*2.0;
                    float ring=1.0-smoothstep(0.0,0.3+u_time*0.7,dist);
                    float flash=ring*(1.0-u_time);
                    vec3 col=mix(vec3(1.0),vec3(0.3,0.5,1.0),dist);
                    gl_FragColor=vec4(col,flash*1.5);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos); mesh.renderOrder = 11;
        this.scene.add(mesh);
        this.fadeAndDispose(mesh, mat, geo, 400);
    }

    // === Phase helpers ===
    private phase1(cardGroup: THREE.Group, weapon: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3, fromRot: number, origY: number, riseAmount: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const endRot = fromRot + Math.PI * 130 / 180;
            new TWEEN.Tween({ x: from.x, y: from.y, z: from.z, rot: fromRot })
                .to({ x: to.x, y: to.y, z: to.z, rot: endRot }, duration)
                .easing(TWEEN.Easing.Quadratic.In)
                .onUpdate((o: any) => { weapon.position.set(o.x, o.y, o.z); weapon.rotation.z = o.rot; }).start();
            new TWEEN.Tween({ y: origY }).to({ y: origY + riseAmount }, duration / 2)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((o: any) => { cardGroup.position.y = o.y; }).start();
            setTimeout(resolve, duration);
        });
    }

    private phase2Sword(weapon: THREE.Mesh, targetGroup: THREE.Group, cardW: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const sp = weapon.position.clone(); const ep = sp.clone(); ep.x += cardW * 0.8;
            const sr = weapon.rotation.z; const er = sr - Math.PI;
            new TWEEN.Tween({ x: sp.x, y: sp.y, z: sp.z, rot: sr })
                .to({ x: ep.x, y: ep.y, z: ep.z, rot: er }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { weapon.position.set(o.x, o.y, o.z); weapon.rotation.z = o.rot; }).start();
            this.shakeGroup(targetGroup, cardW, duration, resolve);
        });
    }

    private phase2Staff(weapon: THREE.Mesh, targetGroup: THREE.Group, cardW: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const sp = weapon.position.clone(); const ep = sp.clone(); ep.x += cardW * 1.0;
            new TWEEN.Tween({ x: sp.x, y: sp.y }).to({ x: ep.x, y: sp.y + cardW * 0.1 }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { weapon.position.x = o.x; weapon.position.y = o.y; }).start();
            this.shakeGroup(targetGroup, cardW, duration, resolve);
        });
    }

    private phase2Master(weapon: THREE.Mesh, cardW: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const sp = weapon.position.clone(); const ep = sp.clone(); ep.x += cardW * 0.8;
            const sr = weapon.rotation.z; const er = sr - Math.PI;
            new TWEEN.Tween({ x: sp.x, y: sp.y, z: sp.z, rot: sr })
                .to({ x: ep.x, y: ep.y, z: ep.z, rot: er }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { weapon.position.set(o.x, o.y, o.z); weapon.rotation.z = o.rot; }).start();
            this.shakeScene(cardW, duration, resolve);
        });
    }

    private phase3(cardGroup: THREE.Group, weapon: THREE.Mesh, fromPos: THREE.Vector3, toPos: THREE.Vector3, fromRot: number, toRot: number, origY: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            new TWEEN.Tween({ x: fromPos.x, y: fromPos.y, z: fromPos.z, rot: fromRot })
                .to({ x: toPos.x, y: toPos.y, z: toPos.z, rot: toRot }, duration)
                .easing(TWEEN.Easing.Quadratic.In)
                .onUpdate((o: any) => { weapon.position.set(o.x, o.y, o.z); weapon.rotation.z = o.rot; }).start();
            new TWEEN.Tween({ y: cardGroup.position.y }).to({ y: origY }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((o: any) => { cardGroup.position.y = o.y; }).start();
            setTimeout(resolve, duration);
        });
    }

    private shakeGroup(group: THREE.Group, cardW: number, duration: number, onDone: () => void): void {
        const orig = group.position.clone(); const steps = 12; const sd = duration / steps; const tweens: any[] = [];
        for (let i = 0; i < steps; i++) {
            const t = new TWEEN.Tween(group.position).to({ x: orig.x + (Math.random() * 2 - 1) * cardW / 8, y: orig.y + (Math.random() * 2 - 1) * cardW / 8 }, sd).easing(TWEEN.Easing.Quadratic.InOut);
            if (i > 0) tweens[i - 1].chain(t); tweens.push(t);
        }
        tweens[steps - 1].chain(new TWEEN.Tween(group.position).to({ x: orig.x, y: orig.y }, sd).easing(TWEEN.Easing.Quadratic.InOut).onComplete(onDone));
        tweens[0].start();
    }

    private shakeGroupPromise(group: THREE.Group, cardW: number, duration: number): void {
        this.shakeGroup(group, cardW, duration, () => {});
    }

    private shakeScenePromise(cardW: number, duration: number): void {
        this.shakeScene(cardW, duration, () => {});
    }

    private shakeScene(cardW: number, duration: number, onDone: () => void): void {
        const orig = this.scene.position.clone(); const steps = 12; const sd = duration / steps; const tweens: any[] = [];
        for (let i = 0; i < steps; i++) {
            const t = new TWEEN.Tween(this.scene.position).to({ x: orig.x + (Math.random() * 2 - 1) * cardW / 8, y: orig.y + (Math.random() * 2 - 1) * cardW / 8 }, sd).easing(TWEEN.Easing.Quadratic.InOut);
            if (i > 0) tweens[i - 1].chain(t); tweens.push(t);
        }
        tweens[steps - 1].chain(new TWEEN.Tween(this.scene.position).to({ x: orig.x, y: orig.y }, sd).easing(TWEEN.Easing.Quadratic.InOut).onComplete(onDone));
        tweens[0].start();
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

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private findWeaponMesh(group: THREE.Group): { mesh: THREE.Mesh | null; type: WeaponType } {
        let found: THREE.Mesh | null = null; let weaponType: WeaponType = 'sword';
        group.traverse((child) => {
            if (child instanceof THREE.Mesh && !found) {
                if (child.userData.slotType === 'sword') { found = child; weaponType = 'sword'; }
                else if (child.userData.slotType === 'staff') { found = child; weaponType = 'staff'; }
            }
        });
        return { mesh: found, type: weaponType };
    }
}
