import * as THREE from 'three';

import {GuideMessageHudRendererV2} from "../common/guide_message/renderer/GuideMessageHudRendererV2";
import {createDefaultGuideMessageHudFrame} from "../common/guide_message/frame/GuideMessageHudFrame";
import {ViewportResize} from "../core/resize/ViewportResize";
import {ShopMenuControl} from "./control/ShopMenuControl";
import {ShopDrawControl} from "./control/ShopDrawControl";
import {LocalCardDraw} from "./draw/LocalCardDraw";
import {ShopMenuType} from "./entity/ShopMenuType";
import {AudioController} from "../audio/AudioController";
import shopMusic from '@resource/music/shop/card-shop.mp3';
import {Navigator} from "../router/Navigator";
import {Component} from "../router/Component";

// 상점 화면이다.
//
// **차리는 일만 한다.** 그리는 것도, 누름을 받는 것도, 창 크기를 따라가는 것도 상점 메뉴를
// 다루는 자리가 가져갔다 (R2-133). 로비·레이드와 같은 방식이다.
//
// 카드를 실제로 사는 일은 아직 없다. 뽑기를 누르면 준비 중임을 알린다 (R2-136 에서 붙인다).
export class TCGCardShopView implements Component {
    private static instance: TCGCardShopView | null = null;

    private readonly scene: THREE.Scene;
    private readonly camera: THREE.OrthographicCamera;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly audioController: AudioController;

    private readonly onResize = new ViewportResize();
    private readonly teardown: (() => void)[] = [];

    private readonly guideRenderer = new GuideMessageHudRendererV2();
    private readonly guideFrame = createDefaultGuideMessageHudFrame();
    private guideElement: HTMLElement | null = null;

    // 카드를 뽑는 일. 무엇이 뽑히는지는 이쪽이 묻고 받는다.
    private drawControl: ShopDrawControl | null = null;

    private initialized = false;
    private isAnimating = false;

    private constructor(
        private readonly shopContainer: HTMLElement,
        private readonly routeMap: Navigator,
    ) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.shopContainer.appendChild(this.renderer.domElement);

        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -aspect * viewSize / 2, aspect * viewSize / 2,
            viewSize / 2, -viewSize / 2,
            0.1, 1000,
        );
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

        this.audioController = AudioController.getInstance();

        this.listen(window, 'resize', () => this.applyViewportSize());
    }

    public static getInstance(shopContainer: HTMLElement, routeMap: Navigator): TCGCardShopView {
        if (!TCGCardShopView.instance) {
            TCGCardShopView.instance = new TCGCardShopView(shopContainer, routeMap);
        }
        return TCGCardShopView.instance;
    }

    public async initialize(): Promise<void> {
        if (this.initialized) {
            this.show();
            return;
        }

        // 뽑기 화면 둘(확인, 결과)을 다루는 자리. 메뉴보다 먼저 세운다 — 메뉴 누름이
        // 이쪽이 떠 있는지 물어봐야 한다.
        this.drawControl = ShopDrawControl.build({
            scene: this.scene,
            camera: this.camera,
            onResize: this.onResize,
            listen: (target, type, handler) => this.listen(target, type, handler),
            canvasElement: this.renderer.domElement,
            // 지금은 이 안에서 굴린다. 서버가 붙으면 서버에 묻는 것으로 바꿔 끼운다.
            cardDraw: new LocalCardDraw(),
            announce: (message) => void this.showGuide(message),
        });

        await ShopMenuControl.build({
            scene: this.scene,
            camera: this.camera,
            onResize: this.onResize,
            listen: (target, type, handler) => this.listen(target, type, handler),
            canvasElement: this.renderer.domElement,
            onPick: (type) => this.onPick(type),
            isBlocked: () => this.drawControl?.isOpen() ?? false,
        });

        this.initialized = true;
        this.isAnimating = true;
        this.animate();
    }

    // 다시 들어왔다. 다시 만들지 않는다 (로비에서 겪은 것 — R2-131).
    public show(): void {
        // 이 화면의 음악을 여기서 건다. 만들 때 걸면 돌아올 때 다시 안 걸린다.
        this.audioController.playForScreen(shopMusic);

        this.renderer.domElement.style.display = 'block';
        this.shopContainer.style.display = 'block';
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

        // 상점을 떠날 때 안내 문구도 함께 치운다.
        if (this.guideElement) {
            this.guideRenderer.dispose(this.guideElement);
            this.guideElement.remove();
            this.guideElement = null;
        }

        this.renderer.domElement.style.display = 'none';
        this.shopContainer.style.display = 'none';
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

    private onPick(type: ShopMenuType): void {
        switch (type) {
            case ShopMenuType.DrawAll:
            case ShopMenuType.DrawUndead:
            case ShopMenuType.DrawTrent:
            case ShopMenuType.DrawHuman:
                void this.drawControl?.openConfirm(type);
                return;
            case ShopMenuType.ToLobby:
                this.routeMap.navigate('/tcg-main-lobby');
                return;
            case ShopMenuType.ToMyCard:
                this.routeMap.navigate('/tcg-my-card');
                return;
        }
    }

    // 안내 문구를 띄운다. 처음 부를 때 만든다.
    private async showGuide(message: string): Promise<void> {
        if (!this.guideElement) {
            this.guideElement = await this.guideRenderer.build(this.guideFrame);
            document.body.appendChild(this.guideElement);
        }
        this.guideRenderer.show(this.guideElement, message, 3000);
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
