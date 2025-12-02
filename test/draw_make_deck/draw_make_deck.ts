import * as THREE from 'three';
import myCardMusic from '@resource/music/my_card/my-card.mp3';

import {TextureManager} from "../../src/texture_manager/TextureManager";
import {NonBackgroundImage} from "../../src/shape/image/NonBackgroundImage";
import { AudioController } from "../../src/audio/AudioController";
import {MouseController} from "../../src/mouse/MouseController";

import {UserWindowSize} from "../../src/window_size/WindowSize"
import {WindowSceneServiceImpl} from "../../src/window_scene/service/WindowSceneServiceImpl";
import {WindowSceneRepositoryImpl} from "../../src/window_scene/repository/WindowSceneRepositoryImpl";
import {CameraServiceImpl} from "../../src/camera/service/CameraServiceImpl";
import {CameraRepositoryImpl} from "../../src/camera/repository/CameraRepositoryImpl";
import {MakeDeckScreenCardMapRepositoryImpl} from "../../src/make_deck_screen_card/repository/MakeDeckScreenCardMapRepositoryImpl";

import {BackgroundServiceImpl} from "../../src/background/service/BackgroundServiceImpl";
import {BackgroundRepositoryImpl} from "../../src/background/repository/BackgroundRepositoryImpl";
import {MakeDeckScreenCardServiceImpl} from "../../src/make_deck_screen_card/service/MakeDeckScreenCardServiceImpl";
import {RaceButtonServiceImpl} from "../../src/race_button/service/RaceButtonServiceImpl";
import {RaceButtonEffectServiceImpl} from "../../src/race_button_effect/service/RaceButtonEffectServiceImpl";
import {CardPageMovementButtonServiceImpl} from "../../src/make_deck_card_page_movement_button/service/CardPageMovementButtonServiceImpl";
import {MakeDeckScreenDoneButtonServiceImpl} from "../../src/make_deck_screen_done_button/service/MakeDeckScreenDoneButtonServiceImpl";
import {SelectedCardBlockServiceImpl} from "../../src/selected_card_block/service/SelectedCardBlockServiceImpl";
import {SideScrollAreaServiceImpl} from "../../src/side_scroll_area/service/SideScrollAreaServiceImpl";
import {NumberOfSelectedCardsServiceImpl} from  "../../src/number_of_selected_cards/service/NumberOfSelectedCardsServiceImpl";
import {SelectedCardBlockEffectServiceImpl} from "../../src/selected_card_block_effect/service/SelectedCardBlockEffectServiceImpl";
import {BlockAddButtonServiceImpl} from "../../src/block_add_button/service/BlockAddButtonServiceImpl";
import {BlockDeleteButtonServiceImpl} from "../../src/block_delete_button/service/BlockDeleteButtonServiceImpl";
import {NumberOfOwnedCardsServiceImpl} from "../../src/number_of_owned_cards/service/NumberOfOwnedCardsServiceImpl";
import {MakeDeckScreenCardEffectServiceImpl} from "../../src/make_deck_screen_card_effect/service/MakeDeckScreenCardEffectServiceImpl";

import {RaceButtonConfigList} from "../../src/race_button/entity/RaceButtonConfigList";
import {RaceButtonEffectConfigList} from "../../src/race_button_effect/entity/RaceButtonEffectConfigList";
import {CardPageMovementButtonConfigList} from "../../src/make_deck_card_page_movement_button/entity/CardPageMovementButtonConfigList";
import {MakeDeckScreenDoneButtonConfigList} from "../../src/make_deck_screen_done_button/entity/MakeDeckScreenDoneButtonConfigList";

import {RaceButtonClickDetectService} from "../../src/race_button_click_detect/service/RaceButtonClickDetectService";
import {RaceButtonClickDetectServiceImpl} from "../../src/race_button_click_detect/service/RaceButtonClickDetectServiceImpl";
import {PageMovementButtonClickDetectService} from "../../src/make_deck_card_page_movement_button_click_detect/service/PageMovementButtonClickDetectService";
import {PageMovementButtonClickDetectServiceImpl} from "../../src/make_deck_card_page_movement_button_click_detect/service/PageMovementButtonClickDetectServiceImpl";
import {MakeDeckScreenCardClickDetectService} from "../../src/make_deck_screen_card_click_detect/service/MakeDeckScreenCardClickDetectService";
import {MakeDeckScreenCardClickDetectServiceImpl} from "../../src/make_deck_screen_card_click_detect/service/MakeDeckScreenCardClickDetectServiceImpl";
import {SideScrollAreaDetectService} from "../../src/side_scroll_area_detect/service/SideScrollAreaDetectService";
import {SideScrollAreaDetectServiceImpl} from "../../src/side_scroll_area_detect/service/SideScrollAreaDetectServiceImpl";
import {SideScrollService} from "../../src/side_scroll/service/SideScrollService";
import {SideScrollServiceImpl} from "../../src/side_scroll/service/SideScrollServiceImpl";
import {MakeDeckScreenDoneButtonClickDetectService} from "../../src/make_deck_screen_done_button_click_detect/service/MakeDeckScreenDoneButtonClickDetectService";
import {MakeDeckScreenDoneButtonClickDetectServiceImpl} from "../../src/make_deck_screen_done_button_click_detect/service/MakeDeckScreenDoneButtonClickDetectServiceImpl";
import {SelectedCardBlockHoverDetectService} from "../../src/selected_card_block_hover_detect/service/SelectedCardBlockHoverDetectService";
import {SelectedCardBlockHoverDetectServiceImpl} from "../../src/selected_card_block_hover_detect/service/SelectedCardBlockHoverDetectServiceImpl";
import {BlockAddButtonClickDetectService} from "../../src/block_add_button_click_detect/service/BlockAddButtonClickDetectService";
import {BlockAddButtonClickDetectServiceImpl} from "../../src/block_add_button_click_detect/service/BlockAddButtonClickDetectServiceImpl";
import {BlockDeleteButtonClickDetectService} from "../../src/block_delete_button_click_detect/service/BlockDeleteButtonClickDetectService";
import {BlockDeleteButtonClickDetectServiceImpl} from "../../src/block_delete_button_click_detect/service/BlockDeleteButtonClickDetectServiceImpl";
import {MakeDeckScreenCardHoverDetectService} from "../../src/make_deck_screen_card_hover_detect/service/MakeDeckScreenCardHoverDetectService";
import {MakeDeckScreenCardHoverDetectServiceImpl} from "../../src/make_deck_screen_card_hover_detect/service/MakeDeckScreenCardHoverDetectServiceImpl";

import {CardStateManager} from "../../src/make_deck_screen_card_manager/CardStateManager";
import {CardCountManager} from "../../src/make_deck_screen_card_manager/CardCountManager";
import {SelectedCardBlockEffectStateManager} from "../../src/selected_card_block_effect_manager/SelectedCardBlockEffectStateManager";
import {AddDeleteButtonStateManager} from "../../src/block_add_delete_button_manager/AddDeleteButtonStateManager";
import {SelectedCardBlockStateManager} from "../../src/selected_card_block_manager/SelectedCardBlockStateManager";
import {NumberOfOwnedCardsStateManager} from "../../src/number_of_owned_cards_manager/NumberOfOwnedCardsStateManager";
import {CardEffectStateManager} from "../../src/make_deck_screen_card_effect_manager/CardEffectStateManager";
import {ClippingMaskManager} from "../../src/clipping_mask_manager/ClippingMaskManager";

export class TCGJustTestMakeDeckView {
    private static instance: TCGJustTestMakeDeckView | null = null;

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
    private makeDeckScreenCardService = MakeDeckScreenCardServiceImpl.getInstance();
    private raceButtonService = RaceButtonServiceImpl.getInstance();
    private raceButtonEffectService = RaceButtonEffectServiceImpl.getInstance();
    private cardPageMovementButtonService = CardPageMovementButtonServiceImpl.getInstance();
    private makeDeckScreenDoneButtonService = MakeDeckScreenDoneButtonServiceImpl.getInstance();
    private selectedCardBlockService = SelectedCardBlockServiceImpl.getInstance();
    private sideScrollAreaService = SideScrollAreaServiceImpl.getInstance();
    private numberOfSelectedCardsService = NumberOfSelectedCardsServiceImpl.getInstance();
    private selectedCardBlockEffectService = SelectedCardBlockEffectServiceImpl.getInstance();
    private blockAddButtonService = BlockAddButtonServiceImpl.getInstance();
    private blockDeleteButtonService = BlockDeleteButtonServiceImpl.getInstance();
    private numberOfOwnedCardsService = NumberOfOwnedCardsServiceImpl.getInstance();
    private makeDeckScreenCardEffectService = MakeDeckScreenCardEffectServiceImpl.getInstance();

    private raceButtonClickDetectService: RaceButtonClickDetectService;
    private pageMovementButtonClickDetectService: PageMovementButtonClickDetectService;
    private makeDeckScreenCardClickDetectService: MakeDeckScreenCardClickDetectService;
    private sideScrollAreaDetectService: SideScrollAreaDetectService;
    private sideScrollService: SideScrollService;
    private makeDeckScreenDoneButtonClickDetectService: MakeDeckScreenDoneButtonClickDetectService;
    private selectedCardBlockHoverDetectService: SelectedCardBlockHoverDetectService;
    private blockAddButtonClickDetectService: BlockAddButtonClickDetectService;
    private blockDeleteButtonClickDetectService: BlockDeleteButtonClickDetectService;
    private makeDeckScreenCardHoverDetectService: MakeDeckScreenCardHoverDetectService;

    private cardStateManager = CardStateManager.getInstance();
    private cardCountManager = CardCountManager.getInstance();
    private selectedCardBlockEffectManager = SelectedCardBlockEffectStateManager.getInstance();
    private addDeleteButtonStateManager = AddDeleteButtonStateManager.getInstance();
    private selectedCadBlockStateManager = SelectedCardBlockStateManager.getInstance();
    private numberOfOwnedCardsStateManager = NumberOfOwnedCardsStateManager.getInstance();
    private cardEffectStateManager = CardEffectStateManager.getInstance();
    private clippingMaskManager = ClippingMaskManager.getInstance();
    private makeDeckScreenCardMapRepository = MakeDeckScreenCardMapRepositoryImpl.getInstance();

    private readonly windowSceneRepository = WindowSceneRepositoryImpl.getInstance();
    private readonly windowSceneService = WindowSceneServiceImpl.getInstance(this.windowSceneRepository);

    private readonly cameraRepository = CameraRepositoryImpl.getInstance();
    private readonly cameraService = CameraServiceImpl.getInstance();

    private initialized = false;
    private isAnimating = false;
    private isSideScrollAreaAdded = false;
    private blockAddedMap: Map<number, boolean> = new Map();
    private isRaceButtonClick: boolean = false;
    private isReAddDeactivationDoneButton: boolean = false;

    private userWindowSize: UserWindowSize;

    constructor(simulationMyDeckContainer: HTMLElement) {
        this.simulationMyDeckContainer = simulationMyDeckContainer;
        this.scene = this.windowSceneService.createScene('make-deck')
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

        this.raceButtonClickDetectService = RaceButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.raceButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const raceButtonClick = await this.raceButtonClickDetectService.onMouseDown(e);
            if (raceButtonClick) {
                this.isRaceButtonClick = true;
            }
        }, false);

        this.pageMovementButtonClickDetectService = PageMovementButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.pageMovementButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            if (this.isRaceButtonClick == true) {
                await this.pageMovementButtonClickDetectService.onMouseDown(e)
            }
        }, false);

        this.makeDeckScreenDoneButtonClickDetectService = MakeDeckScreenDoneButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            if (this.makeDeckScreenDoneButtonClickDetectService.isDeactivationButtonClick() == true) {
                this.makeDeckScreenDoneButtonClickDetectService.onMouseDownForDeactivation(e);
            }
        }, false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            if (this.makeDeckScreenDoneButtonClickDetectService.isActivationButtonClick() == true) {
                this.makeDeckScreenDoneButtonClickDetectService.onMouseDownForActivation(e);
            }
        }, false);

        this.makeDeckScreenCardClickDetectService = MakeDeckScreenCardClickDetectServiceImpl.getInstance(this.camera, this.scene);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.makeDeckScreenCardClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            if (this.isRaceButtonClick == true) {
                const clickCard = await this.makeDeckScreenCardClickDetectService.onMouseDown(e);
                const clickedCardId = this.cardCountManager.findCurrentClickedCardId();
                if (clickCard && clickedCardId !== null) {
                    if (!this.isSideScrollAreaAdded) {
                        await this.addSideScrollArea();
                        this.isSideScrollAreaAdded = true;
                    }
                    if (!this.blockAddedMap.get(clickedCardId)) {
                        await this.addBlock(clickedCardId);
                        await this.addBlockEffect(clickedCardId);
                        await this.addBlockAddButton(clickedCardId);
                        await this.addBlockDeleteButton(clickedCardId);
                        this.blockAddedMap.set(clickedCardId, true);
                    }
                    await this.addNumberOfSelectedCards(clickedCardId);
                    const numberGroup = this.numberOfSelectedCardsService.getNumberGroup();
                    const blockGroup = this.selectedCardBlockService.getAllBlockGroups();
                    numberGroup.position.y = blockGroup.position.y;
                    const totalSelectedCardCount = this.cardCountManager.findTotalSelectedCardCount();
                    if (totalSelectedCardCount == 40) {
                        this.makeDeckScreenDoneButtonClickDetectService.setDeactivationButtonClick(false);
                        this.makeDeckScreenDoneButtonClickDetectService.setActivationButtonClick(true);
                    }
                }
            }
        }, false);

        this.makeDeckScreenCardHoverDetectService = MakeDeckScreenCardHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousemove', async (e) => {
            if (this.isRaceButtonClick == true) {
                await this.makeDeckScreenCardHoverDetectService.onMouseMove(e)
            }
        }, false);

        this.sideScrollAreaDetectService = SideScrollAreaDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.sideScrollAreaDetectService.onMouseMove(e), false);

        this.sideScrollService = SideScrollServiceImpl.getInstance(this.camera, this.scene, this.renderer);
        this.renderer.domElement.addEventListener('wheel', async (e) => {
            const scrollAreaDetect = this.sideScrollAreaDetectService.getMakeDeckScrollEnabledById(0);
            if (scrollAreaDetect == true && this.sideScrollService.getBlockCount() > 10) {
                this.sideScrollService.onWheelScroll(e)
            }
        }, false);

        this.selectedCardBlockHoverDetectService = SelectedCardBlockHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.selectedCardBlockHoverDetectService.onMouseOver(e), false);

        this.blockAddButtonClickDetectService = BlockAddButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.blockAddButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const clickedButton = await this.blockAddButtonClickDetectService.onMouseDown(e);
            const clickedButtonId = this.blockAddButtonClickDetectService.getCurrentClickedButtonId();
            if (clickedButton && clickedButtonId) {
                await this.addNumberOfSelectedCards(clickedButtonId);
                const numberGroup = this.numberOfSelectedCardsService.getNumberGroup();
                const blockGroup = this.selectedCardBlockService.getAllBlockGroups();
                numberGroup.position.y = blockGroup.position.y;
                const totalSelectedCardCount = this.cardCountManager.findTotalSelectedCardCount();
                if (totalSelectedCardCount == 40) {
                    this.makeDeckScreenDoneButtonClickDetectService.setDeactivationButtonClick(false);
                    this.makeDeckScreenDoneButtonClickDetectService.setActivationButtonClick(true);
                }
            }
        }, false);

        this.blockDeleteButtonClickDetectService = BlockDeleteButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.blockDeleteButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const clickedButton = await this.blockDeleteButtonClickDetectService.onMouseDown(e);
            const clickedButtonId = this.blockDeleteButtonClickDetectService.getCurrentClickedButtonId();
            if (clickedButton && clickedButtonId) {
                await this.addNumberOfSelectedCards(clickedButtonId);
                const numberGroup = this.numberOfSelectedCardsService.getNumberGroup();
                const blockGroup = this.selectedCardBlockService.getAllBlockGroups();
                numberGroup.position.y = blockGroup.position.y;
                const cardClickCount = this.cardCountManager.getCardClickCount(clickedButtonId);
                const totalSelectedCardCount = this.cardCountManager.findTotalSelectedCardCount();
                if (totalSelectedCardCount !== 40) {
                    this.makeDeckScreenDoneButtonClickDetectService.setDeactivationButtonClick(true);
                    this.makeDeckScreenDoneButtonClickDetectService.setActivationButtonClick(false);
                }

                if (cardClickCount == 0) {
                    await this.deleteAllBlocks();
                    await this.deleteAllEffects();
                    await this.deleteAllBlockAddButtons();
                    await this.deleteAllBlockDeleteButtons();
                    await this.deleteAllNumbers();

                    await this.reAddBlock();
                    await this.reAddNumberOfSelectedCards();
                    await this.reAddBlockEffect();
                    await this.reAddBlockAddButton();
                    await this.reAddBlockDeleteButton();
                    this.blockAddedMap.set(clickedButtonId, false);
                }

            }
        }, false);
    }

    public static getInstance(simulationMyDeckContainer: HTMLElement): TCGJustTestMakeDeckView {
        if (!TCGJustTestMakeDeckView.instance) {
            TCGJustTestMakeDeckView.instance = new TCGJustTestMakeDeckView(simulationMyDeckContainer);
        }
        return TCGJustTestMakeDeckView.instance;
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

        console.log('TCGJustTestMakeDeckView initialize() operate!!!');
        await this.textureManager.preloadTextures("image-paths.json");
        console.log("Textures preloaded. Adding background and buttons...");

        await this.addBackground();
        await this.addCards();
        await this.addCardEffects();
        await this.addNumberOfOwnedCards();
        await this.addRaceButton();
        await this.addRaceButtonEffect();
        await this.addCardPageMovementButton();
        await this.addDoneButton();
//         await this.addSideScrollArea();
//         this.addBlock();

        this.initialized = true;
        this.isAnimating = true;

        this.animate();
    }

    public show(): void {
        console.log('Showing TCGJustTestMakeDeckView...');
        this.renderer.domElement.style.display = 'block';
        this.simulationMyDeckContainer.style.display = 'block';
        this.isAnimating = true;
        if (!this.initialized) {
            this.initialize();
        } else {
            this.animate();
        }
    }

    public hide(): void {
        console.log('Hiding TCGJustTestMakeDeckView...');
        this.isAnimating = false;
        this.renderer.domElement.style.display = 'none';
        this.simulationMyDeckContainer.style.display = 'none';
    }

    private async addBackground(): Promise<void> {
        try {
            const background = await this.backgroundService.createBackground(
                'make_deck_background',
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

    private async addCards(): Promise<void> {
        try {
            // To-do:예시 데이터 Map 만들어야 함.
            const cardMap = this.makeDeckScreenCardMapRepository.getCurrentMakeDeckScreenCardMap();
            const cardIdList = this.makeDeckScreenCardMapRepository.getCardIdList();
            const cardGroup = await this.makeDeckScreenCardService.createMakeDeckScreenCardWithPosition(cardMap);

            if (cardGroup) {
                this.cardStateManager.initializeCardVisibility(cardIdList);
                this.scene.add(cardGroup);
            }

        } catch (error) {
            console.error('Failed to add cards:', error);
        }
    }

    private async addCardEffects(): Promise<void> {
        try {
            const cardMap = this.makeDeckScreenCardMapRepository.getCurrentMakeDeckScreenCardMap();
            const cardIdList = this.makeDeckScreenCardMapRepository.getCardIdList();
            const effectGroup = await this.makeDeckScreenCardEffectService.createMakeDeckScreenCardEffectWithPosition(cardMap);

            if (effectGroup) {
                this.cardEffectStateManager.initializeEffectVisibility(cardIdList);
                this.scene.add(effectGroup);
            }

        } catch (error) {
            console.error('Failed to add card effects:', error);
        }
    }

    private async addRaceButton(): Promise<void> {
        try {
            const configList = new RaceButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) =>{
                const button = await this.raceButtonService.createRaceButton(
                    config.id,
                    config.position
                );

                if (button) {
                    this.scene.add(button);
                    console.log(`Draw Race Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add Race Button:', error);
        }
    }

    private async addRaceButtonEffect(): Promise<void> {
        try {
            const configList = new RaceButtonEffectConfigList();
            await Promise.all(configList.effectConfigs.map(async (config) =>{
                const effect = await this.raceButtonEffectService.createRaceButtonEffect(
                    config.id,
                    config.position
                );

                if (effect) {
                    this.raceButtonEffectService.initializeRaceButtonEffectVisible();
                    this.scene.add(effect);
                    console.log(`Draw Race Button Effect: ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add Race Button Effect:', error);
        }
    }

    private async addCardPageMovementButton(): Promise<void> {
        try {
            const configList = new CardPageMovementButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) =>{
                const button = await this.cardPageMovementButtonService.createCardPageMovementButton(
                    config.id,
                    config.position
                );

                if (button) {
                    this.scene.add(button);
                    console.log(`Draw Card Page Movement Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add Card Page Movement Button:', error);
        }
    }

    private async addDoneButton(): Promise<void> {
        try {
            const configList = new MakeDeckScreenDoneButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) =>{
                const button = await this.makeDeckScreenDoneButtonService.createDoneButton(
                    config.id,
                    config.position
                );

                if (button) {
                    this.makeDeckScreenDoneButtonService.initializeDoneButtonVisible();
                    const allButtons = this.makeDeckScreenDoneButtonService.getAllDoneButtons();
                    allButtons.forEach((button) => this.scene.add(button.getMesh()));
                    console.log(`Draw Done Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add Done Button:', error);
        }
    }

    private async addBlock(cardId: number): Promise<void> {
        try {
            await this.selectedCardBlockService.createSelectedCardBlockWithPosition(cardId);
            const blockMesh = this.selectedCardBlockService.getBlockMeshByCardId(cardId);

            if (blockMesh) {
                const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
                if (sideScrollArea) {
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
                    this.clippingMaskManager.applyClippingPlanesToMesh(blockMesh, clippingPlanes);
                }
                const blockGroup = this.selectedCardBlockService.getAllBlockGroups();
                blockGroup.add(blockMesh);

                if (!this.scene.children.includes(blockGroup)) {
                    this.scene.add(blockGroup);
                }
                blockGroup.position.y = 0;
            }

        } catch (error) {
            console.error('Failed to add Block:', error);
        }
    }

    private async addBlockEffect(cardId: number): Promise<void> {
        try {
            await this.selectedCardBlockEffectService.createSelectedCardBlockEffectWithPosition(cardId);
            const effectMesh = this.selectedCardBlockEffectService.getEffectMeshByCardId(cardId);

            if (effectMesh) {
                const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
                if (sideScrollArea) {
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
                    this.clippingMaskManager.applyClippingPlanesToMesh(effectMesh, clippingPlanes);
                }
                this.selectedCardBlockEffectManager.initializeEffectVisibility(cardId);

                const effectGroup = this.selectedCardBlockEffectService.getEffectGroup();
                effectGroup.add(effectMesh);

                if (!this.scene.children.includes(effectGroup)) {
                    this.scene.add(effectGroup);
                }
                effectGroup.position.y = 0;
            }

        } catch (error) {
            console.error('Failed to add Effect:', error);
        }
    }

    private async addSideScrollArea(): Promise<void> {
        try{
            const areaMesh = await this.sideScrollAreaService.createSideScrollArea(1, 0, 'makeDeckSideScrollArea', 0.255, 0.735, new THREE.Vector2(0.3895, 0.04));
            if (areaMesh) {
                this.scene.add(areaMesh);
            } else {
                console.warn(`No Side Scroll Area Mesh found`);
            }

        } catch (error) {
            console.error('Failed to add Side Scroll Area:', error);
        }
    }

    private async addNumberOfSelectedCards(cardId: number): Promise<void> {

        try {
            // 기존 Mesh 제거
            const existingMesh = this.numberOfSelectedCardsService.getExistingNumberObjectMeshByCardId(cardId);
            const numberGroup = this.numberOfSelectedCardsService.getNumberGroup();
            if (existingMesh) {
                console.log(`existing Number Mesh (ID: ${cardId})`);
                this.scene.remove(existingMesh);
                numberGroup.remove(existingMesh);
//                 numberGroup.clear();
//                 this.numberOfSelectedCardsService.resetNumberGroup();
            }

            await this.numberOfSelectedCardsService.createNumberOfSelectedCardsWithPosition(cardId);
            const newNumberMesh = this.numberOfSelectedCardsService.getNumberObjectMeshByCardId(cardId);
            if (newNumberMesh) {
                const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
                if (sideScrollArea) {
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
                    this.clippingMaskManager.applyClippingPlanesToMesh(newNumberMesh, clippingPlanes);
                }
                const numberGroup = this.numberOfSelectedCardsService.getNumberGroup();
                numberGroup.add(newNumberMesh);

                if (!this.scene.children.includes(numberGroup)) {
                    this.scene.add(numberGroup);
                }
                numberGroup.position.y = 0;
            }

        } catch (error) {
            console.error('Failed to add number of selected cards:', error);
        }
    }

    private async addBlockAddButton(cardId: number): Promise<void> {
        try {
            await this.blockAddButtonService.createBlockAddButtonWithPosition(cardId);
            const buttonMesh = this.blockAddButtonService.getButtonMeshByCardId(cardId);

            if (buttonMesh) {
                const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
                if (sideScrollArea) {
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
                    this.clippingMaskManager.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
                }
                this.addDeleteButtonStateManager.initializeAddButtonVisibility(cardId);

                const buttonGroup = this.blockAddButtonService.getButtonGroup();
                buttonGroup.add(buttonMesh);

                if (!this.scene.children.includes(buttonGroup)) {
                    this.scene.add(buttonGroup);
                }
                buttonGroup.position.y = 0;
            }

        } catch (error) {
            console.error('Failed to add Block Add Button:', error);
        }
    }

    private async addBlockDeleteButton(cardId: number): Promise<void> {
        try {
            await this.blockDeleteButtonService.createBlockDeleteButtonWithPosition(cardId);
            const buttonMesh = this.blockDeleteButtonService.getButtonMeshByCardId(cardId);

            if (buttonMesh) {
                const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
                if (sideScrollArea) {
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
                    this.clippingMaskManager.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
                }
                this.addDeleteButtonStateManager.initializeDeleteButtonVisibility(cardId);

                const buttonGroup = this.blockDeleteButtonService.getButtonGroup();
                buttonGroup.add(buttonMesh);

                if (!this.scene.children.includes(buttonGroup)) {
                    this.scene.add(buttonGroup);
                }
                buttonGroup.position.y = 0;
            }

        } catch (error) {
            console.error('Failed to add Block Delete Button:', error);
        }
    }

    private async deleteAllBlocks(): Promise<void> {
        try {
            const cardIdList = this.selectedCardBlockService.getAllBlockCardId();
            const blockGroup = this.selectedCardBlockService.getAllBlockGroups();
            cardIdList.forEach((cardId) => {
                const blockMesh = this.selectedCardBlockService.getBlockMeshByCardId(cardId);
                if (blockMesh) {
                    this.scene.remove(blockMesh);
                }
            });
            if (blockGroup) {
                this.scene.remove(blockGroup);
                blockGroup.clear();
                this.selectedCardBlockService.resetBlockGroups();
            }
            this.selectedCadBlockStateManager.resetBlockVisibility();
        } catch (error) {
            console.error('Failed to delete Block:', error);
        }
    }

     private async deleteAllEffects(): Promise<void> {
         try {
             const effectGroup = this.selectedCardBlockEffectService.getEffectGroup();
             const cardIdList = this.selectedCardBlockEffectService.getAllEffectCardId();
             cardIdList.forEach((cardId) => {
                 const effectMesh = this.selectedCardBlockEffectService.getEffectMeshByCardId(cardId);
                 if (effectMesh) {
                     this.scene.remove(effectMesh);
                 }
             });

             if (effectGroup) {
                 this.scene.remove(effectGroup);
                 effectGroup.clear();
                 this.selectedCardBlockEffectService.resetEffectGroup();
             }
             this.selectedCardBlockEffectManager.resetEffectVisibility();
         } catch (error) {
             console.error('Failed to delete Effect:', error);
         }
     }

    private async deleteAllBlockAddButtons(): Promise<void> {
        try {
            const buttonGroup = this.blockAddButtonService.getButtonGroup();
            const cardIdList = this.blockAddButtonService.getButtonCardIdList();
            cardIdList.forEach((cardId) => {
                const buttonMesh = this.blockAddButtonService.getButtonMeshByCardId(cardId);
                if (buttonMesh) {
                    this.scene.remove(buttonMesh);
                }
            });

            if (buttonGroup) {
                this.scene.remove(buttonGroup);
                buttonGroup.clear();
                this.blockAddButtonService.resetButtonGroup();
            }
            this.addDeleteButtonStateManager.resetAddButtonVisibility();
        } catch (error) {
            console.error('Failed to delete Block Add Button:', error);
        }
    }

    private async deleteAllBlockDeleteButtons(): Promise<void> {
        try {
            const buttonGroup = this.blockDeleteButtonService.getButtonGroup();
            const cardIdList = this.blockDeleteButtonService.getButtonCardIdList();
            cardIdList.forEach((cardId) => {
                const buttonMesh = this.blockDeleteButtonService.getButtonMeshByCardId(cardId);
                if (buttonMesh) {
                    this.scene.remove(buttonMesh);
                }
            });

            if (buttonGroup) {
                this.scene.remove(buttonGroup);
                buttonGroup.clear();
                this.blockDeleteButtonService.resetButtonGroup();
            }
            this.addDeleteButtonStateManager.resetDeleteButtonVisibility();
        } catch (error) {
            console.error('Failed to delete Block Delete Button:', error);
        }
    }

    private async deleteAllNumbers(): Promise<void> {
        try {
            const cardIdList = this.numberOfSelectedCardsService.getNumberCardIdList();
            const numberGroup = this.numberOfSelectedCardsService.getNumberGroup();
            cardIdList.forEach((cardId) => {
                const numberMesh = this.numberOfSelectedCardsService.getNumberObjectMeshByCardId(cardId);
                if (numberMesh) {
                    this.scene.remove(numberMesh);
                }
            });
            if (numberGroup) {
                this.scene.remove(numberGroup);
                numberGroup.clear();
                this.numberOfSelectedCardsService.resetNumberGroup();
            }

        } catch (error) {
            console.error('Failed to delete Number:', error);
        }
    }

    private async reAddBlock(): Promise<void> {
        try {
            const cardIdList = this.selectedCardBlockService.getAllBlockCardId();
            cardIdList.forEach((cardId) => {
                this.selectedCardBlockService.createSelectedCardBlockWithPosition(cardId);
            });

            const currentAllBlockMesh = this.selectedCardBlockService.getAllBlockMesh();
            const blockGroup = this.selectedCardBlockService.getAllBlockGroups();
            const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (sideScrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
            }

            currentAllBlockMesh.forEach((block) => {
                const blockMesh = block.getMesh();

                if (clippingPlanes.length > 0) {
                    this.clippingMaskManager.applyClippingPlanesToMesh(blockMesh, clippingPlanes);
                }
                blockGroup.add(blockMesh);
            });

            if (!this.scene.children.includes(blockGroup)) {
                this.scene.add(blockGroup);
            }

            blockGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add All Block:', error);
        }
    }

    private async reAddBlockEffect(): Promise<void> {
        try {
            const cardIdList = this.selectedCardBlockEffectService.getAllEffectCardId();
            cardIdList.forEach((cardId) => {
                this.selectedCardBlockEffectService.createSelectedCardBlockEffectWithPosition(cardId);
                this.selectedCardBlockEffectManager.initializeEffectVisibility(cardId);
            });

            const currentAllEffectMesh = this.selectedCardBlockEffectService.getAllEffectMesh();
            const effectGroup = this.selectedCardBlockEffectService.getEffectGroup();
            const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (sideScrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
            }

            currentAllEffectMesh.forEach((effect) => {
                const effectMesh = effect.getMesh();

                if (clippingPlanes.length > 0) {
                    this.clippingMaskManager.applyClippingPlanesToMesh(effectMesh, clippingPlanes);
                }
                effectGroup.add(effectMesh);
            });

            if (!this.scene.children.includes(effectGroup)) {
                this.scene.add(effectGroup);
            }

            effectGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add All Effect:', error);
        }
    }

    private async reAddBlockAddButton(): Promise<void> {
        try {
            const cardIdList = this.blockAddButtonService.getButtonCardIdList();
            cardIdList.forEach((cardId) => {
                this.blockAddButtonService.createBlockAddButtonWithPosition(cardId);
                this.addDeleteButtonStateManager.initializeAddButtonVisibility(cardId);
            });

            const currentAllButtonMesh = this.blockAddButtonService.getAllButtonMesh();
            const buttonGroup = this.blockAddButtonService.getButtonGroup();
            const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (sideScrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
            }

            currentAllButtonMesh.forEach((button) => {
                const buttonMesh = button.getMesh();

                if (clippingPlanes.length > 0) {
                    this.clippingMaskManager.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
                }
                buttonGroup.add(buttonMesh);
            });

            if (!this.scene.children.includes(buttonGroup)) {
                this.scene.add(buttonGroup);
            }

            buttonGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add All Add Button:', error);
        }
    }

    private async reAddBlockDeleteButton(): Promise<void> {
        try {
            const cardIdList = this.blockDeleteButtonService.getButtonCardIdList();
            cardIdList.forEach((cardId) => {
                this.blockDeleteButtonService.createBlockDeleteButtonWithPosition(cardId);
                this.addDeleteButtonStateManager.initializeDeleteButtonVisibility(cardId);
            });
            const currentAllButtonMesh = this.blockDeleteButtonService.getAllButtonMesh();
            const buttonGroup = this.blockDeleteButtonService.getButtonGroup();
            const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (sideScrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
            }

            currentAllButtonMesh.forEach((button) => {
                const buttonMesh = button.getMesh();

                if (clippingPlanes.length > 0) {
                    this.clippingMaskManager.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
                }
                buttonGroup.add(buttonMesh);
            });

            if (!this.scene.children.includes(buttonGroup)) {
                this.scene.add(buttonGroup);
            }

            buttonGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add All Delete Button:', error);
        }
    }

    private async reAddNumberOfSelectedCards(): Promise<void> {
        try {
            const cardIdList = this.numberOfSelectedCardsService.getNumberCardIdList();
            cardIdList.forEach((cardId) => {
                this.numberOfSelectedCardsService.createNumberOfSelectedCardsWithPosition(cardId);
            });
            const currentNumberMesh = this.numberOfSelectedCardsService.getAllNumber();
            const numberGroup = this.numberOfSelectedCardsService.getNumberGroup();
            const sideScrollArea = this.sideScrollAreaService.getSideScrollAreaByTypeAndId(1, 0);
            let clippingPlanes: THREE.Plane[] = [];

            if (sideScrollArea) {
                clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
            }

            currentNumberMesh.forEach((number) => {
                const numberMesh = number.getMesh();

                if (clippingPlanes.length > 0) {
                    this.clippingMaskManager.applyClippingPlanesToMesh(numberMesh, clippingPlanes);
                }
                numberGroup.add(numberMesh);
            });

            if (!this.scene.children.includes(numberGroup)) {
                this.scene.add(numberGroup);
            }
            numberGroup.position.y = 0;
        } catch (error) {
            console.error('Failed to add All Delete Button:', error);
        }
    }

    private async addNumberOfOwnedCards(): Promise<void> {
        try {
            const cardMap = this.makeDeckScreenCardMapRepository.getCurrentMakeDeckScreenCardMap();
            const cardIdList = this.makeDeckScreenCardMapRepository.getCardIdList();
            const numberGroup = await this.numberOfOwnedCardsService.createNumberOfOwnedCardsWithPosition(cardMap);

            if (numberGroup) {
                this.numberOfOwnedCardsStateManager.initializeNumberVisibility(cardIdList);
                this.scene.add(numberGroup);
            }

        } catch (error) {
            console.error('Failed to add numbers:', error);
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
            this.makeDeckScreenCardService.adjustMakeDeckScreenCardPosition();
            this.raceButtonService.adjustRaceButtonPosition();
            this.raceButtonEffectService.adjustRaceButtonEffectPosition();
            this.cardPageMovementButtonService.adjustCardPageMovementButtonPosition();
            this.makeDeckScreenDoneButtonService.adjustDoneButtonPosition();
            this.selectedCardBlockService.adjustSelectedCardBlockPosition();
            this.selectedCardBlockEffectService.adjustSelectedCardBlockEffectPosition();
            this.sideScrollAreaService.adjustMakeDeckSideScrollAreaPosition();
            this.numberOfSelectedCardsService.adjustNumberOfSelectedCardsPosition();
            this.blockAddButtonService.adjustBlockAddButtonPosition();
            this.blockDeleteButtonService.adjustBlockDeleteButtonPosition();
            this.numberOfOwnedCardsService.adjustNumberOfOwnedCardsPosition();
            this.makeDeckScreenCardEffectService.adjustMakeDeckScreenCardEffectPosition();
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

const fieldView = TCGJustTestMakeDeckView.getInstance(rootElement);
fieldView.initialize();