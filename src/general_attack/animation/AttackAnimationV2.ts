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

    // === AoE skill (Sea of Specter) — magic circle → specters → scream ===
    public async playAoESkill(attackerGroup: THREE.Group): Promise<void> {
        if (this.animating) return;
        this.animating = true;
        const cardW = CWR * window.innerWidth;
        const w = window.innerWidth;
        const h = window.innerHeight;

        const skillPanelX = 0;
        const skillPanelY = (0.5 - 0.78221649) * h;
        const origPos = attackerGroup.position.clone();

        // Phase 1: Card moves to skill panel
        await this.moveCardTo(attackerGroup, skillPanelX, skillPanelY, origPos.z + 1, 800);

        // Phase 2: Darkness gathering — the caster draws power from the abyss
        attackerGroup.updateMatrixWorld(true);
        const casterWorld = attackerGroup.getWorldPosition(new THREE.Vector3());

        // Stage 1: Darkness condenses — slow, ominous
        const darkAura = this.createDarkCondenseAura(casterWorld, cardW);
        this.scene.add(darkAura);
        // Screen edges darken slightly — darkness creeping inward
        const edgeDarken = this.createEdgeDarken(w, h);
        this.scene.add(edgeDarken);

        this.shakeScenePromise(cardW * 0.05, 800);
        await this.delay(600);

        // Stage 2: Magic circle ignites
        const magicCircle = this.createMagicCircle(casterWorld, cardW);
        this.scene.add(magicCircle);
        this.spawnColdWavePulse(casterWorld, cardW, 0);

        this.shakeScenePromise(cardW * 0.1, 600);
        await this.delay(500);

        // Stage 3: Dark energy surges — vortex + beams erupt
        this.spawnDarkVortex(casterWorld, cardW, 3500);
        this.spawnDarkBeams(casterWorld, cardW);
        this.spawnColdWavePulse(casterWorld, cardW, 100);

        this.shakeScenePromise(cardW * 0.2, 600);
        await this.delay(600);

        // Stage 4: Power escalation — ground cracks, stronger shaking
        this.spawnGroundCracks(casterWorld, cardW);
        this.spawnDarkBeams(casterWorld, cardW);
        this.spawnColdWavePulse(casterWorld, cardW, 0);
        this.spawnColdWavePulse(casterWorld, cardW * 1.2, 200);

        this.shakeScenePromise(cardW * 0.4, 600);
        await this.delay(600);

        // Stage 5: Near-critical — darkness pulses violently
        this.spawnGroundCracks(casterWorld, cardW * 1.3);
        this.spawnDarkBeams(casterWorld, cardW);
        this.spawnColdWavePulse(casterWorld, cardW * 1.5, 0);

        this.shakeScenePromise(cardW * 0.7, 500);
        await this.delay(500);

        // Stage 6: CLIMAX — maximum power, screen engulfed
        this.spawnScreenFlash(250);
        this.spawnColdWavePulse(casterWorld, cardW * 2.0, 0);
        this.shakeScenePromise(cardW * 1.2, 400);
        await this.delay(200);
        this.spawnScreenFlash(200);
        this.spawnDarkBeams(casterWorld, cardW);
        this.shakeScenePromise(cardW * 1.5, 500);
        await this.delay(300);

        this.fadeAndDispose(magicCircle, magicCircle.material as THREE.ShaderMaterial, magicCircle.geometry, 400);
        this.fadeAndDispose(darkAura, darkAura.material as THREE.ShaderMaterial, darkAura.geometry, 500);
        this.fadeAndDispose(edgeDarken, edgeDarken.material as THREE.ShaderMaterial, edgeDarken.geometry, 600);

        // Phase 3: Progressive darkening — overlaps with magic circle fade
        const darken = this.createProgressiveDarken();
        this.scene.add(darken);
        await this.animateProgressiveDarken(darken, 600);

        // Phase 4: Dementors fly — no gap after darken
        const dementors = this.spawnFlyingDementors(3, w, h);
        await this.delay(5500);

        // Phase 5: ALL 3 drift off screen
        await this.dementorsFlyAway(dementors, 0, 1400);

        // Phase 5.5: Brief tension
        await this.delay(600);

        // Phase 6: NEW dementor LUNGES from off-screen — jumpscare
        const lastOne = this.spawnSoulKissDementor(w, h);
        if (lastOne) {
            await this.dementorSoulKiss(lastOne, w, h, 2000);
        }

        // Cleanup
        for (const d of dementors) {
            if (d.parent) { this.scene.remove(d); d.geometry.dispose(); (d.material as THREE.ShaderMaterial).dispose(); }
        }
        this.fadeAndDispose(darken, darken.material as THREE.ShaderMaterial, darken.geometry, 600);
        await this.delay(400);

        await this.moveCardTo(attackerGroup, origPos.x, origPos.y, origPos.z, 800);
        attackerGroup.position.copy(origPos);

        // Force-reset scene position — overlapping shakes can leave it offset
        this.scene.position.set(0, 0, 0);

        this.animating = false;
    }

    private createMagicCircle(center: THREE.Vector3, cardW: number): THREE.Mesh {
        const size = cardW * 3;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv; uniform float u_time;
                void main(){
                    vec2 c = vUv - 0.5;
                    float dist = length(c) * 2.0;
                    float angle = atan(c.y, c.x);
                    // Rotating rune rings
                    float ring1 = smoothstep(0.55, 0.6, dist) * (1.0 - smoothstep(0.6, 0.65, dist));
                    float ring2 = smoothstep(0.75, 0.8, dist) * (1.0 - smoothstep(0.8, 0.85, dist));
                    float runes = sin(angle * 8.0 + u_time * 3.0) * 0.5 + 0.5;
                    runes *= sin(angle * 12.0 - u_time * 5.0) * 0.5 + 0.5;
                    float runeRing = runes * (ring1 + ring2);
                    // Inner glow
                    float inner = (1.0 - smoothstep(0.0, 0.5, dist)) * 0.3;
                    // Pulse
                    float pulse = sin(u_time * 6.0) * 0.2 + 0.8;
                    vec3 col = vec3(0.4, 0.1, 0.8) * runeRing + vec3(0.2, 0.0, 0.5) * inner;
                    float a = (runeRing * 0.8 + inner) * pulse * min(u_time * 2.0, 1.0);
                    gl_FragColor = vec4(col, a);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(center.x, center.y - cardW * 0.5, 2);
        mesh.renderOrder = 10;

        const start = performance.now();
        const tick = () => {
            const t = (performance.now() - start) / 1000;
            mat.uniforms.u_time.value = t;
            mesh.rotation.z = t * 0.5;
            const s = Math.min(t * 1.5, 1.0);
            mesh.scale.set(s, s, 1);
            if (mesh.parent) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        return mesh;
    }

    // Dark energy particles spiraling toward caster during buildup
    private spawnDarkVortex(center: THREE.Vector3, cardW: number, duration: number): void {
        const start = performance.now();
        const spawnTick = () => {
            const elapsed = performance.now() - start;
            if (elapsed > duration) return;
            // Spawn particle at random angle, spiral inward
            const angle = Math.random() * Math.PI * 2;
            const startDist = cardW * (2 + Math.random() * 1.5);
            const pSize = cardW * (0.1 + Math.random() * 0.08);
            const px = center.x + Math.cos(angle) * startDist;
            const py = center.y + Math.sin(angle) * startDist;
            const geo = new THREE.PlaneGeometry(pSize, pSize);
            const mat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false,
                uniforms: { u_time: { value: 0.0 } },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
                fragmentShader: `varying vec2 vUv; uniform float u_time; void main(){
                    float d=length(vUv-0.5)*2.0;
                    float a=(1.0-smoothstep(0.0,1.0,d))*(1.0-u_time)*0.6;
                    gl_FragColor=vec4(0.15,0.0,0.3,a);
                }`,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(px, py, 2.5);
            mesh.renderOrder = 9;
            this.scene.add(mesh);

            // Spiral inward
            const pStart = performance.now();
            const pDur = 600 + Math.random() * 400;
            const startAngle = angle;
            const tick = () => {
                const t = Math.min((performance.now() - pStart) / pDur, 1);
                mat.uniforms.u_time.value = t;
                const curDist = startDist * (1 - t);
                const curAngle = startAngle + t * Math.PI * 1.5;
                mesh.position.x = center.x + Math.cos(curAngle) * curDist;
                mesh.position.y = center.y + Math.sin(curAngle) * curDist;
                mesh.scale.set(1 - t * 0.5, 1 - t * 0.5, 1);
                if (t < 1) requestAnimationFrame(tick);
                else { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
            };
            requestAnimationFrame(tick);

            setTimeout(spawnTick, 40 + Math.random() * 30);
        };
        spawnTick();
    }

    // Edge darkening — screen borders darken as darkness is summoned
    private createEdgeDarken(w: number, h: number): THREE.Mesh {
        const size = Math.max(w, h) * 2;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv; uniform float u_time;
                void main(){
                    vec2 c = vUv - 0.5;
                    float dist = length(c) * 2.0;
                    float t = u_time;
                    float progress = min(t * 0.5, 0.8);
                    // Heavy darkness invading from all edges
                    float edge = smoothstep(1.0 - progress * 0.8, 1.0, dist);
                    // Deep vignette — screen corners go nearly black
                    float vignette = smoothstep(0.4, 1.0, dist) * progress * 0.7;
                    // Pulsing darkness — breathes
                    float pulse = sin(t * 3.0) * 0.08 + sin(t * 5.0) * 0.04;
                    float a = (edge * 0.85 + vignette + pulse * progress) * min(t * 0.6, 1.0);
                    gl_FragColor = vec4(0.0, 0.0, 0.02, min(a, 0.9));
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, 1.5);
        mesh.renderOrder = 7;
        const start = performance.now();
        const tick = () => {
            mat.uniforms.u_time.value = (performance.now() - start) / 1000;
            if (mesh.parent) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        return mesh;
    }

    // Dark aura — intense darkness violently gathering around caster
    private createDarkCondenseAura(center: THREE.Vector3, cardW: number): THREE.Mesh {
        const size = cardW * 10;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv; uniform float u_time;
                float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
                float noise(vec2 p){
                    vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
                    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
                }
                float fbm(vec2 p, float t){
                    float v=0.0,a=0.5; mat2 rot=mat2(0.8,0.6,-0.6,0.8);
                    for(int i=0;i<5;i++){ v+=a*noise(p+vec2(t*0.3,t*0.15)); p=rot*p*2.1+vec2(1.7,3.2); a*=0.5; t*=1.15; }
                    return v;
                }
                float wfbm(vec2 p, float t){
                    vec2 q=vec2(fbm(p,t),fbm(p+vec2(5.2,1.3),t*1.1));
                    return fbm(p+q*1.5,t*0.8);
                }
                void main(){
                    vec2 c = vUv - 0.5;
                    float dist = length(c) * 2.0;
                    float angle = atan(c.y, c.x);
                    float t = u_time;
                    float buildup = min(t * 0.6, 1.0);

                    // Layer 1: Dark smoke violently spiraling inward
                    float spiral1 = wfbm(vec2(angle * 2.0 + t * 3.0, dist * 3.0 - t * 2.0), t * 1.5);
                    float spiral2 = fbm(vec2(angle * 3.0 - t * 2.5, dist * 4.0 + t * 1.0), t * 2.0);
                    float inward = smoothstep(1.0, 0.15, dist) * buildup;
                    float darkSmoke = (spiral1 * 0.6 + spiral2 * 0.4) * inward;

                    // Layer 2: Thick dark tendrils reaching inward from edges
                    float tendril1 = wfbm(vec2(angle * 4.0 + t * 1.5, dist * 2.0), t * 1.2);
                    float tendril2 = fbm(vec2(angle * 5.0 - t * 2.0, dist * 3.0), t * 1.8);
                    float tendrils = smoothstep(0.45, 0.70, tendril1) * smoothstep(0.3, 0.8, dist);
                    tendrils += smoothstep(0.50, 0.75, tendril2) * smoothstep(0.4, 0.9, dist) * 0.6;
                    tendrils *= buildup * 0.7;

                    // Layer 3: Pulsing dark core — intensifies over time
                    float pulse = sin(t * 5.0) * 0.1 + sin(t * 8.0) * 0.05;
                    float core = (1.0 - smoothstep(0.0, 0.25 + pulse, dist)) * buildup * 0.7;

                    // Layer 4: Dark particle streaks rushing inward
                    float streaks = 0.0;
                    for(int i=0; i<6; i++){
                        float fi = float(i);
                        float sa = fi * 1.047 + t * (2.0 + fi * 0.3);
                        float sd = fract(dist * 2.0 + t * 0.8 + fi * 0.17);
                        float streak = (1.0 - smoothstep(0.0, 0.06, abs(sd - 0.5)))
                                     * (1.0 - smoothstep(0.0, 0.3, abs(sin(angle - sa))));
                        streaks += streak * 0.08;
                    }
                    streaks *= buildup;

                    float a = darkSmoke * 0.8 + tendrils + core + streaks;
                    a = min(a, 0.92);
                    // Circular edge fade — no visible rectangle
                    a *= 1.0 - smoothstep(0.85, 1.0, dist);

                    vec3 col = vec3(0.02, 0.0, 0.05);
                    col += vec3(0.06, 0.0, 0.12) * core;
                    col += vec3(0.03, 0.0, 0.08) * tendrils;
                    gl_FragColor = vec4(col, a);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(center.x, center.y, 1.8);
        mesh.renderOrder = 8;
        const start = performance.now();
        const tick = () => {
            mat.uniforms.u_time.value = (performance.now() - start) / 1000;
            if (mesh.parent) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        return mesh;
    }

    // Cold wave pulse — expanding ring of icy energy
    private spawnColdWavePulse(center: THREE.Vector3, cardW: number, delay: number): void {
        setTimeout(() => {
            const size = cardW * 8;
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
                        float ringPos = u_time * 1.2;
                        float ring = smoothstep(ringPos - 0.06, ringPos, dist)
                                   * (1.0 - smoothstep(ringPos, ringPos + 0.06, dist));
                        float a = ring * (1.0 - u_time) * 0.35;
                        a *= 1.0 - smoothstep(0.85, 1.0, dist);
                        gl_FragColor = vec4(0.3, 0.5, 0.8, a);
                    }`,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(center.x, center.y, 2.2);
            mesh.renderOrder = 9;
            this.scene.add(mesh);
            this.fadeAndDispose(mesh, mat, geo, 800);
        }, delay);
    }

    // Ground cracks — dark fissures radiating from caster
    private spawnGroundCracks(center: THREE.Vector3, cardW: number): void {
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
            const len = cardW * (1.5 + Math.random() * 1.0);
            const thick = cardW * 0.03;
            const geo = new THREE.PlaneGeometry(len, thick);
            const mat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false,
                uniforms: { u_time: { value: 0.0 } },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
                fragmentShader: `
                    varying vec2 vUv; uniform float u_time;
                    void main(){
                        float d = abs(vUv.y - 0.5) * 2.0;
                        float core = (1.0 - smoothstep(0.0, 0.4, d));
                        // Crack extends outward over time
                        float extend = smoothstep(0.0, u_time * 1.5, vUv.x);
                        float fade = 1.0 - u_time;
                        // Fade at both ends of the crack — no hard rectangle edges
                        float xFade = smoothstep(0.0, 0.05, vUv.x) * (1.0 - smoothstep(0.95, 1.0, vUv.x));
                        float a = core * extend * fade * xFade * 0.7;
                        vec3 col = vec3(0.15, 0.05, 0.25) * core + vec3(0.3, 0.1, 0.5) * (1.0 - d) * 0.3;
                        gl_FragColor = vec4(col, a);
                    }`,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(center.x + Math.cos(angle) * len * 0.4, center.y + Math.sin(angle) * len * 0.4 - cardW * 0.5, 1.9);
            mesh.rotation.z = angle;
            mesh.renderOrder = 8;
            this.scene.add(mesh);
            this.fadeAndDispose(mesh, mat, geo, 1200);
        }
    }

    private createProgressiveDarken(): THREE.Mesh {
        const size = Math.max(window.innerWidth, window.innerHeight) * 2;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            uniforms: { u_alpha: { value: 0.0 }, u_time: { value: 0.0 } },
            vertexShader: `void main(){ gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `uniform float u_alpha; uniform float u_time; void main(){ gl_FragColor=vec4(0.0,0.0,0.02, u_alpha*(1.0-u_time)); }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, 4);
        mesh.renderOrder = 13;
        return mesh;
    }

    private animateProgressiveDarken(mesh: THREE.Mesh, duration: number): Promise<void> {
        return new Promise(resolve => {
            const mat = mesh.material as THREE.ShaderMaterial;
            const start = performance.now();
            const tick = () => {
                const t = Math.min((performance.now() - start) / duration, 1);
                mat.uniforms.u_alpha.value = t * 0.75;
                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });
    }

    // HP dementor-style specters — elongated flowing dark shapes swooping across
    private spawnSpecters(count: number, w: number, h: number): THREE.Mesh[] {
        const specters: THREE.Mesh[] = [];
        const specterShader = `
            varying vec2 vUv; uniform float u_time; uniform float u_intensity;
            void main(){
                vec2 c = vUv - vec2(0.5, 0.5);
                // Elongated vertical body
                float bodyDist = length(c * vec2(2.5, 1.0)) * 2.0;
                float body = 1.0 - smoothstep(0.0, 0.7, bodyDist);
                // Tattered flowing edges
                float tatter = sin(c.y * 15.0 + u_time * 4.0) * 0.15;
                tatter += sin(c.y * 8.0 - u_time * 6.0) * 0.1;
                body *= 1.0 - smoothstep(0.4, 0.7, abs(c.x) + tatter);
                // Trailing wisps at bottom
                float trail = (1.0 - smoothstep(0.0, 0.4, vUv.y)) * 0.5;
                trail *= (1.0 - smoothstep(0.0, 0.3, abs(c.x + sin(vUv.y * 10.0 + u_time * 3.0) * 0.1)));
                // Dark hollow eyes
                float eyeL = 1.0 - smoothstep(0.0, 0.04, length(c - vec2(-0.06, 0.1)));
                float eyeR = 1.0 - smoothstep(0.0, 0.04, length(c - vec2(0.06, 0.1)));
                float eyes = max(eyeL, eyeR);
                // Mouth
                float mouth = 1.0 - smoothstep(0.0, 0.03 + u_intensity * 0.06, length(c - vec2(0.0, 0.0)));
                // Colors — dark spectral
                vec3 bodyCol = vec3(0.15, 0.18, 0.25);
                vec3 trailCol = vec3(0.08, 0.1, 0.15);
                vec3 eyeCol = vec3(0.5, 0.8, 1.0);
                vec3 mouthCol = mix(vec3(0.1, 0.1, 0.15), vec3(0.8, 0.2, 0.2), u_intensity);
                vec3 col = bodyCol * body + trailCol * trail;
                col = mix(col, eyeCol, eyes * body * 0.8);
                col = mix(col, mouthCol, mouth * body * u_intensity);
                float a = (body * 0.7 + trail * 0.4) * (1.0 + u_intensity * 0.3);
                gl_FragColor = vec4(col, a);
            }`;

        for (let i = 0; i < count; i++) {
            const sW = w * (0.06 + Math.random() * 0.04);
            const sH = sW * (2.0 + Math.random() * 0.5);
            const geo = new THREE.PlaneGeometry(sW, sH);
            const mat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false,
                uniforms: { u_time: { value: Math.random() * 100 }, u_intensity: { value: 0.0 } },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
                fragmentShader: specterShader,
            });
            const mesh = new THREE.Mesh(geo, mat);

            // Scattered across the screen — wander from various positions
            const startX = (Math.random() - 0.5) * w * 0.8;
            const startY = (Math.random() - 0.5) * h * 0.6;
            const side = startX > 0 ? 1 : -1;
            mesh.position.set(startX, startY, 5);
            mesh.renderOrder = 14;
            this.scene.add(mesh);
            specters.push(mesh);

            this.animateSpecterSwoop(mesh, w, h, side);
        }
        return specters;
    }

    // Slow eerie wandering — specters drift back and forth with direction changes
    private animateSpecterSwoop(specter: THREE.Mesh, w: number, h: number, _startSide: number): void {
        const mat = specter.material as THREE.ShaderMaterial;
        const start = performance.now();

        // Each specter has unique slow wander parameters
        const driftSpeedX = (Math.random() - 0.5) * 25;
        const driftSpeedY = (Math.random() - 0.5) * 15;
        const wobbleFreqX = 0.3 + Math.random() * 0.4;
        const wobbleFreqY = 0.2 + Math.random() * 0.3;
        const wobbleAmpX = w * (0.08 + Math.random() * 0.1);
        const wobbleAmpY = h * (0.04 + Math.random() * 0.06);
        const baseX = specter.position.x;
        const baseY = specter.position.y;

        const tick = () => {
            const elapsed = (performance.now() - start) / 1000;
            mat.uniforms.u_time.value += 0.02;

            // Slow drifting + sinusoidal back-and-forth
            specter.position.x = baseX + driftSpeedX * elapsed + Math.sin(elapsed * wobbleFreqX) * wobbleAmpX;
            specter.position.y = baseY + driftSpeedY * elapsed * 0.5 + Math.cos(elapsed * wobbleFreqY) * wobbleAmpY;

            // Gentle tilting as they drift
            specter.rotation.z = Math.sin(elapsed * wobbleFreqX * 0.7) * 0.12;

            // Soft boundary — reverse drift if too far
            if (specter.position.x > w * 0.5) specter.position.x -= w * 0.02;
            if (specter.position.x < -w * 0.5) specter.position.x += w * 0.02;
            if (specter.position.y > h * 0.4) specter.position.y -= h * 0.02;
            if (specter.position.y < -h * 0.4) specter.position.y += h * 0.02;

            if (specter.parent) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // Dark energy beams shooting upward from caster during buildup
    private spawnDarkBeams(center: THREE.Vector3, cardW: number): void {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const bw = cardW * 0.04;
                const bh = window.innerHeight * 1.5;
                const geo = new THREE.PlaneGeometry(bw, bh);
                const mat = new THREE.ShaderMaterial({
                    transparent: true, depthWrite: false,
                    blending: THREE.AdditiveBlending,
                    uniforms: { u_time: { value: 0.0 } },
                    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
                    fragmentShader: `varying vec2 vUv; uniform float u_time; void main(){
                        float d=abs(vUv.x-0.5)*2.0;
                        float core=(1.0-smoothstep(0.0,0.3,d));
                        float glow=(1.0-smoothstep(0.0,1.0,d))*0.4;
                        float yFade=smoothstep(0.0,0.1,vUv.y)*(1.0-smoothstep(0.9,1.0,vUv.y));
                        float a=(core+glow)*(1.0-u_time)*0.7*yFade;
                        gl_FragColor=vec4(0.3,0.0,0.6,a);
                    }`,
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(center.x + (Math.random() - 0.5) * cardW, center.y + bh * 0.3, 2.5);
                mesh.renderOrder = 9;
                this.scene.add(mesh);
                this.fadeAndDispose(mesh, mat, geo, 800);
            }, i * 200);
        }
    }

    // Mixed specter types: swooshers (fast), drifters (slow), divers (top-down)
    private spawnSpectersMixed(count: number, w: number, h: number): THREE.Mesh[] {
        const specters: THREE.Mesh[] = [];
        const types: ('swoosh' | 'drift' | 'dive')[] = [];
        for (let i = 0; i < count; i++) {
            const r = Math.random();
            types.push(r < 0.35 ? 'swoosh' : r < 0.7 ? 'drift' : 'dive');
        }

        // Dementor-style shader: hooded head + dark cloak + long flowing tattered tendrils
        const dementorShader = `
            varying vec2 vUv; uniform float u_time; uniform float u_intensity;
            void main(){
                vec2 c = vUv - vec2(0.5, 0.5);

                // Hood: dark rounded top (upper 30%)
                float headY = c.y - 0.25;
                float headDist = length(vec2(c.x * 3.0, headY * 2.0));
                float hood = (1.0 - smoothstep(0.0, 0.5, headDist)) * step(0.15, vUv.y);

                // Cloak body: narrower at top, wider flowing at bottom
                float bodyWidth = 0.15 + (1.0 - vUv.y) * 0.35;
                // Multiple layers of undulating cloth
                float cloth1 = sin(vUv.y * 12.0 + u_time * 3.0 + c.x * 8.0) * 0.08;
                float cloth2 = sin(vUv.y * 18.0 - u_time * 5.0) * 0.06;
                float cloth3 = sin(vUv.y * 25.0 + u_time * 7.0 + 2.0) * 0.04;
                float clothEdge = abs(c.x) - bodyWidth + cloth1 + cloth2 + cloth3;
                float cloak = (1.0 - smoothstep(-0.05, 0.05, clothEdge)) * (1.0 - step(0.85, vUv.y));

                // Long trailing tendrils at bottom (흐물흐물)
                float tendrilZone = 1.0 - smoothstep(0.0, 0.35, vUv.y);
                float t1 = sin(vUv.y * 20.0 + u_time * 2.5 + 0.0) * 0.12;
                float t2 = sin(vUv.y * 15.0 - u_time * 3.5 + 1.5) * 0.1;
                float t3 = sin(vUv.y * 28.0 + u_time * 4.0 + 3.0) * 0.07;
                float t4 = sin(vUv.y * 35.0 - u_time * 2.0 + 5.0) * 0.05;
                float tendril = 0.0;
                tendril += (1.0 - smoothstep(0.0, 0.04, abs(c.x - 0.0 + t1))) * 0.5;
                tendril += (1.0 - smoothstep(0.0, 0.03, abs(c.x - 0.08 + t2))) * 0.4;
                tendril += (1.0 - smoothstep(0.0, 0.03, abs(c.x + 0.07 + t3))) * 0.4;
                tendril += (1.0 - smoothstep(0.0, 0.025, abs(c.x + 0.12 + t4))) * 0.3;
                tendril += (1.0 - smoothstep(0.0, 0.025, abs(c.x - 0.1 + t3 + t1))) * 0.3;
                tendril *= tendrilZone;

                // Hollow face area under hood
                float faceArea = (1.0 - smoothstep(0.0, 0.15, length(vec2(c.x * 2.5, headY * 1.5)))) * hood;
                float eyeL = (1.0 - smoothstep(0.0, 0.025, length(c - vec2(-0.04, 0.28))));
                float eyeR = (1.0 - smoothstep(0.0, 0.025, length(c - vec2(0.04, 0.28))));
                float mouth = (1.0 - smoothstep(0.0, 0.02 + u_intensity * 0.04, length(c - vec2(0.0, 0.22))));

                // Colors
                vec3 hoodCol = vec3(0.06, 0.06, 0.09);
                vec3 cloakCol = vec3(0.1, 0.1, 0.14);
                vec3 tendrilCol = vec3(0.08, 0.09, 0.13);
                vec3 voidCol = vec3(0.01, 0.01, 0.02);
                vec3 eyeCol = mix(vec3(0.3, 0.5, 0.7), vec3(0.9, 0.2, 0.1), u_intensity);
                vec3 mouthCol = mix(voidCol, vec3(0.5, 0.1, 0.1), u_intensity);

                vec3 col = hoodCol * hood + cloakCol * cloak + tendrilCol * tendril;
                col = mix(col, voidCol, faceArea * 0.8);
                col = mix(col, eyeCol, max(eyeL, eyeR) * hood);
                col = mix(col, mouthCol, mouth * hood * u_intensity);

                float a = hood * 0.85 + cloak * 0.75 + tendril * 0.5;
                a *= (1.0 + u_intensity * 0.2);

                // Ambient cold aura
                float aura = (1.0 - smoothstep(0.0, 1.0, length(c) * 1.5)) * 0.12;
                col += vec3(0.05, 0.08, 0.15) * aura;
                a += aura;

                gl_FragColor = vec4(col, a);
            }`;

        for (let i = 0; i < count; i++) {
            const type = types[i];
            const scale = type === 'swoosh' ? 1.6 : type === 'dive' ? 1.3 : 1.0;
            const sW = w * (0.06 + Math.random() * 0.03) * scale;
            const sH = sW * (2.8 + Math.random() * 0.6);
            const geo = new THREE.PlaneGeometry(sW, sH);
            const mat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false,
                uniforms: { u_time: { value: Math.random() * 100 }, u_intensity: { value: 0.0 } },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
                fragmentShader: dementorShader,
            });
            const mesh = new THREE.Mesh(geo, mat);

            if (type === 'swoosh') {
                const side = Math.random() > 0.5 ? 1 : -1;
                mesh.position.set(side * w * 0.6, (Math.random() - 0.5) * h * 0.5, 5);
                this.animateSpecterSwoosh(mesh, w, h, side);
            } else if (type === 'dive') {
                mesh.position.set((Math.random() - 0.5) * w * 0.6, h * 0.5, 5);
                this.animateSpecterDive(mesh, w, h);
            } else {
                mesh.position.set((Math.random() - 0.5) * w * 0.7, (Math.random() - 0.5) * h * 0.4, 5);
                this.animateSpecterDrift(mesh, w, h);
            }

            mesh.renderOrder = 14;
            this.scene.add(mesh);
            specters.push(mesh);

            // Spawn trailing wisps
            this.animateSpecterTrail(mesh);
        }
        return specters;
    }

    // SWOOSH: fast fly-through, reverse, fly back
    private animateSpecterSwoosh(sp: THREE.Mesh, w: number, h: number, side: number): void {
        const mat = sp.material as THREE.ShaderMaterial;
        const start = performance.now();
        const speed = 150 + Math.random() * 100;
        const baseY = sp.position.y;
        const arcAmp = h * (0.1 + Math.random() * 0.15);

        const tick = () => {
            const elapsed = (performance.now() - start) / 1000;
            mat.uniforms.u_time.value += 0.04;

            // Pendulum: fly across, slow down, reverse, fly back
            const cycle = elapsed * 0.6;
            const swing = Math.sin(cycle) * w * 0.5;
            sp.position.x = -side * swing;
            sp.position.y = baseY + Math.sin(elapsed * 1.2) * arcAmp;

            // Tilt toward movement direction
            sp.rotation.z = -Math.cos(cycle) * side * 0.2;

            if (sp.parent) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // DRIFT: slow eerie back-and-forth
    private animateSpecterDrift(sp: THREE.Mesh, w: number, h: number): void {
        const mat = sp.material as THREE.ShaderMaterial;
        const start = performance.now();
        const baseX = sp.position.x;
        const baseY = sp.position.y;
        const freqX = 0.2 + Math.random() * 0.2;
        const freqY = 0.15 + Math.random() * 0.15;
        const ampX = w * (0.06 + Math.random() * 0.08);
        const ampY = h * (0.03 + Math.random() * 0.05);

        const tick = () => {
            const elapsed = (performance.now() - start) / 1000;
            mat.uniforms.u_time.value += 0.02;
            sp.position.x = baseX + Math.sin(elapsed * freqX) * ampX;
            sp.position.y = baseY + Math.cos(elapsed * freqY) * ampY;
            sp.rotation.z = Math.sin(elapsed * freqX * 0.7) * 0.08;
            if (sp.parent) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // DIVE: swoop from top, arc down, swing back up
    private animateSpecterDive(sp: THREE.Mesh, w: number, h: number): void {
        const mat = sp.material as THREE.ShaderMaterial;
        const start = performance.now();
        const baseX = sp.position.x;
        const driftX = (Math.random() - 0.5) * 40;

        const tick = () => {
            const elapsed = (performance.now() - start) / 1000;
            mat.uniforms.u_time.value += 0.03;

            // Diving sine wave
            const phase = elapsed * 0.5;
            sp.position.y = Math.cos(phase) * h * 0.35;
            sp.position.x = baseX + Math.sin(phase * 1.3) * w * 0.15 + driftX * elapsed;

            // Tilt into dive
            sp.rotation.z = -Math.sin(phase) * 0.25;

            if (sp.parent) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // Trailing dark wisps behind each specter
    // Flowing dark wisp trail — undulating tendrils left behind
    private animateSpecterTrail(sp: THREE.Mesh): void {
        const interval = setInterval(() => {
            if (!sp.parent) { clearInterval(interval); return; }
            // Elongated wispy trail particle
            const tw = 15 + Math.random() * 12;
            const th = 30 + Math.random() * 25;
            const geo = new THREE.PlaneGeometry(tw, th);
            const seed = Math.random() * 100;
            const mat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false,
                uniforms: { u_time: { value: 0.0 }, u_seed: { value: seed } },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
                fragmentShader: `varying vec2 vUv; uniform float u_time; uniform float u_seed; void main(){
                    vec2 c = vUv - 0.5;
                    // Undulating wisp shape
                    float wave = sin(vUv.y * 8.0 + u_seed + u_time * 3.0) * 0.15;
                    float d = abs(c.x + wave) * 3.0;
                    float wisp = (1.0 - smoothstep(0.0, 1.0, d)) * (1.0 - smoothstep(0.0, 0.2, vUv.y));
                    float fade = (1.0 - u_time);
                    float a = wisp * fade * 0.45;
                    gl_FragColor = vec4(0.07, 0.08, 0.12, a);
                }`,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                sp.position.x + (Math.random() - 0.5) * 15,
                sp.position.y - 20 - Math.random() * 15,
                sp.position.z - 0.1,
            );
            mesh.renderOrder = 13;
            this.scene.add(mesh);
            this.fadeAndDispose(mesh, mat, geo, 500);
        }, 80);
    }

    // === Dementor system ===
    // Mesh is HORIZONTAL. Shader uses xn = 1-UV.x so head is at UV.x=1 (local +X).
    // Upper portion = hooded cloak with cloth folds, lower portion = swirling smoke/mist.
    // rotation.z = flightAngle points +X (head) in flight direction.
    private readonly DEMENTOR_SHADER = `
        varying vec2 vUv;
        uniform float u_time;
        uniform float u_intensity;
        uniform float u_approach;

        float hash(vec2 p){
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float hash3(vec3 p){
            return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }
        float noise(vec2 p){
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i), hash(i + vec2(1,0)), f.x),
                mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
                f.y
            );
        }
        // 5-octave FBM with animated drift
        float fbm5(vec2 p, float t){
            float v = 0.0, amp = 0.5;
            mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
            for(int i = 0; i < 5; i++){
                v += amp * noise(p + vec2(t * 0.2, t * 0.1));
                p = rot * p * 2.1 + vec2(1.7, 3.2);
                amp *= 0.5;
                t *= 1.15;
            }
            return v;
        }
        // Warped FBM — feeds FBM into itself for more chaotic smoke
        float warpedFbm(vec2 p, float t){
            vec2 q = vec2(fbm5(p, t), fbm5(p + vec2(5.2, 1.3), t * 1.1));
            return fbm5(p + q * 1.5, t * 0.8);
        }

        void main(){
            vec2 c = vUv - 0.5;
            float t = u_time;
            float xn = 1.0 - vUv.x;   // 0=head, 1=tail
            float yn = vUv.y;          // 0=bottom, 1=top
            vec2 fuv = vec2(xn, yn);
            float aspect = 0.6;
            vec2 sq = vec2(xn, (yn - 0.5) / aspect + 0.5);

            // Noise layers
            float n1 = fbm5(fuv * vec2(3.0, 4.0), t * 0.8);
            float n2 = fbm5(fuv * vec2(5.0, 7.0) + 7.0, t * 1.2);
            float n3 = warpedFbm(fuv * vec2(2.5, 3.5) + 13.0, t * 0.6);

            // =============================================
            // BODY — compact torso, NOT tapering like a tadpole
            // Ends abruptly around xn=0.35, then ragged strips trail behind
            // =============================================

            // Body shape: compact, ends sharply
            vec2 bodyC = vec2(0.22, 0.48);
            float bodyW = 0.18;
            float bodyH = 0.22;
            vec2 bodyUV = (sq - bodyC) * vec2(1.0 / bodyW, 1.0 / bodyH);
            float bodyDist = length(bodyUV);

            // Warped edges — organic
            float bodyWarp = warpedFbm(fuv * vec2(4.0, 6.0) + vec2(t * 0.4, 0.0), t * 1.0);
            float bodyEdge = bodyDist - bodyWarp * 0.25;
            float density = (1.0 - smoothstep(0.6, 1.0, bodyEdge));
            density *= smoothstep(0.0, 0.05, xn);
            density *= 1.0 - smoothstep(0.35, 0.50, xn);

            // Internal turbulence
            float innerTurb = warpedFbm(fuv * vec2(5.0, 8.0) + vec2(t * 0.5, t * 0.2), t * 1.3);
            float innerDetail = fbm5(fuv * vec2(10.0, 14.0) + 5.0, t * 1.5);

            // =============================================
            // HEAD — denser, rounder
            // =============================================
            // HEAD + HOOD — hood wraps around the head: front(face), top(dome), back
            // Side view: like a backwards comma — round at front, extends back over the head
            vec2 headC = vec2(0.15, 0.50);
            vec2 headOff = sq - headC;
            // Asymmetric: tight at front (face), extends further backward (+xn = back of head)
            float hx = headOff.x * (headOff.x < 0.0 ? 1.8 : 0.7);
            float hy = headOff.y;
            // Hood top curves higher at the back
            hy *= 1.0 - smoothstep(0.0, 0.15, headOff.x) * 0.3;
            float headR = length(vec2(hx, hy));
            float headShape = 1.0 - smoothstep(0.12, 0.22, headR);
            density = max(density, headShape * 0.95);

            // =============================================
            // TRAILING SMOKE — billowing dark clouds behind the body
            // Puffy, thick, cloudy — NOT thin tentacles
            // =============================================
            float trailZone = smoothstep(0.20, 0.40, xn);

            // Multiple overlapping smoke puffs at different scales
            float trail = 0.0;

            // Large billowing clouds
            float cloud1 = warpedFbm(fuv * vec2(3.0, 5.0) + vec2(t * 0.5, 0.0), t * 1.0);
            float cloud2 = warpedFbm(fuv * vec2(4.0, 6.0) + vec2(t * 0.4, 3.0), t * 1.3);
            float cloud3 = fbm5(fuv * vec2(5.0, 8.0) + vec2(t * 0.6, 7.0), t * 1.5);

            // Cloud shapes — wide puffy blobs, not lines
            float puff1 = smoothstep(0.30, 0.60, cloud1) * (1.0 - smoothstep(0.25, 0.50, abs(yn - 0.50 + (cloud2 - 0.5) * 0.1)));
            float puff2 = smoothstep(0.35, 0.65, cloud2) * (1.0 - smoothstep(0.20, 0.45, abs(yn - 0.45 + (cloud1 - 0.5) * 0.08)));
            float puff3 = smoothstep(0.32, 0.58, cloud3) * (1.0 - smoothstep(0.18, 0.38, abs(yn - 0.55 + (cloud3 - 0.5) * 0.06)));

            trail = (puff1 * 0.5 + puff2 * 0.35 + puff3 * 0.25);
            // Fade toward tail end
            trail *= (1.0 - smoothstep(0.55, 0.92, xn));
            trail *= trailZone;

            // Thin wisps at the very end — smoke dissipating
            float wisps = 0.0;
            float wispZone = smoothstep(0.50, 0.85, xn);
            float wispNoise = warpedFbm(fuv * vec2(4.0, 7.0) + vec2(t * 0.7, 5.0), t * 1.6);
            wisps = smoothstep(0.4, 0.65, wispNoise) * (1.0 - smoothstep(0.15, 0.35, abs(yn - 0.50 + (wispNoise - 0.5) * 0.1)));
            wisps *= wispZone * (1.0 - smoothstep(0.88, 1.0, xn)) * 0.3;

            // =============================================
            // EYES — front-facing :) — stacked vertically (top eye, bottom eye)
            // The dementor stares at YOU while flying past
            // =============================================
            vec2 fUV = (sq - headC) * 7.0;
            // Both eyes at same x (facing camera), separated vertically
            vec2 eyeTop = vec2(-0.05, 0.18);
            vec2 eyeBot = vec2(-0.05, -0.12);
            vec2 jT = vec2(sin(t * 2.5) * 0.015, cos(t * 3.0) * 0.02);
            vec2 jBt = vec2(sin(t * 2.5 + 1.5) * 0.015, cos(t * 3.0 + 2.0) * 0.02);
            float eyeGlowT = (1.0 - smoothstep(0.0, 0.28, length(fUV - eyeTop))) * 0.35;
            float eyeGlowBt = (1.0 - smoothstep(0.0, 0.28, length(fUV - eyeBot))) * 0.35;
            float eyeCoreT = (1.0 - smoothstep(0.0, 0.09, length(fUV - eyeTop + jT)));
            float eyeCoreBt = (1.0 - smoothstep(0.0, 0.09, length(fUV - eyeBot + jBt)));
            float eyeGlow = max(eyeGlowT, eyeGlowBt) * headShape;
            float eyeCore = max(eyeCoreT, eyeCoreBt) * headShape;
            eyeCore *= 0.6 + sin(t * 13.0) * 0.2 + sin(t * 19.0) * 0.15 + sin(t * 29.0) * 0.05;

            // =============================================
            // MOUTH — opens with u_approach
            // =============================================
            float mouthW = 0.06 + u_approach * 0.35;
            float mouthH = 0.04 + u_approach * 0.25;
            vec2 mouthC = vec2(0.24, 0.50);
            vec2 mouthUV = (sq - mouthC) * vec2(1.0/mouthW, 1.0/mouthH);
            float mouthD = length(mouthUV);
            float mouth = (1.0 - smoothstep(0.0, 1.0, mouthD)) * u_approach;
            float mouthCoreGlow = (1.0 - smoothstep(0.0, 0.4, mouthD)) * u_approach;
            float mouthBreath = sin(t * 1.5) * 0.08 + 0.92;
            float mouthTotal = (mouth * 0.6 + mouthCoreGlow * 0.5) * mouthBreath;

            // =============================================
            // AURA — cold glow around the entity
            // =============================================
            float auraDist = length(c * vec2(1.0, 1.3));
            float aura = (1.0 - smoothstep(0.05, 0.45, auraDist)) * 0.35;
            aura *= 0.6 + n3 * 0.4;
            float frost = hash(fuv * 50.0 + floor(t * 3.0)) * step(0.91, hash(fuv * 30.0 + 0.5));
            frost *= (1.0 - smoothstep(0.15, 0.4, auraDist)) * 0.2;

            // =============================================
            // COMPOSITE
            // =============================================
            vec3 col = vec3(0.0);
            float alpha = 0.0;

            // Aura
            col += vec3(0.10, 0.15, 0.30) * aura;
            alpha += aura;
            col += vec3(0.35, 0.55, 0.85) * frost;
            alpha += frost;

            // Trailing smoke — pale ghostly ectoplasm
            vec3 trailDark = vec3(0.13, 0.17, 0.26);
            vec3 trailGhost = vec3(0.33, 0.44, 0.58);
            vec3 trailBright = vec3(0.48, 0.60, 0.72);
            vec3 trailCol = mix(trailBright, trailDark, smoothstep(0.12, 0.40, trail));
            float ghostPulse = sin(t * 3.5 + innerTurb * 10.0) * 0.18 + 0.82;
            float ghostFlicker = sin(t * 11.0 + n2 * 5.0) * 0.08;
            trailCol *= ghostPulse + ghostFlicker;
            trailCol += vec3(0.15, 0.20, 0.30) * (1.0 - smoothstep(0.0, 0.18, trail));
            col += trailCol * trail;
            alpha += trail * 0.48;

            // Wisps — pale spectral filaments
            vec3 wispGhost = vec3(0.30, 0.42, 0.56);
            float wispFlicker = sin(t * 7.0 + n1 * 8.0) * 0.12 + 0.88;
            float wispTipGlow = smoothstep(0.5, 0.85, xn) * 0.35;
            col += (wispGhost + vec3(0.08, 0.10, 0.15) * wispTipGlow) * wisps * wispFlicker;
            alpha += wisps * 0.42;

            // Main body — dense dark core with turbulence shading
            vec3 bodyDeep = vec3(0.02, 0.02, 0.04);
            vec3 bodyMid = vec3(0.06, 0.07, 0.12);
            vec3 bodyLight = vec3(0.12, 0.14, 0.22);
            float shade = innerTurb * 0.6 + innerDetail * 0.4;
            vec3 bodyCol = mix(bodyDeep, bodyMid, smoothstep(0.3, 0.5, shade));
            bodyCol = mix(bodyCol, bodyLight, smoothstep(0.5, 0.7, shade));
            col = mix(col, bodyCol, density * 0.9);
            alpha = mix(alpha, 0.88 + headShape * 0.10, density);

            // Head — denser, darker core
            col = mix(col, vec3(0.015, 0.015, 0.03), headShape * 0.8);
            alpha = mix(alpha, 0.97, headShape);

            // Rim light — edge of body glows cold blue
            float rim = density * (1.0 - smoothstep(0.0, 0.15, 1.0 - bodyEdge));
            col += vec3(0.15, 0.22, 0.45) * rim * 0.5;
            alpha += rim * 0.3;

            // Eyes
            col += vec3(0.10, 0.18, 0.40) * eyeGlow;
            alpha += eyeGlow * 0.3;
            vec3 eyeCol = mix(vec3(0.2, 0.4, 0.9), vec3(0.6, 0.85, 1.0), eyeCore);
            col += eyeCol * eyeCore * (0.8 + u_intensity * 1.2);
            alpha += eyeCore * 0.8;
            col += vec3(0.08, 0.15, 0.4) * eyeGlow * u_intensity * 0.3;

            // Mouth glow
            vec3 mouthEdgeCol = vec3(0.08, 0.15, 0.4);
            vec3 mouthCoreCol = vec3(0.25, 0.45, 0.9);
            vec3 mouthColor = mix(mouthEdgeCol, mouthCoreCol, mouthCoreGlow);
            col = mix(col, mouthColor, mouthTotal * 0.9);
            alpha = mix(alpha, 0.95, mouthTotal);

            alpha = min(alpha, 1.0) * (1.0 + u_intensity * 0.15);
            // Fade to transparent at mesh edges — no visible rectangle
            // Top edge has wider margin to not clip the hood dome
            float edgeFade = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x)
                           * smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.97, vUv.y);
            alpha *= edgeFade;
            gl_FragColor = vec4(col, alpha);
        }`;

    // 3 dementors: LARGE, FAST, sweeping across the ENTIRE screen
    private spawnFlyingDementors(count: number, w: number, h: number): THREE.Mesh[] {
        const dementors: THREE.Mesh[] = [];

        // Each dementor flies a big sweeping path across the full screen
        const configs = [
            { delay: 0, fromX: -w * 0.6, fromY: h * 0.25, toX: w * 0.7, toY: -h * 0.1, dur: 4400, arc: h * 0.2 },
            { delay: 200, fromX: w * 0.65, fromY: h * 0.1, toX: -w * 0.6, toY: h * 0.15, dur: 4800, arc: -h * 0.2 },
            { delay: 400, fromX: -w * 0.5, fromY: -h * 0.1, toX: w * 0.6, toY: h * 0.1, dur: 4200, arc: h * 0.25 },
        ];

        for (let i = 0; i < Math.min(count, configs.length); i++) {
            const cfg = configs[i];
            const dLen = w * (0.28 + Math.random() * 0.06);
            const dThick = dLen * 0.6;
            const geo = new THREE.PlaneGeometry(dLen, dThick);
            const mat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false,
                uniforms: {
                    u_time: { value: Math.random() * 100 },
                    u_intensity: { value: 0.0 },
                    u_approach: { value: 0.0 },
                },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
                fragmentShader: this.DEMENTOR_SHADER,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(cfg.fromX, cfg.fromY, 5);
            mesh.renderOrder = 14;
            this.scene.add(mesh);
            dementors.push(mesh);

            // Staggered entry — first one starts immediately, others delayed
            if (cfg.delay === 0) {
                mesh.visible = true;
                this.animateDementorSweep(mesh, cfg, w, h);
            } else {
                mesh.visible = false;
                setTimeout(() => {
                    mesh.visible = true;
                    this.animateDementorSweep(mesh, cfg, w, h);
                }, cfg.delay);
            }
        }
        return dementors;
    }

    private animateDementorSweep(
        dm: THREE.Mesh,
        cfg: { fromX: number; fromY: number; toX: number; toY: number; dur: number; arc: number },
        _w: number, _h: number,
    ): void {
        const mat = dm.material as THREE.ShaderMaterial;
        let prevX = cfg.fromX;
        let prevY = cfg.fromY;
        const startTime = performance.now();

        // Lissajous-style flight: two sin waves at different frequencies
        // X uses freq 1, Y uses freq ~1.5 → figure-8-ish pattern
        // No endpoint slow-down because both axes are always in motion
        const periodX = cfg.dur * 2;
        const periodY = cfg.dur * 1.3;
        const midX = (cfg.fromX + cfg.toX) * 0.5;
        const midY = (cfg.fromY + cfg.toY) * 0.5;
        const ampX = (cfg.toX - cfg.fromX) * 0.5;
        const ampY = (cfg.toY - cfg.fromY) * 0.5 + Math.abs(cfg.arc);

        const tick = () => {
            if (!dm.parent || dm.userData.__stopSweep) return;
            const elapsed = performance.now() - startTime;
            mat.uniforms.u_time.value += 0.025;

            const phaseX = (elapsed / periodX) * Math.PI * 2;
            const phaseY = (elapsed / periodY) * Math.PI * 2;

            const x = midX + Math.sin(phaseX) * ampX;
            const y = midY + Math.sin(phaseY) * ampY;

            dm.position.x = x;
            dm.position.y = y;

            const dx = x - prevX;
            const dy = y - prevY;
            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                const angle = Math.atan2(dy, dx);
                dm.rotation.z = angle;
                const absY = Math.abs(dm.scale.y);
                dm.scale.y = (Math.abs(angle) > Math.PI * 0.5) ? -absY : absY;
            }

            prevX = x;
            prevY = y;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    // 2 dementors zoom off screen at high speed
    private dementorsFlyAway(dementors: THREE.Mesh[], keepCount: number, duration: number): Promise<void> {
        const active = dementors.filter(d => d.parent);
        const removeCount = active.length - keepCount;
        if (removeCount <= 0) return Promise.resolve();

        const shuffled = [...active].sort(() => Math.random() - 0.5);
        const leaving = shuffled.slice(0, removeCount);

        return new Promise(resolve => {
            let done = 0;
            for (const dm of leaving) {
                // Fly off in current direction at high speed
                const angle = dm.rotation.z;
                const speed = window.innerWidth * 1.5;
                const startX = dm.position.x;
                const startY = dm.position.y;
                const targetX = startX + Math.cos(angle) * speed;
                const targetY = startY + Math.sin(angle) * speed;
                const startT = performance.now();

                const tick = () => {
                    const t = Math.min((performance.now() - startT) / duration, 1);
                    const eased = t * t;
                    dm.position.x = startX + (targetX - startX) * eased;
                    dm.position.y = startY + (targetY - startY) * eased;
                    if (t < 1) {
                        requestAnimationFrame(tick);
                    } else {
                        this.scene.remove(dm);
                        dm.geometry.dispose();
                        (dm.material as THREE.ShaderMaterial).dispose();
                        done++;
                        if (done >= leaving.length) resolve();
                    }
                };
                setTimeout(() => requestAnimationFrame(tick), Math.random() * 200);
            }
        });
    }

    // Spawns a fresh dementor off-screen for the soul kiss lunge
    private spawnSoulKissDementor(w: number, h: number): THREE.Mesh {
        const dLen = w * 0.30;
        const dThick = dLen * 0.6;
        const geo = new THREE.PlaneGeometry(dLen, dThick);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            uniforms: {
                u_time: { value: Math.random() * 100 },
                u_intensity: { value: 0.0 },
                u_approach: { value: 0.0 },
            },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: this.DEMENTOR_SHADER,
        });
        const mesh = new THREE.Mesh(geo, mat);
        // Start off-screen — no rotation, face already facing camera
        const side = Math.random() > 0.5 ? 1 : -1;
        mesh.position.set(side * w * 0.8, (Math.random() - 0.5) * h * 0.3, 5);
        mesh.rotation.z = 0;
        mesh.renderOrder = 14;
        this.scene.add(mesh);
        return mesh;
    }

    // Soul kiss: lunge from side → face fills screen → sucked into blue abyss
    private async dementorSoulKiss(dm: THREE.Mesh, w: number, h: number, _duration: number): Promise<void> {
        const mat = dm.material as THREE.ShaderMaterial;
        const baseAbsX = Math.abs(dm.scale.x);
        const baseAbsY = Math.abs(dm.scale.y);
        const entryX = dm.position.x;
        const entryY = dm.position.y;
        const entryRot = dm.rotation.z;

        // Mouth offset in local geometry coords
        const geoParams = (dm.geometry as THREE.PlaneGeometry).parameters;
        // mouthC in shader: sq=(0.24, 0.50). xn=0.24→vUv.x=0.76. yn=0.50
        const mouthLocalX = (0.76 - 0.5) * geoParams.width;
        const mouthLocalY = 0;

        // Head is at local +X (UV.x=1). scale.x is always -1 to flip head forward.
        // scale.y = +1 keeps hood on top when facing right (rot≈0).
        const sxSign = -1;
        const sySign = 1;

        const centerMouthPos = (sx: number, sy: number, rot: number) => {
            const offX = mouthLocalX * sx;
            const offY = mouthLocalY * sy;
            const c = Math.cos(rot), s = Math.sin(rot);
            return { x: -(c * offX - s * offY), y: -(s * offX + c * offY) };
        };

        // Phase A: LUNGE — dementor rockets in from the side (900ms)
        // Cubic ease-in: slow start, FAST arrival → startling
        const lungeScale = 6;
        const lungeSx = sxSign * baseAbsX * lungeScale;
        const lungeSy = sySign * baseAbsY * lungeScale;
        const lungeTarget = centerMouthPos(lungeSx, lungeSy, 0);

        await new Promise<void>(resolve => {
            const startT = performance.now();
            const dur = 900;
            const tick = () => {
                const t = Math.min((performance.now() - startT) / dur, 1);
                // Cubic ease-in: barely moves at first, then SLAMS in
                const eased = t * t * t;
                mat.uniforms.u_time.value += 0.03;

                const curScale = 1 + eased * (lungeScale - 1);
                const sx = sxSign * baseAbsX * curScale;
                const sy = sySign * baseAbsY * curScale;
                dm.scale.set(sx, sy, 1);

                const curTarget = centerMouthPos(sx, sy, 0);
                dm.position.x = entryX + (curTarget.x - entryX) * eased;
                dm.position.y = entryY + (curTarget.y - entryY) * eased;

                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });

        // IMPACT — heavy shake, eyes flash
        this.shakeScenePromise(w * CWR * 1.0, 400);
        this.spawnScreenFlash(250);
        mat.uniforms.u_intensity.value = 1.0;

        // Phase B: Freeze — face fills screen, eyes burning, 공포의 순간 (600ms)
        // Frost creeps in during this freeze
        const frostMesh = this.createFrostOverlay(w, h);
        this.scene.add(frostMesh);
        const frostMat = frostMesh.material as THREE.ShaderMaterial;
        const frostStart = performance.now();
        const frostTick = () => {
            if (!frostMesh.parent) return;
            frostMat.uniforms.u_time.value = (performance.now() - frostStart) / 1000;
            requestAnimationFrame(frostTick);
        };
        requestAnimationFrame(frostTick);

        await new Promise<void>(resolve => {
            const startT = performance.now();
            const dur = 600;
            const tick = () => {
                const t = Math.min((performance.now() - startT) / dur, 1);
                mat.uniforms.u_time.value += 0.02;
                // Eyes intensity fades from flash to steady burn
                mat.uniforms.u_intensity.value = 1.0 - t * 0.5;
                // Mouth begins to open — dread
                mat.uniforms.u_approach.value = t * 0.5;
                frostMat.uniforms.u_intensity.value = t * 0.5;
                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });

        // Phase C: Soul extraction — bright energy streams from viewer into the mouth
        this.fadeAndDisposeFrost(frostMesh, 600);

        // Soul stream overlay
        const soulStream = this.createSoulStreamOverlay(w, h);
        this.scene.add(soulStream);
        const soulMat = soulStream.material as THREE.ShaderMaterial;

        const sceneOrigX = this.scene.position.x;
        const sceneOrigY = this.scene.position.y;

        // Soul extraction: 2500ms — energy flows into mouth, dementor grows
        await new Promise<void>(resolve => {
            const startT = performance.now();
            const dur = 2500;
            const tick = () => {
                const t = Math.min((performance.now() - startT) / dur, 1);
                const eased = t < 0.5
                    ? 2 * t * t
                    : 1 - Math.pow(-2 * t + 2, 2) / 2;

                mat.uniforms.u_time.value += 0.03;
                mat.uniforms.u_approach.value = 0.5 + eased * 0.5;
                soulMat.uniforms.u_time.value += 0.04;
                soulMat.uniforms.u_intensity.value = eased;

                // Dementor grows — mouth vortex expands
                const scale = lungeScale + eased * 30;
                const sx = sxSign * baseAbsX * scale;
                const sy = sySign * baseAbsY * scale;
                dm.scale.set(sx, sy, 1);
                dm.rotation.z = 0;

                const pos = centerMouthPos(sx, sy, 0);
                dm.position.x = pos.x;
                dm.position.y = pos.y;

                // Tremor intensifies
                const shakeAmp = eased * eased * w * CWR * 0.2;
                this.scene.position.x = sceneOrigX + (Math.random() - 0.5) * shakeAmp;
                this.scene.position.y = sceneOrigY + (Math.random() - 0.5) * shakeAmp;

                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });

        this.scene.position.set(sceneOrigX, sceneOrigY, 0);

        // Dispose soul stream
        this.scene.remove(soulStream);
        soulStream.geometry.dispose();
        soulMat.dispose();

        // Phase D: Fade to darkness — soul fully consumed
        const fadeSize = Math.max(w, h) * 3;
        const fadeGeo = new THREE.PlaneGeometry(fadeSize, fadeSize);
        const fadeMat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            uniforms: { u_time: { value: 0.0 } },
            vertexShader: `void main(){ gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `uniform float u_time; void main(){
                gl_FragColor = vec4(0.0, 0.0, 0.0, u_time * 0.95);
            }`,
        });
        const fadeMesh = new THREE.Mesh(fadeGeo, fadeMat);
        fadeMesh.position.set(0, 0, 6);
        fadeMesh.renderOrder = 18;
        this.scene.add(fadeMesh);

        await new Promise<void>(resolve => {
            const startT = performance.now();
            const dur = 800;
            const tick = () => {
                const t = Math.min((performance.now() - startT) / dur, 1);
                fadeMat.uniforms.u_time.value = t;
                mat.uniforms.u_time.value += 0.03;
                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });

        // Clean up dementor (hidden behind black overlay now)
        if (dm.parent) { this.scene.remove(dm); dm.geometry.dispose(); mat.dispose(); }

        // Phase F: Hold darkness briefly, then fade out — return to reality
        await this.delay(500);

        // Fade black out
        await new Promise<void>(resolve => {
            const startT = performance.now();
            const dur = 600;
            const tick = () => {
                const t = Math.min((performance.now() - startT) / dur, 1);
                fadeMat.uniforms.u_time.value = 1.0 - t;
                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });

        this.scene.remove(fadeMesh);
        fadeGeo.dispose();
        fadeMat.dispose();
        await this.delay(200);
    }

    // Soul stream — ethereal luminous energy being extracted from viewer into dementor's mouth.
    // Uses warped FBM in polar coords for organic, cinematic smoke-light flowing inward.
    private createSoulStreamOverlay(w: number, h: number): THREE.Mesh {
        const size = Math.max(w, h) * 2.5;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                u_time: { value: 0.0 },
                u_intensity: { value: 0.0 },
            },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;
                uniform float u_intensity;

                float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
                float noise(vec2 p){
                    vec2 i=floor(p), f=fract(p);
                    f=f*f*(3.0-2.0*f);
                    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
                               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
                }
                float fbm5(vec2 p, float t){
                    float v=0.0, a=0.5;
                    mat2 rot = mat2(0.8,0.6,-0.6,0.8);
                    for(int i=0;i<5;i++){
                        v+=a*noise(p+vec2(t*0.25,t*0.12));
                        p=rot*p*2.1+vec2(1.7,3.2); a*=0.5; t*=1.15;
                    }
                    return v;
                }
                float warpFbm(vec2 p, float t){
                    vec2 q = vec2(fbm5(p,t), fbm5(p+vec2(5.2,1.3),t*1.1));
                    return fbm5(p+q*1.8, t*0.7);
                }

                void main(){
                    vec2 c = vUv - 0.5;
                    float dist = length(c);
                    float angle = atan(c.y, c.x);
                    float t = u_time;

                    // Polar UV for radial flow: x=angle, y=distance
                    // The "flow" is along y (inward), distorted by FBM
                    vec2 polar = vec2(angle * 0.5, dist * 3.0);

                    // === PRIMARY SOUL ENERGY — warped luminous smoke flowing inward ===
                    // FBM sampled in polar space, scrolling inward over time
                    float flow1 = warpFbm(polar + vec2(0.0, t * 0.6), t * 0.8);
                    float flow2 = fbm5(polar * 1.5 + vec2(3.0, t * 0.8), t * 1.2);
                    float flow3 = fbm5(polar * 0.8 + vec2(7.0, t * 0.5), t * 0.6);

                    // Shape the flows: bright tendrils where noise is high
                    float energy1 = smoothstep(0.35, 0.65, flow1) * 0.7;
                    float energy2 = smoothstep(0.40, 0.70, flow2) * 0.5;
                    float energy3 = smoothstep(0.30, 0.55, flow3) * 0.3;

                    // Combine — layered ethereal smoke
                    float soulEnergy = energy1 + energy2 * 0.6 + energy3 * 0.4;

                    // Radial gradient: bright at edges (soul source), converges toward center
                    float radialMask = smoothstep(0.03, 0.12, dist);
                    soulEnergy *= radialMask;

                    // === BRIGHT CORE STREAM — the main concentrated flow near center ===
                    // Tighter, brighter streams closer to center
                    vec2 innerPolar = vec2(angle * 1.5, dist * 8.0);
                    float coreFlow = warpFbm(innerPolar + vec2(1.0, t * 1.2), t * 1.5);
                    float coreStream = smoothstep(0.4, 0.7, coreFlow);
                    coreStream *= (1.0 - smoothstep(0.0, 0.18, dist)); // only near center
                    coreStream *= 0.8;

                    // === CONVERGENCE GLOW — bright point where energy enters mouth ===
                    float convergence = (1.0 - smoothstep(0.0, 0.08, dist));
                    convergence *= 1.0 + sin(t * 3.0) * 0.15;

                    // === WISP FILAMENTS — thin bright threads being pulled in ===
                    float filaments = 0.0;
                    float filNoise = fbm5(vec2(angle * 3.0, dist * 5.0 + t * 0.8), t * 2.0);
                    filaments = smoothstep(0.55, 0.62, filNoise) * radialMask * 0.6;

                    // === COLOR — blue-white gradient, whiter at core ===
                    float totalEnergy = (soulEnergy + coreStream + convergence * 0.5 + filaments) * u_intensity;

                    vec3 outerCol = vec3(0.3, 0.5, 0.95);    // deep blue at edges
                    vec3 midCol = vec3(0.5, 0.7, 1.0);       // lighter blue mid
                    vec3 coreCol = vec3(0.85, 0.92, 1.0);     // near-white at center

                    float colorBlend = 1.0 - smoothstep(0.0, 0.3, dist);
                    vec3 col = mix(outerCol, midCol, smoothstep(0.2, 0.05, dist));
                    col = mix(col, coreCol, colorBlend * 0.7 + convergence * 0.3);
                    col *= totalEnergy;

                    // Boost brightness where energy is dense
                    col += coreCol * convergence * u_intensity * 0.4;

                    gl_FragColor = vec4(col, totalEnergy * 0.9);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, 5.9);
        mesh.renderOrder = 16;
        return mesh;
    }

    // Frost overlay — icy crystalline patterns creeping from screen edges
    private createFrostOverlay(w: number, h: number): THREE.Mesh {
        const size = Math.max(w, h) * 2;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, depthTest: false,
            uniforms: { u_time: { value: 0.0 }, u_intensity: { value: 0.0 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;
                uniform float u_intensity;
                float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
                float noise(vec2 p){
                    vec2 i=floor(p), f=fract(p);
                    f=f*f*(3.0-2.0*f);
                    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
                }
                float fbm(vec2 p){
                    float v=0.0, a=0.5;
                    for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.1+vec2(1.7,3.2); a*=0.5; }
                    return v;
                }
                void main(){
                    vec2 c = vUv - 0.5;
                    // Distance from nearest edge (0 at edge, 0.5 at center)
                    float edgeDist = min(min(vUv.x, 1.0-vUv.x), min(vUv.y, 1.0-vUv.y));
                    // Frost creeps inward with u_intensity
                    float creep = u_intensity * 0.35;
                    float frostZone = 1.0 - smoothstep(0.0, creep + 0.02, edgeDist);
                    // Ice crystal pattern
                    float crystal = fbm(vUv * 15.0 + u_time * 0.3);
                    crystal = smoothstep(0.3, 0.6, crystal);
                    // Branching ice veins
                    float veins = fbm(vUv * 30.0 + vec2(u_time * 0.2, 0.0));
                    veins = smoothstep(0.55, 0.65, veins) * 0.5;
                    float frost = (crystal * 0.7 + veins) * frostZone * u_intensity;
                    // Color: cold blue-white
                    vec3 col = mix(vec3(0.4, 0.55, 0.75), vec3(0.7, 0.85, 1.0), crystal);
                    gl_FragColor = vec4(col, frost * 0.5);
                }`,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, 5.5);
        mesh.renderOrder = 15;
        return mesh;
    }

    private fadeAndDisposeFrost(mesh: THREE.Mesh, duration: number): void {
        const mat = mesh.material as THREE.ShaderMaterial;
        const startIntensity = mat.uniforms.u_intensity.value;
        const startT = performance.now();
        const tick = () => {
            const t = Math.min((performance.now() - startT) / duration, 1);
            mat.uniforms.u_intensity.value = startIntensity * (1 - t);
            if (t < 1) requestAnimationFrame(tick);
            else { this.scene.remove(mesh); mesh.geometry.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(tick);
    }

    private async spectersScream(specters: THREE.Mesh[], cardW: number, w: number, h: number): Promise<void> {
        // Specters converge toward center
        for (const sp of specters) {
            const targetX = (Math.random() - 0.5) * w * 0.2;
            const targetY = (Math.random() - 0.5) * h * 0.15;
            new TWEEN.Tween(sp.position)
                .to({ x: targetX, y: targetY }, 500)
                .easing(TWEEN.Easing.Quadratic.In)
                .start();
        }
        await this.delay(500);

        // Scream — intensity rises + expand
        for (const sp of specters) {
            const mat = sp.material as THREE.ShaderMaterial;
            const origSx = sp.scale.x;
            const origSy = sp.scale.y;
            const start = performance.now();
            const tick = () => {
                const t = Math.min((performance.now() - start) / 800, 1);
                const intensity = t < 0.4 ? t / 0.4 : 1.0;
                mat.uniforms.u_intensity.value = intensity;
                const expand = 1 + intensity * 0.8;
                sp.scale.set(origSx * expand, origSy * expand, 1);
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }

        await this.delay(300);
        // Screen flash + heavy shake at scream peak
        this.spawnScreenFlash(500);
        this.shakeScenePromise(cardW, 600);
        await this.delay(700);

        // Specters dissolve outward
        for (const sp of specters) {
            const angle = Math.random() * Math.PI * 2;
            const speed = w * 0.4;
            new TWEEN.Tween(sp.position)
                .to({ x: sp.position.x + Math.cos(angle) * speed, y: sp.position.y + Math.sin(angle) * speed }, 400)
                .easing(TWEEN.Easing.Quadratic.In)
                .start();

            const mat = sp.material as THREE.ShaderMaterial;
            const startT = performance.now();
            const tick = () => {
                const t = Math.min((performance.now() - startT) / 400, 1);
                mat.uniforms.u_intensity.value = 1.0 - t;
                sp.scale.multiplyScalar(0.96);
                if (t < 1) {
                    requestAnimationFrame(tick);
                } else {
                    this.scene.remove(sp);
                    sp.geometry.dispose();
                    mat.dispose();
                }
            };
            requestAnimationFrame(tick);
        }
        await this.delay(500);
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
        this.scene.position.set(0, 0, 0);
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
        // CardSkillMotion.SKILL_POSITION_X = 0, SKILL_POSITION_Y = (0.5 - 0.78221649) * h
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

        this.scene.position.set(0, 0, 0);
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
                    c*=smoothstep(0.0,0.05,vUv.x)*(1.0-smoothstep(0.95,1.0,vUv.x));
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
        // Always return to origin (0,0) — not the current position, which may be mid-shake
        const steps = 12; const sd = duration / steps; const tweens: any[] = [];
        for (let i = 0; i < steps; i++) {
            const t = new TWEEN.Tween(this.scene.position).to({ x: (Math.random() * 2 - 1) * cardW / 8, y: (Math.random() * 2 - 1) * cardW / 8 }, sd).easing(TWEEN.Easing.Quadratic.InOut);
            if (i > 0) tweens[i - 1].chain(t); tweens.push(t);
        }
        tweens[steps - 1].chain(new TWEEN.Tween(this.scene.position).to({ x: 0, y: 0 }, sd).easing(TWEEN.Easing.Quadratic.InOut).onComplete(onDone));
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
