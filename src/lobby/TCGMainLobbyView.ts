import * as THREE from 'three';
import {GuideMessageHudRendererV2} from "../common/guide_message/renderer/GuideMessageHudRendererV2";
import {createDefaultGuideMessageHudFrame} from "../common/guide_message/frame/GuideMessageHudFrame";
import { TextureManager } from "../texture_manager/TextureManager";
import { NonBackgroundImage } from "../shape/image/NonBackgroundImage";
import { LobbyButtonConfigList } from "./LobbyButtonConfigList";
import { LobbyButtonType } from "./LobbyButtonType";
import { AudioController } from "../audio/AudioController";
import lobbyMusic from '@resource/music/lobby/lobby-menu.mp3';
import { MouseController } from "../mouse/MouseController";
import { RouteMap } from "../router/RouteMap";
import { Component } from "../router/Component";

export class TCGMainLobbyView implements Component {
    private static instance: TCGMainLobbyView | null = null;

    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private textureManager: TextureManager;
    private lobbyContainer: HTMLElement;
    private background: NonBackgroundImage | null = null;
    private buttons: NonBackgroundImage[] = [];
    private buttonInitialInfo: Map<string, { positionPercent: THREE.Vector2, widthPercent: number, heightPercent: number }> = new Map();
    private audioController: AudioController;
    private mouseController: MouseController;
    private routeMap: RouteMap;

    // 아직 못 가는 곳을 눌렀을 때 알려 준다.
    private readonly guideRenderer = new GuideMessageHudRendererV2();
    private readonly guideFrame = createDefaultGuideMessageHudFrame();
    private guideElement: HTMLElement | null = null;

    private initialized = false;
    private isAnimating = false;

    constructor(lobbyContainer: HTMLElement, routeMap: RouteMap) {
        this.lobbyContainer = lobbyContainer;
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
            0.1, 1000
        );
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

        this.textureManager = TextureManager.getInstance();
        this.audioController = AudioController.getInstance();
        this.audioController.setMusic(lobbyMusic);

        window.addEventListener('resize', this.onWindowResize.bind(this));

        // this.mouseController = MouseController.getInstance(this.camera, this.scene);
        this.mouseController = new MouseController(this.camera, this.scene);
        this.routeMap = routeMap;

        window.addEventListener('click', () => this.initializeAudio(), { once: true });
    }

    public static getInstance(lobbyContainer: HTMLElement, routeMap: RouteMap): TCGMainLobbyView {
        if (!TCGMainLobbyView.instance) {
            TCGMainLobbyView.instance = new TCGMainLobbyView(lobbyContainer, routeMap);
        }
        return TCGMainLobbyView.instance;
    }

    private async initializeAudio(): Promise<void> {
        try {
            await this.audioController.playMusic();
        } catch (error) {
            console.error('Initial audio play failed:', error);
        }
    }

    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('Already initialized');
            this.show();
            return;
        }

        console.log('TCGMainLobbyView initialize() operate!!!');
        await this.textureManager.preloadTextures("image-paths.json");

        console.log("Textures preloaded. Adding background and buttons...");

        this.addBackground();
        this.addButtons();
        this.initialized = true;
        this.isAnimating = true;
        this.animate();
    }

    public show(): void {
        console.log('Showing TCGMainLobbyView...');
        this.renderer.domElement.style.display = 'block';
        this.lobbyContainer.style.display = 'block';
        this.isAnimating = true;

        this.mouseController.clearButtons();

        this.scene.children.forEach(child => {
            child.visible = true;
        });

        if (!this.initialized) {
            this.initialize();
        } else {
            this.addButtons(); // 버튼을 다시 생성하는 메서드 호출

            this.animate();
            this.registerEventHandlers()
        }
    }

    private registerEventHandlers(): void {
        this.buttons.forEach((button, index) => {
            const config = LobbyButtonConfigList.buttonConfigs[index];
            this.mouseController.registerButton(button.getMesh(), this.onButtonClick.bind(this, config.type));
        });
    }

    public hide(): void {
        console.log('Hiding TCGMainLobbyView...');
        this.isAnimating = false;

        // 로비를 떠날 때 안내 문구도 함께 치운다.
        if (this.guideElement) {
            this.guideRenderer.dispose(this.guideElement);
            this.guideElement.remove();
            this.guideElement = null;
        }

        this.renderer.domElement.style.display = 'none';
        this.lobbyContainer.style.display = 'none';

        this.buttons.forEach(button => {
            this.mouseController.unregisterButton(button.getMesh());
            button.getMesh().removeFromParent(); // 씬에서 버튼 완전 제거
        });

        this.mouseController.clearButtons();

        this.buttons = [];

        this.scene.children.forEach(child => {
            child.visible = false;
        });
    }

    private async addBackground(): Promise<void> {
        const texture = await this.textureManager.getTexture('main_lobby_background', 1);
        console.log('addBackground():', texture);
        if (texture) {
            if (!this.background) {
                this.background = new NonBackgroundImage(
                    window.innerWidth,
                    window.innerHeight,
                    new THREE.Vector2(0, 0)
                );
            }
            this.background.createNonBackgroundImageWithTexture(texture, 1, 1);
            this.background.draw(this.scene);
        } else {
            console.error("Background texture not found.");
        }
    }

    private async addButtons(): Promise<void> {
        await Promise.all(LobbyButtonConfigList.buttonConfigs.map(async (config) => {
            const buttonTexture = await this.textureManager.getTexture('main_lobby_buttons', config.id);
            if (buttonTexture) {
                const widthPercent = 800 / 1920;  // 기준 화면 크기의 퍼센트로 버튼 크기를 정의
                const heightPercent = 100 / 1080;
                const positionPercent = new THREE.Vector2(config.position.x / 1920, config.position.y / 1080);

                const button = new NonBackgroundImage(
                    window.innerWidth * widthPercent,
                    window.innerHeight * heightPercent,
                    new THREE.Vector2(
                        window.innerWidth * positionPercent.x,
                        window.innerHeight * positionPercent.y
                    )
                );
                button.createNonBackgroundImageWithTexture(buttonTexture, 1, 1);
                button.draw(this.scene);

                this.buttons.push(button);
                this.buttonInitialInfo.set(button.getMesh()?.uuid ?? '', { positionPercent, widthPercent, heightPercent });

                this.mouseController.registerButton(button.getMesh(), this.onButtonClick.bind(this, config.type));
            } else {
                console.error("Button texture not found.");
            }
        }));
    }

    private onButtonClick(type: LobbyButtonType): void {
        console.log('Button clicked:', type);
        switch (type) {
            case LobbyButtonType.OneVsOne:
                // 상대를 찾는 화면이 아직 없다. 없는 길로 보내면 로비로 되돌아와서
                // 아무 일도 안 일어난 것처럼 보인다. 그래서 알려 준다.
                void this.showGuide('1대1 대전은 준비 중입니다.');
                break;
            case LobbyButtonType.MyCards:
                this.routeMap.navigate("/tcg-my-card");
                break;
            case LobbyButtonType.Shop:
                console.log('Navigating to /tcg-card-shop')
                this.routeMap.navigate("/tcg-card-shop");
                break;
            case LobbyButtonType.Test:
                this.routeMap.navigate("/tcg-simulation-battle-field");
                break;
            default:
                console.error("Unknown button type:", type);
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

    private onWindowResize(): void {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        const aspect = newWidth / newHeight;
        const viewSize = newHeight;

        this.camera.left = -aspect * viewSize / 2;
        this.camera.right = aspect * viewSize / 2;
        this.camera.top = viewSize / 2;
        this.camera.bottom = -viewSize / 2;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(newWidth, newHeight);

        if (this.background) {
            const scaleX = newWidth / this.background.getWidth();
            const scaleY = newHeight / this.background.getHeight();
            this.background.setScale(scaleX, scaleY);
        }

        this.buttons.forEach(button => {
            const initialInfo = this.buttonInitialInfo.get(button.getMesh()?.uuid ?? '');
            if (initialInfo) {
                const newWidth = window.innerWidth * initialInfo.widthPercent;
                const newHeight = window.innerHeight * initialInfo.heightPercent;
                const newPosition = new THREE.Vector2(
                    window.innerWidth * initialInfo.positionPercent.x,
                    window.innerHeight * initialInfo.positionPercent.y
                );

                button.setPosition(newPosition.x, newPosition.y);
                button.setScale(newWidth / button.getWidth(), newHeight / button.getHeight());
            }
        });
    }

    public animate(): void {
        if (this.isAnimating) {
            // console.log('Animating frame...'); // 애니메이션 루프가 제대로 동작하는지 확인
            requestAnimationFrame(() => this.animate());
            this.renderer.render(this.scene, this.camera);
        } else {
            console.log('TCGMainLobby: Animation stopped.'); // 애니메이션 루프가 멈추는지 확인
        }
    }
}

