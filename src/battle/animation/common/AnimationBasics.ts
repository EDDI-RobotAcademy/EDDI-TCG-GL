import * as THREE from "three";

import {moveCard, CardMoveEasing} from "../../../animation/motion/CardMove";
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
            else { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(tick);
    }

    public moveCardTo(group: THREE.Group, x: number, y: number, z: number, duration: number): Promise<void> {
        return moveCard(group, { x, y, z }, duration, CardMoveEasing.inOut);
    }

    public shakeScene(cardW: number, duration: number, onDone: () => void): void {
        // Always return to origin (0,0) — not the current position, which may be mid-shake
        const steps = 12; const sd = duration / steps; const tweens: any[] = [];
        for (let i = 0; i < steps; i++) {
            const t = new TWEEN.Tween(this.scene.position).to({ x: (Math.random() * 2 - 1) * cardW / 8, y: (Math.random() * 2 - 1) * cardW / 8 }, sd).easing(TWEEN.Easing.Quadratic.InOut);
            if (i > 0) tweens[i - 1].chain(t); tweens.push(t);
        }
        tweens[steps - 1].chain(new TWEEN.Tween(this.scene.position).to({ x: 0, y: 0 }, sd).easing(TWEEN.Easing.Quadratic.InOut).onComplete(onDone));
        tweens[0].start();
    }

    public shakeScenePromise(cardW: number, duration: number): void {
        this.shakeScene(cardW, duration, () => {});
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
