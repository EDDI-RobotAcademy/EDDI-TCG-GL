import * as THREE from 'three';

import {GuideMessageHudRendererV2} from "../common/guide_message/renderer/GuideMessageHudRendererV2";
import {createDefaultGuideMessageHudFrame} from "../common/guide_message/frame/GuideMessageHudFrame";
import {ViewportResize} from "../core/resize/ViewportResize";
import {LobbyMenuControl} from "./control/LobbyMenuControl";
import {LobbyMenuType} from "./entity/LobbyMenuType";
import {AudioController} from "../audio/AudioController";
import lobbyMusic from '@resource/music/lobby/lobby-menu.mp3';
import {RouteMap} from "../router/RouteMap";
import {Component} from "../router/Component";

// 로비 화면이다.
//
// **차리는 일만 한다.** 그리는 것도, 누름을 받는 것도, 창 크기를 따라가는 것도 메뉴를
// 다루는 자리가 가져갔다 (R2-131). 여기 남은 것은 장면·카메라·그리는 기계를 세우고,
// 소리를 걸고, 고른 메뉴를 어디로 보낼지 정하는 것뿐이다.
//
// 전투 화면과 같은 방식이다 — 값은 frame, THREE 물건은 renderer, 만들기·누름·크기 조절은
// control. 다음에 만드는 화면(레이드, 덱)이 이 셋을 보고 따라간다.
export class TCGMainLobbyView implements Component {
    private static instance: TCGMainLobbyView | null = null;

    private readonly scene: THREE.Scene;
    private readonly camera: THREE.OrthographicCamera;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly audioController: AudioController;

    // 창 크기가 바뀔 때 다시 재야 하는 것. 만드는 자리에서 바로 등록된다.
    private readonly onResize = new ViewportResize();
    // 화면을 떠날 때 떼야 하는 것.
    private readonly teardown: (() => void)[] = [];

    private readonly guideRenderer = new GuideMessageHudRendererV2();
    private readonly guideFrame = createDefaultGuideMessageHudFrame();
    private guideElement: HTMLElement | null = null;

    private initialized = false;
    private isAnimating = false;

    private constructor(
        private readonly lobbyContainer: HTMLElement,
        private readonly routeMap: RouteMap,
    ) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.lobbyContainer.appendChild(this.renderer.domElement);

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
        this.audioController.setMusic(lobbyMusic);

        this.listen(window, 'resize', () => this.applyViewportSize());
        this.listen(window, 'click', () => { void this.playMusic(); }, {once: true});
    }

    public static getInstance(lobbyContainer: HTMLElement, routeMap: RouteMap): TCGMainLobbyView {
        if (!TCGMainLobbyView.instance) {
            TCGMainLobbyView.instance = new TCGMainLobbyView(lobbyContainer, routeMap);
        }
        return TCGMainLobbyView.instance;
    }

    public async initialize(): Promise<void> {
        if (this.initialized) {
            this.show();
            return;
        }

        await LobbyMenuControl.build({
            scene: this.scene,
            camera: this.camera,
            onResize: this.onResize,
            listen: (target, type, handler) => this.listen(target, type, handler),
            canvasElement: this.renderer.domElement,
            onPick: (type) => this.goTo(type),
        });

        this.initialized = true;
        this.isAnimating = true;
        this.animate();
    }

    // 다시 들어왔다. **다시 만들지 않는다.**
    //
    // 전에는 여기서 단추를 새로 만들고 떠날 때 지웠다. 오갈 때마다 그림을 다시 읽고
    // 물건을 다시 만들었고, 누름 처리기도 그때마다 다시 붙였다. 한 번 만들고 보이기만
    // 바꾼다.
    public show(): void {
        this.renderer.domElement.style.display = 'block';
        this.lobbyContainer.style.display = 'block';
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

        // 로비를 떠날 때 안내 문구도 함께 치운다.
        if (this.guideElement) {
            this.guideRenderer.dispose(this.guideElement);
            this.guideElement.remove();
            this.guideElement = null;
        }

        this.renderer.domElement.style.display = 'none';
        this.lobbyContainer.style.display = 'none';
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

    // 고른 메뉴가 어디로 가는지는 화면이 안다. 메뉴를 다루는 자리는 무엇을 골랐는지만 알린다.
    private goTo(type: LobbyMenuType): void {
        switch (type) {
            case LobbyMenuType.Battle:
                // 상대를 찾는 화면이 아직 없다. 없는 길로 보내면 로비로 되돌아와서
                // 아무 일도 안 일어난 것처럼 보인다. 그래서 알려 준다.
                void this.showGuide('1대1 대전은 준비 중입니다.');
                return;
            case LobbyMenuType.Deck:
                // 덱 화면이 앱에 아직 없다. 보유 카드를 볼 유일한 길로 보낸다.
                // 덱이 붙으면 이 줄이 덱으로 바뀐다 (R2-136).
                this.routeMap.navigate('/tcg-my-card');
                return;
            case LobbyMenuType.Shop:
                this.routeMap.navigate('/tcg-card-shop');
                return;
            case LobbyMenuType.Raid:
                this.routeMap.navigate('/tcg-raid');
                return;
            case LobbyMenuType.TestBattle:
                this.routeMap.navigate('/tcg-simulation-battle-field');
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

    // 창 크기가 바뀌었다. 카메라와 그리는 기계를 맞추고, 등록된 것을 차례로 돌린다.
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

    private async playMusic(): Promise<void> {
        try {
            await this.audioController.playMusic();
        } catch (error) {
            console.error('Initial audio play failed:', error);
        }
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
