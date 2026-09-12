import * as THREE from "three";

import {moveCard, CardMoveEasing, CardMovePoint} from "../../../animation/motion/CardMove";
import {installTween} from "../../../core/tween/Tween";

declare const TWEEN: { Tween: any; Easing: any; update: (time?: number) => void };

// 값 바꾸기를 얹는다. 화면마다 index.html 이 받아 오던 것을 꾸러미에서 가져온다.
installTween();

// 어느 연출에나 쓰이는 바탕이다.
//
// 기다리기, 사라지며 치우기, 카드 옮기기, 화면 흔들기, 번쩍임.
// 공격 연출과 광역기 연출이 함께 쓴다. 한쪽에 두면 다른 쪽이 그쪽을 알아야 한다.
export class AnimationBasics {
    // 흔드는 것이 화면을 움직인다. 화면이 바뀌면 여기도 바꿔 준다.
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public setScene(scene: THREE.Scene): void {
        this.scene = scene;
    }

    public delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public fadeAndDispose(mesh: THREE.Mesh, mat: THREE.ShaderMaterial, geo: THREE.BufferGeometry, duration: number): void {
        const start = performance.now();
        const tick = () => {
            const t = Math.min((performance.now() - start) / duration, 1);
            mat.uniforms.u_time.value = t;
            if (t < 1) requestAnimationFrame(tick);
            // 붙어 있는 곳에서 뺀다. 연출을 한 겹으로 묶어 두면 그 겹에서 빼야 하므로
            // 화면에서 빼는 것으로 정해 두면 안 빠진다.
            else { mesh.removeFromParent(); geo.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(tick);
    }

    public moveCardTo(group: THREE.Group, x: number, y: number, z: number, duration: number): Promise<void> {
        return moveCard(group, { x, y, z }, duration, CardMoveEasing.inOut);
    }

    // 갈 곳을 가는 내내 다시 묻는다. 창 크기가 바뀌면 갈 곳도 달라지는 자리에 쓴다.
    public moveCardToLive(group: THREE.Group, to: () => CardMovePoint, duration: number): Promise<void> {
        return moveCard(group, to, duration, CardMoveEasing.inOut);
    }

    // 화면을 흔든다.
    //
    // 두 공격이 같이 돌면 흔들기도 겹친다. 먼저 끝난 쪽이 화면을 제자리로 돌려 버리면
    // 아직 흔드는 쪽이 뚝 끊긴다. 그래서 지금 몇 개가 흔드는지 세고, 마지막 하나가
    // 끝날 때만 제자리로 돌린다.
    private static shaking = 0;

    public shakeScene(cardW: number, duration: number, onDone: () => void): void {
        AnimationBasics.shaking += 1;
        const steps = 12; const sd = duration / steps; const tweens: any[] = [];
        for (let i = 0; i < steps; i++) {
            const t = new TWEEN.Tween(this.scene.position).to({ x: (Math.random() * 2 - 1) * cardW / 8, y: (Math.random() * 2 - 1) * cardW / 8 }, sd).easing(TWEEN.Easing.Quadratic.InOut);
            if (i > 0) tweens[i - 1].chain(t); tweens.push(t);
        }
        const scene = this.scene;
        tweens[steps - 1].chain(
            new TWEEN.Tween(scene.position)
                .to({ x: 0, y: 0 }, sd)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    AnimationBasics.shaking -= 1;
                    // 아직 흔드는 것이 남아 있으면 제자리로 돌리지 않는다.
                    if (AnimationBasics.shaking > 0) { onDone(); return; }
                    scene.position.set(0, 0, 0);
                    onDone();
                }),
        );
        tweens[0].start();
    }

    public shakeScenePromise(cardW: number, duration: number): void {
        this.shakeScene(cardW, duration, () => {});
    }

    // 연출이 끝나면서 화면을 제자리로 돌린다.
    //
    // 다른 연출이 아직 흔드는 중이면 돌리지 않는다. 돌리면 그쪽이 뚝 끊긴다.
    public restoreScenePosition(): void {
        if (AnimationBasics.shaking > 0) return;
        this.scene.position.set(0, 0, 0);
    }

    public spawnScreenFlash(duration: number): void {
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
}
