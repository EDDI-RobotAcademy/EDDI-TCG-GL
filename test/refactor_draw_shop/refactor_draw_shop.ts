import * as THREE from 'three';
import myCardMusic from '@resource/music/shop/card-shop.mp3';

import {TextureManager} from "../../src/texture_manager/TextureManager";
import {NonBackgroundImage} from "../../src/shape/image/NonBackgroundImage";
import {AudioController} from "../../src/audio/AudioController";
import {MouseController} from "../../src/mouse/MouseController";

import {UserWindowSize} from "../../src/window_size/WindowSize"
import {WindowSceneServiceImpl} from "../../src/window_scene/service/WindowSceneServiceImpl";
import {WindowSceneRepositoryImpl} from "../../src/window_scene/repository/WindowSceneRepositoryImpl";
import {CameraServiceImpl} from "../../src/camera/service/CameraServiceImpl";
import {CameraRepositoryImpl} from "../../src/camera/repository/CameraRepositoryImpl";

import {BackgroundServiceImpl} from "../../src/background/service/BackgroundServiceImpl";
import {BackgroundRepositoryImpl} from "../../src/background/repository/BackgroundRepositoryImpl";
import {GlobalNavigationBarServiceImpl} from "../../src/global_navigation_bar/service/GlobalNavigationBarServiceImpl";
import {GlobalNavigationBarEffectServiceImpl} from "../../src/global_navigation_bar_effect/service/GlobalNavigationBarEffectServiceImpl";

import {GlobalNavigationBarConfigList} from "../../src/global_navigation_bar/entity/GlobalNavigationBarConfigList";

import {MyCardScreenCardMapRepositoryImpl} from "../../src/my_card_screen_card/repository/MyCardScreenCardMapRepositoryImpl";
import {ClippingMaskManager} from "../../src/clipping_mask_manager/ClippingMaskManager";

import {MyCardScreenCardHoverDetectService} from "../../src/my_card_screen_card_hover_detect/service/MyCardScreenCardHoverDetectService";
import {MyCardScreenCardHoverDetectServiceImpl} from "../../src/my_card_screen_card_hover_detect/service/MyCardScreenCardHoverDetectServiceImpl";
import {MyCardScreenCardClickDetectService} from "../../src/my_card_screen_card_click_detect/service/MyCardScreenCardClickDetectService";
import {MyCardScreenCardClickDetectServiceImpl} from "../../src/my_card_screen_card_click_detect/service/MyCardScreenCardClickDetectServiceImpl";
import {CloseButtonClickDetectService} from "../../src/my_card_close_button_click_detect/service/CloseButtonClickDetectService";
import {CloseButtonClickDetectServiceImpl} from "../../src/my_card_close_button_click_detect/service/CloseButtonClickDetectServiceImpl";
import {GnbButtonHoverDetectService} from "../../src/global_navigation_bar_button_hover_detect/service/GnbButtonHoverDetectService";
import {GnbButtonHoverDetectServiceImpl} from "../../src/global_navigation_bar_button_hover_detect/service/GnbButtonHoverDetectServiceImpl";
import {GnbButtonClickDetectService} from "../../src/global_navigation_bar_button_click_detect/service/GnbButtonClickDetectService";
import {GnbButtonClickDetectServiceImpl} from "../../src/global_navigation_bar_button_click_detect/service/GnbButtonClickDetectServiceImpl";
import { ShopGachaButtonServiceImpl } from "../../src/shop_gacha_button/service/ShopGachaButtonServiceImpl";
import { ShopGachaButtonPositionRepositoryImpl } from "../../src/shop_gacha_button_position/repository/ShopGachaButtonPositionRepositoryImpl";
import { ShopGachaButtonRepositoryImpl } from "../../src/shop_gacha_button/repository/ShopGachaButtonRepositoryImpl";

export class TCGJustTestShopView {
    private static instance: TCGJustTestShopView | null = null;

    private scene: THREE.Scene;
    private cameraId: number;
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private textureManager: TextureManager;
    private simulationShopContainer: HTMLElement;

    private audioController: AudioController;
    private mouseController: MouseController;

    private background: NonBackgroundImage | null = null;
    private backgroundService = BackgroundServiceImpl.getInstance();

    private globalNavigationBarService = GlobalNavigationBarServiceImpl.getInstance();
    private globalNavigationBarEffectService = GlobalNavigationBarEffectServiceImpl.getInstance();
    private myCardScreenCardHoverDetectService: MyCardScreenCardHoverDetectService;
    private closeButtonClickDetectService: CloseButtonClickDetectService;
    private myCardScreenCardClickDetectService: MyCardScreenCardClickDetectService;
    private gnbButtonHoverDetectService: GnbButtonHoverDetectService;
    private gnbButtonClickDetectService: GnbButtonClickDetectService;

    private myCardScreenCardMapRepository = MyCardScreenCardMapRepositoryImpl.getInstance();
    private clippingMaskManager = ClippingMaskManager.getInstance();

    private readonly windowSceneRepository = WindowSceneRepositoryImpl.getInstance();
    private readonly windowSceneService = WindowSceneServiceImpl.getInstance(this.windowSceneRepository);

    private readonly cameraRepository = CameraRepositoryImpl.getInstance();
    private readonly cameraService = CameraServiceImpl.getInstance();

    private initialized = false;
    private isAnimating = false;
    private userWindowSize: UserWindowSize;

    private readonly shopGachaButtonPositionRepository = ShopGachaButtonPositionRepositoryImpl.getInstance();
    private readonly shopGachaButtonRepository = ShopGachaButtonRepositoryImpl.getInstance();
    private readonly shopGachaButtonService = ShopGachaButtonServiceImpl.getInstance(this.shopGachaButtonRepository);

    constructor(simulationShopContainer: HTMLElement) {
        this.simulationShopContainer = simulationShopContainer;
        this.scene = this.windowSceneService.createScene('shop')
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.simulationShopContainer.appendChild(this.renderer.domElement);
        this.clippingMaskManager.setRenderer(this.renderer);

        this.userWindowSize = UserWindowSize.getInstance()

        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = window.innerHeight;
        const cameraObject = this.cameraService.createCamera(aspect, viewSize)
        this.cameraId = cameraObject.getId()
        this.camera = cameraObject.getCamera()

        this.cameraService.setCameraPosition(this.cameraId, 0, 0, 5)
        this.cameraService.setCameraLookAt(this.cameraId, 0, 0, 0)

        this.textureManager = TextureManager.getInstance();
        this.audioController = AudioController.getInstance();
        this.audioController.setMusic(myCardMusic);

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.mouseController = new MouseController(this.camera, this.scene);
        window.addEventListener('click', () => this.initializeAudio(), { once: true });

        this.gnbButtonHoverDetectService = GnbButtonHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousemove', async (e) => {
            const buttonDetectState = this.gnbButtonHoverDetectService.getButtonHoverDetectState();
            if (buttonDetectState == true) {
                this.gnbButtonHoverDetectService.onMouseMove(e)
            }
        }, false);

        this.gnbButtonClickDetectService = GnbButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const buttonClickState = this.gnbButtonClickDetectService.getButtonClickDetectState();
            if (buttonClickState == true) {
                const gnbButtonClick = await this.gnbButtonClickDetectService.onMouseDown(e);
                if (gnbButtonClick) {
                    this.myCardScreenCardClickDetectService.setMouseDown(false);
                }
            }
        }, false);

        this.myCardScreenCardHoverDetectService = MyCardScreenCardHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousemove', async (e) => {
            const cardDetectState = this.myCardScreenCardHoverDetectService.getCardDetectState();
            if (cardDetectState == true) {
                this.myCardScreenCardHoverDetectService.onMouseMove(e)
            }
        }, false);

    this.closeButtonClickDetectService = CloseButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
            this.myCardScreenCardClickDetectService = MyCardScreenCardClickDetectServiceImpl.getInstance(this.camera, this.scene);
            this.renderer.domElement.addEventListener('mousedown', async (e) => {
                const cardClickState = this.myCardScreenCardClickDetectService.isMouseDown();
                if (cardClickState == true) {
                    const clickCard = await this.myCardScreenCardClickDetectService.onMouseDown(e);
                    if (clickCard) {
                        this.closeButtonClickDetectService.setCloseButtonClickState(true);
                    }
                }
            }, false);

        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const hasCloseButtonBeenClicked = this.closeButtonClickDetectService.getCloseButtonClickState();
            if (hasCloseButtonBeenClicked == true) {
                this.myCardScreenCardClickDetectService.setMouseDown(false);
                this.myCardScreenCardHoverDetectService.setCardDetectState(false);
                this.gnbButtonHoverDetectService.setButtonHoverDetectState(false);
                this.gnbButtonClickDetectService.setButtonClickDetectState(false);
                const clickButton = await this.closeButtonClickDetectService.onMouseDown(e);
                if (clickButton) {
                    this.closeButtonClickDetectService.setCloseButtonClickState(false);
                    this.myCardScreenCardClickDetectService.setMouseDown(true);
                    this.myCardScreenCardHoverDetectService.setCardDetectState(true);
                    this.gnbButtonHoverDetectService.setButtonHoverDetectState(true);
                    this.gnbButtonClickDetectService.setButtonClickDetectState(true);
                }
            }
        }, false);
    }

    public static getInstance(simulationShopContainer: HTMLElement): TCGJustTestShopView {
        if (!TCGJustTestShopView.instance) {
            TCGJustTestShopView.instance = new TCGJustTestShopView(simulationShopContainer);
        }
        return TCGJustTestShopView.instance;
    }

    private async initializeAudio(): Promise<void> {
        try {
            await this.audioController.playMusic();
        } catch (error) {
            console.error('Initial audio play failed:', error);
        }
    }

    //해야할 것
    // 1)배경이 상점 배경이여야 함
    //  1-1)상정 백그라운드 설정
    //  1-2)상점 종족별 박스 4개 띄우기
    // 2)그에 맞춰서 오브젝트 배치
    // 2-1)갸챠 버튼 위치에 맞춰서 배치해야함
    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('Already initialized');
            this.show();
            return;
        }

        console.log('TCGJustTestShopView initialize() operate!!!');
        await this.textureManager.preloadTextures("image-paths.json");
        console.log("Textures preloaded. Adding background and buttons...");

        await this.addBackground();
        await this.addGlobalNavigationBarButton();
        await this.addGlobalNavigationBarButtonEffect();
        await this.addGachaButtons();

        this.initialized = true;
        this.isAnimating = true;

        this.animate();
    }

    public show(): void {
        console.log('Showing TCGJustTestShopView...');
        this.renderer.domElement.style.display = 'block';
        this.simulationShopContainer.style.display = 'block';
        this.isAnimating = true;
        if (!this.initialized) {
            this.initialize();
        } else {
            this.animate();
        }
    }

    public hide(): void {
        console.log('Hiding TCGJustTestShopView...');
        this.isAnimating = false;
        this.renderer.domElement.style.display = 'none';
        this.simulationShopContainer.style.display = 'none';
    }

    private async addBackground(): Promise<void> {
        try {
            const background = await this.backgroundService.createBackground(
                'select_card_screen',
                1, // BackgroundType 값
                window.innerWidth,
                window.innerHeight
            );

            this.background = background;
            if (this.background instanceof NonBackgroundImage) {
                this.background.draw(this.scene);
            }
        } catch (error) {
            console.error('Failed to add background:', error);
        }
    }

    private async addGlobalNavigationBarButton(): Promise<void> {
        try {
            const configList = new GlobalNavigationBarConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) => {
                const button = await this.globalNavigationBarService.createGlobalNavigationBar(config.id,config.position);

                if (button) {
                    this.globalNavigationBarService.initializeButtonVisible();
                    this.scene.add(button);
                    console.log(`Draw GNB Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add GNB Button:', error);
        }
    }

    private async addGlobalNavigationBarButtonEffect(): Promise<void> {
        try {
            const configList = new GlobalNavigationBarConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) => {
                const effect = await this.globalNavigationBarEffectService.createGlobalNavigationBarEffect(config.id,config.position);

                if (effect) {
                    this.globalNavigationBarEffectService.initializeButtonEffectVisible();
                    this.scene.add(effect);
                    console.log(`Draw GNB Button Effect ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add GNB Button Effect:', error);
        }
    }

    private async addGachaButtons(): Promise<void> {
        try {
            console.log('Starting to add gacha buttons...');
            await this.shopGachaButtonService.initializeButtons();
            
            const buttons = this.shopGachaButtonService.getAllButtons();
            buttons.forEach(button => {
                const mesh = button.getMesh();
                if (mesh) {
                    this.scene.add(mesh);
                    console.log(`Added button ${button.id} at position:`, mesh.position);
                }
            });

            console.log('Finished adding gacha buttons');
        } catch (error) {
            console.error('Failed to add gacha buttons:', error);
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

            this.userWindowSize.calculateScaleFactors(newWidth, newHeight);
            const { scaleX, scaleY } = this.userWindowSize.getScaleFactors();
            this.globalNavigationBarService.adjustGlobalNavigationBarPosition();
            this.globalNavigationBarEffectService.adjustGlobalNavigationBarEffectPosition();
            this.shopGachaButtonService.adjustButtonPositions();
        }
    }


    animate(): void {
        if (this.isAnimating) {
            requestAnimationFrame(() => this.animate());
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

const fieldView = TCGJustTestShopView.getInstance(rootElement);
fieldView.initialize();
