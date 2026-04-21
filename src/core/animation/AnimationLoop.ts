import * as THREE from 'three';
import { RendererManager } from '../renderer/RendererManager';
import { SceneManager } from '../scene/SceneManager';
import { CameraManager } from '../camera/CameraManager';

export class AnimationLoop {
    private isRunning: boolean = false;
    private animationFrameId: number | null = null;
    private clock: THREE.Clock;
    private customUpdateCallback: ((delta: number, elapsedTime: number) => void) | null = null;
    // Optional render-path override. When set, called INSTEAD of the default single-pass
    // renderer.render(scene, camera) — lets effects (e.g. doom-contract warp) render the
    // scene to a target, apply a screen-space shader, and draw overlays on top.
    private renderOverride: ((scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => void) | null = null;

    constructor(
        private rendererManager: RendererManager,
        private sceneManager: SceneManager,
        private cameraManager: CameraManager
    ) {
        this.clock = new THREE.Clock();
    }

    public start(): void {
        if (this.isRunning) {
            console.warn('AnimationLoop is already running');
            return;
        }

        this.isRunning = true;
        this.clock.start();
        this.animate();
        console.log('AnimationLoop started');
    }

    public stop(): void {
        if (!this.isRunning) {
            console.warn('AnimationLoop is not running');
            return;
        }

        this.isRunning = false;

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.clock.stop();
        console.log('AnimationLoop stopped');
    }

    public setCustomUpdate(callback: (delta: number, elapsedTime: number) => void): void {
        this.customUpdateCallback = callback;
    }

    public setRenderOverride(
        fn: ((scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => void) | null,
    ): void {
        this.renderOverride = fn;
    }

    private animate = (time?: number): void => {
        if (!this.isRunning) {
            return;
        }

        this.animationFrameId = requestAnimationFrame(this.animate);

        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // 커스텀 업데이트 로직 실행
        if (this.customUpdateCallback) {
            this.customUpdateCallback(delta, elapsedTime);
        }

        // 기본 업데이트 로직
        this.update(delta, elapsedTime);

        // 렌더링
        this.render();
    }

    private update(delta: number, elapsedTime: number): void {
        // 기본 업데이트 로직
    }

    private render(): void {
        const scene = this.sceneManager.getActiveScene();
        const camera = this.cameraManager.getActiveCamera();
        const renderer = this.rendererManager.getRenderer();

        if (!scene || !camera) {
            console.warn('Scene or Camera is not available for rendering');
            return;
        }

        if (this.renderOverride) {
            this.renderOverride(scene, camera, renderer);
        } else {
            renderer.render(scene, camera);
        }
    }

    public isActive(): boolean {
        return this.isRunning;
    }

    public getElapsedTime(): number {
        return this.clock.getElapsedTime();
    }

    public getDelta(): number {
        return this.clock.getDelta();
    }
}