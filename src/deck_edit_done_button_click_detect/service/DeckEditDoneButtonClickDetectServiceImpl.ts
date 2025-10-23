import * as THREE from "three";
import {getCardById} from "../../card/utility";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";
import {AlertModalContainerType} from "../../alert_modal_container/entity/AlertModalContainerType";
import {AlertModalButtonsType} from "../../alert_modal_buttons/entity/AlertModalButtonsType";
import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckEditDoneButtonClickDetectService} from "./DeckEditDoneButtonClickDetectService";
import {DeckEditDoneButtonClickDetectRepositoryImpl} from "../repository/DeckEditDoneButtonClickDetectRepositoryImpl";
import {DeckEditDoneButtonRepositoryImpl} from "../../deck_edit_done_button/repository/DeckEditDoneButtonRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardMapRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardMapRepositoryImpl";
import {DeckEditButtonRepositoryImpl} from "../../deck_edit_button/repository/DeckEditButtonRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash/repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {TotalNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_total_number_of_selected_cards/repository/TotalNumberOfSelectedCardsRepositoryImpl";
import {MyDeckChosenOutOfTotalSlashRepositoryImpl} from "../../my_deck_chosen_out_of_total_slash/repository/MyDeckChosenOutOfTotalSlashRepositoryImpl";
import {RequiredNumberOfCardsRepositoryImpl} from "../../required_number_of_cards_in_the_deck/repository/RequiredNumberOfCardsRepositoryImpl";
import {DeckCardAddButtonRepositoryImpl} from "../../deck_card_add_button/repository/DeckCardAddButtonRepositoryImpl";
import {DeckCardDeleteButtonRepositoryImpl} from "../../deck_card_delete_button/repository/DeckCardDeleteButtonRepositoryImpl";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../../my_deck_block_hover_detect/repository/MyDeckBlockHoverDetectRepositoryImpl";
import {DeckEditDoneButtonHoverDetectRepositoryImpl} from "../../deck_edit_done_button_hover_detect/repository/DeckEditDoneButtonHoverDetectRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {AlertModalButtonsRepositoryImpl} from "../../alert_modal_buttons/repository/AlertModalButtonsRepositoryImpl";
import {AlertModalContainerRepositoryImpl} from "../../alert_modal_container/repository/AlertModalContainerRepositoryImpl";
import {MyDeckAlertModalButtonsClickDetectRepositoryImpl} from "../../my_deck_alert_modal_buttons_click_detect/repository/MyDeckAlertModalButtonsClickDetectRepositoryImpl";
import {DeckNameEditButtonClickDetectRepositoryImpl} from "../../deck_name_edit_button_click_detect/repository/DeckNameEditButtonClickDetectRepositoryImpl";
import {BuildDeckButtonHoverDetectRepositoryImpl} from "../../build_deck_button_hover_detect/repository/BuildDeckButtonHoverDetectRepositoryImpl";
import {BuildDeckButtonClickDetectRepositoryImpl} from "../../build_deck_button_click_detect/repository/BuildDeckButtonClickDetectRepositoryImpl";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../../deck_delete_button_click_detect/repository/DeckDeleteButtonClickDetectRepositoryImpl";
import {DeckCardDeleteButtonClickDetectRepositoryImpl} from "../../deck_card_delete_button_click_detect/repository/DeckCardDeleteButtonClickDetectRepositoryImpl";
import {DeckCardAddButtonClickDetectRepositoryImpl} from "../../deck_card_add_button_click_detect/repository/DeckCardAddButtonClickDetectRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";

export class DeckEditDoneButtonClickDetectServiceImpl implements DeckEditDoneButtonClickDetectService {
    private static instance: DeckEditDoneButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private cardCountManager: CardCountManager;
    private deckEditDoneButtonClickDetectRepository: DeckEditDoneButtonClickDetectRepositoryImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardMapRepository: MyDeckCardMapRepositoryImpl;
    private deckEditButtonRepository: DeckEditButtonRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private totalNumberOfSelectedCardsRepository: TotalNumberOfSelectedCardsRepositoryImpl;
    private myDeckChosenOutOfTotalSlashRepository: MyDeckChosenOutOfTotalSlashRepositoryImpl;
    private requiredNumberOfCardsRepository: RequiredNumberOfCardsRepositoryImpl;
    private deckCardAddButtonRepository: DeckCardAddButtonRepositoryImpl;
    private deckCardDeleteButtonRepository: DeckCardDeleteButtonRepositoryImpl;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;
    private deckEditDoneButtonHoverDetectRepository: DeckEditDoneButtonHoverDetectRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private alertModalButtonsRepository: AlertModalButtonsRepositoryImpl;
    private alertModalContainerRepository: AlertModalContainerRepositoryImpl;
    private myDeckAlertModalButtonsClickDetectRepository: MyDeckAlertModalButtonsClickDetectRepositoryImpl;
    private deckNameEditButtonClickDetectRepository: DeckNameEditButtonClickDetectRepositoryImpl;
    private buildDeckButtonHoverDetectRepository: BuildDeckButtonHoverDetectRepositoryImpl;
    private buildDeckButtonClickDetectRepository: BuildDeckButtonClickDetectRepositoryImpl;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private deckCardDeleteButtonClickDetectRepository: DeckCardDeleteButtonClickDetectRepositoryImpl;
    private deckCardAddButtonClickDetectRepository: DeckCardAddButtonClickDetectRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
        this.deckEditDoneButtonClickDetectRepository = DeckEditDoneButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.totalNumberOfSelectedCardsRepository = TotalNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckChosenOutOfTotalSlashRepository = MyDeckChosenOutOfTotalSlashRepositoryImpl.getInstance();
        this.requiredNumberOfCardsRepository = RequiredNumberOfCardsRepositoryImpl.getInstance(scene);
        this.deckCardAddButtonRepository = DeckCardAddButtonRepositoryImpl.getInstance(scene);
        this.deckCardDeleteButtonRepository = DeckCardDeleteButtonRepositoryImpl.getInstance(scene);
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.deckEditDoneButtonHoverDetectRepository = DeckEditDoneButtonHoverDetectRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.alertModalButtonsRepository = AlertModalButtonsRepositoryImpl.getInstance(scene);
        this.alertModalContainerRepository = AlertModalContainerRepositoryImpl.getInstance(scene);
        this.myDeckAlertModalButtonsClickDetectRepository = MyDeckAlertModalButtonsClickDetectRepositoryImpl.getInstance();
        this.deckNameEditButtonClickDetectRepository = DeckNameEditButtonClickDetectRepositoryImpl.getInstance();
        this.buildDeckButtonHoverDetectRepository = BuildDeckButtonHoverDetectRepositoryImpl.getInstance();
        this.buildDeckButtonClickDetectRepository = BuildDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonClickDetectRepository = DeckCardDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardAddButtonClickDetectRepository = DeckCardAddButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckEditDoneButtonClickDetectServiceImpl {
        if (!DeckEditDoneButtonClickDetectServiceImpl.instance) {
            DeckEditDoneButtonClickDetectServiceImpl.instance = new DeckEditDoneButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckEditDoneButtonClickDetectServiceImpl.instance;
    }

    private setDeckEditDoneButtonClickEnabled(isEnabled: boolean): void {
        this.deckEditDoneButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isDeckEditDoneButtonClickEnabled(): boolean {
        return this.deckEditDoneButtonClickDetectRepository.isButtonClickEnabled();
    }

    public async handleClick(clickPoint: { x: number; y: number }): Promise<DeckEditDoneButton | null> {
        const { x, y } = clickPoint;
        const currentClickedDeckId = this.getCurrentClickDeckId();
        if (currentClickedDeckId == null) return null;

        const button = this.getDeckEditDoneButton();
        if (button == null) return null;

        const clickedButton = this.deckEditDoneButtonClickDetectRepository.isDeckEditDoneButtonClicked(
            { x, y },
            button,
            this.camera);

        if (clickedButton) {
            this.saveCurrentDoneButtonClickState(true);
            console.log(`%c Clicked Deck Edit Done Button`, 'color: #ffbb00; font-weight: bold;');

            const selectedTotalCardCount = this.cardCountManager.findTotalSelectedCardCount(currentClickedDeckId);
            if (selectedTotalCardCount == 40) {
                this.handleDeckEditCompletion(currentClickedDeckId);
            } else {
                this.handleDeckEditIncompletion(selectedTotalCardCount, currentClickedDeckId);
                return null;
            }
            return clickedButton;
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckEditDoneButton | null> {
        if (!this.isDeckEditDoneButtonClickEnabled()) return null;
        if (this.getDeckEditDoneButtonVisibility() == false) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleClick(clickPoint);
        }
        return null;
    }

    private handleDeckEditCompletion(currentClickedDeckId: number): void {
        // To-do: 확인용 메세지 나중에 지워야 함
        console.log(`%c 덱 편집 완료 버튼 클릭 화면 전환 필요 `, 'color: #087500; font-weight: bold;');

        this.saveDeckCardCountInfo(currentClickedDeckId);
        this.hideDeckEditObjects(currentClickedDeckId);
        this.showMyDeckObjects(currentClickedDeckId);
        this.setInteractionStatesAfterDeckEditCompletion();
    }

    private handleDeckEditIncompletion(selectedTotalCardCount: number, currentClickedDeckId: number): void {
        console.warn(
            `%c [DEBUG] 덱을 구성하는 카드의 개수가 부족합니다.(현재 총 카드 개수: ${selectedTotalCardCount})`,
             'color: #a80000; font-weight: bold;'
        );
        this.showIncompleteDeckPopup();
        this.setInteractionStatesAfterIncompleteDeckPopupShown(currentClickedDeckId);
    }

    private hideDeckEditObjects(currentClickedDeckId: number): void {
        this.setDeckEditDoneButtonVisibility(false);
        this.setOwnedCardsVisibility(false);
        this.setNumberOfRemainingCardsVisibility(false);
        this.setRemainingOutOfTotalSlashVisibility(false);
        this.setNumberOfTotalOwnedCardsVisibility(false);
        this.setChosenOutOfTotalSlashVisibility(false);
        this.setRequiredNumberOfCardsVisibility(false);
        this.setCardBlockerVisibility(false);
        this.setTotalNumberOfSelectedCardsVisibility(currentClickedDeckId, false);
        this.setDeckCardAddButtonVisibility(currentClickedDeckId, false);
        this.setDeckCardDeleteButtonVisibility(currentClickedDeckId, false);
    }

    private showMyDeckObjects(currentClickedDeckId: number): void {
        this.setDeckEditButtonVisibility(true);
        this.setMyDeckCardVisibilityByDeckId(currentClickedDeckId, true);
        this.setMyDeckNumberOfCards(currentClickedDeckId, true);
        this.setDeckCardCountMarkerVisibilityByDeckId(currentClickedDeckId, true);
    }

    private showIncompleteDeckPopup(): void {
        this.setTransparentBackgroundVisible(true);
        this.setIncompleteDeckPopupContainerVisibility(true);
        this.setUIncompleteDeckPopupButtonVisibility(true);
    }

    private setInteractionStatesAfterDeckEditCompletion(): void {
        this.setDeckEditDoneButtonClickEnabled(false);
        this.setDeckEditButtonClickEnabled(true);
        this.saveDeckEditButtonClickState(false);
        this.setMyDeckBlockHoverEnabled(false);
        this.setDeckEditDoneButtonHoverEnabled(false);
        this.setCardDeleteButtonClickEnabled(false);
        this.setCardAddButtonClickEnabled(false);
    }

    private setInteractionStatesAfterIncompleteDeckPopupShown(currentClickedDeckId: number): void {
        this.setIncompleteDeckPopupButtonClickEnabled(true);
        this.setAllMyDeckButtonClickEnabled(false);
        this.setAllDeckNameEditButtonClickEnabled(false);
        this.setDeckNameEditButtonClickEnabled(currentClickedDeckId, false);
        this.setBuildDeckButtonHoverEnabled(false);
        this.setBuildDeckButtonClickEnabled(false);
        this.setMyDeckBlockHoverEnabled(false);
        this.setDeckEditDoneButtonHoverEnabled(false);
        this.setAllDeckDeleteButtonClickEnabled(false);
        this.setDeckEditDoneButtonClickEnabled(false);
        this.setCardDeleteButtonClickEnabled(false);
        this.setCardAddButtonClickEnabled(false);
        this.setMyDeckCardSearchInputEnabled(true);
    }

    private getDeckEditDoneButton(): DeckEditDoneButton | null {
        return this.deckEditDoneButtonRepository.findButtonById(1);
    }

    public getCurrentButtonClickState(): boolean | null {
        return this.deckEditDoneButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private getDeckEditDoneButtonVisibility(): boolean | undefined {
        const button = this.getDeckEditDoneButton();
        if (button !== null) {
            return button.getVisibility();
        }
    }

    private getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

    private saveCurrentDoneButtonClickState(state: boolean): void {
        this.deckEditDoneButtonClickDetectRepository.saveCurrentButtonClickState(state);
    }

    private saveDeckEditButtonClickState(state: boolean): void {
        this.deckEditButtonClickDetectRepository.saveCurrentButtonClickState(state);
    }

    private saveDeckCardCountInfo(deckId: number): void {
        // 덱 초기화 (기존 데이터 삭제)
        this.myDeckCardMapRepository.deleteMyDeck(deckId);

        // 편집 완료한 덱의 카드 아이디 목록 가져오기
        const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(deckId);

        // 정보 저장(서버에 보낼 데이터)
        for (const cardId of cardIdList) {
            const cardCount = this.cardCountManager.findSelectedCardCountByDeck(deckId, cardId);
            this.myDeckCardMapRepository.addMyDeckCard(deckId, cardId, cardCount);
        }

        // To-do: 확인용 나중에 제거 필요
        this.myDeckCardMapRepository.findCardInfosByDeckId(deckId);
    }

    private setDeckEditButtonVisibility(isVisible: boolean): void {
        this.deckEditButtonRepository.findButtonById(0)?.setVisibility(isVisible);
    }

    private setDeckEditDoneButtonVisibility(isVisible: boolean): void {
        const buttons = this.deckEditDoneButtonRepository.findAll();
        buttons.forEach((button) => button.setVisibility(isVisible));
    }

    private setOwnedCardsVisibility(isVisible: boolean): void {
        this.myDeckOwnedCardsRepository.findAllCards()?.forEach(card =>
            card.setVisibility(isVisible)
        );
    }

    private setNumberOfRemainingCardsVisibility(isVisible: boolean): void {
        this.myDeckRemainingCardsRepository.findAllRemainingCardsList()?.forEach(numberMesh =>
            numberMesh.setVisibility(isVisible)
        );
    }

    private setRemainingOutOfTotalSlashVisibility(isVisible: boolean): void {
        this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashList()?.forEach(slash =>
            slash.setVisibility(isVisible)
        );
    }

    private setNumberOfTotalOwnedCardsVisibility(isVisible: boolean): void {
        this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsList()?.forEach(numberMesh =>
            numberMesh.setVisibility(isVisible)
        );
    }

    private setCardBlockerVisibility(isVisible: boolean): void {
        const allBlockers = this.cardSelectionBlockerRepository.findAllBlockers();
        allBlockers.forEach((blocker) => blocker.setVisibility(isVisible));
    }

    private setMyDeckCardVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckCardRepository.findCardListByDeckId(deckId)?.forEach(card =>
            card.setVisibility(isVisible)
        );
    }

    private setMyDeckNumberOfCards(deckId: number, isVisible: boolean): void {
        const numberList = this.myDeckNumberOfCardsRepository.findNumberListByDeckId(deckId);
        numberList?.forEach((number) => number.setVisibility(isVisible));
    }

    private setDeckCardCountMarkerVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.deckCardCountMarkerRepository.findMarkerListByDeckId(deckId)?.forEach(marker =>
            marker.setVisibility(isVisible)
        );
    }

    private setTotalNumberOfSelectedCardsVisibility(deckId: number, isVisible: boolean): void {
        this.totalNumberOfSelectedCardsRepository.findNumberByDeckId(deckId)?.setVisibility(isVisible);
    }

    private setChosenOutOfTotalSlashVisibility(isVisible: boolean): void {
        this.myDeckChosenOutOfTotalSlashRepository.findSlash()?.setVisibility(isVisible);
    }

    private setRequiredNumberOfCardsVisibility(isVisible: boolean): void {
        this.requiredNumberOfCardsRepository.findNumber()?.setVisibility(isVisible);
    }

    private setDeckCardAddButtonVisibility(deckId: number, isVisible: boolean): void {
        const buttonList = this.deckCardAddButtonRepository.findButtonListByDeckId(deckId);
        buttonList?.forEach((button) => button.setVisibility(isVisible));
    }

    private setDeckCardDeleteButtonVisibility(deckId: number, isVisible: boolean): void {
        const buttonList = this.deckCardDeleteButtonRepository.findButtonListByDeckId(deckId);
        buttonList?.forEach((button) => button.setVisibility(isVisible));
    }

    private setTransparentBackgroundVisible(isVisible: boolean): void {
        this.transparentBackgroundRepository.findTransparentBackground()?.setVisibility(isVisible);
    }

    private setIncompleteDeckPopupContainerVisibility(isVisible: boolean): void {
        this.alertModalContainerRepository.findContainerByType(AlertModalContainerType.INCOMPLETE_DECK)?.setVisibility(isVisible);
    }

    private setUIncompleteDeckPopupButtonVisibility(isVisible: boolean): void {
        this.alertModalButtonsRepository.findButtonByType(AlertModalButtonsType.INCOMPLETE_DECK)?.setVisibility(isVisible);
    }

    private setDeckEditButtonClickEnabled(isEnabled: boolean): void {
        this.deckEditButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setIncompleteDeckPopupButtonClickEnabled(isEnabled: boolean): void {
        this.myDeckAlertModalButtonsClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setAllMyDeckButtonClickEnabled(isEnabled: boolean): void {
        this.myDeckButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private setAllDeckNameEditButtonClickEnabled(isEnabled: boolean): void {
        this.deckNameEditButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private setDeckNameEditButtonClickEnabled(deckId: number, isEnabled: boolean): void {
        this.deckNameEditButtonClickDetectRepository.saveButtonClickEnabled(deckId, isEnabled);
    }

    private setBuildDeckButtonHoverEnabled(isEnabled: boolean): void {
        this.buildDeckButtonHoverDetectRepository.setButtonHoverEnabled(isEnabled);
    }

    private setBuildDeckButtonClickEnabled(isEnabled: boolean): void {
        this.buildDeckButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setAllDeckDeleteButtonClickEnabled(isEnabled: boolean): void {
        this.deckDeleteButtonClickDetectRepository.setAllButtonClickEnabled(isEnabled);
    }

    private setMyDeckBlockHoverEnabled(isEnabled: boolean): void {
        this.myDeckBlockHoverDetectRepository.setBlockHoverEnabled(isEnabled);
    }

    private setDeckEditDoneButtonHoverEnabled(isEnabled: boolean): void {
        this.deckEditDoneButtonHoverDetectRepository.setButtonHoverEnabled(isEnabled);
    }

    private setCardDeleteButtonClickEnabled(isEnabled: boolean): void {
        this.deckCardDeleteButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setCardAddButtonClickEnabled(isEnabled: boolean): void {
        this.deckCardAddButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private setMyDeckCardSearchInputEnabled(isEnabled: boolean): void {
        const searchContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
        if (searchContainer) {
            searchContainer.setInputDisabled(isEnabled); // 사용 가능: false, 사용 불가능: true
        }
    }

}
