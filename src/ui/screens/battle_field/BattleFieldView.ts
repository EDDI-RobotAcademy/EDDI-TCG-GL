import * as THREE from 'three';

import battleFieldMusic from '@resource/music/battle_field/battle-field.mp3';
import {SceneManager} from "../../../core/scene/SceneManager";
import {RendererManager} from "../../../core/renderer/RendererManager";
import {CameraManager} from "../../../core/camera/CameraManager";
import {InputManager} from "../../../input/InputManager";
import {AnimationLoop} from "../../../core/animation/AnimationLoop";
import {AnimationHandler} from "../../../animation/handler/AnimationHandler";
import {BattleFieldController} from "../../../game/battle/BattleFieldController";
import {AudioController} from "../../../audio/AudioController";
import {TextureManager} from "../../../texture_manager/TextureManager";
import {NeonShape} from "../../../neon/NeonShape";
import {UserWindowSize} from "../../../window_size/WindowSize";
import {BackgroundServiceImpl} from "../../../background/service/BackgroundServiceImpl";
import {YourFieldAreaServiceImpl} from "../../../your_field_area/service/YourFieldAreaServiceImpl";
import {OpponentFieldAreaServiceImpl} from "../../../opponent_field_area/service/OpponentFieldAreaServiceImpl";
import {BattleFieldHandServiceImpl} from "../../../battle_field_hand/service/BattleFieldHandServiceImpl";
import {OpponentFieldServiceImpl} from "../../../opponent_field/service/OpponentFieldServiceImpl";
import {MouseInputHandler} from "../../../mouse/MouseInputHandler";
import {LeftClickDetectServiceImpl} from "../../../left_click_detect/service/LeftClickDetectServiceImpl";
import {RightClickDetectServiceImpl} from "../../../right_click_detect/service/RightClickDetectServiceImpl";
import {DragMoveServiceImpl} from "../../../drag_move/service/DragMoveServiceImpl";
import {MouseDropServiceImpl} from "../../../mouse_drop/service/MouseDropServiceImpl";
import {KeyboardInputHandler} from "../../../keyboard/KeyboardInputHandler";
import {KeyboardServiceImpl} from "../../../keyboard/service/KeyboardServiceImpl";
import {showFieldEnergy} from "../../../common/field_energy/FieldEnergy";
import {showFieldEnergyRace} from "../../../common/card_race/CardRace";
import {showFieldEnergyCount} from "../../../common/field_energy/FieldEnergyCount";
import {showGuideMessage} from "../../../common/guide_message/GuideMessage";
import {showSandTimer} from "../../../common/timer/Timer";
import {showTurn} from "../../../common/turn/Turn";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

export class BattleFieldView {
    private static instance: BattleFieldView | null = null;

    private sceneManager: SceneManager;
    private rendererManager: RendererManager;
    private cameraManager: CameraManager;
    private inputManager: InputManager;
    private animationLoop: AnimationLoop;
    private animationHandler: AnimationHandler;
    private battleFieldController: BattleFieldController;

    private audioController: AudioController;
    private textureManager: TextureManager;
    private neonShape: NeonShape;
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
        const scene = this.sceneManager.createScene('battle-field');
        const renderer = this.rendererManager.getRenderer();
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

        // AnimationHandler 초기화
        this.animationHandler = AnimationHandler.initialize(camera, scene, renderer);

        // Neon effect 초기화
        this.neonShape = NeonShape.getInstance(scene, renderer, camera);

        // Audio 초기화
        this.audioController = AudioController.getInstance();
        this.audioController.setMusic(battleFieldMusic);

        // Texture manager 초기화
        this.textureManager = TextureManager.getInstance();

        // BattleFieldController 초기화
        this.battleFieldController = new BattleFieldController(
            scene,
            BackgroundServiceImpl.getInstance(),
            YourFieldAreaServiceImpl.getInstance(),
            OpponentFieldAreaServiceImpl.getInstance(),
            BattleFieldHandServiceImpl.getInstance(),
            OpponentFieldServiceImpl.getInstance()
        );

        // AnimationLoop 초기화 (TWEEN 업데이트 포함)
        this.animationLoop = new AnimationLoop(
            this.rendererManager,
            this.sceneManager,
            this.cameraManager
        );

        // 커스텀 업데이트 로직 추가
        this.setupCustomAnimationUpdate();

        // Input handlers 설정
        this.setupInputHandlers();

        // Resize handler 설정
        this.setupResizeHandler();

        // Audio 초기화 설정
        this.setupAudioInitialization();
    }

    public static getInstance(container?: HTMLElement): BattleFieldView {
        if (!BattleFieldView.instance) {
            if (!container) {
                throw new Error('Container required for first initialization');
            }
            BattleFieldView.instance = new BattleFieldView(container);
        }
        return BattleFieldView.instance;
    }

    private setupInputHandlers(): void {
        const scene = this.sceneManager.getActiveScene()!;
        const camera = this.cameraManager.getActiveCamera()!;

        // Mouse handler 설정
        const mouseHandler = new MouseInputHandler(
            LeftClickDetectServiceImpl.getInstance(camera, scene),
            RightClickDetectServiceImpl.getInstance(camera, scene),
            DragMoveServiceImpl.getInstance(camera, scene),
            MouseDropServiceImpl.getInstance()
        );

        // Keyboard handler 설정
        const keyboardHandler = new KeyboardInputHandler(
            KeyboardServiceImpl.getInstance(scene)
        );

        // InputManager에 등록
        this.inputManager.register('mousedown', mouseHandler);
        this.inputManager.register('mousemove', mouseHandler);
        this.inputManager.register('mouseup', mouseHandler);
        this.inputManager.register('contextmenu', mouseHandler);
        this.inputManager.register('keydown', keyboardHandler);
        this.inputManager.register('keyup', keyboardHandler);

        // 리스너 설정
        this.inputManager.setupListeners(this.rendererManager.getDomElement());
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

    private setupCustomAnimationUpdate(): void {
        // AnimationLoop의 update 로직에 TWEEN과 Neon 업데이트 추가
        const originalAnimate = this.animationLoop['animate'].bind(this.animationLoop);

        this.animationLoop['animate'] = (time?: number) => {
            if (this.animationLoop.isActive()) {
                // TWEEN 업데이트
                if (typeof TWEEN !== 'undefined') {
                    TWEEN.update(time);
                }

                // Neon effect 업데이트
                this.neonShape.updateNeonEffect();

                // 원래 animate 로직 실행
                originalAnimate(time);
            }
        };
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

        // BattleFieldController의 resize 로직 호출
        this.battleFieldController.handleResize(width, height);
    }

    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('Already initialized');
            this.show();
            return;
        }

        console.log('BattleFieldView initialize() operate!!!');

        // Texture 로드
        await this.textureManager.preloadTextures("image-paths.json");

        console.log("Textures preloaded. Initializing battle field...");

        // BattleFieldController 초기화
        await this.battleFieldController.initialize();

        // UI 요소 표시
        this.showUIElements();

        this.initialized = true;
        this.isAnimating = true;
        this.animationLoop.start();
    }

    private showUIElements(): void {
        showFieldEnergy(7);
        showFieldEnergyRace(1);
        showFieldEnergyCount(1);
        showGuideMessage("카드를 드래그하여 이동하세요!", 3000);
        showSandTimer();
        showTurn();
    }

    public show(): void {
        console.log('Showing BattleFieldView...');
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
        console.log('Hiding BattleFieldView...');
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