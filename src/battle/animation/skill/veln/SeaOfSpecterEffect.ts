import * as THREE from "three";

import {BattleFieldConstants} from "../../../../common/BattleFieldConstants";
import {createCardSkillPositionFrame} from "../../../../animation/skill/frame/CardSkillPositionFrame";
import {AnimationBasics} from "../../common/AnimationBasics";
import {installTween} from "../../../../core/tween/Tween";

declare const TWEEN: { Tween: any; Easing: any; update: (time?: number) => void };

installTween();

const CWR = BattleFieldConstants.CARD_WIDTH_RATIO;

// 영혼 수확자 벨른의 광역기다. 마법진에서 망령들이 나와 화면을 훑고 얼린다.
//
// 전에는 일반 공격과 한 파일에 있었다. 그 파일이 2,298 줄이었는데 그중 985 줄이
// 이 카드 하나의 것이었다. 카드마다 연출이 붙으면 그 파일이 계속 커진다.
//
// 어느 연출에나 쓰이는 것은 AnimationBasics 가 든다.
export class SeaOfSpecterEffect {
    private scene: THREE.Scene;
    private readonly basics: AnimationBasics;
    private animating = false;

    // 이 연출이 그리는 것을 전부 담는 겹.
    //
    // 연출은 시작할 때 창 크기를 재서 그림의 크기와 자리를 정하고, 도는 동안 다시 재지
    // 않는다. 도중에 창이 바뀌면 연출만 옛 크기로 남는다. 그리는 자리마다 고치는 대신
    // 전부 이 겹에 담아 두고, 겹 하나를 창 크기에 맞춰 늘리거나 줄인다.
    //
    // 자리는 전부 [화면 가운데에서 창 크기의 몇 분의 얼마] 로 잡혀 있어서, 겹을 가로세로
    // 비율만큼 늘리면 새로 그린 것과 같은 자리에 온다.
    private readonly root = new THREE.Group();
    private builtWidth = 0;
    private builtHeight = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.basics = new AnimationBasics(scene);
        this.scene.add(this.root);
    }

    public setScene(scene: THREE.Scene): void {
        this.root.removeFromParent();
        this.scene = scene;
        this.basics.setScene(scene);
        this.scene.add(this.root);
    }

    // 창 크기가 바뀌었을 때. 도는 중이 아니면 할 일이 없다.
    public resize(viewportWidth: number, viewportHeight: number): void {
        if (!this.animating) return;
        if (this.builtWidth <= 0 || this.builtHeight <= 0) return;
        this.root.scale.set(
            viewportWidth / this.builtWidth,
            viewportHeight / this.builtHeight,
            1,
        );
    }

    public isAnimating(): boolean {
        return this.animating;
    }

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

    // home 을 주면 그것을 돌아갈 자리로 쓴다. 연출이 도는 동안 창 크기가 바뀌면 카드의
    // 제자리도 달라지는데, 나갈 때 적어 둔 자리로 돌아가면 엉뚱한 데 선다. 제자리를 아는
    // 쪽이 이 값을 고쳐 주면 연출은 돌아갈 때 그 값을 다시 읽는다.
    public async play(attackerGroup: THREE.Group, home?: THREE.Vector3): Promise<void> {
        if (this.animating) return;
        this.animating = true;
        const cardW = CWR * window.innerWidth;
        const w = window.innerWidth;
        const h = window.innerHeight;

        // 이번 연출을 어떤 크기로 그렸는지 적어 둔다. 도중에 창이 바뀌면 이것과 견준다.
        this.builtWidth = w;
        this.builtHeight = h;
        this.root.scale.set(1, 1, 1);

        const { x: skillPositionX, y: skillPositionY } = createCardSkillPositionFrame(h);
        const origPos = home ?? attackerGroup.position.clone();

        // Phase 1: Card moves to skill panel
        await this.basics.moveCardTo(attackerGroup, skillPositionX, skillPositionY, origPos.z + 1, 800);

        // Phase 2: Darkness gathering — the caster draws power from the abyss
        attackerGroup.updateMatrixWorld(true);
        const casterWorld = attackerGroup.getWorldPosition(new THREE.Vector3());

        // Stage 1: Darkness condenses — slow, ominous
        const darkAura = this.createDarkCondenseAura(casterWorld, cardW);
        this.root.add(darkAura);
        // Screen edges darken slightly — darkness creeping inward
        const edgeDarken = this.createEdgeDarken(w, h);
        this.root.add(edgeDarken);

        this.basics.shakeScenePromise(cardW * 0.05, 800);
        await this.basics.delay(600);

        // Stage 2: Magic circle ignites
        const magicCircle = this.createMagicCircle(casterWorld, cardW);
        this.root.add(magicCircle);
        this.spawnColdWavePulse(casterWorld, cardW, 0);

        this.basics.shakeScenePromise(cardW * 0.1, 600);
        await this.basics.delay(500);

        // Stage 3: Dark energy surges — vortex + beams erupt
        this.spawnDarkVortex(casterWorld, cardW, 3500);
        this.spawnDarkBeams(casterWorld, cardW);
        this.spawnColdWavePulse(casterWorld, cardW, 100);

        this.basics.shakeScenePromise(cardW * 0.2, 600);
        await this.basics.delay(600);

        // Stage 4: Power escalation — ground cracks, stronger shaking
        this.spawnGroundCracks(casterWorld, cardW);
        this.spawnDarkBeams(casterWorld, cardW);
        this.spawnColdWavePulse(casterWorld, cardW, 0);
        this.spawnColdWavePulse(casterWorld, cardW * 1.2, 200);

        this.basics.shakeScenePromise(cardW * 0.4, 600);
        await this.basics.delay(600);

        // Stage 5: Near-critical — darkness pulses violently
        this.spawnGroundCracks(casterWorld, cardW * 1.3);
        this.spawnDarkBeams(casterWorld, cardW);
        this.spawnColdWavePulse(casterWorld, cardW * 1.5, 0);

        this.basics.shakeScenePromise(cardW * 0.7, 500);
        await this.basics.delay(500);

        // Stage 6: CLIMAX — maximum power, screen engulfed
        this.basics.spawnScreenFlash(250);
        this.spawnColdWavePulse(casterWorld, cardW * 2.0, 0);
        this.basics.shakeScenePromise(cardW * 1.2, 400);
        await this.basics.delay(200);
        this.basics.spawnScreenFlash(200);
        this.spawnDarkBeams(casterWorld, cardW);
        this.basics.shakeScenePromise(cardW * 1.5, 500);
        await this.basics.delay(300);

        this.basics.fadeAndDispose(magicCircle, magicCircle.material as THREE.ShaderMaterial, magicCircle.geometry, 400);
        this.basics.fadeAndDispose(darkAura, darkAura.material as THREE.ShaderMaterial, darkAura.geometry, 500);
        this.basics.fadeAndDispose(edgeDarken, edgeDarken.material as THREE.ShaderMaterial, edgeDarken.geometry, 600);

        // Phase 3: Progressive darkening — overlaps with magic circle fade
        const darken = this.createProgressiveDarken();
        this.root.add(darken);
        await this.animateProgressiveDarken(darken, 600);

        // Phase 4: Dementors fly — no gap after darken
        const dementors = this.spawnFlyingDementors(3, w, h);
        await this.basics.delay(5500);

        // Phase 5: ALL 3 drift off screen
        await this.dementorsFlyAway(dementors, 0, 1400);

        // Phase 5.5: Brief tension
        await this.basics.delay(600);

        // Phase 6: NEW dementor LUNGES from off-screen — jumpscare
        const lastOne = this.spawnSoulKissDementor(w, h);
        if (lastOne) {
            await this.dementorSoulKiss(lastOne, w, h, 2000);
        }

        // Cleanup
        for (const d of dementors) {
            if (d.parent) { d.removeFromParent(); d.geometry.dispose(); (d.material as THREE.ShaderMaterial).dispose(); }
        }
        this.basics.fadeAndDispose(darken, darken.material as THREE.ShaderMaterial, darken.geometry, 600);
        await this.basics.delay(400);

        await this.basics.moveCardTo(attackerGroup, origPos.x, origPos.y, origPos.z, 800);
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
            this.root.add(mesh);

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
                else { mesh.removeFromParent(); geo.dispose(); mat.dispose(); }
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
            this.root.add(mesh);
            this.basics.fadeAndDispose(mesh, mat, geo, 800);
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
            this.root.add(mesh);
            this.basics.fadeAndDispose(mesh, mat, geo, 1200);
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
                this.root.add(mesh);
                this.basics.fadeAndDispose(mesh, mat, geo, 800);
            }, i * 200);
        }
    }

    // Mixed specter types: swooshers (fast), drifters (slow), divers (top-down)

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
            this.root.add(mesh);
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
                        dm.removeFromParent();
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
        this.root.add(mesh);
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
        this.basics.shakeScenePromise(w * CWR * 1.0, 400);
        this.basics.spawnScreenFlash(250);
        mat.uniforms.u_intensity.value = 1.0;

        // Phase B: Freeze — face fills screen, eyes burning, 공포의 순간 (600ms)
        // Frost creeps in during this freeze
        const frostMesh = this.createFrostOverlay(w, h);
        this.root.add(frostMesh);
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
        this.root.add(soulStream);
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
        soulStream.removeFromParent();
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
        this.root.add(fadeMesh);

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
        if (dm.parent) { dm.removeFromParent(); dm.geometry.dispose(); mat.dispose(); }

        // Phase F: Hold darkness briefly, then fade out — return to reality
        await this.basics.delay(500);

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

        fadeMesh.removeFromParent();
        fadeGeo.dispose();
        fadeMat.dispose();
        await this.basics.delay(200);
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
            else { mesh.removeFromParent(); mesh.geometry.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(tick);
    }
}
