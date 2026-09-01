import * as THREE from 'three';
import battleFieldMusic from '@resource/music/battle_field/battle-field.mp3';

import {TextureManager} from "../../src/texture_manager/TextureManager";
import {NonBackgroundImage} from "../../src/shape/image/NonBackgroundImage";
import {AudioController} from "../../src/audio/AudioController";
import {MouseController} from "../../src/mouse/MouseController";
import {BattleFieldUnitRepository} from "../../src/battle_field_unit/repository/BattleFieldUnitRepository";

import {BattleFieldUnitScene} from "../../src/battle_field_unit/scene/BattleFieldUnitScene";
import {ResourceManager} from "../../src/resouce_manager/ResourceManager";
import {BattleFieldUnitRenderer} from "../../src/battle_field_unit/renderer/BattleFieldUnitRenderer";

import {BattleFieldHandSceneRepository} from "../../src/battle_field_hand/deprecated_repository/BattleFieldHandSceneRepository";
import {BattleFieldHandPositionRepository} from "../../src/battle_field_hand/deprecated_repository/BattleFieldHandPositionRepository";

import {UserWindowSize} from "../../src/window_size/WindowSize"
import {UnitCardGenerator} from "../../src/card/unit/generate";

import {SupportCardGenerator} from "../../src/card/support/generate";
import {ItemCardGenerator} from "../../src/card/item/generate";
import {EnergyCardGenerator} from "../../src/card/energy/generate";
import {WindowSceneServiceImpl} from "../../src/window_scene/service/WindowSceneServiceImpl";
import {WindowSceneRepositoryImpl} from "../../src/window_scene/repository/WindowSceneRepositoryImpl";
import {CameraServiceImpl} from "../../src/camera/service/CameraServiceImpl";
import {CameraRepositoryImpl} from "../../src/camera/repository/CameraRepositoryImpl";
import {BackgroundServiceImpl} from "../../src/background/service/BackgroundServiceImpl";
import {BackgroundRepositoryImpl} from "../../src/background/repository/BackgroundRepositoryImpl";
import {BattleFieldHandServiceImpl} from "../../src/battle/hand/service/BattleFieldHandServiceImpl";
import {BattleFieldHandMapRepositoryImpl} from "../../src/battle/hand/repository/BattleFieldHandMapRepositoryImpl";
import {CardGenerationHandler} from "../../src/card/handler";
import {LegacyDragAndDropManager} from "../../src/drag_and_drop/LegacyDragAndDropManager";
import {DragAndDropManager} from "../../src/drag_and_drop/DragAndDropManager";
import {LeftClickDetectServiceImpl} from "../../src/left_click_detect/service/LeftClickDetectServiceImpl";
import {LeftClickDetectService} from "../../src/left_click_detect/service/LeftClickDetectService";
import {DragMoveServiceImpl} from "../../src/drag_move/service/DragMoveServiceImpl";
import {DragMoveService} from "../../src/drag_move/service/DragMoveService";
import {YourFieldAreaServiceImpl} from "../../src/your_field_area/service/YourFieldAreaServiceImpl";
import {CardState} from "../../src/card/state";
import {MouseDropService} from "../../src/mouse_drop/service/MouseDropService";
import {MouseDropServiceImpl} from "../../src/mouse_drop/service/MouseDropServiceImpl";

export class TCGJustTestBattleFieldView {
    private static instance: TCGJustTestBattleFieldView | null = null;

    private scene: THREE.Scene;
    private cameraId: number;
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private textureManager: TextureManager;
    private simulationBattleFieldContainer: HTMLElement;

    private buttons: NonBackgroundImage[] = [];
    private buttonInitialInfo: Map<string, { positionPercent: THREE.Vector2, widthPercent: number, heightPercent: number }> = new Map();
    private audioController: AudioController;
    private mouseController: MouseController;

    private background: NonBackgroundImage | null = null;
    private backgroundService = BackgroundServiceImpl.getInstance()

    private battleFieldUnitRepository = BattleFieldUnitRepository.getInstance();
    private battleFieldUnitScene = new BattleFieldUnitScene();
    private battleFieldResourceManager = new ResourceManager()
    private battleFieldUnitRenderer?: BattleFieldUnitRenderer;

    private battleFieldHandService = BattleFieldHandServiceImpl.getInstance()
    // private battleFieldHandRepository = BattleFieldHandRepository.getInstance()
    private battleFieldHandMapRepository = BattleFieldHandMapRepositoryImpl.getInstance()
    private battleFieldHandSceneRepository = BattleFieldHandSceneRepository.getInstance()
    private battleFieldHandPositionRepository = BattleFieldHandPositionRepository.getInstance()

    // private dragAndDropManager: DragAndDropManager;
    private leftClickDetectService: LeftClickDetectService
    private dragMoveService: DragMoveService
    private mouseDropService: MouseDropService

    private yourFieldAreaService = YourFieldAreaServiceImpl.getInstance();

    private readonly windowSceneRepository = WindowSceneRepositoryImpl.getInstance();
    private readonly windowSceneService = WindowSceneServiceImpl.getInstance(this.windowSceneRepository);

    private readonly cameraRepository = CameraRepositoryImpl.getInstance()
    private readonly cameraService = CameraServiceImpl.getInstance()

    private initialized = false;
    private isAnimating = false;

    private userWindowSize: UserWindowSize;

    constructor(simulationBattleFieldContainer: HTMLElement) {
        this.simulationBattleFieldContainer = simulationBattleFieldContainer;
        this.scene = this.windowSceneService.createScene('battle-field')
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.simulationBattleFieldContainer.appendChild(this.renderer.domElement);

        // this.userWindowSize = new UserWindowSize(window.innerWidth, window.innerHeight);
        this.userWindowSize = UserWindowSize.getInstance()

        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = window.innerHeight;
        const cameraObject = this.cameraService.createCamera(aspect, viewSize)
        this.cameraId = cameraObject.getId()
        this.camera = cameraObject.getCamera()

        this.cameraService.setCameraPosition(this.cameraId, 0, 0, 5)
        this.cameraService.setCameraLookAt(this.cameraId, 0, 0, 0)
        // this.camera.position.set(0, 0, 5);
        // this.camera.lookAt(0, 0, 0);

        this.textureManager = TextureManager.getInstance();
        this.audioController = AudioController.getInstance();
        this.audioController.setMusic(battleFieldMusic);

        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.mouseController = new MouseController(this.camera, this.scene);

        window.addEventListener('click', () => this.initializeAudio(), { once: true });

        this.leftClickDetectService = LeftClickDetectServiceImpl.getInstance(this.camera, this.scene)
        this.dragMoveService = DragMoveServiceImpl.getInstance(this.camera, this.scene)
        this.mouseDropService = MouseDropServiceImpl.getInstance()

        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            if (e.button === 0) { // 좌클릭만 처리
                const result = await this.leftClickDetectService.handleLeftClick(e);
                console.log(`result: ${JSON.stringify(result, null, 2)}`)
                if (result !== null) {
                    this.leftClickDetectService.setLeftMouseDown(true);
                }
            }
        }, false)

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (this.leftClickDetectService.isLeftMouseDown()) {
                this.dragMoveService.onMouseMove(e);
            }
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            if (this.leftClickDetectService.isLeftMouseDown()) {
                this.mouseDropService.onMouseUp();
                this.leftClickDetectService.setLeftMouseDown(false); // 드롭 후 상태 초기화
            }
        }, false);
        // this.renderer.domElement.addEventListener('mousedown', (e) => this.leftClickDetectService.handleLeftClick(e), false);
        // this.renderer.domElement.addEventListener('mousemove', (e) => this.dragAndDropManager.onMouseMove(e), false);
        // this.renderer.domElement.addEventListener('mouseup', () => this.dragAndDropManager.onMouseUp(), false);
    }

    public static getInstance(lobbyContainer: HTMLElement): TCGJustTestBattleFieldView {
        if (!TCGJustTestBattleFieldView.instance) {
            TCGJustTestBattleFieldView.instance = new TCGJustTestBattleFieldView(lobbyContainer);
        }
        return TCGJustTestBattleFieldView.instance;
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

        console.log('TCGBattleFieldView initialize() operate!!!');
        await this.textureManager.preloadTextures("image-paths.json");

        console.log("Textures preloaded. Adding background and buttons...");

        await this.addBackground();
        this.addYourField();
        this.addYourHandUnitList()

        this.initialized = true;
        this.isAnimating = true;

        this.animate();
    }

    public show(): void {
        console.log('Showing TCGMainLobbyView...');
        this.renderer.domElement.style.display = 'block';
        this.simulationBattleFieldContainer.style.display = 'block';
        this.isAnimating = true;
        if (!this.initialized) {
            this.initialize(); // 초기화되지 않은 경우 초기화 호출
        } else {
            this.animate(); // 이미 초기화된 경우 애니메이션만 다시 시작
        }
    }

    public hide(): void {
        console.log('Hiding TCGMainLobbyView...');
        this.isAnimating = false;
        this.renderer.domElement.style.display = 'none';
        this.simulationBattleFieldContainer.style.display = 'none';
    }

    private async addBackground(): Promise<void> {
        try {
            const background = await this.backgroundService.createBackground(
                'battle_field_background',
                1, // BackgroundType 값
                window.innerWidth,
                window.innerHeight
            );

            this.background = background;
            // this.dragAndDropManager.setBackground(this.background)

            if (this.background instanceof NonBackgroundImage) {
                this.background.draw(this.scene);
            }
        } catch (error) {
            console.error('Failed to add background:', error);
        }
    }

    private addYourField(): void {
        const yourField = this.yourFieldAreaService.createYourField()
        const yourFieldAreaMesh = yourField.getArea()

        this.scene.add(yourFieldAreaMesh);
    }

    private async addYourHandUnitList(): Promise<void> {
        const battleFieldHandList = this.battleFieldHandMapRepository.getBattleFieldHandList()

        for (const handCardId of battleFieldHandList) {
            const createdHand = await this.battleFieldHandService.createHand(handCardId)

            if (createdHand) {
                this.battleFieldHandSceneRepository.addBattleFieldHandScene(createdHand);
                this.scene.add(createdHand);
            }
        }
    }

    private onWindowResize(): void {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        // 기존 크기와 비교해서 변경된 경우만 처리
        if (newWidth !== this.userWindowSize.getWidth() || newHeight !== this.userWindowSize.getHeight()) {
            const aspect = newWidth / newHeight;
            const viewSize = newHeight;
            this.cameraService.updateCamera(this.cameraId, aspect, viewSize)

            this.renderer.setSize(newWidth, newHeight);

            if (this.background) {
                const scaleX = newWidth / this.background.getWidth();
                const scaleY = newHeight / this.background.getHeight();
                this.background.setScale(scaleX, scaleY);
            }

            this.buttons.forEach(button => {
                const initialInfo = this.buttonInitialInfo.get(button.getMesh()?.uuid ?? '');
                if (initialInfo) {
                    const buttonWidth = window.innerWidth * initialInfo.widthPercent;
                    const buttonHeight = window.innerHeight * initialInfo.heightPercent;
                    const newPosition = new THREE.Vector2(
                        window.innerWidth * initialInfo.positionPercent.x,
                        window.innerHeight * initialInfo.positionPercent.y
                    );

                    button.setPosition(newPosition.x, newPosition.y);
                    button.setScale(buttonWidth / button.getWidth(), buttonHeight / button.getHeight());
                }
            });

            // 창 크기 변경에 따라 배틀 필드도 리사이징
            this.userWindowSize.calculateScaleFactors(newWidth, newHeight);
            const { scaleX, scaleY } = this.userWindowSize.getScaleFactors();
            // this.battleFieldHandSceneRepository.resizeHandSceneList(scaleX, scaleY);
            UnitCardGenerator.adjustHandCardPositions();
            SupportCardGenerator.adjustCardPositions()
            ItemCardGenerator.adjustCardPositions()
            EnergyCardGenerator.adjustCardPositions()
        }
    }

    animate(): void {
        if (this.isAnimating) {
            requestAnimationFrame(() => this.animate());
            // this.battleFieldHandRenderer?.render(this.renderer, this.camera);
            this.renderer.render(this.scene, this.camera);
        } else {
            console.log('Animation stopped.');
        }
    }
}

const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error("Cannot find element with id 'app'.");
}

const fieldView = TCGJustTestBattleFieldView.getInstance(rootElement);
fieldView.initialize();