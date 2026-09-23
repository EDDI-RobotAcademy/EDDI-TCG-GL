import * as THREE from 'three';

import {ViewportResize} from "../core/resize/ViewportResize";
import {RaidPlaceholderControl} from "./control/RaidPlaceholderControl";
import {RouteMap} from "../router/RouteMap";
import {Component} from "../router/Component";

// 레이드 화면이다.
//
// **아직 준비 중이다.** 무엇을 하는 화면인지 안 정했으므로 자리만 만들어 둔다 — 메뉴
// 다섯이 갖춰지고, 누르면 갈 데가 있고, 다음에 기능을 붙일 자리가 정해진다.
//
// 로비와 같은 방식이다 (R2-131) — 값은 frame, THREE 물건은 renderer, 만들기·누름·크기
// 조절은 control, 화면은 차리는 일만. 실제 레이드 기능은 이 넷 위에 얹는다.
export class TCGRaidView implements Component {
    private static instance: TCGRaidView | null = null;

    private readonly scene: THREE.Scene;
    private readonly camera: THREE.OrthographicCamera;
    private readonly renderer: THREE.WebGLRenderer;

    private readonly onResize = new ViewportResize();
    private readonly teardown: (() => void)[] = [];

    private initialized = false;
    private isAnimating = false;

    private constructor(
        private readonly container: HTMLElement,
        private readonly routeMap: RouteMap,
    ) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101014);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -aspect * viewSize / 2, aspect * viewSize / 2,
            viewSize / 2, -viewSize / 2,
            0.1, 1000,
        );
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

        this.listen(window, 'resize', () => this.applyViewportSize());
    }

    public static getInstance(container: HTMLElement, routeMap: RouteMap): TCGRaidView {
        if (!TCGRaidView.instance) {
            TCGRaidView.instance = new TCGRaidView(container, routeMap);
        }
        return TCGRaidView.instance;
    }

    public async initialize(): Promise<void> {
        if (this.initialized) {
            this.show();
            return;
        }

        await RaidPlaceholderControl.build({
            scene: this.scene,
            onResize: this.onResize,
            listen: (target, type, handler) => this.listen(target, type, handler),
            canvasElement: this.renderer.domElement,
            onLeave: () => this.routeMap.navigate('/tcg-main-lobby'),
        });

        this.initialized = true;
        this.isAnimating = true;
        this.animate();
    }

    // 다시 들어왔다. 다시 만들지 않는다 (로비에서 겪은 것 — R2-131).
    public show(): void {
        this.renderer.domElement.style.display = 'block';
        this.container.style.display = 'block';
        for (const child of this.scene.children) child.visible = true;

        if (!this.initialized) {
            void this.initialize();
            return;
        }
        this.isAnimating = true;
        this.animate();
    }

    public hide(): void {
        this.isAnimating = false;
        this.renderer.domElement.style.display = 'none';
        this.container.style.display = 'none';
        for (const child of this.scene.children) child.visible = false;
    }

    public animate(): void {
        if (!this.isAnimating) return;
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    public dispose(): void {
        for (const off of this.teardown) off();
        this.teardown.length = 0;
    }

    private applyViewportSize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;
        const viewSize = height;

        this.camera.left = -aspect * viewSize / 2;
        this.camera.right = aspect * viewSize / 2;
        this.camera.top = viewSize / 2;
        this.camera.bottom = -viewSize / 2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        this.onResize.apply(width, height);
    }

    private listen(
        target: Window | Document | HTMLElement,
        type: string,
        handler: (event: never) => void,
        options?: AddEventListenerOptions,
    ): void {
        const listener = handler as EventListener;
        target.addEventListener(type, listener, options);
        this.teardown.push(() => target.removeEventListener(type, listener, options));
    }
}
