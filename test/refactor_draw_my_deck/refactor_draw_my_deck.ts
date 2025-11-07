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
import {SideScrollAreaConfigList} from "../../src/side_scroll_area/entity/SideScrollAreaConfigList";
import {DeckNameEditPopupButtonsConfigList} from "../../src/deck_name_edit_pop_up_buttons/entity/DeckNameEditPopupButtonsConfigList";
import {DeckNameEditInfoTextConfigList} from "../../src/deck_name_edit_info_text/entity/DeckNameEditInfoTextConfigList";
import {AlertModalContainerConfigList} from "../../src/alert_modal_container/entity/AlertModalContainerConfigList";
import {AlertModalButtonsConfigList} from "../../src/alert_modal_buttons/entity/AlertModalButtonsConfigList";
import {CardFilterRaceOptionInactiveConfigList} from "../../src/card_filter_race_option_inactive/entity/CardFilterRaceOptionInactiveConfigList";
import {CardFilterRaceOptionActiveConfigList} from "../../src/card_filter_race_option_active/entity/CardFilterRaceOptionActiveConfigList";
import {CardFilterGradeOptionInactiveConfigList} from "../../src/card_filter_grade_option_inactive/entity/CardFilterGradeOptionInactiveConfigList";
import {CardFilterGradeOptionActiveConfigList} from "../../src/card_filter_grade_option_active/entity/CardFilterGradeOptionActiveConfigList";

import {MyDeckButtonServiceImpl} from "../../src/my_deck_button/service/MyDeckButtonServiceImpl";
import {MyDeckButtonEffectServiceImpl} from "../../src/my_deck_button_effect/service/MyDeckButtonEffectServiceImpl";
import {MyDeckButtonMapRepositoryImpl} from "../../src/my_deck_button/repository/MyDeckButtonMapRepositoryImpl";
import {MyDeckCardServiceImpl} from "../../src/my_deck_card/service/MyDeckCardServiceImpl";
import {MyDeckCardMapRepositoryImpl} from "../../src/my_deck_card/repository/MyDeckCardMapRepositoryImpl";
import {MyDeckOwnedCardsMapRepositoryImpl} from "../../src/my_deck_owned_cards/repository/MyDeckOwnedCardsMapRepositoryImpl";

import {MyDeckNameTextServiceImpl} from "../../src/my_deck_name_text/service/MyDeckNameTextServiceImpl";
import {MyDeckNameTextMapRepositoryImpl} from "../../src/my_deck_name_text/repository/MyDeckNameTextMapRepositoryImpl";
import {TransparentBackgroundServiceImpl} from "../../src/transparent_background/service/TransparentBackgroundServiceImpl";
import {DeckMakePopupBackgroundServiceImpl} from "../../src/deck_make_pop_up_background/service/DeckMakePopupBackgroundServiceImpl";
import {DeckMakePopupButtonsServiceImpl} from "../../src/deck_make_pop_up_buttons/service/DeckMakePopupButtonsServiceImpl";
import {DeckMakePopupInputContainerServiceImpl} from "../../src/deck_make_pop_up_input_container/service/DeckMakePopupInputContainerServiceImpl";
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
import {MyDeckNumberOfCardsServiceImpl} from "../../src/my_deck_number_of_cards/service/MyDeckNumberOfCardsServiceImpl";
import {MyDeckTotalOwnedCardsServiceImpl} from "../../src/my_deck_total_owned_cards/service/MyDeckTotalOwnedCardsServiceImpl";
import {MyDeckRemainingCardsServiceImpl} from "../../src/my_deck_remaining_cards/service/MyDeckRemainingCardsServiceImpl";
import {MyDeckRemainingOutOfTotalSlashServiceImpl} from "../../src/my_deck_remaining_out_of_total_slash/service/MyDeckRemainingOutOfTotalSlashServiceImpl";
import {MyDeckNumberOfSelectedCardsServiceImpl} from "../../src/my_deck_number_of_selected_cards/service/MyDeckNumberOfSelectedCardsServiceImpl";
import {MyDeckChosenOutOfTotalSlashServiceImpl} from "../../src/my_deck_chosen_out_of_total_slash/service/MyDeckChosenOutOfTotalSlashServiceImpl";
import {TotalNumberOfSelectedCardsServiceImpl} from "../../src/my_deck_total_number_of_selected_cards/service/TotalNumberOfSelectedCardsServiceImpl";
import {DeckCardDeleteButtonServiceImpl} from "../../src/deck_card_delete_button/service/DeckCardDeleteButtonServiceImpl";
import {DeckCardCountMarkerServiceImpl} from "../../src/deck_card_count_marker/service/DeckCardCountMarkerServiceImpl";
import {DeckCardAddButtonServiceImpl} from "../../src/deck_card_add_button/service/DeckCardAddButtonServiceImpl";
import {RequiredNumberOfCardsServiceImpl} from "../../src/required_number_of_cards_in_the_deck/service/RequiredNumberOfCardsServiceImpl";
import {MyDeckSearchInputContainerServiceImpl} from "../../src/my_deck_search_input_container/service/MyDeckSearchInputContainerServiceImpl";
import {MyDeckCardSearchCancelButtonServiceImpl} from "../../src/my_deck_card_search_cancel_button/service/MyDeckCardSearchCancelButtonServiceImpl";
import {MyDeckCardSearchBoxServiceImpl} from "../../src/my_deck_card_search_box/service/MyDeckCardSearchBoxServiceImpl";
import {DeckNameEditPopupBackgroundServiceImpl} from "../../src/deck_name_edit_pop_up_background/service/DeckNameEditPopupBackgroundServiceImpl";
import {DeckNameEditPopupButtonsServiceImpl} from "../../src/deck_name_edit_pop_up_buttons/service/DeckNameEditPopupButtonsServiceImpl";
import {DeckNameEditInputContainerServiceImpl} from "../../src/deck_name_edit_input_container/service/DeckNameEditInputContainerServiceImpl";
import {DeckNameEditInfoTextServiceImpl} from "../../src/deck_name_edit_info_text/service/DeckNameEditInfoTextServiceImpl";
import {AlertModalContainerServiceImpl} from "../../src/alert_modal_container/service/AlertModalContainerServiceImpl";
import {AlertModalButtonsServiceImpl} from "../../src/alert_modal_buttons/service/AlertModalButtonsServiceImpl";
import {AlertModalSelectedDeckCardCountServiceImpl} from "../../src/alert_modal_selected_deck_card_count/service/AlertModalSelectedDeckCardCountServiceImpl";
import {CardFilterButtonServiceImpl} from "../../src/card_filter_button/service/CardFilterButtonServiceImpl";
import {CardFilterPanelServiceImpl} from "../../src/card_filter_panel/service/CardFilterPanelServiceImpl";
import {CardFilterRaceOptionInactiveServiceImpl} from "../../src/card_filter_race_option_inactive/service/CardFilterRaceOptionInactiveServiceImpl";
import {CardFilterRaceOptionActiveServiceImpl} from "../../src/card_filter_race_option_active/service/CardFilterRaceOptionActiveServiceImpl";
import {CardFilterGradeOptionInactiveServiceImpl} from "../../src/card_filter_grade_option_inactive/service/CardFilterGradeOptionInactiveServiceImpl";
import {CardFilterGradeOptionActiveServiceImpl} from "../../src/card_filter_grade_option_active/service/CardFilterGradeOptionActiveServiceImpl";

import {MyDeckButtonClickDetectServiceImpl} from "../../src/deck_button_click_detect/service/MyDeckButtonClickDetectServiceImpl";
import {MyDeckButtonClickDetectService} from "../../src/deck_button_click_detect/service/MyDeckButtonClickDetectService";
import {DeckMakePopupButtonsClickDetectServiceImpl} from "../../src/deck_make_pop_up_buttons_click_detect/service/DeckMakePopupButtonsClickDetectServiceImpl";
import {DeckMakePopupButtonsClickDetectService} from "../../src/deck_make_pop_up_buttons_click_detect/service/DeckMakePopupButtonsClickDetectService";
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
import {MyDeckOwnedCardsClickDetectService} from "../../src/deck_owned_cards_click_detect/service/MyDeckOwnedCardsClickDetectService";
import {MyDeckOwnedCardsClickDetectServiceImpl} from "../../src/deck_owned_cards_click_detect/service/MyDeckOwnedCardsClickDetectServiceImpl";
import {MyDeckBlockHoverDetectService} from "../../src/my_deck_block_hover_detect/service/MyDeckBlockHoverDetectService";
import {MyDeckBlockHoverDetectServiceImpl} from "../../src/my_deck_block_hover_detect/service/MyDeckBlockHoverDetectServiceImpl";
import {DeckCardDeleteButtonClickDetectService} from "../../src/deck_card_delete_button_click_detect/service/DeckCardDeleteButtonClickDetectService";
import {DeckCardDeleteButtonClickDetectServiceImpl} from "../../src/deck_card_delete_button_click_detect/service/DeckCardDeleteButtonClickDetectServiceImpl";
import {DeckCardAddButtonClickDetectService} from "../../src/deck_card_add_button_click_detect/service/DeckCardAddButtonClickDetectService";
import {DeckCardAddButtonClickDetectServiceImpl} from "../../src/deck_card_add_button_click_detect/service/DeckCardAddButtonClickDetectServiceImpl";
import {DeckEditDoneButtonHoverDetectService} from "../../src/deck_edit_done_button_hover_detect/service/DeckEditDoneButtonHoverDetectService";
import {DeckEditDoneButtonHoverDetectServiceImpl} from "../../src/deck_edit_done_button_hover_detect/service/DeckEditDoneButtonHoverDetectServiceImpl";
import {DeckEditDoneButtonClickDetectService} from "../../src/deck_edit_done_button_click_detect/service/DeckEditDoneButtonClickDetectService";
import {DeckEditDoneButtonClickDetectServiceImpl} from "../../src/deck_edit_done_button_click_detect/service/DeckEditDoneButtonClickDetectServiceImpl";
import {DeckCardSearchInputEnterDetectService} from "../../src/deck_card_search_input_enter_detect/service/DeckCardSearchInputEnterDetectService";
import {DeckCardSearchInputEnterDetectServiceImpl} from "../../src/deck_card_search_input_enter_detect/service/DeckCardSearchInputEnterDetectServiceImpl";
import {DeckCardSearchCancelButtonClickDetectService} from "../../src/deck_card_search_cancel_button_click_detect/service/DeckCardSearchCancelButtonClickDetectService";
import {DeckCardSearchCancelButtonClickDetectServiceImpl} from "../../src/deck_card_search_cancel_button_click_detect/service/DeckCardSearchCancelButtonClickDetectServiceImpl";
import {DeckCardSearchInputChangeDetectService} from "../../src/deck_card_search_input_change_detect/service/DeckCardSearchInputChangeDetectService";
import {DeckCardSearchInputChangeDetectServiceImpl} from "../../src/deck_card_search_input_change_detect/service/DeckCardSearchInputChangeDetectServiceImpl";
import {DeckNameEditPopupButtonsClickDetectService} from "../../src/deck_name_edit_pop_up_buttons_click_detect/service/DeckNameEditPopupButtonsClickDetectService";
import {DeckNameEditPopupButtonsClickDetectServiceImpl} from "../../src/deck_name_edit_pop_up_buttons_click_detect/service/DeckNameEditPopupButtonsClickDetectServiceImpl";
import {DeckNameEditInputChangeDetectService} from "../../src/deck_name_edit_input_change_detect/service/DeckNameEditInputChangeDetectService";
import {DeckNameEditInputChangeDetectServiceImpl} from "../../src/deck_name_edit_input_change_detect/service/DeckNameEditInputChangeDetectServiceImpl";
import {MyDeckAlertModalButtonsClickDetectService} from "../../src/my_deck_alert_modal_buttons_click_detect/service/MyDeckAlertModalButtonsClickDetectService";
import {MyDeckAlertModalButtonsClickDetectServiceImpl} from "../../src/my_deck_alert_modal_buttons_click_detect/service/MyDeckAlertModalButtonsClickDetectServiceImpl";
import {CardFilterButtonClickDetectService} from "../../src/card_filter_button_click_detect/service/CardFilterButtonClickDetectService";
import {CardFilterButtonClickDetectServiceImpl} from "../../src/card_filter_button_click_detect/service/CardFilterButtonClickDetectServiceImpl";
import {CardFilterRaceOptionClickDetectService} from "../../src/card_filter_race_option_click_detect/service/CardFilterRaceOptionClickDetectService";
import {CardFilterRaceOptionClickDetectServiceImpl} from "../../src/card_filter_race_option_click_detect/service/CardFilterRaceOptionClickDetectServiceImpl";
import {CardFilterPanelHoverDetectService} from "../../src/card_filter_panel_hover_detect/service/CardFilterPanelHoverDetectService";
import {CardFilterPanelHoverDetectServiceImpl} from "../../src/card_filter_panel_hover_detect/service/CardFilterPanelHoverDetectServiceImpl";
import {CardFilterGradeOptionClickDetectService} from "../../src/card_filter_grade_option_click_detect/service/CardFilterGradeOptionClickDetectService";
import {CardFilterGradeOptionClickDetectServiceImpl} from "../../src/card_filter_grade_option_click_detect/service/CardFilterGradeOptionClickDetectServiceImpl";

import {ClippingMaskManager} from "../../src/clipping_mask_manager/ClippingMaskManager";
import {CardCountManager} from "../../src/my_deck_card_manager/CardCountManager";
import {DeckCardSearchStateInDeckEditMode} from "../../src/deck_card_search_input_enter_detect/entity/DeckCardSearchStateInDeckEditMode";
import {DeleteDeckPopupButtonType} from "../../src/delete_deck_popup_button/entity/DeleteDeckPopupButtonType";

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

    private transparentBackgroundService = TransparentBackgroundServiceImpl.getInstance();
    private decKMakePopupBackgroundService = DeckMakePopupBackgroundServiceImpl.getInstance();
    private deckMakePopupButtonsService = DeckMakePopupButtonsServiceImpl.getInstance();
    private deckMakePopupInputContainerService = DeckMakePopupInputContainerServiceImpl.getInstance();
    private sideScrollAreaService = SideScrollAreaServiceImpl.getInstance();
    private deleteDeckPopupWindowService = DeleteDeckPopupWindowServiceImpl.getInstance();
    private deleteDeckPopupButtonService = DeleteDeckPopupButtonServiceImpl.getInstance();
    private deckEditButtonService = DeckEditButtonServiceImpl.getInstance();
    private myDeckOwnedCardsService = MyDeckOwnedCardsServiceImpl.getInstance();
    private deckEditDoneButtonService = DeckEditDoneButtonServiceImpl.getInstance();
    private myDeckTotalOwnedCardsService = MyDeckTotalOwnedCardsServiceImpl.getInstance();
    private myDeckRemainingOutOfTotalSlashService = MyDeckRemainingOutOfTotalSlashServiceImpl.getInstance();
    private myDeckChosenOutOfTotalSlashService = MyDeckChosenOutOfTotalSlashServiceImpl.getInstance();
    private myDeckSearchInputContainerService = MyDeckSearchInputContainerServiceImpl.getInstance();
    private myDeckCardSearchCancelButtonService = MyDeckCardSearchCancelButtonServiceImpl.getInstance();
    private myDeckCardSearchBoxService = MyDeckCardSearchBoxServiceImpl.getInstance();
    private deckNameEditPopupBackgroundService = DeckNameEditPopupBackgroundServiceImpl.getInstance();
    private deckNameEditPopupButtonsService = DeckNameEditPopupButtonsServiceImpl.getInstance();
    private deckNameEditInputContainerService = DeckNameEditInputContainerServiceImpl.getInstance();

    private deckCardDeleteButtonService: DeckCardDeleteButtonServiceImpl;
    private deckCardCountMarkerService: DeckCardCountMarkerServiceImpl;
    private myDeckBlockService: MyDeckBlockServiceImpl;
    private myDeckCardNameService: MyDeckCardNameServiceImpl;
    private myDeckNumberOfSelectedCardsService: MyDeckNumberOfSelectedCardsServiceImpl;
    private myDeckRemainingCardsService: MyDeckRemainingCardsServiceImpl;
    private myDeckCardService: MyDeckCardServiceImpl;
    private myDeckButtonService: MyDeckButtonServiceImpl;
    private myDeckButtonEffectService: MyDeckButtonEffectServiceImpl;
    private deckDeleteButtonService: DeckDeleteButtonServiceImpl;
    private deckNameEditButtonService: DeckNameEditButtonServiceImpl;
    private myDeckNameTextService: MyDeckNameTextServiceImpl;
    private myDeckNumberOfCardsService: MyDeckNumberOfCardsServiceImpl;
    private cardSelectionBlockerService: CardSelectionBlockerServiceImpl;
    private buildDeckButtonService: BuildDeckButtonServiceImpl;
    private deckCardAddButtonService: DeckCardAddButtonServiceImpl;
    private totalNumberOfSelectedCardsService: TotalNumberOfSelectedCardsServiceImpl;
    private requiredNumberOfCarsService: RequiredNumberOfCardsServiceImpl;
    private deckNameEditInfoTextService: DeckNameEditInfoTextServiceImpl;
    private alertModalContainerService: AlertModalContainerServiceImpl;
    private alertModalButtonsService: AlertModalButtonsServiceImpl;
    private alertModalSelectedDeckCardCountService: AlertModalSelectedDeckCardCountServiceImpl;
    private cardFilterButtonService: CardFilterButtonServiceImpl;
    private cardFilterPanelService: CardFilterPanelServiceImpl;
    private cardFilterRaceOptionInactive: CardFilterRaceOptionInactiveServiceImpl;
    private cardFilterRaceOptionActive: CardFilterRaceOptionActiveServiceImpl;
    private cardFilterGradeOptionInactive: CardFilterGradeOptionInactiveServiceImpl;
    private cardFilterGradeOptionActive: CardFilterGradeOptionActiveServiceImpl;

    private clippingMaskManager = ClippingMaskManager.getInstance();
    private cardCountManager = CardCountManager.getInstance();

    private myDeckButtonMapRepository = MyDeckButtonMapRepositoryImpl.getInstance();
    private myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
    private myDeckNameTextMapRepository = MyDeckNameTextMapRepositoryImpl.getInstance();
    private myDeckOwnedCardsMapRepository = MyDeckOwnedCardsMapRepositoryImpl.getInstance();

    private readonly windowSceneRepository = WindowSceneRepositoryImpl.getInstance();
    private readonly windowSceneService = WindowSceneServiceImpl.getInstance(this.windowSceneRepository);

    private readonly cameraRepository = CameraRepositoryImpl.getInstance();
    private readonly cameraService = CameraServiceImpl.getInstance(this.cameraRepository);

    private myDeckButtonClickDetectService: MyDeckButtonClickDetectService;
    private deckMakePopupButtonsClickDetectService: DeckMakePopupButtonsClickDetectService;
    private myDeckScrollService: MyDeckScrollService;
    private sideScrollAreaDetectService: SideScrollAreaDetectService;
    private buildDeckButtonHoverDetectService: BuildDeckButtonHoverDetectService;
    private buildDeckButtonClickDetectService: BuildDeckButtonClickDetectService;
    private deckDeleteButtonClickDetectService: DeckDeleteButtonClickDetectService;
    private deleteDeckPopupButtonClickDetectService: DeleteDeckPopupButtonClickDetectService;
    private deckNameEditButtonClickDetectService: DeckNameEditButtonClickDetectService;
    private myDeckCardScrollService: MyDeckCardScrollService;
    private myDeckBlockScrollService: MyDeckBlockScrollService;
    private deckEditButtonClickDetectService: DeckEditButtonClickDetectService;
    private myDeckOwnedCardsScrollService: MyDeckOwnedCardsScrollService;
    private myDeckOwnedCardsClickDetectService: MyDeckOwnedCardsClickDetectService;
    private myDeckBlockHoverDetectService: MyDeckBlockHoverDetectService;
    private deckCardDeleteButtonClickDetectService: DeckCardDeleteButtonClickDetectService;
    private deckCardAddButtonClickDetectService: DeckCardAddButtonClickDetectService;
    private deckEditDoneButtonHoverDetectService: DeckEditDoneButtonHoverDetectService;
    private deckEditDoneButtonClickDetectService: DeckEditDoneButtonClickDetectService;
    private deckCardSearchInputEnterDetectService: DeckCardSearchInputEnterDetectService;
    private deckCardSearchCancelButtonClickDetectService: DeckCardSearchCancelButtonClickDetectService;
    private deckCardSearchInputChangeDetectService: DeckCardSearchInputChangeDetectService;
    private deckNameEditPopupButtonsClickDetectService: DeckNameEditPopupButtonsClickDetectService;
    private deckNameEditInputChangeDetectService: DeckNameEditInputChangeDetectService;
    private myDeckAlertModalButtonsClickDetectService: MyDeckAlertModalButtonsClickDetectService;
    private cardFilterButtonClickDetectService: CardFilterButtonClickDetectService;
    private cardFilterRaceOptionClickDetectService: CardFilterRaceOptionClickDetectService;
    private cardFilterPanelHoverDetectService: CardFilterPanelHoverDetectService;
    private cardFilterGradeOptionClickDetectService: CardFilterGradeOptionClickDetectService;

    private initialized = false;
    private isAnimating = false;

    private userWindowSize: UserWindowSize;

    constructor(simulationMyDeckContainer: HTMLElement) {
        this.simulationMyDeckContainer = simulationMyDeckContainer;
        this.scene = this.windowSceneService.createScene('my-deck')
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
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

        this.deckCardDeleteButtonService = DeckCardDeleteButtonServiceImpl.getInstance(this.scene);
        this.deckCardCountMarkerService = DeckCardCountMarkerServiceImpl.getInstance(this.scene);
        this.myDeckBlockService = MyDeckBlockServiceImpl.getInstance(this.scene);
        this.myDeckCardNameService = MyDeckCardNameServiceImpl.getInstance(this.scene);
        this.myDeckNumberOfSelectedCardsService = MyDeckNumberOfSelectedCardsServiceImpl.getInstance(this.scene);
        this.myDeckRemainingCardsService = MyDeckRemainingCardsServiceImpl.getInstance(this.scene);
        this.myDeckCardService = MyDeckCardServiceImpl.getInstance(this.scene);
        this.myDeckButtonService = MyDeckButtonServiceImpl.getInstance(this.scene);
        this.myDeckButtonEffectService = MyDeckButtonEffectServiceImpl.getInstance(this.scene);
        this.deckDeleteButtonService = DeckDeleteButtonServiceImpl.getInstance(this.scene);
        this.deckNameEditButtonService = DeckNameEditButtonServiceImpl.getInstance(this.scene);
        this.myDeckNameTextService = MyDeckNameTextServiceImpl.getInstance(this.scene);
        this.myDeckNumberOfCardsService = MyDeckNumberOfCardsServiceImpl.getInstance(this.scene);
        this.cardSelectionBlockerService = CardSelectionBlockerServiceImpl.getInstance(this.scene);
        this.buildDeckButtonService = BuildDeckButtonServiceImpl.getInstance(this.scene);
        this.deckCardAddButtonService = DeckCardAddButtonServiceImpl.getInstance(this.scene);
        this.totalNumberOfSelectedCardsService = TotalNumberOfSelectedCardsServiceImpl.getInstance(this.scene);
        this.requiredNumberOfCarsService = RequiredNumberOfCardsServiceImpl.getInstance(this.scene);
        this.deckNameEditInfoTextService = DeckNameEditInfoTextServiceImpl.getInstance(this.scene);
        this.alertModalContainerService = AlertModalContainerServiceImpl.getInstance(this.scene);
        this.alertModalButtonsService = AlertModalButtonsServiceImpl.getInstance(this.scene);
        this.alertModalSelectedDeckCardCountService = AlertModalSelectedDeckCardCountServiceImpl.getInstance(this.scene);
        this.cardFilterButtonService = CardFilterButtonServiceImpl.getInstance(this.scene);
        this.cardFilterPanelService = CardFilterPanelServiceImpl.getInstance(this.scene);
        this.cardFilterRaceOptionInactive = CardFilterRaceOptionInactiveServiceImpl.getInstance(this.scene);
        this.cardFilterRaceOptionActive = CardFilterRaceOptionActiveServiceImpl.getInstance(this.scene);
        this.cardFilterGradeOptionInactive = CardFilterGradeOptionInactiveServiceImpl.getInstance(this.scene);
        this.cardFilterGradeOptionActive = CardFilterGradeOptionActiveServiceImpl.getInstance(this.scene);

        this.myDeckButtonClickDetectService = MyDeckButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.sideScrollAreaDetectService = SideScrollAreaDetectServiceImpl.getInstance(this.camera, this.scene);
        this.buildDeckButtonHoverDetectService = BuildDeckButtonHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.myDeckScrollService = MyDeckScrollServiceImpl.getInstance(this.camera, this.scene, this.renderer);
        this.myDeckCardScrollService = MyDeckCardScrollServiceImpl.getInstance(this.camera, this.scene, this.renderer);
        this.myDeckOwnedCardsScrollService = MyDeckOwnedCardsScrollServiceImpl.getInstance(this.camera, this.scene, this.renderer);
        this.myDeckBlockScrollService = MyDeckBlockScrollServiceImpl.getInstance(this.camera, this.scene, this.renderer);
        this.myDeckBlockHoverDetectService = MyDeckBlockHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckCardDeleteButtonClickDetectService = DeckCardDeleteButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.buildDeckButtonClickDetectService = BuildDeckButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckEditButtonClickDetectService = DeckEditButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.myDeckOwnedCardsClickDetectService = MyDeckOwnedCardsClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckDeleteButtonClickDetectService = DeckDeleteButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckNameEditButtonClickDetectService = DeckNameEditButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deleteDeckPopupButtonClickDetectService = DeleteDeckPopupButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckMakePopupButtonsClickDetectService = DeckMakePopupButtonsClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckCardAddButtonClickDetectService = DeckCardAddButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckEditDoneButtonHoverDetectService = DeckEditDoneButtonHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckEditDoneButtonClickDetectService = DeckEditDoneButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckCardSearchInputEnterDetectService = DeckCardSearchInputEnterDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckCardSearchCancelButtonClickDetectService = DeckCardSearchCancelButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckCardSearchInputChangeDetectService = DeckCardSearchInputChangeDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckNameEditPopupButtonsClickDetectService = DeckNameEditPopupButtonsClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.deckNameEditInputChangeDetectService = DeckNameEditInputChangeDetectServiceImpl.getInstance(this.camera, this.scene);
        this.myDeckAlertModalButtonsClickDetectService = MyDeckAlertModalButtonsClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.cardFilterButtonClickDetectService = CardFilterButtonClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.cardFilterRaceOptionClickDetectService = CardFilterRaceOptionClickDetectServiceImpl.getInstance(this.camera, this.scene);
        this.cardFilterPanelHoverDetectService = CardFilterPanelHoverDetectServiceImpl.getInstance(this.camera, this.scene);
        this.cardFilterGradeOptionClickDetectService = CardFilterGradeOptionClickDetectServiceImpl.getInstance(this.camera, this.scene);

        this.renderer.domElement.addEventListener('mousedown', (e) => this.myDeckButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mouseup', (e) => this.myDeckButtonClickDetectService.onMouseUp(e), false);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.sideScrollAreaDetectService.onMouseMoveMyDeck(e), false);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.buildDeckButtonHoverDetectService.onMouseMove(e), false);
        this.renderer.domElement.addEventListener('wheel', (e) => this.myDeckScrollService.onWheelScroll(e), false);
        this.renderer.domElement.addEventListener('wheel', (e) => this.myDeckCardScrollService.onWheelScroll(e), false);
        this.renderer.domElement.addEventListener('wheel', (e) => this.myDeckBlockScrollService.onWheelScroll(e), false);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.myDeckBlockHoverDetectService.onMouseMove(e), false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.cardFilterButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mouseup', (e) => this.cardFilterButtonClickDetectService.onMouseUp(e), false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.cardFilterRaceOptionClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.cardFilterPanelHoverDetectService.onMouseMove(e), false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.cardFilterGradeOptionClickDetectService.onMouseDown(e), false);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.deckCardDeleteButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const buttonEvent = await this.deckCardDeleteButtonClickDetectService.onMouseDown(e);
            if (buttonEvent) {
                // To-do: 객체 scene 에 그리는 코드 후에 분리 필요
                this.reAddMyDeckNumberOfSelectedCards();
                const cardId = this.deckCardDeleteButtonClickDetectService.getCurrentClickedCardId();
                if (cardId == null) return;
                this.reAddMyDeckRemainingCards(cardId);
                this.reAddMyDeckNumberOfCards();
                this.reAddTotalNumberOfSelectedCards();
            }
        }, false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.buildDeckButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.deckEditButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('wheel', (e) => this.myDeckOwnedCardsScrollService.onWheelScroll(e), false);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.myDeckOwnedCardsClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const buttonEvent = await this.myDeckOwnedCardsClickDetectService.onMouseDown(e);
            if (buttonEvent){
                // To-do: 객체 scene 에 그리는 코드 후에 분리 필요
                await this.reAddMyDeckBlock();
                await this.reAddMyDeckCardName();
                await this.reAddMyDeckNumberOfSelectedCards();
                await this.reAddDeckCardDeleteButton();
                await this.reAddDeckCardAddButton();
                await this.reAddMyDeckCard();

                const cardId = this.myDeckOwnedCardsClickDetectService.getCurrentClickedCardId();
                if (cardId == null) return;
                await this.reAddMyDeckRemainingCards(cardId);
                await this.reAddMyDeckNumberOfCards();
                await this.reAddMyDeckCardCountMarker();
                await this.reAddTotalNumberOfSelectedCards();
            }
        }, false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.deckDeleteButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.deckNameEditButtonClickDetectService.onMouseDown(e), false);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.deleteDeckPopupButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async(e) => {
            const buttonEvent = await this.deleteDeckPopupButtonClickDetectService.onMouseDown(e);
            if (buttonEvent) {
                if (this.deleteDeckPopupButtonClickDetectService.getCurrentClickedButtonType() == DeleteDeckPopupButtonType.DELETE) {
                    await this.reAddMyDeckRemainingCardsAfterDeleteDeck();
                }
            }
        }, false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.deckMakePopupButtonsClickDetectService.onMouseDown(e), false);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.deckCardAddButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const buttonEvent = await this.deckCardAddButtonClickDetectService.onMouseDown(e);
            if (buttonEvent) {
                // To-do: 객체 scene 에 그리는 코드 후에 분리 필요
                this.reAddMyDeckNumberOfSelectedCards();
                const cardId = this.deckCardAddButtonClickDetectService.getCurrentClickedCardId();
                if (cardId == null) return;
                this.reAddMyDeckRemainingCards(cardId);
                this.reAddMyDeckNumberOfCards();
                this.reAddTotalNumberOfSelectedCards();
            }
        }, false);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.deckEditDoneButtonHoverDetectService.onMouseMove(e), false);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.deckEditDoneButtonClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const buttonEvent = await this.deckEditDoneButtonClickDetectService.onMouseDown(e);
            if (buttonEvent) {
                // To-do: 나중에 수정 필요
                if (this.deckEditDoneButtonClickDetectService.getCurrentButtonClickState() == false) {
                    await this.addAlertModalSelectedDeckCardCount();
                }
            }
        }, false);
        this.renderer.domElement.addEventListener('mousedown', (e) => this.deckCardSearchCancelButtonClickDetectService.onMouseDown(e), false);
//         this.renderer.domElement.addEventListener('mousedown', (e) => this.deckNameEditPopupButtonsClickDetectService.onMouseDown(e), false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => {
            const buttonEvent = await this.deckNameEditPopupButtonsClickDetectService.onMouseDown(e);
            if (buttonEvent) {
                this.reAddMyDeckNameText();
            }
        }, false);
        this.renderer.domElement.addEventListener('mousedown', async (e) => await this.myDeckAlertModalButtonsClickDetectService.onMouseDown(e), false);
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
        await TextGenerator.loadFont(`Batang`, '../../resource/font/GowunBatang-Regular.ttf');
        await TextGenerator.loadFont(`KakaoFont`, '../../resource/font/KakaoSmallSans-Light.ttf');

        await this.addBackground();
        await this.addScrollArea();
        await this.addChosenOutOfTotalSlash();
        await this.addRequiredNumberOfCards();
        await this.addTotalNumberOfSelectedCards();
        await this.addMyDeckCard();
        await this.addMyDeckCardCountMarker();
        await this.addMyDeckOwnedCards();
        await this.addMyDeckTotalOwnedCards();
        await this.addMyDeckNumberOfCards();
        await this.addMyDeckNumberOfSelectedCards();
        await this.addRemainingOutOfTotalSlash();
        await this.addMyDeckRemainingCards();
        await this.addCardSelectionBlocker();
        await this.addMyDeckBlock();
        await this.addMyDeckCardName();
        await this.addMyDeckSearchInputContainer();
        await this.addMyDeckCardSearchBox();
        await this.addMyDeckCardSearchCancelButton();
        await this.addCardFilterButton();
        await this.addCardFilterPanel();
        await this.addCardFilterRaceOptionInactive();
        await this.addCardFilterRaceOptionActive();
        await this.addCardFilterGradeOptionInactive();
        await this.addCardFilterGradeOptionActive();
        await this.addDeckCardDeleteButton();
        await this.addDeckCardAddButton();
        await this.addMyDeckButton();
        await this.addMyDeckButtonEffect();
        await this.addBuildDeckButton();
        await this.addDeckEditButton();
        await this.addDeckEditDoneButton();
        await this.addMyDeckNameText();
        await this.addDeckNameEditButton();
        await this.addDeckDeleteButton();
        await this.addTransparentBackground();
        await this.addDeckMakePopupBackground();
        await this.addDeckMakePopupButtons();
        await this.addDeckMakePopupInputContainer();
        await this.addDeleteDeckPopupWindow();
        await this.addDeleteDeckPopupButton();
        await this.addDeckNameEditPopupBackground();
        await this.addDeckNameEditPopupButtons();
        await this.addDeckNameEditInputContainer();
        await this.addDeckNameEditInfoText();
        await this.addAlertModalContainer();
        await this.addAlertModalButtons();

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

    private async addMyDeckSearchInputContainer():  Promise<void> {
        try {
            const searchInputContainer = await this.myDeckSearchInputContainerService.createMyDeckSearchInputContainer();

            // 생성 완료 후 이벤트 등록
            if (searchInputContainer) {
                const inputContainer = this.myDeckSearchInputContainerService.getMyDeckSearchInputContainer();
                if (inputContainer == null) return;

                const inputElement = inputContainer.getInputElement();
                inputElement.addEventListener("keydown", (e) => {
                    this.deckCardSearchInputEnterDetectService.onKeyDown(e);
                });
                console.log('Search input keydown event registered!');

                inputElement.addEventListener("input", (e) => {
                    this.deckCardSearchInputChangeDetectService.onInput(e);
                });
                console.log("Search input event registered!");
            }

        } catch (error) {
            console.error('Failed to add MyDeckSearchInputContainer:', error);
        }
    }

    private async addCardFilterButton(): Promise<void> {
        try {
            await this.cardFilterButtonService.createCardFilterButton();

            const button = this.cardFilterButtonService.getCardFilterButton();
            if (button) {
                this.scene.add(button.getMesh());
            } else {
                console.warn(`Card Filter Button Not found`);
            }

        } catch (error) {
            console.error('Failed to add Card Filter Button:', error);
        }
    }

    private async addCardFilterPanel(): Promise<void> {
        try {
            await this.cardFilterPanelService.createCardFilterPanel();

            const panel = this.cardFilterPanelService.getCardFilterPanel();
            if (panel) {
                this.scene.add(panel.getMesh());
            } else {
                console.warn(`Card Filter Panel Not found`);
            }

        } catch (error) {
            console.error('Failed to add Card Filter Panel:', error);
        }
    }

    private async addCardFilterRaceOptionInactive(): Promise<void> {
        try {
            const configList = new CardFilterRaceOptionInactiveConfigList();
            await Promise.all(configList.raceOptionConfigs.map(async (config) => {
                await this.cardFilterRaceOptionInactive.createCardFilterRaceOptionInactive(config.type, config.position);
            }));

            const allOptions = this.cardFilterRaceOptionInactive.getAllCardFilterRaceOptionInactive();
            allOptions.forEach(option => {
                this.scene.add(option.getMesh());
            });

        } catch (error) {
            console.error('Failed to add Card Filter Race Option Inactive:', error);
        }
    }

    private async addCardFilterRaceOptionActive(): Promise<void> {
        try {
            const configList = new CardFilterRaceOptionActiveConfigList();
            await Promise.all(configList.raceOptionConfigs.map(async (config) => {
                await this.cardFilterRaceOptionActive.createCardFilterRaceOptionActive(config.type, config.position);
            }));

            const allOptions = this.cardFilterRaceOptionActive.getAllCardFilterRaceOptionActive();
            allOptions.forEach(option => {
                this.scene.add(option.getMesh());
            });

        } catch (error) {
            console.error('Failed to add Card Filter Race Option Active:', error);
        }
    }

    private async addCardFilterGradeOptionInactive(): Promise<void> {
        try {
            const configList = new CardFilterGradeOptionInactiveConfigList();
            await Promise.all(configList.gradeOptionConfigs.map(async (config) => {
                await this.cardFilterGradeOptionInactive.createCardFilterGradeOptionInactive(config.type, config.position);
            }));

            const allOptions = this.cardFilterGradeOptionInactive.getAllCardFilterGradeOptionInactive();
            allOptions.forEach(option => {
                this.scene.add(option.getMesh());
            });

        } catch (error) {
            console.error('Failed to add Card Filter Grade Option Inactive:', error);
        }
    }

    private async addCardFilterGradeOptionActive(): Promise<void> {
        try {
            const configList = new CardFilterGradeOptionActiveConfigList();
            await Promise.all(configList.gradeOptionConfigs.map(async (config) => {
                await this.cardFilterGradeOptionActive.createCardFilterGradeOptionActive(config.type, config.position);
            }));

            const allOptions = this.cardFilterGradeOptionActive.getAllCardFilterGradeOptionActive();
            allOptions.forEach(option => {
                this.scene.add(option.getMesh());
            });

        } catch (error) {
            console.error('Failed to add Card Filter Grade Option Active:', error);
        }
    }

    private async addScrollArea(): Promise<void> {
        try{
            const configList = new SideScrollAreaConfigList();
            await Promise.all(configList.myDeckScrollAreaConfigs.map(async (config) => {
                const areaMesh = await this.sideScrollAreaService.createSideScrollArea(
                    config.type, config.id, config.name, config.width, config.height, config.position);

                if (areaMesh) {
                    this.scene.add(areaMesh);
                    console.log(`Draw Scroll Area ${config.id}`);
                }
            }));

        } catch (error) {
            console.error('Failed to add Side Scroll Area:', error);
        }
    }

    private async addChosenOutOfTotalSlash(): Promise<void> {
        try {
            const slashMesh = await this.myDeckChosenOutOfTotalSlashService.createSlash();
            if (slashMesh) {
                this.scene.add(slashMesh);
            } else {
                console.warn(`Chosen Out Of Total Slash Mesh Not found`);
            }

        } catch (error) {
            console.error('Failed to add Chosen Out Of Total Slash:', error);
        }
    }

    private async addMyDeckCardSearchCancelButton(): Promise<void> {
        try {
            await this.myDeckCardSearchCancelButtonService.createMyDeckCardSearchCancelButton();
            const button = this.myDeckCardSearchCancelButtonService.getButton();
            if (button) {
                this.scene.add(button.getMesh());
            } else {
                console.warn(`My Deck Card Search Cancel Button Not found`);
            }

        } catch (error) {
            console.error('Failed to add Search Cancel Button:', error);
        }
    }

    private async addMyDeckCardSearchBox(): Promise<void> {
        try {
            await this.myDeckCardSearchBoxService.createMyDeckCardSearchBox();
            const searchBox = this.myDeckCardSearchBoxService.getSearchBox();
            if (searchBox) {
                this.scene.add(searchBox.getMesh());
            } else {
                console.warn(`My Deck Card Search Box Not found`);
            }

        } catch (error) {
            console.error('Failed to add My Deck Card Search Box:', error);
        }
    }

    private async addRequiredNumberOfCards(): Promise<void> {
        try {
            await this.requiredNumberOfCarsService.createRequiredNumberOfCards();

            const numberMesh = this.requiredNumberOfCarsService.getNumber();
            if (numberMesh) {
                this.scene.add(numberMesh.getMesh());
            } else {
                console.warn(`Required Number Of Cards Mesh Not found`);
            }

        } catch (error) {
            console.error('Failed to add Required Number Of Cards:', error);
        }
    }

    private async addTotalNumberOfSelectedCards(): Promise<void> {
        try {
            const totalCardCountMap = this.myDeckCardMapRepository.getTotalCardCount();
            for (const [deckId, totalCardCount] of totalCardCountMap) {
                await this.totalNumberOfSelectedCardsService.createTotalNumberOfSelectedCards(deckId, totalCardCount);
            }

            const deckIdList = this.totalNumberOfSelectedCardsService.getAllDeckIdList();
            for (const deckId of deckIdList) {
                const numberMesh = this.totalNumberOfSelectedCardsService.getTotalNumberOfSelectedCardsByDeckId(deckId);
                if (numberMesh) {
                    this.scene.add(numberMesh.getMesh());
                } else {
                    console.warn(`Total Number Of Selected Cards Mesh Not found`);
                }
            }
        } catch (error) {
            console.error('Failed To Add Total Number Of Selected Cards:', error);
        }
    }

    private async reAddTotalNumberOfSelectedCards(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const totalCardCount = this.cardCountManager.findTotalSelectedCardCount(currentClickedDeckId);
            console.log(`%c 선택한 총 카드 개수는? ${totalCardCount}`, 'color: #ffbb00; font-weight: bold;');
            await this.totalNumberOfSelectedCardsService.createTotalNumberOfSelectedCards(currentClickedDeckId, totalCardCount);
            this.totalNumberOfSelectedCardsService.setNumberVisibility(currentClickedDeckId, true);

            const numberMesh = this.totalNumberOfSelectedCardsService.getTotalNumberOfSelectedCardsByDeckId(currentClickedDeckId);
            if (numberMesh) {
                console.log(`%c 여기 실행됨?`, 'color: #ffbb00; font-weight: bold;');
                this.scene.add(numberMesh.getMesh());
            } else {
                console.warn(`Total Number Of Selected Cards Mesh Not found`);
            }

        } catch (error) {
            console.error('Failed to reAdd Total Number Of Selected Cards:', error);
        }
    }

    private async addMyDeckButton(): Promise<void> {
        try {
            const myDeckButtonList = this.myDeckButtonMapRepository.getMyDeckList();

            for (const [index, deckId] of myDeckButtonList.entries()) {
                await this.myDeckButtonService.createMyDeckButtonWithPosition(deckId);
            }

            this.myDeckButtonService.initializeDeckButtonVisibility();
            this.myDeckButtonService.saveCurrentClickDeckId();
            this.myDeckButtonService.applyClippingMaskToDeckButtons();

            const deckButtonGroup = this.myDeckButtonService.getMyDeckButtonGroups();
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

            for (const [index, deckId] of myDeckButtonList.entries()) {
                await this.myDeckButtonEffectService.createDeckButtonEffectWithPosition(deckId);
            }
            this.myDeckButtonEffectService.initializeDeckButtonEffectVisibility();
            this.myDeckButtonEffectService.applyClippingMaskToDeckButtonEffects();

            const deckButtonEffectGroup = this.myDeckButtonEffectService.getMyDeckButtonEffectGroups();
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

            this.deckNameEditButtonService.initializeDeckNameEditButtonVisibility();
            this.deckNameEditButtonService.applyClippingMaskToDeckNameEditButtons();

            const buttonGroup = this.deckNameEditButtonService.getButtonGroup();
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

            this.deckDeleteButtonService.initializeDeckDeleteButtonVisibility();
            this.deckDeleteButtonService.applyClippingMaskToDeckDeleteButtons();

            const buttonGroup = this.deckDeleteButtonService.getButtonGroup();
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
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardLists();
            for (const [deckId, cardIdList] of myDeckCardList) {
                for (const cardId of cardIdList) {
                    await this.myDeckCardService.createMyDeckCardWithPosition(deckId, cardId);
                }
                this.myDeckCardService.saveCardGroup(deckId);
            }

            this.myDeckCardService.initializeDeckCardVisibility();
            this.myDeckCardService.applyClippingMaskToMyDeckCards();

            const deckIdList = this.myDeckCardService.getAllDeckIdList();
            deckIdList.forEach((deckId) => {
                const cardGroup = this.myDeckCardService.getCardGroupByDeckId(deckId);
                if (!this.scene.children.includes(cardGroup)) {
                    this.scene.add(cardGroup);
                }
                cardGroup.position.y = 0;
            });
        } catch (error) {
            console.error('Failed to add my deck cards:', error);
        }
    }

    private async reAddMyDeckCard(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(currentClickedDeckId);
            for (const cardId of cardIdList) {
                await this.myDeckCardService.createMyDeckCardWithPosition(currentClickedDeckId, cardId);
            }
            this.myDeckCardService.saveCardGroup(currentClickedDeckId);
            this.myDeckCardService.applyClippingMaskToMyDeckCards();

            const cardGroup = this.myDeckCardService.getCardGroupByDeckId(currentClickedDeckId);
            if (!this.scene.children.includes(cardGroup)) {
                this.scene.add(cardGroup);
            }
            cardGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to reAdd my deck card:', error);
        }
    }

    private async addMyDeckCardCountMarker(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardLists();
            for (const [deckId, cardIdList] of myDeckCardList) {
                for (const cardId of cardIdList) {
                    await this.deckCardCountMarkerService.createDeckCardCountMarkerWithPosition(deckId, cardId);
                }
                this.deckCardCountMarkerService.saveMarkerGroup(deckId);
            }

            this.deckCardCountMarkerService.initializeMarkerVisibility();
            this.deckCardCountMarkerService.applyClippingMaskToMarker();

            const deckIdList = this.deckCardCountMarkerService.getAllDeckIdList();
            deckIdList.forEach((deckId) => {
                const markerGroup = this.deckCardCountMarkerService.getMarkerGroupByDeckId(deckId);
                if (!this.scene.children.includes(markerGroup)) {
                    this.scene.add(markerGroup);
                }
                markerGroup.position.y = 0;
            });

        } catch (error) {
            console.error('Failed to add my deck card count marker:', error);
        }
    }

    private async reAddMyDeckCardCountMarker(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(currentClickedDeckId);
            for (const cardId of cardIdList) {
                await this.deckCardCountMarkerService.createDeckCardCountMarkerWithPosition(currentClickedDeckId, cardId);
            }
            this.deckCardCountMarkerService.saveMarkerGroup(currentClickedDeckId);
            this.deckCardCountMarkerService.applyClippingMaskToMarker();

            const markerGroup = this.deckCardCountMarkerService.getMarkerGroupByDeckId(currentClickedDeckId);
            if (!this.scene.children.includes(markerGroup)) {
                this.scene.add(markerGroup);
            }
            markerGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to reAdd my deck card count marker:', error);
        }
    }

    private async addMyDeckOwnedCards(): Promise<void> {
        try {
            const cardIdList = this.myDeckOwnedCardsMapRepository.getCardIdList();
            for (const cardId of cardIdList) {
                await this.myDeckOwnedCardsService.createMyDeckOwnedCardsWithPosition(cardId);
            }
            this.myDeckOwnedCardsService.saveCardGroup();
            this.myDeckOwnedCardsService.applyClippingMaskToDeckOwnedCards();

            const cardGroup = this.myDeckOwnedCardsService.getCardGroup();
            if (!this.scene.children.includes(cardGroup)) {
                this.scene.add(cardGroup);
            }
            cardGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add my deck owned cards:', error);
        }
    }

    private async addMyDeckTotalOwnedCards(): Promise<void> {
        try {
            const cardMap = this.myDeckOwnedCardsMapRepository.findCurrentMyDeckOwnedCardsMap();
            await this.myDeckTotalOwnedCardsService.createMyDeckTotalOwnedCardsWithPosition(cardMap);
            this.myDeckTotalOwnedCardsService.applyClippingMaskToTotalOwnedCards();

            const totalOwnedCardsGroup = this.myDeckTotalOwnedCardsService.getTotalOwnedCardsGroup();
            if (!this.scene.children.includes(totalOwnedCardsGroup)) {
                this.scene.add(totalOwnedCardsGroup);
            }
            totalOwnedCardsGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add my deck total owned cards:', error);
        }
    }

    private async addMyDeckRemainingCards(): Promise<void> {
        try {
            const totalOwnedCardMap = this.myDeckOwnedCardsMapRepository.findCurrentMyDeckOwnedCardsMap();
            const usedCardMap = this.myDeckCardMapRepository.getTotalUsedCardCount();
            for (const [cardId, ownedCardCount] of totalOwnedCardMap) {
                const usedCardCount = usedCardMap.get(cardId) ?? 0;
                const remainingCount = ownedCardCount - usedCardCount;
//                 console.log(`%c Card ID: ${cardId}, Used Card Count: ${usedCardCount}, Remaining Count: ${remainingCount}`, 'color: #FE2EF7; font-weight: bold;');

                await this.myDeckRemainingCardsService.createMyDeckRemainingCardsWithPosition(cardId, remainingCount);
            }
            this.myDeckRemainingCardsService.saveRemainingCardGroup();
            this.myDeckRemainingCardsService.applyClippingMaskToRemainingCards();

            const remainingCardsGroup = this.myDeckRemainingCardsService.getRemainingCardsGroup();
            if (!this.scene.children.includes(remainingCardsGroup)) {
                this.scene.add(remainingCardsGroup);
            }
            remainingCardsGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add my deck remaining cards:', error);
        }
    }

    // To-do: 리팩토링 필요
    private async reAddMyDeckRemainingCards(cardId: number): Promise<void> {
        try {
            const remainingCardCount = this.cardCountManager.findRemainingCardCountByCardId(cardId);
            if (remainingCardCount == null) return;
            await this.myDeckRemainingCardsService.createMyDeckRemainingCardsWithPosition(cardId, remainingCardCount);

            // To-do: 덱 검색 후의 화면일 경우 배치된 카드의 위치에 맞춰서 위치도 변경해야 함
            // 덱 편집 모드일 때 검색된 카드만 배치된 경우 아닌 경우 구분 지어야 함 -> 아래는 이에 대한 임시 방편
            const deckEditModeSearchState = this.deckCardSearchInputEnterDetectService.getDeckEditSearchState();
            const clickedRaceOptionTypes = this.cardFilterRaceOptionClickDetectService.getClickedRaceOptionTypes();

            if (deckEditModeSearchState === DeckCardSearchStateInDeckEditMode.MATCHED) {
                this.handleDeckEditModeMatched(cardId);
            } else if (clickedRaceOptionTypes !== null) {
                this.handleFilteredState(cardId);
            } else {
                this.myDeckRemainingCardsService.setNumberOfRemainingCardsByCardId(cardId, true);
            }

            this.myDeckRemainingCardsService.saveRemainingCardGroup();
            this.myDeckRemainingCardsService.applyClippingMaskToRemainingCards();
            this.ensureRemainingCardsGroupInScene();

        } catch (error) {
            console.error('Failed to add my deck remaining cards:', error);
        }
    }

    // 덱 편집 모드 - 검색 결과가 매치된 경우 처리
    private handleDeckEditModeMatched(cardId: number): void {
        this.myDeckRemainingCardsService.adjustDeckEditModeSearchRemainingCardsPosition(cardId);

        const matchedList = this.deckCardSearchInputEnterDetectService.getMatchedOwnedCardIdList() || [];
        const isMatched = matchedList.includes(cardId);
        this.myDeckRemainingCardsService.setNumberOfRemainingCardsByCardId(cardId, isMatched);
    }

    // 덱 편집모드에서  카드가 필터링된 경우 처리
    private handleFilteredState(cardId: number): void {
        this.myDeckRemainingCardsService.adjustDeckEditModeFilteredRemainingCardsPosition(cardId);

        const clickedGradeOptionTypes = this.cardFilterRaceOptionClickDetectService.getClickedGradeOptionTypes() || [];
        const clickedRaceOptionTypes = this.cardFilterRaceOptionClickDetectService.getClickedRaceOptionTypes() || [];
        const filteredList = this.cardFilterRaceOptionClickDetectService.getFilteredOwnedCardIdList(
            clickedRaceOptionTypes,
            clickedGradeOptionTypes
        );

        const isIncluded = Array.isArray(filteredList) && filteredList.includes(cardId);
        this.myDeckRemainingCardsService.setNumberOfRemainingCardsByCardId(cardId, isIncluded);
    }

    // 남은 카드 수량 객체 그룹 추가 및 초기 위치 설정
    private ensureRemainingCardsGroupInScene(): void {
        const remainingCardsGroup = this.myDeckRemainingCardsService.getRemainingCardsGroup();
        if (!remainingCardsGroup) return;

        if (!this.scene.children.includes(remainingCardsGroup)) {
            this.scene.add(remainingCardsGroup);
        }
        remainingCardsGroup.position.y = 0;
    }

    // To-do: 리팩토링 필용한 부분
    private async reAddMyDeckRemainingCardsAfterDeleteDeck(): Promise<void> {
        try {
            const currentCardIdList = this.myDeckRemainingCardsService.getCardIdList();
            const allCardIdList = this.cardCountManager.findRemainingCardIdList();

            for (const cardId of allCardIdList) {
                if (!currentCardIdList.includes(cardId)) {
                    const remainingCardCount = this.cardCountManager.findRemainingCardCountByCardId(cardId);
                    if (remainingCardCount == null) return;

                    console.log(`%c 카드 ID: ${cardId}) 수량: ${remainingCardCount}`, 'color: #ff0033; font-weight: bold;');
                    await this.myDeckRemainingCardsService.createMyDeckRemainingCardsWithPosition(cardId, remainingCardCount);
                    this.myDeckRemainingCardsService.setNumberOfRemainingCardsByCardId(cardId, false);
                }
            }

            this.myDeckRemainingCardsService.saveRemainingCardGroup();
            this.myDeckRemainingCardsService.applyClippingMaskToRemainingCards();

            const remainingCardsGroup = this.myDeckRemainingCardsService.getRemainingCardsGroup();
            if (!this.scene.children.includes(remainingCardsGroup)) {
                this.scene.add(remainingCardsGroup);
            }
            remainingCardsGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add my deck remaining cards:', error);
        }
    }

    private async addRemainingOutOfTotalSlash(): Promise<void> {
        try {
            const cardMap = this.myDeckOwnedCardsMapRepository.findCurrentMyDeckOwnedCardsMap();
            await this.myDeckRemainingOutOfTotalSlashService.createSlashWithPosition(cardMap);
            this.myDeckRemainingOutOfTotalSlashService.applyClippingMaskToSlash();

            const slashGroup = this.myDeckRemainingOutOfTotalSlashService.getSlashGroup();
            if (!this.scene.children.includes(slashGroup)) {
                this.scene.add(slashGroup);
            }
            slashGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add remaining out of total Slash:', error);
        }
    }

    private async addCardSelectionBlocker(): Promise<void> {
        try {
            const cardIdList = this.myDeckOwnedCardsMapRepository.getCardIdList();
            for (const cardId of cardIdList) {
                await this.cardSelectionBlockerService.createCardSelectionBlockerWithPosition(cardId);
            }
            this.cardSelectionBlockerService.saveBlockerGroup();
//             this.cardSelectionBlockerService.initializeBlockerVisibility();
            this.cardSelectionBlockerService.applyClippingMaskToBlocker();

            const blockerGroup = this.cardSelectionBlockerService.getBlockerGroup();
            if (!this.scene.children.includes(blockerGroup)) {
                this.scene.add(blockerGroup);
            }
            blockerGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add Card Selection Blocker:', error);
        }
    }

    private async addMyDeckNumberOfCards(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardLists();
            for (const [deckId, cardIdList] of myDeckCardList) {
                for (const cardId of cardIdList) {
                    const cardCount = this.myDeckCardMapRepository.findCardCountByDeckIdAndCardId(deckId, cardId);
                    await this.myDeckNumberOfCardsService.createMyDeckNumberOfCardsWithPosition(deckId, cardId, cardCount);
                    this.myDeckNumberOfCardsService.saveCardCountInfo(deckId, cardId, cardCount);
                    this.myDeckNumberOfCardsService.saveNumberGroup(deckId);
                }
            }

            this.myDeckNumberOfCardsService.initializeDeckNumberOfCardsVisibility();
            this.myDeckNumberOfCardsService.applyClippingMaskToMyDeckNumberOfCards();

            const deckIdList = this.myDeckNumberOfCardsService.getAllDeckIdList();
            deckIdList.forEach((deckId) => {
                const numberGroup = this.myDeckNumberOfCardsService.getNumberGroupByDeckId(deckId);
                if (!this.scene.children.includes(numberGroup)) {
                    this.scene.add(numberGroup);
                }
                numberGroup.position.y = 0;
            });
        } catch (error) {
            console.error('Failed to add my deck number of cards:', error);
        }
    }

    private async reAddMyDeckNumberOfCards(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(currentClickedDeckId);
            for (const cardId of cardIdList) {
                const cardCount = this.cardCountManager.findSelectedCardCountByDeck(currentClickedDeckId, cardId);
                if (cardCount !== 0) {
                    await this.myDeckNumberOfCardsService.createMyDeckNumberOfCardsWithPosition(currentClickedDeckId, cardId, cardCount);
                    this.myDeckNumberOfCardsService.saveNumberGroup(currentClickedDeckId);
                }
            }

            this.myDeckNumberOfCardsService.applyClippingMaskToMyDeckNumberOfCards();

            const numberGroup = this.myDeckNumberOfCardsService.getNumberGroupByDeckId(currentClickedDeckId);
            if (!this.scene.children.includes(numberGroup)) {
                this.scene.add(numberGroup);
            }
            numberGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add my deck number of cards:', error);
        }
    }

    private async addMyDeckNumberOfSelectedCards(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardLists();
            for (const [deckId, cardIdList] of myDeckCardList) {
                for (const cardId of cardIdList) {
                    const cardCount = this.myDeckCardMapRepository.findCardCountByDeckIdAndCardId(deckId, cardId);
                    await this.myDeckNumberOfSelectedCardsService.createMyDeckNumberOfSelectedCardsWithPosition(deckId, cardId, cardCount);
                    this.myDeckNumberOfSelectedCardsService.saveNumberGroup(deckId);
                }
            }

            this.myDeckNumberOfSelectedCardsService.initializeNumberVisibility();
            this.myDeckNumberOfSelectedCardsService.applyClippingMaskToNumber();

            const deckIdList = this.myDeckNumberOfSelectedCardsService.getAllDeckIdList();
            deckIdList.forEach((deckId) => {
                const numberGroup = this.myDeckNumberOfSelectedCardsService.getNumberGroupByDeckId(deckId);
                if (!this.scene.children.includes(numberGroup)) {
                    this.scene.add(numberGroup);
                }
                numberGroup.position.y = 0;
            });

        } catch (error) {
            console.error('Failed to add my deck number of selected cards:', error);
        }
    }

    private async reAddMyDeckNumberOfSelectedCards(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;
            console.log(`%c [delete card or add card button click] 현재 클릭한 덱 ID: ${currentClickedDeckId}`, 'color: #FE2EF7; font-weight: bold;');

            const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(currentClickedDeckId);
            for (const cardId of cardIdList) {
                const cardCount = this.cardCountManager.findSelectedCardCountByDeck(currentClickedDeckId, cardId);
                if (cardCount !== 0) {
                    await this.myDeckNumberOfSelectedCardsService.createMyDeckNumberOfSelectedCardsWithPosition(currentClickedDeckId, cardId, cardCount);
                    this.myDeckNumberOfSelectedCardsService.saveNumberGroup(currentClickedDeckId);
                }
            }

            this.myDeckNumberOfSelectedCardsService.applyClippingMaskToNumber();

            const numberGroup = this.myDeckNumberOfSelectedCardsService.getNumberGroupByDeckId(currentClickedDeckId);
            if (!this.scene.children.includes(numberGroup)) {
                this.scene.add(numberGroup);
            }
            numberGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to add my deck number of selected cards:', error);
        }
    }

    private async addMyDeckBlock(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardLists();
            for (const [deckId, cardIdList] of myDeckCardList) {
                for (const cardId of cardIdList) {
                    await this.myDeckBlockService.createMyDeckBlockWithPosition(deckId, cardId);
                }
                this.myDeckBlockService.saveBlockGroup(deckId);
            }

            this.myDeckBlockService.initializeBlockVisibility();
            this.myDeckBlockService.applyClippingMaskToBlock();

            const deckIdList = this.myDeckBlockService.getAllDeckIdList();
            deckIdList.forEach((deckId) => {
                const blockGroup = this.myDeckBlockService.getBlockGroupByDeckId(deckId);
                if (!this.scene.children.includes(blockGroup)) {
                    this.scene.add(blockGroup);
                }
                blockGroup.position.y = 0;
            });

        } catch (error) {
            console.error('Failed to add my deck blocks:', error);
        }
    }

    private async reAddMyDeckBlock(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(currentClickedDeckId);
            for (const cardId of cardIdList) {
                await this.myDeckBlockService.createMyDeckBlockWithPosition(currentClickedDeckId, cardId);
            }
            this.myDeckBlockService.saveBlockGroup(currentClickedDeckId);
            this.myDeckBlockService.applyClippingMaskToBlock();

            const blockGroup = this.myDeckBlockService.getBlockGroupByDeckId(currentClickedDeckId);
            if (!this.scene.children.includes(blockGroup)) {
                this.scene.add(blockGroup);
            }
            blockGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to reAdd my deck blocks:', error);
        }
    }

    private async addMyDeckCardName(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardLists();
            for (const [deckId, cardIdList] of myDeckCardList) {
                for (const cardId of cardIdList) {
                    await this.myDeckCardNameService.createMyDeckCardNameWithPosition(deckId, cardId);
                }
                this.myDeckCardNameService.saveCardNameGroup(deckId);
            }

            this.myDeckCardNameService.initializeCardNameVisibility();
            this.myDeckCardNameService.applyClippingMaskToCardName();

            const deckIdList = this.myDeckCardNameService.getAllDeckIdList();
            deckIdList.forEach((deckId) => {
                const cardNameGroup = this.myDeckCardNameService.getCardNameGroupByDeckId(deckId);
                if (!this.scene.children.includes(cardNameGroup)) {
                    this.scene.add(cardNameGroup);
                }
                cardNameGroup.position.y = 0;
            });

        } catch (error) {
            console.error('Failed to add My Deck Card Name:', error);
        }
    }

    private async reAddMyDeckCardName(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(currentClickedDeckId);
            for (const cardId of cardIdList) {
                await this.myDeckCardNameService.createMyDeckCardNameWithPosition(currentClickedDeckId, cardId);
            }
            this.myDeckCardNameService.saveCardNameGroup(currentClickedDeckId);
            this.myDeckCardNameService.applyClippingMaskToCardName();

            const cardNameGroup = this.myDeckCardNameService.getCardNameGroupByDeckId(currentClickedDeckId);
            if (!this.scene.children.includes(cardNameGroup)) {
                this.scene.add(cardNameGroup);
            }
            cardNameGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to reAdd my deck card name:', error);
        }
    }

    private async addMyDeckNameText(): Promise<void> {
        try{
            const deckIdList = this.myDeckNameTextMapRepository.getDeckIds();
            const myDeckNameList = this.myDeckNameTextMapRepository.getMyDeckNameTextList();

            for (const [index, deckName] of myDeckNameList.entries()) {
                const deckId = deckIdList[index];
                await this.myDeckNameTextService.createMyDeckNameTextWithPosition(deckId, deckName);
            }

            this.myDeckNameTextService.saveMyDeckTextGroup();
            this.myDeckNameTextService.applyClippingMaskToDeckNameText();

            const textGroup = this.myDeckNameTextService.getMyDeckTextGroups();
            if (!this.scene.children.includes(textGroup)) {
                this.scene.add(textGroup);
            }
            textGroup.position.y = 0;

        } catch (error){
             console.error('Failed to add test text:', error);
        }
    }

    private async reAddMyDeckNameText(): Promise<void> {
        try{
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const deckName = this.myDeckNameTextMapRepository.findMyDeckNameByDeckId(currentClickedDeckId);
            if (deckName == undefined) return;

            await this.myDeckNameTextService.createMyDeckNameTextWithPosition(currentClickedDeckId, deckName);

            this.myDeckNameTextService.saveMyDeckTextGroup();
            this.myDeckNameTextService.applyClippingMaskToDeckNameText();

            const textGroup = this.myDeckNameTextService.getMyDeckTextGroups();
            if (!this.scene.children.includes(textGroup)) {
                this.scene.add(textGroup);
            }
            textGroup.position.y = 0;

        } catch (error){
             console.error('Failed to add My Deck Name text:', error);
        }
    }

    private async addDeckCardDeleteButton(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardLists();
            for (const [deckId, cardIdList] of myDeckCardList) {
                for (const cardId of cardIdList) {
                    await this.deckCardDeleteButtonService.createDeckCardDeleteButtonWithPosition(deckId, cardId);
                }
                this.deckCardDeleteButtonService.saveButtonGroup(deckId);
            }

            this.deckCardDeleteButtonService.applyClippingMaskToButton();

            const deckIdList = this.deckCardDeleteButtonService.getAllDeckIdList();
            deckIdList.forEach((deckId) => {
                const buttonGroup = this.deckCardDeleteButtonService.getButtonGroupByDeckId(deckId);
                if (!this.scene.children.includes(buttonGroup)) {
                    this.scene.add(buttonGroup);
                }
                buttonGroup.position.y = 0;
            });

        } catch (error) {
            console.error('Failed to add deck card delete button:', error);
        }
    }

    private async reAddDeckCardDeleteButton(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(currentClickedDeckId);
            for (const cardId of cardIdList) {
                await this.deckCardDeleteButtonService.createDeckCardDeleteButtonWithPosition(currentClickedDeckId, cardId);
            }
            this.deckCardDeleteButtonService.saveButtonGroup(currentClickedDeckId);
            this.deckCardDeleteButtonService.applyClippingMaskToButton();

            const buttonGroup = this.deckCardDeleteButtonService.getButtonGroupByDeckId(currentClickedDeckId);
            if (!this.scene.children.includes(buttonGroup)) {
                this.scene.add(buttonGroup);
            }
            buttonGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to reAdd deck card delete button:', error);
        }
    }

    private async addDeckCardAddButton(): Promise<void> {
        try {
            const myDeckCardList = this.myDeckCardMapRepository.getDeckIdAndUniqueCardLists();
            for (const [deckId, cardIdList] of myDeckCardList) {
                for (const cardId of cardIdList) {
                    await this.deckCardAddButtonService.createDeckCardAddButtonWithPosition(deckId, cardId);
                }
                this.deckCardAddButtonService.saveButtonGroup(deckId);
            }

            this.deckCardAddButtonService.applyClippingMaskToButton();

            const deckIdList = this.deckCardAddButtonService.getAllDeckIdList();
            deckIdList.forEach((deckId) => {
                const buttonGroup = this.deckCardAddButtonService.getButtonGroupByDeckId(deckId);
                if (!this.scene.children.includes(buttonGroup)) {
                    this.scene.add(buttonGroup);
                }
                buttonGroup.position.y = 0;
            });

        } catch (error) {
            console.error('Failed to add deck card add button:', error);
        }
    }

    private async reAddDeckCardAddButton(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(currentClickedDeckId);
            for (const cardId of cardIdList) {
                await this.deckCardAddButtonService.createDeckCardAddButtonWithPosition(currentClickedDeckId, cardId);
            }

            this.deckCardAddButtonService.saveButtonGroup(currentClickedDeckId);
            this.deckCardAddButtonService.applyClippingMaskToButton();

            const buttonGroup = this.deckCardAddButtonService.getButtonGroupByDeckId(currentClickedDeckId);
            if (!this.scene.children.includes(buttonGroup)) {
                this.scene.add(buttonGroup);
            }
            buttonGroup.position.y = 0;

        } catch (error) {
            console.error('Failed to reAdd deck card add button:', error);
        }
    }

    private async addBuildDeckButton(): Promise<void> {
        try {
            const configList = new BuildDeckButtonConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) =>{
                const button = await this.buildDeckButtonService.createBuildDeckButton(
                    config.id,
                    config.position
                );

                if (button) {
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
                const button = await this.deckEditButtonService.createDeckEditButton(config.id, config.position);

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
                const button = await this.deckEditDoneButtonService.createDeckEditDoneButton(config.id, config.position);

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
                const button = await this.deleteDeckPopupButtonService.createDeleteDeckPopupButton(config.id, config.position);

                if (button) {
                    this.scene.add(button);
                    console.log(`Draw Delete Deck Popup Button ${config.id}`);
                }
            }));
        } catch (error) {
            console.error('Failed to add Delete Deck Popup Button:', error);
        }
    }

    private async addDeckMakePopupBackground(): Promise<void> {
        try {
            const deckMakePopupBackground = await this.decKMakePopupBackgroundService.createDeckMakePopupBackground();
            if (deckMakePopupBackground) {
                this.scene.add(deckMakePopupBackground);
            } else {
                console.warn(`No deckMakePopupBackground found`);
            }
        } catch (error) {
            console.error('Failed to add DeckMakePopupBackground:', error);
        }
    }

    private async addDeckMakePopupButtons(): Promise<void> {
        try {
            const configList = new DeckMakePopupButtonsConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) => {
                const button = await this.deckMakePopupButtonsService.createDeckMakePopupButtons(config.id,config.position);

                if (button) {
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

    private async addDeckNameEditPopupBackground(): Promise<void> {
        try {
            await this.deckNameEditPopupBackgroundService.createDeckNameEditPopupBackground();

            const popupBackground = this.deckNameEditPopupBackgroundService.getDeckNameEditPopupBackground();
            if (popupBackground !== null) {
                this.scene.add(popupBackground.getMesh());

            } else {
                console.warn(`Not found Deck Name Edit Popup Background`);
                }
        } catch (error) {
            console.error('Failed to add Deck Name Edit Popup Background:', error);
        }
    }

    private async addDeckNameEditPopupButtons(): Promise<void> {
        try {
            const configList = new DeckNameEditPopupButtonsConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) => {
                const button = await this.deckNameEditPopupButtonsService.createDeckNameEditPopupButtons(config.id,config.position);

                if (button) {
                    this.scene.add(button);
                    console.log(`Draw Deck Name Edit Pop-up Button ${config.id}`);
                }
            }));

        } catch (error) {
            console.error('Failed to add Deck Name Edit Popup Buttons:', error);
        }
    }

    private async addDeckNameEditInputContainer():  Promise<void> {
        try {
            const deckNameEditInputContainer = await this.deckNameEditInputContainerService.createDeckNameEditInputContainer();
            // 생성 완료 후 이벤트 등록
            if (deckNameEditInputContainer) {
                const inputContainer = this.deckNameEditInputContainerService.getDeckNameEditInputContainer();
                if (inputContainer == null) return;

                const inputElement = inputContainer.getInputElement();


                inputElement.addEventListener("input", (e) => {
                    this.deckNameEditInputChangeDetectService.onInput(e);
                });
                console.log("Search input event registered!");
            }

        } catch (error) {
            console.error('Failed to add Deck Name Edit Input Container:', error);
        }
    }

    private async addDeckNameEditInfoText(): Promise<void> {
        try {
            const configList = new DeckNameEditInfoTextConfigList();
            await Promise.all(configList.infoTextConfigs.map(async (config) =>{
                const infoText = await this.deckNameEditInfoTextService.createDeckNameEditInfoText(
                    config.id,
                    config.color,
                    config.text,
                    config.position
                );

                if (infoText) {
                    this.scene.add(infoText);
                    console.log(`Draw Deck Name Edit Info Text ${config.id}`);
                }

            }));
        } catch (error) {
            console.error('Failed to add Deck Name Edit Info Text:', error);
        }
    }

    private async addAlertModalContainer(): Promise<void> {
        try {
            const configList = new AlertModalContainerConfigList();
            await Promise.all(configList.containerConfigs.map(async (config) => {
                await this.alertModalContainerService.createAlertModalContainer(config.type, config.position);
            }));

            const allContainer = this.alertModalContainerService.getAllAlertModalContainers();
            allContainer.forEach(container => {
                this.scene.add(container.getMesh());
            });

        } catch (error) {
            console.error('Failed to add Alert Modal Container:', error);
        }
    }

    private async addAlertModalButtons(): Promise<void> {
        try {
            const configList = new AlertModalButtonsConfigList();
            await Promise.all(configList.buttonConfigs.map(async (config) => {
                await this.alertModalButtonsService.createAlertModalButtons(config.type, config.position);
            }));

            const allButtons = this.alertModalButtonsService.getAllAlertModalButtons();
            allButtons.forEach(button => {
                this.scene.add(button.getMesh());
            });

        } catch (error) {
            console.error('Failed to add Alert Modal Button:', error);
        }
    }

    private async addAlertModalSelectedDeckCardCount(): Promise<void> {
        try {
            const currentClickedDeckId = this.myDeckButtonClickDetectService.getCurrentClickDeckId();
            if (currentClickedDeckId == null) return;

            const cardCount = this.cardCountManager.findTotalSelectedCardCount(currentClickedDeckId);

            await this.alertModalSelectedDeckCardCountService.createAlertModalSelectedDeckCardCount(cardCount);

            const cardCountMesh = this.alertModalSelectedDeckCardCountService.getAlertModalSelectedDeckCardCount();
            if (cardCountMesh) {
                this.scene.add(cardCountMesh.getMesh());
            } else {
                console.warn(`Alert Modal Selected Deck Card Count Not found`);
            }

        } catch (error) {
            console.error('Failed to add Alert Modal Selected Deck Card Count:', error);
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
            this.myDeckSearchInputContainerService.adjustMyDeckSearchInputContainerPosition();
            this.myDeckCardSearchBoxService.adjustMyDeckCardSearchBoxPosition();
            this.myDeckCardSearchCancelButtonService.adjustMyDeckCardSearchCancelButtonPosition();
            this.sideScrollAreaService.adjustMyDeckSideScrollAreaPosition();
            this.sideScrollAreaService.adjustMyDeckCardScrollAreaPosition();
            this.sideScrollAreaService.adjustMyDeckBlockScrollAreaPosition();
            this.myDeckChosenOutOfTotalSlashService.adjustSlashPosition();
            this.requiredNumberOfCarsService.adjustNumberPosition();
            this.totalNumberOfSelectedCardsService.adjustTotalNumberOfSelectedCardsPosition();
            this.myDeckButtonService.adjustMyDeckButtonPosition();
            this.myDeckButtonEffectService.adjustMyDeckButtonEffectPosition();
            this.deckNameEditButtonService.adjustDeckNameEditButtonPosition();
            this.deckDeleteButtonService.adjustDeckDeleteButtonPosition();
            this.myDeckCardService.adjustMyDeckCardPosition();
            this.deckCardCountMarkerService.adjustDeckCardCountMarkerPosition();
            this.myDeckOwnedCardsService.adjustMyDeckOwnedCardsPosition();
            this.myDeckTotalOwnedCardsService.adjustMyDeckTotalOwnedCardsPosition();
            this.myDeckNumberOfCardsService.adjustMyDeckNumberOfCardsPosition();
            this.myDeckNumberOfSelectedCardsService.adjustMyDeckNumberOfSelectedCardsPosition();
            this.myDeckRemainingOutOfTotalSlashService.adjustSlashPosition();
            this.myDeckRemainingCardsService.adjustMyDeckRemainingCardsPosition();
            this.cardSelectionBlockerService.adjustCardSelectionBlockerPosition();
            this.myDeckBlockService.adjustMyDeckBlockPosition();
            this.myDeckCardNameService.adjustMyDeckCardNamePosition();
            this.deckCardDeleteButtonService.adjustDeckCardDeleteButtonPosition();
            this.myDeckNameTextService.adjustMyDeckNameTextPosition();
            this.buildDeckButtonService.adjustBuildDeckButtonPosition();
            this.deckEditButtonService.adjustDeckEditButtonPosition();
            this.deckEditDoneButtonService.adjustDeckEditDoneButtonPosition();
            this.transparentBackgroundService.adjustTransparentBackgroundPosition();
            this.decKMakePopupBackgroundService.adjustDeckMakePopupBackgroundPosition();
            this.deckMakePopupButtonsService.adjustDeckMakePopupButtonsPosition();
            this.deckMakePopupInputContainerService.adjustDeckMakePopupInputContainerPosition();
            this.deleteDeckPopupWindowService.adjustDeckMakePopupBackgroundPosition();
            this.deleteDeckPopupButtonService.adjustDeleteDeckPopupButtonPosition();
            this.deckCardAddButtonService.adjustDeckCardAddButtonPosition();
            this.deckNameEditPopupBackgroundService.adjustDeckMakePopupBackgroundPosition();
            this.deckNameEditPopupButtonsService.adjustDeckMakePopupButtonsPosition();
            this.deckNameEditInputContainerService.adjustDeckNameEditInputContainerPosition();
            this.deckNameEditInfoTextService.adjustDeckNameEditInfoTextPosition();
            this.alertModalContainerService.adjustAlertModalContainerPosition();
            this.alertModalButtonsService.adjustAlertModalButtonsPosition();
            this.alertModalSelectedDeckCardCountService.adjustAlertModalSelectedDeckCardCount();
            this.cardFilterButtonService.adjustCardFilterButtonPosition();
            this.cardFilterPanelService.adjustCardFilterPanelPosition();
            this.cardFilterRaceOptionInactive.adjustCardFilterRaceOptionInactivePosition();
            this.cardFilterRaceOptionActive.adjustCardFilterRaceOptionActivePosition();
            this.cardFilterGradeOptionInactive.adjustCardFilterGradeOptionInactivePosition();
            this.cardFilterGradeOptionActive.adjustCardFilterGradeOptionActivePosition();
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