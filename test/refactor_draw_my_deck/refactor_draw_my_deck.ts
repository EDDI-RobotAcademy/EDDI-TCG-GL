import * as THREE from 'three';
import myCardMusic from '@resource/music/my_card/my-card.mp3';

import {TextureManager} from "../../src/texture_manager/TextureManager";
import {NonBackgroundImage} from "../../src/shape/image/NonBackgroundImage";
import { AudioController } from "../../src/audio/AudioController";
import {MouseController} from "../../src/mouse/MouseController";
import {TextGenerator} from "../../src/text/generator";

import {UserWindowSize} from "../../src/window_size/WindowSize"
import {WindowSceneServiceImpl} from "../../src/window_scene/service/WindowSceneServiceImpl";
import {WindowSceneRepositoryImpl} from "../../src/window_scene/repository/WindowSceneRepositoryImpl";
import {CameraServiceImpl} from "../../src/camera/service/CameraServiceImpl";
import {CameraRepositoryImpl} from "../../src/camera/repository/CameraRepositoryImpl";

import {BackgroundServiceImpl} from "../../src/background/service/BackgroundServiceImpl";
import {BackgroundRepositoryImpl} from "../../src/background/repository/BackgroundRepositoryImpl";

import {MyDeckCardPageMovementButtonServiceImpl} from "../../src/my_deck_card_page_movement_button/service/MyDeckCardPageMovementButtonServiceImpl";
import {MyDeckCardPageMovementButtonRepositoryImpl} from "../../src/my_deck_card_page_movement_button/repository/MyDeckCardPageMovementButtonRepositoryImpl";
import {MyDeckButtonPageMovementButtonServiceImpl} from "../../src/my_deck_button_page_movement_button/service/MyDeckButtonPageMovementButtonServiceImpl";
import {MyDeckButtonPageMovementButtonRepositoryImpl} from "../../src/my_deck_button_page_movement_button/repository/MyDeckButtonPageMovementButtonRepositoryImpl";
import {MyDeckCardPageMovementButtonConfigList} from "../../src/my_deck_card_page_movement_button/entity/MyDeckCardPageMovementButtonConfigList";
import {MyDeckButtonPageMovementButtonConfigList} from "../../src/my_deck_button_page_movement_button/entity/MyDeckButtonPageMovementButtonConfigList";
import {DeckMakePopupButtonsConfigList} from "../../src/deck_make_pop_up_buttons/entity/DeckMakePopupButtonsConfigList";

import {MyDeckButtonServiceImpl} from "../../src/my_deck_button/service/MyDeckButtonServiceImpl";
import {MyDeckButtonEffectServiceImpl} from "../../src/my_deck_button_effect/service/MyDeckButtonEffectServiceImpl";
import {MyDeckButtonMapRepositoryImpl} from "../../src/my_deck_button/repository/MyDeckButtonMapRepositoryImpl";
import {MyDeckCardServiceImpl} from "../../src/my_deck_card/service/MyDeckCardServiceImpl";
import {MyDeckCardMapRepositoryImpl} from "../../src/my_deck_card/repository/MyDeckCardMapRepositoryImpl";

import {MyDeckNameTextServiceImpl} from "../../src/my_deck_name_text/service/MyDeckNameTextServiceImpl";
import {MyDeckNameTextMapRepositoryImpl} from "../../src/my_deck_name_text/repository/MyDeckNameTextMapRepositoryImpl";
import {DeckMakeButtonServiceImpl} from "../../src/deck_make_button/service/DeckMakeButtonServiceImpl";
import {TransparentBackgroundServiceImpl} from "../../src/transparent_background/service/TransparentBackgroundServiceImpl";
import {DeckMakePopupBackgroundServiceImpl} from "../../src/deck_make_pop_up_background/service/DeckMakePopupBackgroundServiceImpl";
import {DeckMakePopupButtonsServiceImpl} from "../../src/deck_make_pop_up_buttons/service/DeckMakePopupButtonsServiceImpl";
import {DeckMakePopupInputContainerServiceImpl} from "../../src/deck_make_pop_up_input_container/service/DeckMakePopupInputContainerServiceImpl";

import {MyDeckButtonClickDetectServiceImpl} from "../../src/deck_button_click_detect/service/MyDeckButtonClickDetectServiceImpl";
import {MyDeckButtonClickDetectService} from "../../src/deck_button_click_detect/service/MyDeckButtonClickDetectService";
import {DeckPageMovementButtonClickDetectServiceImpl} from "../../src/deck_button_page_movement_button_detect/service/DeckPageMoveButtonClickDetectServiceImpl";
import {DeckPageMovementButtonClickDetectService} from "../../src/deck_button_page_movement_button_detect/service/DeckPageMoveButtonClickDetectService";
import {DeckCardPageMoveButtonClickDetectServiceImpl} from "../../src/deck_card_page_movement_button_detect/service/DeckCardPageMoveButtonClickDetectServiceImpl";
import {DeckCardPageMoveButtonClickDetectService} from "../../src/deck_card_page_movement_button_detect/service/DeckCardPageMoveButtonClickDetectService";
import {DeckMakeButtonClickDetectServiceImpl} from "../../src/deck_make_button_click_detect/service/DeckMakeButtonClickDetectServiceImpl";
import {DeckMakeButtonClickDetectService} from "../../src/deck_make_button_click_detect/service/DeckMakeButtonClickDetectService";
import {DeckMakePopupButtonsClickDetectServiceImpl} from "../../src/deck_make_pop_up_buttons_click_detect/service/DeckMakePopupButtonsClickDetectServiceImpl";
import {DeckMakePopupButtonsClickDetectService} from "../../src/deck_make_pop_up_buttons_click_detect/service/DeckMakePopupButtonsClickDetectService";

export class TCGJustTestMyDeckView {
    private static instance: TCGJustTestMyDeckView | null = null;

    private scene: THREE.Scene;
    private cameraId: number;
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private textureManager: TextureManager;
    private simulationMyDeckContainer: HTMLElement;

    private audioController: AudioController;
    private mouseController: MouseController;

    private background: NonBackgroundImage | null = null;
    private backgroundService = BackgroundServiceImpl.getInstance();

    private myDeckCardPageMovementButtonService = MyDeckCardPageMovementButtonServiceImpl.getInstance();
    private myDeckButtonPageMovementButtonService = MyDeckButtonPageMovementButtonServiceImpl.getInstance();
    private myDeckButtonService = MyDeckButtonServiceImpl.getInstance();
    private myDeckButtonEffectService = MyDeckButtonEffectServiceImpl.getInstance();
    private myDeckCardService = MyDeckCardServiceImpl.getInstance();
    private myDeckNameTextService = MyDeckNameTextServiceImpl.getInstance();
    private deckMakeButtonService = DeckMakeButtonServiceImpl.getInstance();
    private transparentBackgroundService = TransparentBackgroundServiceImpl.getInstance();
    private decKMakePopupBackgroundService = DeckMakePopupBackgroundServiceImpl.getInstance();
    private deckMakePopupButtonsService = DeckMakePopupButtonsServiceImpl.getInstance();
    private deckMakePopupInputContainerService = DeckMakePopupInputContainerServiceImpl.getInstance();

    private myDeckButtonMapRepository = MyDeckButtonMapRepositoryImpl.getInstance();
    private myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
    private myDeckNameTextMapRepository = MyDeckNameTextMapRepositoryImpl.getInstance();

    private readonly windowSceneRepository = WindowSceneRepositoryImpl.getInstance();
    private readonly windowSceneService = WindowSceneServiceImpl.getInstance(this.windowSceneRepository);

    private readonly cameraRepository = CameraRepositoryImpl.getInstance();
    private readonly cameraService = CameraServiceImpl.getInstance(this.cameraRepository);

    private myDeckButtonClickDetectService: MyDeckButtonClickDetectService;
//     private deckPageMovementButtonClickDetectService: DeckPageMovementButtonClickDetectService;
    private deckCardPageMoveButtonClickDetectService: DeckCardPageMoveButtonClickDetectService;
//     private deckMakeButtonClickDetectService: DeckMakeButtonClickDetectService;
    private deckMakePopupButtonsClickDetectService: DeckMakePopupButtonsClickDetectService;

    private initialized = false;
    private isAnimating = false;

    private isMyDeckButtonEnabled: boolean = true;
    private isDeckPageMovementButtonEnabled: boolean = true;
    private isDeckCardPageMovementButtonEnabled: boolean = true;
    private isDeckMakeButtonEnabled: boolean = true;
    private isDeckMakePopupButtonsEnabled: boolean = true;

    private userWindowSize: UserWindowSize;

    constructor(simulationMyDeckContainer: HTMLElement) {
        this.simulationMyDeckContainer = simulationMyDeckContainer;
        this.scene = this.windowSceneService.createScene('my-deck')
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.simulationMyDeckContainer.appendChild(this.renderer.domElement);

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

        this.myDeckButtonClickDetectService = MyDeckButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.myDeckButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            if (this.isMyDeckButtonEnabled) {
                this.myDeckButtonClickDetectService.onMouseDown(e);
            }
        }, false);

//         this.deckPageMovementButtonClickDetectService = DeckPageMovementButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
// //         this.renderer.domElement.addEventListener('mousedown', (e) => this.deckPageMovementButtonClickDetectService.onMouseDown(e), false);
//         this.renderer.domElement.addEventListener('mousedown', (e) => {
//             if (this.isDeckPageMovementButtonEnabled) {
//                 this.deckPageMovementButtonClickDetectService.onMouseDown(e);
//             }
//         }, false);

        this.deckCardPageMoveButtonClickDetectService = DeckCardPageMoveButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.deckCardPageMoveButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            if (this.isDeckCardPageMovementButtonEnabled) {
                this.deckCardPageMoveButtonClickDetectService.onMouseDown(e);
            }
        }, false);

//         this.deckMakeButtonClickDetectService = DeckMakeButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
// //         this.renderer.domElement.addEventListener('mousedown', (e) => this.deckMakeButtonClickDetectService.onMouseDown(e), false);
//         this.renderer.domElement.addEventListener('mousedown', (e) => {
//             if (this.isDeckMakeButtonEnabled) {
//                 this.deckMakeButtonClickDetectService.onMouseDown(e);
//                 const currentButtonClickState = this.deckMakeButtonClickDetectService.getCurrentButtonClickState();
//                 if (currentButtonClickState) {
//                     this.isMyDeckButtonEnabled = false;
//                     this.isDeckPageMovementButtonEnabled = false;
//                     this.isDeckCardPageMovementButtonEnabled = false;
//                     this.isDeckMakeButtonEnabled = false;
//                 }
//             }
//         }, false);

        this.deckMakePopupButtonsClickDetectService = DeckMakePopupButtonsClickDetectServiceImpl.getInstance(this.camera, this.scene);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.deckMakePopupButtonsClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            if (this.isDeckMakePopupButtonsEnabled) {
                this.deckMakePopupButtonsClickDetectService.onMouseDown(e);
                const currentButtonClickState = this.deckMakePopupButtonsClickDetectService.getCurrentButtonClickState();
                if (currentButtonClickState) {
                    this.isMyDeckButtonEnabled = true;
                    this.isDeckPageMovementButtonEnabled = true;
                    this.isDeckCardPageMovementButtonEnabled = true;
                    this.isDeckMakeButtonEnabled = true;
                }
            }
        }, false);

    }

    public static getInstance(simulationMyDeckContainer: HTMLElement): TCGJustTestMyDeckView {
        if (!TCGJustTestMyDeckView.instance) {
            TCGJustTestMyDeckView.instance = new TCGJustTestMyDeckView(simulationMyDeckContainer);
        }
        return TCGJustTestMyDeckView.instance;
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

        console.log('TCGJustTestMyDeckView initialize() operate!!!');
        await this.textureManager.preloadTextures("image-paths.json");
        console.log("Textures preloaded. Adding background and buttons...");
        await TextGenerator.loadFont('../../resource/font/HeirofLightOTFRegular.otf');

        await this.addBackground();
//         await this.addMyDeckButtonPageMovementButton();
//         await this.saveMyDeckCard();
        await this.addMyDeckCardPageMovementButton();
        await this.addMyDeckButton();
        await this.addMyDeckButtonEffect();
        this.addMyDeckNameText();
//         this.addDeckMakeButton();
        this.addTransparentBackground();
        this.addDeckMakePopupBackground();
        this.addDeckMakePopupButtons();
        this.addDeckMakePopupInputContainer();

        this.initialized = true;
        this.isAnimating = true;

        this.animate();
    }

    public show(): void {
        console.log('Showing TCGJustTestMyDeckView...');
        this.renderer.domElement.style.display = 'block';
        this.simulationMyDeckContainer.style.display = 'block';
        this.isAnimating = true;
        if (!this.initialized) {
            this.initialize(); // 초기화되지 않은 경우 초기화 호출
        } else {
            this.animate(); // 이미 초기화된 경우 애니메이션만 다시 시작
        }
    }

    public hide(): void {
        console.log('Hiding TCGJustTestMyDeckView...');
        this.isAnimating = false;
        this.renderer.domElement.style.display = 'none';
        this.simulationMyDeckContainer.style.display = 'none';
    }

    private async addBackground(): Promise<void> {
        try {
            const background = await this.backgroundService.createBackground(
                'my_deck_background',
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

    private async addMyDeckCardPageMovementButton(): Promise<void> {
        try {
            const configList = new MyDeckCardPageMovementButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) =>{
                    const button = await this.myDeckCardPageMovementButtonService.createMyDeckCardPageMovementButton(
                        config.id,
                        config.position
                    );

                    if (button) {
                        this.scene.add(button);
                        console.log(`Draw My Deck Card Page Movement Button ${config.id}`);
                    }
                })
            );
        } catch (error) {
            console.error('Failed to add my deck card page movement button:', error);
        }
    }

    private async addMyDeckButtonPageMovementButton(): Promise<void> {
        try {
            const deckSize = this.myDeckButtonMapRepository.getMyDeckMapSize();
            const configList = new MyDeckButtonPageMovementButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) => {
                const button = await this.myDeckButtonPageMovementButtonService.createMyDeckButtonPageMovementButton(
                    config.id,
                    config.position
                );

                if (button) {
                    this.myDeckButtonPageMovementButtonService.initializeDeckButtonPageMovementButtonState(deckSize);
                    this.scene.add(button);
                    console.log(`Draw My Deck Button Page Movement Button: ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add my deck button page movement buttons:', error);
        }
    }

    private async addMyDeckButton(): Promise<void> {
        try {
            const myDeckButtonList = this.myDeckButtonMapRepository.getMyDeckList();

            myDeckButtonList.forEach(async (deckId, index) => {
                const buttonGroup = await this.myDeckButtonService.createMyDeckButtonWithPosition(deckId);

                if (buttonGroup) {
                    this.myDeckButtonService.initializeDeckButton(); // 처음 6개만 visible
                    this.scene.add(buttonGroup);
                }
            });

        } catch (error) {
            console.error('Failed to add my deck buttons:', error);
        }
    }

    private async addMyDeckButtonEffect(): Promise<void> {
        try {
            const myDeckButtonList = this.myDeckButtonMapRepository.getMyDeckList();

            myDeckButtonList.forEach(async (deckId, index) => {
                const buttonEffectGroup = await this.myDeckButtonEffectService.createDeckButtonEffectWithPosition(deckId);
                if (buttonEffectGroup) {
                    this.myDeckButtonEffectService.initializeDeckButtonEffect();
                    this.scene.add(buttonEffectGroup);
                }
            });

        } catch (error) {
            console.error('Failed to add my deck button effects:', error);
        }
    }

    private async saveMyDeckCard(): Promise<void> {
        try{
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndCardLists();

            for (const [deckId, cardIdList] of myDeckCardList) {
                await this.myDeckCardService.createMyDeckCardSceneWithPosition(deckId, cardIdList);
            }

            const deckIdList = this.myDeckCardService.getAllDeckIds();
            deckIdList.forEach((deckId, index) => {
                const cardIds = this.myDeckCardService.getCardIdsByDeckId(deckId);
                const cardMeshes = this.myDeckCardService.getCardMeshesByDeckId(deckId);
                if (cardMeshes) {
                    if (index === 0) {
                        this.myDeckCardService.initializeCardState(deckId, cardIds);
                    } else {
                        this.myDeckCardService.setCardState(deckId, cardIds);
                    }
                    cardMeshes.forEach((mesh) => {
                        this.scene.add(mesh);
                    });
                }
            });
        } catch (error) {
            console.error('Failed to save my deck cards:', error);
        }
    }

    private async addMyDeckNameText(): Promise<void> {
        try{
            const deckIdList = this.myDeckNameTextMapRepository.getDeckIds();
            const myDeckNameList = this.myDeckNameTextMapRepository.getMyDeckNameTextList();

            myDeckNameList.forEach(async (deckName, index) => {
                const deckId = deckIdList[index];
                const textGroup = await this.myDeckNameTextService.createMyDeckNameTextWithPosition(deckId, deckName);

                if (textGroup) {
//                     this.myDeckNameTextService.initializeDeckNameText();
                    this.scene.add(textGroup);
                } else {
                    console.warn(`No deckId found for index ${index}`);
                }
            });
        } catch (error){
             console.error('Failed to add test text:', error);
        }
    }

    private async addDeckMakeButton(): Promise<void> {
        try{
            const deckMakeButtonMesh = await this.deckMakeButtonService.createDeckMakeButton();
            if (deckMakeButtonMesh) {
                this.scene.add(deckMakeButtonMesh);
            } else {
                console.warn(`No deckMakeButtonMesh found`);
                }

        } catch (error) {
           console.error('Failed to add DeckMakeButton:', error);
        }
    }

    private async addTransparentBackground(): Promise<void> {
        try{
            const transparentBackground = await this.transparentBackgroundService.createTransparentBackground();
            if (transparentBackground) {
                this.transparentBackgroundService.initialTransparentBackgroundVisible();
                this.scene.add(transparentBackground);
            } else {
                console.warn(`No transparentBackground found`);
            }
        } catch (error) {
            console.error('Failed to add TransparentBackground:', error);
        }
    }

    private async addDeckMakePopupBackground(): Promise<void> {
        try {
            const deckMakePopupBackground = await this.decKMakePopupBackgroundService.createDeckMakePopupBackground();
            if (deckMakePopupBackground) {
                this.decKMakePopupBackgroundService.initialDeckMakePopupBackgroundVisible();
                this.scene.add(deckMakePopupBackground);
            } else {
                console.warn(`No deckMakePopupBackground found`);
            }
        }catch (error) {
            console.error('Failed to add DeckMakePopupBackground:', error);
        }
    }

    private async addDeckMakePopupButtons(): Promise<void> {
        try {
            const configList = new DeckMakePopupButtonsConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) =>{
                const button = await this.deckMakePopupButtonsService.createDeckMakePopupButtons(
                    config.id,
                    config.position
                );

                if (button) {
                    this.deckMakePopupButtonsService.initializeDeckMakePopupButtonsVisible();
                    this.scene.add(button);
                    console.log(`Draw Deck Make Pop-up Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add DeckMakePopupButtons:', error);
        }
    }

    private async addDeckMakePopupInputContainer():  Promise<void> {
        try {
            await this.deckMakePopupInputContainerService.createDeckMakePopupInputContainer();

        } catch (error) {
            console.error('Failed to add DeckMakePopupInputContainer:', error);
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
            this.myDeckButtonPageMovementButtonService.adjustMyDeckButtonPageMovementButtonPosition();
            this.myDeckCardPageMovementButtonService.adjustMyDeckCardPageMovementButtonPosition();
            this.myDeckButtonService.adjustMyDeckButtonPosition();
            this.myDeckButtonEffectService.adjustMyDeckButtonEffectPosition();
            this.myDeckCardService.adjustMyDeckCardPosition();
            this.myDeckNameTextService.adjustMyDeckNameTextPosition();
//             this.deckMakeButtonService.adjustDeckMakeButtonPosition();
            this.transparentBackgroundService.adjustTransparentBackgroundPosition();
            this.decKMakePopupBackgroundService.adjustDeckMakePopupBackgroundPosition();
            this.deckMakePopupButtonsService.adjustDeckMakePopupButtonsPosition();
            this.deckMakePopupInputContainerService.adjustDeckMakePopupInputContainerPosition();
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

const fieldView = TCGJustTestMyDeckView.getInstance(rootElement);
fieldView.initialize();