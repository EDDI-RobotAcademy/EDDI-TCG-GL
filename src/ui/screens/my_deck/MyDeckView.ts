import * as THREE from 'three';

import myDeckMusic from '@resource/music/my_card/my-card.mp3';
import {SceneManager} from "../../../core/scene/SceneManager";
import {RendererManager} from "../../../core/renderer/RendererManager";
import {CameraManager} from "../../../core/camera/CameraManager";
import {InputManager} from "../../../input/InputManager";
import {AnimationLoop} from "../../../core/animation/AnimationLoop";
import {AnimationHandler} from "../../../animation/handler/AnimationHandler";
import {MyDeckController} from "../../../game/my_deck/MyDeckController";
import {AudioController} from "../../../audio/AudioController";
import {TextureManager} from "../../../texture_manager/TextureManager";
import {UserWindowSize} from "../../../window_size/WindowSize";
import {BackgroundServiceImpl} from "../../../background/service/BackgroundServiceImpl";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

export class MyDeckView {
    private static instance: MyDeckView | null = null;

    private sceneManager: SceneManager;
    private rendererManager: RendererManager;
    private cameraManager: CameraManager;
    private inputManager: InputManager;
    private animationLoop: AnimationLoop;
    private animationHandler: AnimationHandler;
    private myDeckController: MyDeckController;

    private audioController: AudioController;
    private textureManager: TextureManager;
    private userWindowSize: UserWindowSize;

    private initialized = false;
    private isAnimating = false;

    private constructor(private container: HTMLElement) {
        // Core managers 초기화
        this.sceneManager = new SceneManager();
        this.rendererManager = new RendererManager(container);
        this.cameraManager = CameraManager.getInstance();
        this.inputManager = new InputManager();
        this.userWindowSize = UserWindowSize.getInstance();

        // 카메라 생성
        const aspectRatio = window.innerWidth / window.innerHeight;
        const viewSize = window.innerHeight;
        const camera = this.cameraManager.createAndSetActiveCamera(aspectRatio, viewSize);

        // Scene 생성
        const scene = this.sceneManager.createScene('my-deck');
        const renderer = this.rendererManager.getRenderer();
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        // AnimationHandler 초기화
        this.animationHandler = AnimationHandler.initialize(camera, scene, renderer);

        // Audio 초기화
        this.audioController = AudioController.getInstance();
        this.audioController.setMusic(myDeckMusic);

        // Texture manager 초기화
        this.textureManager = TextureManager.getInstance();

        // MyDeckController 초기화
        this.myDeckController = new MyDeckController(
            scene,
            BackgroundServiceImpl.getInstance(),
        );

        // AnimationLoop 초기화 (TWEEN 업데이트 포함)
        this.animationLoop = new AnimationLoop(
            this.rendererManager,
            this.sceneManager,
            this.cameraManager
        );

        // Input handlers 설정
        this.setupInputHandlers();

        // Resize handler 설정
        this.setupResizeHandler();

        // Audio 초기화 설정
        this.setupAudioInitialization();
    }

    public static getInstance(container?: HTMLElement): MyDeckView {
        if (!MyDeckView.instance) {
            if (!container) {
                throw new Error('Container required for first initialization');
            }
            MyDeckView.instance = new MyDeckView(container);
        }
        return MyDeckView.instance;
    }

    private setupInputHandlers(): void {
        // 클릭 이벤트 리팩토링 후 넣기
    }

    private setupResizeHandler(): void {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    private setupAudioInitialization(): void {
        window.addEventListener('click', async () => {
            await this.initializeAudio();
        }, { once: true });
    }

    private async initializeAudio(): Promise<void> {
        try {
            await this.audioController.playMusic();
        } catch (error) {
            console.error('Initial audio play failed:', error);
        }
    }

    private handleResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Camera 업데이트
        this.cameraManager.updateAspect(width, height);

        // Renderer 업데이트
        this.rendererManager.resize(width, height);

        // UserWindowSize 업데이트
        this.userWindowSize.calculateScaleFactors(width, height);

        // MyDeckController의  resize 로직 호출
        this.myDeckController.handleResize(width, height);
    }

    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('Already initialized');
            this.show();
            return;
        }

        console.log('MyDeckView initialize() operate!!!');

        // Texture 로드
        await this.textureManager.preloadTextures("image-paths.json");

        console.log("Textures preloaded. Initializing battle field...");

        // MyDeckController 초기화
        await this.myDeckController.initialize();

        this.initialized = true;
        this.isAnimating = true;
        this.animationLoop.start();
    }

    public show(): void {
        console.log('Showing MyDeckView...');
        this.rendererManager.getDomElement().style.display = 'block';
        this.container.style.display = 'block';
        this.isAnimating = true;

        if (!this.initialized) {
            this.initialize();
        } else {
            this.animationLoop.start();
        }
    }

    public hide(): void {
        console.log('Hiding MyDeckView...');
        this.isAnimating = false;
        this.animationLoop.stop();
        this.rendererManager.getDomElement().style.display = 'none';
        this.container.style.display = 'none';
    }

    public getAnimationHandler(): AnimationHandler {
        return this.animationHandler;
    }

    public getScene(): THREE.Scene | null {
        return this.sceneManager.getActiveScene();
    }

    public getCamera(): THREE.Camera | null {
        return this.cameraManager.getActiveCamera();
    }

    public getRenderer(): THREE.WebGLRenderer {
        return this.rendererManager.getRenderer();
    }

}