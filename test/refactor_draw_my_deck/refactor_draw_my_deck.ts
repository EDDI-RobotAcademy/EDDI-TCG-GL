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
import {DeckMakePopupButtonsConfigList} from "../../src/deck_make_pop_up_buttons/entity/DeckMakePopupButtonsConfigList";
import {BuildDeckButtonConfigList} from "../../src/build_deck_button/entity/BuildDeckButtonConfigList";
import {DeleteDeckPopupButtonConfigList} from "../../src/delete_deck_popup_button/entity/DeleteDeckPopupButtonConfigList";
import {DeckEditButtonConfigList} from "../../src/deck_edit_button/entity/DeckEditButtonConfigList";
import {DeckEditDoneButtonConfigList} from "../../src/deck_edit_done_button/entity/DeckEditDoneButtonConfigList";

import {MyDeckButtonServiceImpl} from "../../src/my_deck_button/service/MyDeckButtonServiceImpl";
import {MyDeckButtonEffectServiceImpl} from "../../src/my_deck_button_effect/service/MyDeckButtonEffectServiceImpl";
import {MyDeckButtonMapRepositoryImpl} from "../../src/my_deck_button/repository/MyDeckButtonMapRepositoryImpl";
import {MyDeckCardServiceImpl} from "../../src/my_deck_card/service/MyDeckCardServiceImpl";
import {MyDeckCardMapRepositoryImpl} from "../../src/my_deck_card/repository/MyDeckCardMapRepositoryImpl";
import {MyDeckOwnedCardsMapRepositoryImpl} from "../../src/my_deck_owned_cards/repository/MyDeckOwnedCardsMapRepositoryImpl";

import {MyDeckNameTextServiceImpl} from "../../src/my_deck_name_text/service/MyDeckNameTextServiceImpl";
import {MyDeckNameTextMapRepositoryImpl} from "../../src/my_deck_name_text/repository/MyDeckNameTextMapRepositoryImpl";
// import {DeckMakeButtonServiceImpl} from "../../src/deck_make_button/service/DeckMakeButtonServiceImpl";
import {TransparentBackgroundServiceImpl} from "../../src/transparent_background/service/TransparentBackgroundServiceImpl";
import {DeckMakePopupBackgroundServiceImpl} from "../../src/deck_make_pop_up_background/service/DeckMakePopupBackgroundServiceImpl";
// import {DeckMakePopupButtonsServiceImpl} from "../../src/deck_make_pop_up_buttons/service/DeckMakePopupButtonsServiceImpl";
// import {DeckMakePopupInputContainerServiceImpl} from "../../src/deck_make_pop_up_input_container/service/DeckMakePopupInputContainerServiceImpl";
import {SideScrollAreaServiceImpl} from "../../src/side_scroll_area/service/SideScrollAreaServiceImpl";
import {BuildDeckButtonServiceImpl} from "../../src/build_deck_button/service/BuildDeckButtonServiceImpl";
import {DeckNameEditButtonServiceImpl} from "../../src/deck_name_edit_button/service/DeckNameEditButtonServiceImpl";
import {DeckDeleteButtonServiceImpl} from "../../src/deck_delete_button/service/DeckDeleteButtonServiceImpl";
import {DeleteDeckPopupWindowServiceImpl} from "../../src/delete_deck_popup_window/service/DeleteDeckPopupWindowServiceImpl";
import {DeleteDeckPopupButtonServiceImpl} from "../../src/delete_deck_popup_button/service/DeleteDeckPopupButtonServiceImpl";
import {DeckEditButtonServiceImpl} from "../../src/deck_edit_button/service/DeckEditButtonServiceImpl";
import {MyDeckBlockServiceImpl} from "../../src/my_deck_block/service/MyDeckBlockServiceImpl";
import {MyDeckCardNameServiceImpl} from "../../src/my_deck_card_name/service/MyDeckCardNameServiceImpl";
import {MyDeckOwnedCardsServiceImpl} from "../../src/my_deck_owned_cards/service/MyDeckOwnedCardsServiceImpl";
import {DeckEditDoneButtonServiceImpl} from "../../src/deck_edit_done_button/service/DeckEditDoneButtonServiceImpl";
import {CardSelectionBlockerServiceImpl} from "../../src/card_selection_blocker/service/CardSelectionBlockerServiceImpl";

import {MyDeckButtonClickDetectServiceImpl} from "../../src/deck_button_click_detect/service/MyDeckButtonClickDetectServiceImpl";
import {MyDeckButtonClickDetectService} from "../../src/deck_button_click_detect/service/MyDeckButtonClickDetectService";
import {DeckMakeButtonClickDetectServiceImpl} from "../../src/deck_make_button_click_detect/service/DeckMakeButtonClickDetectServiceImpl";
import {DeckMakeButtonClickDetectService} from "../../src/deck_make_button_click_detect/service/DeckMakeButtonClickDetectService";
// import {DeckMakePopupButtonsClickDetectServiceImpl} from "../../src/deck_make_pop_up_buttons_click_detect/service/DeckMakePopupButtonsClickDetectServiceImpl";
// import {DeckMakePopupButtonsClickDetectService} from "../../src/deck_make_pop_up_buttons_click_detect/service/DeckMakePopupButtonsClickDetectService";
import {MyDeckScrollService} from "../../src/my_deck_scroll/service/MyDeckScrollService";
import {MyDeckScrollServiceImpl} from "../../src/my_deck_scroll/service/MyDeckScrollServiceImpl";
import {SideScrollAreaDetectService} from "../../src/side_scroll_area_detect/service/SideScrollAreaDetectService";
import {SideScrollAreaDetectServiceImpl} from "../../src/side_scroll_area_detect/service/SideScrollAreaDetectServiceImpl";
import {BuildDeckButtonHoverDetectService} from "../../src/build_deck_button_hover_detect/service/BuildDeckButtonHoverDetectService";
import {BuildDeckButtonHoverDetectServiceImpl} from "../../src/build_deck_button_hover_detect/service/BuildDeckButtonHoverDetectServiceImpl";
import {BuildDeckButtonClickDetectService} from "../../src/build_deck_button_click_detect/service/BuildDeckButtonClickDetectService";
import {BuildDeckButtonClickDetectServiceImpl} from "../../src/build_deck_button_click_detect/service/BuildDeckButtonClickDetectServiceImpl";
import {MyDeckButtonEffectHoverDetectService} from "../../src/my_deck_button_effect_hover_detect/service/MyDeckButtonEffectHoverDetectService";
import {MyDeckButtonEffectHoverDetectServiceImpl} from "../../src/my_deck_button_effect_hover_detect/service/MyDeckButtonEffectHoverDetectServiceImpl";
import {DeckDeleteButtonClickDetectService} from "../../src/deck_delete_button_click_detect/service/DeckDeleteButtonClickDetectService";
import {DeckDeleteButtonClickDetectServiceImpl} from "../../src/deck_delete_button_click_detect/service/DeckDeleteButtonClickDetectServiceImpl";
import {DeleteDeckPopupButtonClickDetectService} from "../../src/delete_deck_popup_button_click_detect/service/DeleteDeckPopupButtonClickDetectService";
import {DeleteDeckPopupButtonClickDetectServiceImpl} from "../../src/delete_deck_popup_button_click_detect/service/DeleteDeckPopupButtonClickDetectServiceImpl";
import {DeckNameEditButtonClickDetectService} from "../../src/deck_name_edit_button_click_detect/service/DeckNameEditButtonClickDetectService";
import {DeckNameEditButtonClickDetectServiceImpl} from "../../src/deck_name_edit_button_click_detect/service/DeckNameEditButtonClickDetectServiceImpl";
import {MyDeckCardScrollService} from "../../src/my_deck_card_scroll/service/MyDeckCardScrollService";
import {MyDeckCardScrollServiceImpl} from "../../src/my_deck_card_scroll/service/MyDeckCardScrollServiceImpl";
import {MyDeckBlockScrollService} from "../../src/my_deck_block_scroll/service/MyDeckBlockScrollService";
import {MyDeckBlockScrollServiceImpl} from "../../src/my_deck_block_scroll/service/MyDeckBlockScrollServiceImpl";
import {DeckEditButtonClickDetectService} from "../../src/deck_edit_button_click_detect/service/DeckEditButtonClickDetectService";
import {DeckEditButtonClickDetectServiceImpl} from "../../src/deck_edit_button_click_detect/service/DeckEditButtonClickDetectServiceImpl";
import {MyDeckOwnedCardsScrollService} from "../../src/my_deck_owned_cards_scroll/service/MyDeckOwnedCardsScrollService";
import {MyDeckOwnedCardsScrollServiceImpl} from "../../src/my_deck_owned_cards_scroll/service/MyDeckOwnedCardsScrollServiceImpl";

import {ClippingMaskManager} from "../../src/clipping_mask_manager/ClippingMaskManager";

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

    private myDeckButtonService = MyDeckButtonServiceImpl.getInstance();
    private myDeckButtonEffectService = MyDeckButtonEffectServiceImpl.getInstance();
    private myDeckCardService = MyDeckCardServiceImpl.getInstance();
    private myDeckNameTextService = MyDeckNameTextServiceImpl.getInstance();
//     private deckMakeButtonService = DeckMakeButtonServiceImpl.getInstance();
    private transparentBackgroundService = TransparentBackgroundServiceImpl.getInstance();
//     private decKMakePopupBackgroundService = DeckMakePopupBackgroundServiceImpl.getInstance();
//     private deckMakePopupButtonsService = DeckMakePopupButtonsServiceImpl.getInstance();
//     private deckMakePopupInputContainerService = DeckMakePopupInputContainerServiceImpl.getInstance();
    private sideScrollAreaService = SideScrollAreaServiceImpl.getInstance();
    private buildDeckButtonService = BuildDeckButtonServiceImpl.getInstance();
    private deckNameEditButtonService = DeckNameEditButtonServiceImpl.getInstance();
    private deckDeleteButtonService = DeckDeleteButtonServiceImpl.getInstance();
    private deleteDeckPopupWindowService = DeleteDeckPopupWindowServiceImpl.getInstance();
    private deleteDeckPopupButtonService = DeleteDeckPopupButtonServiceImpl.getInstance();
    private deckEditButtonService = DeckEditButtonServiceImpl.getInstance();
    private myDeckBlockService = MyDeckBlockServiceImpl.getInstance();
    private myDeckCardNameService = MyDeckCardNameServiceImpl.getInstance();
    private myDeckOwnedCardsService = MyDeckOwnedCardsServiceImpl.getInstance();
    private deckEditDoneButtonService = DeckEditDoneButtonServiceImpl.getInstance();
    private cardSelectionBlockerService = CardSelectionBlockerServiceImpl.getInstance();

    private clippingMaskManager = ClippingMaskManager.getInstance();

    private myDeckButtonMapRepository = MyDeckButtonMapRepositoryImpl.getInstance();
    private myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
    private myDeckNameTextMapRepository = MyDeckNameTextMapRepositoryImpl.getInstance();
    private myDeckOwnedCardsMapRepository = MyDeckOwnedCardsMapRepositoryImpl.getInstance();

    private readonly windowSceneRepository = WindowSceneRepositoryImpl.getInstance();
    private readonly windowSceneService = WindowSceneServiceImpl.getInstance(this.windowSceneRepository);

    private readonly cameraRepository = CameraRepositoryImpl.getInstance();
    private readonly cameraService = CameraServiceImpl.getInstance(this.cameraRepository);

    private myDeckButtonClickDetectService: MyDeckButtonClickDetectService;
//     private deckMakeButtonClickDetectService: DeckMakeButtonClickDetectService;
//     private deckMakePopupButtonsClickDetectService: DeckMakePopupButtonsClickDetectService;
    private myDeckScrollService: MyDeckScrollService;
    private sideScrollAreaDetectService: SideScrollAreaDetectService;
    private buildDeckButtonHoverDetectService: BuildDeckButtonHoverDetectService;
    private buildDeckButtonClickDetectService: BuildDeckButtonClickDetectService;
    private myDeckButtonEffectHoverDetectService: MyDeckButtonEffectHoverDetectService;
    private deckDeleteButtonClickDetectService: DeckDeleteButtonClickDetectService;
    private deleteDeckPopupButtonClickDetectService: DeleteDeckPopupButtonClickDetectService;
    private deckNameEditButtonClickDetectService: DeckNameEditButtonClickDetectService;
    private myDeckCardScrollService: MyDeckCardScrollService;
    private myDeckBlockScrollService: MyDeckBlockScrollService;
    private deckEditButtonClickDetectService: DeckEditButtonClickDetectService;
    private myDeckOwnedCardsScrollService: MyDeckOwnedCardsScrollService;

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

        this.myDeckButtonClickDetectService = MyDeckButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckDeleteButtonClickDetectService = DeckDeleteButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckNameEditButtonClickDetectService = DeckNameEditButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.myDeckButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const buttonClickState = this.myDeckButtonClickDetectService.getButtonClickState();
            if (buttonClickState == true) {
                this.deckDeleteButtonClickDetectService.setButtonClickState(false);
                this.deckNameEditButtonClickDetectService.setButtonClickState(false);
                const buttonClick = await this.myDeckButtonClickDetectService.onMouseDown(e);
            }
        }, false);

        this.sideScrollAreaDetectService = SideScrollAreaDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousemove', async (e) => {
            const scrollAreaDetectState = this.sideScrollAreaDetectService.getMyDeckScrollAreaDetectState();
            if (scrollAreaDetectState == true) {
                this.sideScrollAreaDetectService.onMouseMoveMyDeck(e);
            }
        }, false);

        this.buildDeckButtonHoverDetectService = BuildDeckButtonHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousemove', async (e) => {
            const buildDeckButtonDetectState = this.buildDeckButtonHoverDetectService.getButtonDetectState();
            if (buildDeckButtonDetectState == true) {
                this.buildDeckButtonHoverDetectService.onMouseMove(e);
            }
        }, false);

        this.myDeckScrollService = MyDeckScrollServiceImpl.getInstance(this.camera, this.scene, this.renderer);
        this.renderer.domElement.addEventListener('wheel', async (e) => {
            const scrollState = this.myDeckScrollService.getScrollState();
            if (scrollState == true && this.myDeckScrollService.getDeckCount() > 6) {
                const scrollAreaDetect = this.sideScrollAreaDetectService.getMyDeckScrollEnabledById(0);
                if (scrollAreaDetect == true) {
                    this.myDeckScrollService.onWheelScroll(e);
                }
            }

        }, false);

        this.myDeckCardScrollService = MyDeckCardScrollServiceImpl.getInstance(this.camera, this.scene, this.renderer);
        this.renderer.domElement.addEventListener('wheel', async (e) => {
            const scrollState = this.myDeckCardScrollService.getCardScrollState();
            if (scrollState == true) {
                const currentClickDeckId = this.myDeckCardScrollService.getCurrentClickDeckButtonId();
                const scrollAreaDetect = this.sideScrollAreaDetectService.getMyDeckScrollEnabledById(1);
                if (scrollAreaDetect == true && currentClickDeckId !== null) {
                    const cardRowCount = this.myDeckCardScrollService.getCardRowCount(currentClickDeckId);
                    if (cardRowCount > 2) {
                        this.myDeckCardScrollService.onWheelScroll(e, currentClickDeckId);
                    }
                }
            }

        }, false);

        this.myDeckOwnedCardsScrollService = MyDeckOwnedCardsScrollServiceImpl.getInstance(this.camera, this.scene, this.renderer);
        this.renderer.domElement.addEventListener('wheel', async (e) => {
            const isScrollEnabled = this.myDeckOwnedCardsScrollService.isCardScrollEnabled();
            if (isScrollEnabled == true) {
                const scrollAreaDetect = this.sideScrollAreaDetectService.getMyDeckScrollEnabledById(1);
                if (scrollAreaDetect == true) {
                    const cardRowCount = this.myDeckOwnedCardsScrollService.getCardRowCount();
                    if (cardRowCount > 2) {
                        this.myDeckOwnedCardsScrollService.onWheelScroll(e);
                    }
                }
            }

        }, false);

        this.myDeckBlockScrollService = MyDeckBlockScrollServiceImpl.getInstance(this.camera, this.scene, this.renderer);
        this.renderer.domElement.addEventListener('wheel', async (e) => {
            const scrollState = this.myDeckBlockScrollService.getBlockScrollState();
            if (scrollState == true) {
                const currentClickDeckId = this.myDeckBlockScrollService.getCurrentClickDeckButtonId();
                const scrollAreaDetect = this.sideScrollAreaDetectService.getMyDeckScrollEnabledById(2);
                if (scrollAreaDetect == true && currentClickDeckId !== null) {
                    const blockCount = this.myDeckBlockScrollService.getBlockCountByDeckId(currentClickDeckId);
                    if (blockCount > 8) {
                        this.myDeckBlockScrollService.onWheelScroll(e, currentClickDeckId);
                    }
                }
            }

        }, false);

        this.buildDeckButtonClickDetectService = BuildDeckButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const buildDeckButtonClickState = this.buildDeckButtonClickDetectService.getButtonClickState();
            if (buildDeckButtonClickState == true) {
                // To-do: 덱 생성 버튼 클릭 했을 때 덱 버튼은 클릭 안 되게 해야 함.
                const buildDeckButtonClick = await this.buildDeckButtonClickDetectService.onMouseDown(e);
            }
        }, false);

        this.deckEditButtonClickDetectService = DeckEditButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const deckEditButtonClickEnabled = this.deckEditButtonClickDetectService.isButtonClickEnabled();
            if (deckEditButtonClickEnabled == true) {
                const deckEditButtonClick = await this.deckEditButtonClickDetectService.onMouseDown(e);
            }
        }, false);

        this.myDeckButtonEffectHoverDetectService = MyDeckButtonEffectHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousemove', async (e) => {
            const effectDetectState = this.myDeckButtonEffectHoverDetectService.getEffectDetectState();
            if (effectDetectState == true) {
                const buttonEffectHover = await this.myDeckButtonEffectHoverDetectService.onMouseMove(e);
            }
        }, false);

        // 덱 버튼 클릭되고 덱 삭제 버튼이 나타날 때만 삭제 버튼 클릭 가능해야 함
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const currentHoveredEffectId = this.myDeckButtonEffectHoverDetectService.getCurrentHoveredEffectId();
            if (currentHoveredEffectId !== null) {
                const deleteButtonVisibleState = this.myDeckButtonEffectHoverDetectService.getDeckDeleteButtonVisibility(currentHoveredEffectId);
                if (deleteButtonVisibleState == true) {
                    this.deckDeleteButtonClickDetectService.setButtonClickState(true);
                }
            }

            // 덱 삭제 버튼 클릭시 덱 버튼이 클릭되면 안 됨
            const buttonClickState = this.deckDeleteButtonClickDetectService.getButtonClickState();
            if (buttonClickState == true) {
                this.myDeckButtonClickDetectService.setButtonClickState(false);
                const buttonClick = await this.deckDeleteButtonClickDetectService.onMouseDown(e);
                if (buttonClick) {
                    this.deckDeleteButtonClickDetectService.setButtonClickState(false);
                    this.myDeckButtonClickDetectService.setButtonClickState(true);
                }
            }
        }, false);

        // To-do: 팝업 창이 나타났을 때 팝업 창의 버튼 외의 다른 버튼들은 클릭되면 안 되게 해야 함.
        this.deleteDeckPopupButtonClickDetectService = DeleteDeckPopupButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const buttonsVisibleState = this.deleteDeckPopupButtonService.getButtonsVisibleState();
            if (buttonsVisibleState.some((state) => state === true)) {
                this.deleteDeckPopupButtonClickDetectService.setButtonClickState(true);
            }
            const buttonClickState = this.deleteDeckPopupButtonClickDetectService.getButtonClickState();
            if (buttonClickState == true) {
                this.myDeckButtonClickDetectService.setButtonClickState(false);
                this.buildDeckButtonClickDetectService.setButtonClickState(false);
                this.buildDeckButtonHoverDetectService.setButtonDetectState(false);
                this.myDeckButtonEffectHoverDetectService.setEffectDetectState(false);
                this.sideScrollAreaDetectService.setMyDeckScrollAreaDetectState(false);

                await this.deleteAllCard();

                const popupButtonClick = await this.deleteDeckPopupButtonClickDetectService.onMouseDown(e);
                if (popupButtonClick) {
                    this.deleteDeckPopupButtonClickDetectService.setButtonClickState(false);
                    this.myDeckButtonClickDetectService.setButtonClickState(true);
                    this.buildDeckButtonClickDetectService.setButtonClickState(true);
                    this.buildDeckButtonHoverDetectService.setButtonDetectState(true);
                    this.myDeckButtonEffectHoverDetectService.setEffectDetectState(true);
                    this.sideScrollAreaDetectService.setMyDeckScrollAreaDetectState(true);

                    await this.deleteMyDeckButtons();
                    await this.deleteMyDeckButtonEffects();
                    await this.deleteDeckNameEditButton();
                    await this.deleteDeckDeleteButton();
                    await this.deleteDeckNameText();

                    await this.addMyDeckCard();
                    await this.addMyDeckButton();
                    await this.addMyDeckButtonEffect();
                    await this.addMyDeckNameText();
                    await this.addDeckNameEditButton();
                    await this.addDeckDeleteButton();

                }
            }
        }, false);

        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const currentHoveredButtonEffectId = this.myDeckButtonEffectHoverDetectService.getCurrentHoveredEffectId();
            if (currentHoveredButtonEffectId !== null) {
                const deckEditButtonVisibleState = this.myDeckButtonEffectHoverDetectService.getDeckNameEditButtonVisibility(currentHoveredButtonEffectId);
                if (deckEditButtonVisibleState == true) {
                    this.deckNameEditButtonClickDetectService.setButtonClickState(true);
                }
            }

            const deckNameEditButtonClickState = this.deckNameEditButtonClickDetectService.getButtonClickState();
            if (deckNameEditButtonClickState == true) {
                this.myDeckButtonClickDetectService.setButtonClickState(false);
                const deckNameEditButtonClick = await this.deckNameEditButtonClickDetectService.onMouseDown(e);
                if (deckNameEditButtonClick) {
                    this.deckNameEditButtonClickDetectService.setButtonClickState(false);
                    this.myDeckButtonClickDetectService.setButtonClickState(true);
                }
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

//         this.deckMakePopupButtonsClickDetectService = DeckMakePopupButtonsClickDetectServiceImpl.getInstance(this.camera, this.scene);
// //         this.renderer.domElement.addEventListener('mousedown', (e) => this.deckMakePopupButtonsClickDetectService.onMouseDown(e), false);
//         this.renderer.domElement.addEventListener('mousedown', (e) => {
//             if (this.isDeckMakePopupButtonsEnabled) {
//                 this.deckMakePopupButtonsClickDetectService.onMouseDown(e);
//                 const currentButtonClickState = this.deckMakePopupButtonsClickDetectService.getCurrentButtonClickState();
//                 if (currentButtonClickState) {
//                     this.isMyDeckButtonEnabled = true;
//                     this.isDeckPageMovementButtonEnabled = true;
//                     this.isDeckCardPageMovementButtonEnabled = true;
//                     this.isDeckMakeButtonEnabled = true;
//                 }
//             }
//         }, false);

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
//         await TextGenerator.loadFont('../../resource/font/HeirofLightOTFRegular.otf');
        await TextGenerator.loadFont('../../resource/font/GowunBatang-Regular.ttf');

        await this.addBackground();
        await this.addScrollArea();
        await this.addCardScrollArea();
        await this.addBlockScrollArea();
        await this.addMyDeckCard();
        await this.addMyDeckOwnedCards();
        await this.addCardSelectionBlocker();
        await this.addMyDeckBlock();
        await this.addMyDeckCardName();
        await this.addMyDeckButton();
        await this.addMyDeckButtonEffect();
        await this.addBuildDeckButton();
        await this.addDeckEditButton();
        await this.addDeckEditDoneButton();
        await this.addMyDeckNameText();
        await this.addDeckNameEditButton();
        await this.addDeckDeleteButton();
//         this.addDeckMakeButton();
        this.addTransparentBackground();
//         this.addDeckMakePopupBackground();
//         this.addDeckMakePopupButtons();
//         this.addDeckMakePopupInputContainer();
        this.addDeleteDeckPopupWindow();
        this.addDeleteDeckPopupButton();

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

    private async addScrollArea(): Promise<void> {
        try{
            const areaMesh = await this.sideScrollAreaService.createSideScrollArea('myDeckScrollArea', 3, 0.203, 0.46, -0.381, -0.035);
            if (areaMesh) {
                this.scene.add(areaMesh);
            } else {
                console.warn(`No Side Scroll Area Mesh found`);
            }

        } catch (error) {
            console.error('Failed to add Side Scroll Area:', error);
        }
    }

    private async addCardScrollArea(): Promise<void> {
        try {
            const areaMesh = await this.sideScrollAreaService.createSideScrollArea('myDeckCardScrollArea', 3, 0.54, 0.745, 0, -0.125);
            if (areaMesh) {
                this.scene.add(areaMesh);
            } else {
                console.warn(`No Card Scroll Area Mesh found`);
            }

        } catch (error) {
            console.error('Failed to add Card Scroll Area:', error);
        }
    }

    private async addBlockScrollArea(): Promise<void> {
        try {
            const areaMesh = await this.sideScrollAreaService.createSideScrollArea('myDeckBlockScrollArea', 3, 0.202, 0.61, 0.38, -0.024);
            if (areaMesh) {
                this.scene.add(areaMesh);
            } else {
                console.warn(`Block Scroll Area Mesh Not found`);
            }

        } catch (error) {
            console.error('Failed to add Block Scroll Area:', error);
        }
    }

    private async addMyDeckButton(): Promise<void> {
        try {
            const myDeckButtonList = this.myDeckButtonMapRepository.getMyDeckList();

//             myDeckButtonList.forEach(async (deckId, index) => {
//                 const buttonGroup = await this.myDeckButtonService.createMyDeckButtonWithPosition(deckId);
//
//                 if (buttonGroup) {
//                     this.myDeckButtonService.initializeDeckButton(); // 처음 6개만 visible
//                     this.scene.add(buttonGroup);
//                 }
//             });

            for (const [index, deckId] of myDeckButtonList.entries()) {
                await this.myDeckButtonService.createMyDeckButtonWithPosition(deckId);
            }

            this.myDeckButtonService.initializeDeckButton();
            this.myDeckButtonService.saveCurrentClickDeckButtonId(1);
            const deckButtonGroup = this.myDeckButtonService.getMyDeckButtonGroups();
            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
                deckButtonGroup.children.forEach((buttonObject) => {
                    if (buttonObject instanceof THREE.Mesh) {
                        this.clippingMaskManager.applyClippingPlanesToMesh(buttonObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in buttonGroup:", buttonObject);
                    }
                });
            }

            if (!this.scene.children.includes(deckButtonGroup)) {
                this.scene.add(deckButtonGroup);
            }
            deckButtonGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add my deck buttons:', error);
        }
    }

    private async addMyDeckButtonEffect(): Promise<void> {
        try {
            const myDeckButtonList = this.myDeckButtonMapRepository.getMyDeckList();

//             myDeckButtonList.forEach(async (deckId, index) => {
//                 const buttonEffectGroup = await this.myDeckButtonEffectService.createDeckButtonEffectWithPosition(deckId);
//                 if (buttonEffectGroup) {
//                     this.myDeckButtonEffectService.initializeDeckButtonEffect();
//                     this.scene.add(buttonEffectGroup);
//                 }
//             });

            for (const [index, deckId] of myDeckButtonList.entries()) {
                await this.myDeckButtonEffectService.createDeckButtonEffectWithPosition(deckId);
            }
            this.myDeckButtonEffectService.initializeDeckButtonEffect();
            const deckButtonEffectGroup = this.myDeckButtonEffectService.getMyDeckButtonEffectGroups();
            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
                deckButtonEffectGroup.children.forEach((effectObject) => {
                    if (effectObject instanceof THREE.Mesh) {
                        this.clippingMaskManager.applyClippingPlanesToMesh(effectObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in button effect Group:", effectObject);
                    }
                });
            }

            if (!this.scene.children.includes(deckButtonEffectGroup)) {
                this.scene.add(deckButtonEffectGroup);
            }
            deckButtonEffectGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add my deck button effects:', error);
        }
    }

    private async addDeckNameEditButton(): Promise<void> {
        try {
            const myDeckButtonList = this.myDeckButtonMapRepository.getMyDeckList();

            for (const [index, deckId] of myDeckButtonList.entries()) {
                await this.deckNameEditButtonService.createDeckNameEditButtonWithPosition(deckId);
            }

            const buttonGroup = this.deckNameEditButtonService.getButtonGroup();
            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
                buttonGroup.children.forEach((buttonObject) => {
                    if (buttonObject instanceof THREE.Mesh) {
                        this.clippingMaskManager.applyClippingPlanesToMesh(buttonObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in buttonGroup:", buttonObject);
                    }
                });
            }

            if (!this.scene.children.includes(buttonGroup)) {
                this.scene.add(buttonGroup);
            }
            buttonGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add Deck Name Edit Buttons:', error);
        }
    }

    private async addDeckDeleteButton(): Promise<void> {
        try {
            const myDeckButtonList = this.myDeckButtonMapRepository.getMyDeckList();

            for (const [index, deckId] of myDeckButtonList.entries()) {
                await this.deckDeleteButtonService.createDeckDeleteButtonWithPosition(deckId);
            }

            const buttonGroup = this.deckDeleteButtonService.getButtonGroup();
            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
                buttonGroup.children.forEach((buttonObject) => {
                    if (buttonObject instanceof THREE.Mesh) {
                        this.clippingMaskManager.applyClippingPlanesToMesh(buttonObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in buttonGroup:", buttonObject);
                    }
                });
            }

            if (!this.scene.children.includes(buttonGroup)) {
                this.scene.add(buttonGroup);
            }
            buttonGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add Deck Delete Buttons:', error);
        }
    }

    private async addMyDeckCard(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardListsNew();
            for (const [deckId, cardIdList] of myDeckCardList) {
                await this.myDeckCardService.createMyDeckCardWithPosition(deckId, cardIdList);
            }

            const deckIdList = this.myDeckCardService.getAllDeckIdList();
            const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
            const firstDeckId = sortedDeckIdList[0];

            deckIdList.forEach((deckId, index) => {
                if (deckId === firstDeckId) {
                    this.myDeckButtonClickDetectService.saveCurrentClickDeckButtonId(deckId);
                    this.myDeckCardService.setAllCardVisibilityByDeckId(deckId, true);
                } else {
                    this.myDeckCardService.setAllCardVisibilityByDeckId(deckId, false);
                }
                this.myDeckCardService.saveCardGroup(deckId);
//                 const cardList = this.myDeckCardService.getCardListByDeckId(deckId);
//                 cardList.forEach((cardMesh) => this.scene.add(cardMesh));
            });

            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 1);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                deckIdList.forEach((deckId) => {
                    const cardGroup = this.myDeckCardService.getCardGroupByDeckId(deckId);
//                     console.log(`%c Card Group for Deck ID ${deckId}:, ${cardGroup}`, 'color: #FE2EF7; font-weight: bold;');
//                     console.log(`%c Children of Card Group:${cardGroup.children}`, 'color: #FE2EF7; font-weight: bold;');
                    cardGroup.children.forEach((buttonObject) => {
                        if (buttonObject instanceof THREE.Mesh) {
                            this.clippingMaskManager.applyClippingPlanesToMesh(buttonObject, clippingPlanes);
                        } else {
                            console.warn("[WARN] Skipping non-mesh object in cardGroup:", buttonObject);
                        }
                    });

                    if (!this.scene.children.includes(cardGroup)) {
                        this.scene.add(cardGroup);
                    }
                    cardGroup.position.y = 0;
                });

            }
        } catch (error) {
            console.error('Failed to add my deck cards:', error);
        }
    }

    private async addMyDeckOwnedCards(): Promise<void> {
        try {
            const cardMap = this.myDeckOwnedCardsMapRepository.findCurrentMyDeckOwnedCardsMap();
            await this.myDeckOwnedCardsService.createMyDeckOwnedCardsWithPosition(cardMap);

            const cardList = this.myDeckOwnedCardsService.getCardList();
            cardList.forEach((card) => {
                card.setVisibility(false);
//                 this.scene.add(card.getMesh());
            });

            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 1);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                const cardGroup = this.myDeckOwnedCardsService.getCardGroup();
                cardGroup.children.forEach((buttonObject) => {
                    if (buttonObject instanceof THREE.Mesh) {
                        this.clippingMaskManager.applyClippingPlanesToMesh(buttonObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in cardGroup:", buttonObject);
                    }
                });

                if (!this.scene.children.includes(cardGroup)) {
                    this.scene.add(cardGroup);
                }
                cardGroup.position.y = 0;

            }

        } catch (error) {
            console.error('Failed to add my deck owned cards:', error);
        }
    }

    private async addCardSelectionBlocker(): Promise<void> {
        try {
            const cardIdList = this.myDeckOwnedCardsMapRepository.getCardIdList();
            await this.cardSelectionBlockerService.createCardSelectionBlockerWithPosition(cardIdList);

            const blockerList = this.cardSelectionBlockerService.getBlockerList();
//             blockerList.forEach((blocker) => {
//                 this.scene.add(blocker.getMesh());
//             });

            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 1);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                const blockerGroup = this.cardSelectionBlockerService.getBlockerGroup();
                blockerGroup.children.forEach((blockerObject) => {
                    if (blockerObject instanceof THREE.Mesh) {
                        this.clippingMaskManager.applyClippingPlanesToMesh(blockerObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in blockerGroup:", blockerObject);
                    }
                });

                if (!this.scene.children.includes(blockerGroup)) {
                    this.scene.add(blockerGroup);
                }
                blockerGroup.position.y = 0;
            }

        } catch (error) {
            console.error('Failed to add Card Selection Blocker:', error);
        }
    }

    private async addMyDeckBlock(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardListsNew();
            for (const [deckId, cardIdList] of myDeckCardList) {
                await this.myDeckBlockService.createMyDeckBlockWithPosition(deckId, cardIdList);
            }

            const deckIdList = this.myDeckBlockService.getAllDeckIdList();
            const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
            const firstDeckId = sortedDeckIdList[0];

            deckIdList.forEach((deckId, index) => {
                const blockList = this.myDeckBlockService.getBlockListByDeckId(deckId);
                if (deckId === firstDeckId) {
                    blockList.forEach((block) => block.setVisibility(true));
                } else {
                    blockList.forEach((block) => block.setVisibility(false));
                }
                this.myDeckBlockService.saveBlockGroup(deckId);
//                 blockList.forEach((block) => this.scene.add(block.getMesh()));
            });

            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 2);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                deckIdList.forEach((deckId) => {
                    const blockGroup = this.myDeckBlockService.getBlockGroupByDeckId(deckId);
                    blockGroup.children.forEach((blockObject) => {
                        if (blockObject instanceof THREE.Mesh) {
                            this.clippingMaskManager.applyClippingPlanesToMesh(blockObject, clippingPlanes);
                        } else {
                            console.warn("[WARN] Skipping non-mesh object in Block Group:", blockObject);
                        }
                    });

                    if (!this.scene.children.includes(blockGroup)) {
                        this.scene.add(blockGroup);
                    }
                    blockGroup.position.y = 0;
                });

            }

        } catch (error) {
            console.error('Failed to add my deck blocks:', error);
        }
    }

    private async addMyDeckCardName(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardListsNew();
            for (const [deckId, cardIdList] of myDeckCardList) {
                await this.myDeckCardNameService.createMyDeckCardNameWithPosition(deckId, cardIdList);
            }

            const deckIdList = this.myDeckCardNameService.getAllDeckIdList();
            const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
            const firstDeckId = sortedDeckIdList[0];

            deckIdList.forEach((deckId, index) => {
                const cardNameList = this.myDeckCardNameService.getCardNameListByDeckId(deckId);
                if (deckId === firstDeckId) {
                    cardNameList.forEach((cardName) => cardName.setVisibility(true));
                } else {
                    cardNameList.forEach((cardName) => cardName.setVisibility(false));
                }
                this.myDeckCardNameService.saveCardNameGroup(deckId);
//                 cardNameList.forEach((cardName) => this.scene.add(cardName.getMesh()));
            });

            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 2);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                deckIdList.forEach((deckId) => {
                    const cardNameGroup = this.myDeckCardNameService.getCardNameGroupByDeckId(deckId);
                    cardNameGroup.children.forEach((cardNameObject) => {
                        if (cardNameObject instanceof THREE.Mesh) {
                            this.clippingMaskManager.applyClippingPlanesToMesh(cardNameObject, clippingPlanes);
                        } else {
                            console.warn("[WARN] Skipping non-mesh object in Card Name Group:", cardNameObject);
                        }
                    });

                    if (!this.scene.children.includes(cardNameGroup)) {
                        this.scene.add(cardNameGroup);
                    }
                    cardNameGroup.position.y = 0;
                });

            }

        } catch (error) {
            console.error('Failed to add My Deck Card Name:', error);
        }
    }

    private async addMyDeckNameText(): Promise<void> {
        try{
            const deckIdList = this.myDeckNameTextMapRepository.getDeckIds();
            const myDeckNameList = this.myDeckNameTextMapRepository.getMyDeckNameTextList();

//             myDeckNameList.forEach(async (deckName, index) => {
//                 const deckId = deckIdList[index];
//                 const textGroup = await this.myDeckNameTextService.createMyDeckNameTextWithPosition(deckId, deckName);
//
//                 if (textGroup) {
//                     this.scene.add(textGroup);
//                 } else {
//                     console.warn(`No deckId found for index ${index}`);
//                 }
//             });

            for (const [index, deckName] of myDeckNameList.entries()) {
                const deckId = deckIdList[index];
                await this.myDeckNameTextService.createMyDeckNameTextWithPosition(deckId, deckName);
            }

            const textGroup = this.myDeckNameTextService.getMyDeckTextGroups();
            const scrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(3, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (scrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
                textGroup.children.forEach((textObject) => {
                    if (textObject instanceof THREE.Mesh) {
                        this.clippingMaskManager.applyClippingPlanesToMesh(textObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in text Group:", textObject);
                    }
                });
            }

            if (!this.scene.children.includes(textGroup)) {
                this.scene.add(textGroup);
            }
            textGroup.position.y = 0;

        } catch (error){
             console.error('Failed to add test text:', error);
        }
    }

//     private async addDeckMakeButton(): Promise<void> {
//         try{
//             const deckMakeButtonMesh = await this.deckMakeButtonService.createDeckMakeButton();
//             if (deckMakeButtonMesh) {
//                 this.scene.add(deckMakeButtonMesh);
//             } else {
//                 console.warn(`No deckMakeButtonMesh found`);
//                 }
//
//         } catch (error) {
//            console.error('Failed to add DeckMakeButton:', error);
//         }
//     }

    private async addBuildDeckButton(): Promise<void> {
        try {
            const configList = new BuildDeckButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) =>{
                const button = await this.buildDeckButtonService.createBuildDeckButton(
                    config.id,
                    config.position
                );

                if (button) {
                    this.buildDeckButtonService.initializeRaceButtonVisible();
                    this.scene.add(button);
                    console.log(`Draw Build Deck Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add Build Deck Button:', error);
        }
    }

    private async addDeckEditButton(): Promise<void> {
        try {
            const configList = new DeckEditButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) =>{
                const button = await this.deckEditButtonService.createDeckEditButton(
                    config.id,
                    config.position
                );

                if (button) {
                    this.scene.add(button);
                    console.log(`Draw Deck Edit Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add Deck Edit Button:', error);
        }
    }

    private async addDeckEditDoneButton(): Promise<void> {
        try {
            const configList = new DeckEditDoneButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) => {
                const button = await this.deckEditDoneButtonService.createDeckEditDoneButton(
                    config.id,
                    config.position
                );

                if (button) {
                    this.scene.add(button);
                    console.log(`Draw Deck Edit Done Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add Deck Edit Done Button:', error);
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

    private async addDeleteDeckPopupWindow(): Promise<void> {
        try {
            const popupWindow = await this.deleteDeckPopupWindowService.createDeleteDeckPopupWindow();
            if (popupWindow) {
                this.scene.add(popupWindow);
            } else {
                console.warn(`Not found Delete Deck Popup Window`);
            }
        }catch (error) {
            console.error('Failed to add Delete Deck Popup Window`:', error);
        }
    }

    private async addDeleteDeckPopupButton(): Promise<void> {
        try {
            const configList = new DeleteDeckPopupButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) => {
                const button = await this.deleteDeckPopupButtonService.createDeleteDeckPopupButton(
                    config.id,
                    config.position
                );

                if (button) {
                    this.scene.add(button);
                    console.log(`Draw Delete Deck Popup Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add Delete Deck Popup Button:', error);
        }
    }

//     private async addDeckMakePopupBackground(): Promise<void> {
//         try {
//             const deckMakePopupBackground = await this.decKMakePopupBackgroundService.createDeckMakePopupBackground();
//             if (deckMakePopupBackground) {
//                 this.decKMakePopupBackgroundService.initialDeckMakePopupBackgroundVisible();
//                 this.scene.add(deckMakePopupBackground);
//             } else {
//                 console.warn(`No deckMakePopupBackground found`);
//             }
//         }catch (error) {
//             console.error('Failed to add DeckMakePopupBackground:', error);
//         }
//     }

//     private async addDeckMakePopupButtons(): Promise<void> {
//         try {
//             const configList = new DeckMakePopupButtonsConfigList();
//             await Promise.all(configList.buttonConfigs.map(async (config) =>{
//                 const button = await this.deckMakePopupButtonsService.createDeckMakePopupButtons(
//                     config.id,
//                     config.position
//                 );
//
//                 if (button) {
//                     this.deckMakePopupButtonsService.initializeDeckMakePopupButtonsVisible();
//                     this.scene.add(button);
//                     console.log(`Draw Deck Make Pop-up Button ${config.id}`);
//                 }
//             }));
//         } catch (error) {
//             console.error('Failed to add DeckMakePopupButtons:', error);
//         }
//     }

//     private async addDeckMakePopupInputContainer():  Promise<void> {
//         try {
//             await this.deckMakePopupInputContainerService.createDeckMakePopupInputContainer();
//
//         } catch (error) {
//             console.error('Failed to add DeckMakePopupInputContainer:', error);
//         }
//     }

    private async deleteMyDeckButtons(): Promise<void> {
        try {
            const allButton = this.myDeckButtonService.getAllMyDeckButton();
            const buttonGroup = this.myDeckButtonService.getMyDeckButtonGroups();
            allButton.forEach((buttonMesh) => {
                if (buttonMesh) {
                    this.scene.remove(buttonMesh.getMesh());
                }
            });
            if (buttonGroup) {
                this.scene.remove(buttonGroup);
                buttonGroup.clear();
                this.myDeckButtonService.resetMyDeckButtonGroups();
            }
            this.myDeckButtonService.resetButtonVisibility();
        } catch (error) {
            console.error('Failed to delete My Deck Button:', error);
        }
    }

    private async deleteMyDeckButtonEffects(): Promise<void> {
        try {
            const allEffect = this.myDeckButtonEffectService.getAllMyButtonEffect();
            const effectGroup = this.myDeckButtonEffectService.getMyDeckButtonEffectGroups();
            allEffect.forEach((effectMesh) => {
                if (effectMesh) {
                    this.scene.remove(effectMesh.getMesh());
                }
            });
            if (effectGroup) {
                this.scene.remove(effectGroup);
                effectGroup.clear();
                this.myDeckButtonEffectService.resetMyDeckButtonEffectGroups();
            }
            this.myDeckButtonEffectService.resetEffectVisibility();
        } catch (error) {
            console.error('Failed to delete My Deck Button Effect:', error);
        }
    }

    private async deleteDeckNameEditButton(): Promise<void> {
        try {
            const allButton = this.deckNameEditButtonService.getAllButton();
            const buttonGroup = this.deckNameEditButtonService.getButtonGroup();
            allButton.forEach((buttonMesh) => {
                if (buttonMesh) {
                    this.scene.remove(buttonMesh.getMesh());
                }
            });
            if (buttonGroup) {
                this.scene.remove(buttonGroup);
                buttonGroup.clear();
                this.deckNameEditButtonService.resetButtonGroup();
            }
        } catch (error) {
            console.error('Failed to delete Deck Name Edit Button:', error);
        }
    }

    private async deleteDeckDeleteButton(): Promise<void> {
        try {
            const allButton = this.deckDeleteButtonService.getAllButton();
            const buttonGroup = this.deckDeleteButtonService.getButtonGroup();
            allButton.forEach((buttonMesh) => {
                if (buttonMesh) {
                    this.scene.remove(buttonMesh.getMesh());
                }
            });
            if (buttonGroup) {
                this.scene.remove(buttonGroup);
                buttonGroup.clear();
                this.deckDeleteButtonService.resetButtonGroup();
            }
        } catch (error) {
            console.error('Failed to delete Deck Delete Button:', error);
        }
    }

    private async deleteDeckNameText(): Promise<void> {
        try {
            const allText = this.myDeckNameTextService.getAllMyDeckNameText();
            const textGroup = this.myDeckNameTextService.getMyDeckTextGroups();
            allText.forEach((text) => {
                if (text) {
                    this.scene.remove(text.getMesh());
                }
            });
            if (textGroup) {
                this.scene.remove(textGroup);
                textGroup.clear();
                this.myDeckNameTextService.resetMyDeckTextGroups();
            }
        } catch (error) {
            console.error('Failed to delete Deck Name Text:', error);
        }
    }

    private async deleteAllCard(): Promise<void> {
        try {
            const allDeckIdList = this.myDeckCardService.getAllDeckIdList();
            allDeckIdList.forEach((deckId) => {
                const cardMeshList = this.myDeckCardService.getCardListByDeckId(deckId);
                for (const cardMesh of cardMeshList) {
                    cardMesh.visible = false;
                    this.scene.remove(cardMesh);
                }
            });

            this.myDeckCardService.resetCardVisibility();

        } catch (error) {
            console.error('Failed to delete Card:', error);
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
            this.sideScrollAreaService.adjustMyDeckSideScrollAreaPosition();
            this.sideScrollAreaService.adjustMyDeckCardScrollAreaPosition();
            this.sideScrollAreaService.adjustMyDeckBlockScrollAreaPosition();
            this.myDeckButtonService.adjustMyDeckButtonPosition();
            this.myDeckButtonEffectService.adjustMyDeckButtonEffectPosition();
            this.deckNameEditButtonService.adjustDeckNameEditButtonPosition();
            this.deckDeleteButtonService.adjustDeckDeleteButtonPosition();
            this.myDeckCardService.adjustMyDeckCardPosition();
            this.myDeckOwnedCardsService.adjustMyDeckOwnedCardsPosition();
            this.cardSelectionBlockerService.adjustCardSelectionBlockerPosition();
            this.myDeckBlockService.adjustMyDeckBlockPosition();
            this.myDeckCardNameService.adjustMyDeckCardNamePosition();
            this.myDeckNameTextService.adjustMyDeckNameTextPosition();
            this.buildDeckButtonService.adjustBuildDeckButtonPosition();
            this.deckEditButtonService.adjustDeckEditButtonPosition();
            this.deckEditDoneButtonService.adjustDeckEditDoneButtonPosition();
//             this.deckMakeButtonService.adjustDeckMakeButtonPosition();
            this.transparentBackgroundService.adjustTransparentBackgroundPosition();
//             this.decKMakePopupBackgroundService.adjustDeckMakePopupBackgroundPosition();
//             this.deckMakePopupButtonsService.adjustDeckMakePopupButtonsPosition();
//             this.deckMakePopupInputContainerService.adjustDeckMakePopupInputContainerPosition();
            this.deleteDeckPopupWindowService.adjustDeckMakePopupBackgroundPosition();
            this.deleteDeckPopupButtonService.adjustDeleteDeckPopupButtonPosition();
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