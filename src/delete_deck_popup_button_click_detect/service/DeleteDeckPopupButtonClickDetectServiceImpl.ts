import * as THREE from "three";

import {DeleteDeckPopupButtonType} from "../../delete_deck_popup_button/entity/DeleteDeckPopupButtonType";
import {DeleteDeckPopupButtonClickDetectService} from "./DeleteDeckPopupButtonClickDetectService";
import {DeleteDeckPopupButtonClickDetectRepositoryImpl} from '../repository/DeleteDeckPopupButtonClickDetectRepositoryImpl';
import {DeleteDeckPopupButton} from "../../delete_deck_popup_button/entity/DeleteDeckPopupButton";
import {DeleteDeckPopupButtonRepositoryImpl} from "../../delete_deck_popup_button/repository/DeleteDeckPopupButtonRepositoryImpl"
import {DeleteDeckPopupWindowRepositoryImpl} from "../../delete_deck_popup_window/repository/DeleteDeckPopupWindowRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../../deck_delete_button_click_detect/repository/DeckDeleteButtonClickDetectRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {BuildDeckButtonClickDetectRepositoryImpl} from "../../build_deck_button_click_detect/repository/BuildDeckButtonClickDetectRepositoryImpl";
import {BuildDeckButtonHoverDetectRepositoryImpl} from "../../build_deck_button_hover_detect/repository/BuildDeckButtonHoverDetectRepositoryImpl";
import {SideScrollAreaDetectRepositoryImpl} from "../../side_scroll_area_detect/repository/SideScrollAreaDetectRepositoryImpl";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../../deck_card_search_cancel_button_click_detect/repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {MyDeckOwnedCardsClickDetectRepositoryImpl} from "../../deck_owned_cards_click_detect/repository/MyDeckOwnedCardsClickDetectRepositoryImpl";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../../my_deck_block_hover_detect/repository/MyDeckBlockHoverDetectRepositoryImpl";
import {DeckEditDoneButtonHoverDetectRepositoryImpl} from "../../deck_edit_done_button_hover_detect/repository/DeckEditDoneButtonHoverDetectRepositoryImpl";

import {DeckDeleteButtonRepositoryImpl} from "../../deck_delete_button/repository/DeckDeleteButtonRepositoryImpl";
import {DeckNameEditButtonRepositoryImpl} from "../../deck_name_edit_button/repository/DeckNameEditButtonRepositoryImpl";
import {MyDeckButtonRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonRepositoryImpl";
import {MyDeckButtonEffectRepositoryImpl} from "../../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckNameTextRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextRepositoryImpl";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {MyDeckNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_number_of_selected_cards/repository/MyDeckNumberOfSelectedCardsRepositoryImpl";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../../my_deck_card_search_cancel_button/repository/MyDeckCardSearchCancelButtonRepositoryImpl";
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash/repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {DeckEditButtonRepositoryImpl} from "../../deck_edit_button/repository/DeckEditButtonRepositoryImpl";
import {DeckEditDoneButtonRepositoryImpl} from "../../deck_edit_done_button/repository/DeckEditDoneButtonRepositoryImpl";
import {MyDeckChosenOutOfTotalSlashRepositoryImpl} from "../../my_deck_chosen_out_of_total_slash/repository/MyDeckChosenOutOfTotalSlashRepositoryImpl";
import {TotalNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_total_number_of_selected_cards/repository/TotalNumberOfSelectedCardsRepositoryImpl";
import {RequiredNumberOfCardsRepositoryImpl} from "../../required_number_of_cards_in_the_deck/repository/RequiredNumberOfCardsRepositoryImpl";

import {DeckDeleteButtonPositionRepositoryImpl} from "../../deck_delete_button_position/repository/DeckDeleteButtonPositionRepositoryImpl";
import {DeckNameEditButtonPositionRepositoryImpl} from "../../deck_name_edit_button_position/repository/DeckNameEditButtonPositionRepositoryImpl";
import {MyDeckButtonPositionRepositoryImpl} from "../../my_deck_button_position/repository/MyDeckButtonPositionRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckNameTextPositionRepositoryImpl} from "../../my_deck_name_text_position/repository/MyDeckNameTextPositionRepositoryImpl";
import {MyDeckBlockPositionRepositoryImpl} from "../../my_deck_block_position/repository/MyDeckBlockPositionRepositoryImpl";
import {MyDeckCardNamePositionRepositoryImpl} from "../../my_deck_card_name_position/repository/MyDeckCardNamePositionRepositoryImpl";
import {MyDeckNumberOfCardsPositionRepositoryImpl} from "../../my_deck_number_of_cards_position/repository/MyDeckNumberOfCardsPositionRepositoryImpl";
import {DeckCardCountMarkerPositionRepositoryImpl} from "../../deck_card_count_marker_position/repository/DeckCardCountMarkerPositionRepositoryImpl";
import {MyDeckNumberOfSelectedCardsPositionRepositoryImpl} from "../../my_deck_number_of_selected_cards_position/repository/MyDeckNumberOfSelectedCardsPositionRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";

import {MyDeckButtonMapRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonMapRepositoryImpl";
import {MyDeckCardMapRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardMapRepositoryImpl";
import {MyDeckNameTextMapRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextMapRepositoryImpl";

import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class DeleteDeckPopupButtonClickDetectServiceImpl implements DeleteDeckPopupButtonClickDetectService {
    private static instance: DeleteDeckPopupButtonClickDetectServiceImpl | null = null;
    private deleteDeckPopupButtonClickDetectRepository: DeleteDeckPopupButtonClickDetectRepositoryImpl;
    private deleteDeckPopupButtonRepository: DeleteDeckPopupButtonRepositoryImpl;
    private deleteDeckPopupWindowRepository: DeleteDeckPopupWindowRepositoryImpl;
    private transparentBackgroundRepository : TransparentBackgroundRepositoryImpl;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private buildDeckButtonClickDetectRepository: BuildDeckButtonClickDetectRepositoryImpl;
    private buildDeckButtonHoverDetectRepository: BuildDeckButtonHoverDetectRepositoryImpl;
    private sideScrollAreaDetectRepository: SideScrollAreaDetectRepositoryImpl;
    private cameraRepository: CameraRepository;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private myDeckOwnedCardsClickDetectRepository: MyDeckOwnedCardsClickDetectRepositoryImpl;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;
    private deckEditDoneButtonHoverDetectRepository: DeckEditDoneButtonHoverDetectRepositoryImpl;

    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private deckNameEditButtonRepository: DeckNameEditButtonRepositoryImpl;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckNameTextRepository: MyDeckNameTextRepositoryImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private myDeckNumberOfSelectedCardsRepository: MyDeckNumberOfSelectedCardsRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private deckEditButtonRepository: DeckEditButtonRepositoryImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;
    private myDeckChosenOutOfTotalSlashRepository: MyDeckChosenOutOfTotalSlashRepositoryImpl;
    private totalNumberOfSelectedCardsRepository: TotalNumberOfSelectedCardsRepositoryImpl;
    private requiredNumberOfCardsRepository: RequiredNumberOfCardsRepositoryImpl;

    private deckDeleteButtonPositionRepository: DeckDeleteButtonPositionRepositoryImpl;
    private deckNameEditButtonPositionRepository: DeckNameEditButtonPositionRepositoryImpl;
    private myDeckButtonPositionRepository: MyDeckButtonPositionRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckNameTextPositionRepository: MyDeckNameTextPositionRepositoryImpl;
    private myDeckBlockPositionRepository: MyDeckBlockPositionRepositoryImpl;
    private myDeckCardNamePositionRepository: MyDeckCardNamePositionRepositoryImpl;
    private myDeckNumberOfCardsPositionRepository: MyDeckNumberOfCardsPositionRepositoryImpl;
    private deckCardCountMarkerPositionRepository: DeckCardCountMarkerPositionRepositoryImpl;
    private myDeckNumberOfSelectedCardsPositionRepository: MyDeckNumberOfSelectedCardsPositionRepositoryImpl;

    private myDeckButtonMapRepository: MyDeckButtonMapRepositoryImpl;
    private myDeckCardMapRepository: MyDeckCardMapRepositoryImpl;
    private myDeckNameTextMapRepository: MyDeckNameTextMapRepositoryImpl;

    private myDeckElementAdjuster: MyDeckElementAdjuster;
    private cardCountManager: CardCountManager;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.deleteDeckPopupButtonClickDetectRepository = DeleteDeckPopupButtonClickDetectRepositoryImpl.getInstance();
        this.deleteDeckPopupButtonRepository = DeleteDeckPopupButtonRepositoryImpl.getInstance();
        this.deleteDeckPopupWindowRepository = DeleteDeckPopupWindowRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.buildDeckButtonClickDetectRepository = BuildDeckButtonClickDetectRepositoryImpl.getInstance();
        this.buildDeckButtonHoverDetectRepository = BuildDeckButtonHoverDetectRepositoryImpl.getInstance();
        this.sideScrollAreaDetectRepository = SideScrollAreaDetectRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckOwnedCardsClickDetectRepository = MyDeckOwnedCardsClickDetectRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.deckEditDoneButtonHoverDetectRepository = DeckEditDoneButtonHoverDetectRepositoryImpl.getInstance();

        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance(scene);
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance(scene);
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckNameTextRepository = MyDeckNameTextRepositoryImpl.getInstance(scene);
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.myDeckChosenOutOfTotalSlashRepository = MyDeckChosenOutOfTotalSlashRepositoryImpl.getInstance();
        this.totalNumberOfSelectedCardsRepository = TotalNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.requiredNumberOfCardsRepository = RequiredNumberOfCardsRepositoryImpl.getInstance(scene);

        this.deckDeleteButtonPositionRepository = DeckDeleteButtonPositionRepositoryImpl.getInstance();
        this.deckNameEditButtonPositionRepository = DeckNameEditButtonPositionRepositoryImpl.getInstance();
        this.myDeckButtonPositionRepository = MyDeckButtonPositionRepositoryImpl.getInstance();
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckNameTextPositionRepository = MyDeckNameTextPositionRepositoryImpl.getInstance();
        this.myDeckBlockPositionRepository = MyDeckBlockPositionRepositoryImpl.getInstance();
        this.myDeckCardNamePositionRepository = MyDeckCardNamePositionRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsPositionRepository = MyDeckNumberOfCardsPositionRepositoryImpl.getInstance();
        this.deckCardCountMarkerPositionRepository = DeckCardCountMarkerPositionRepositoryImpl.getInstance();
        this.myDeckNumberOfSelectedCardsPositionRepository = MyDeckNumberOfSelectedCardsPositionRepositoryImpl.getInstance();

        this.myDeckButtonMapRepository = MyDeckButtonMapRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
        this.myDeckNameTextMapRepository = MyDeckNameTextMapRepositoryImpl.getInstance();

        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeleteDeckPopupButtonClickDetectServiceImpl {
        if (!DeleteDeckPopupButtonClickDetectServiceImpl.instance) {
            DeleteDeckPopupButtonClickDetectServiceImpl.instance = new DeleteDeckPopupButtonClickDetectServiceImpl(camera, scene);
        }
        return DeleteDeckPopupButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnable: boolean): void {
        this.deleteDeckPopupButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private isButtonClickEnabled(): boolean {
        return this.deleteDeckPopupButtonClickDetectRepository.isButtonClickEnabled();
    }

    private saveCurrentClickedButtonType(type: DeleteDeckPopupButtonType): void {
        this.deleteDeckPopupButtonClickDetectRepository.saveCurrentClickedButtonType(type);
    }

    public getCurrentClickedButtonType(): number | null {
        return this.deleteDeckPopupButtonClickDetectRepository.findCurrentClickedButtonType();
    }

    async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeleteDeckPopupButton | null> {
        const { x, y } = clickPoint;
        const buttonList = this.getAllButtons();
        const clickedButton = this.deleteDeckPopupButtonClickDetectRepository.isButtonClicked(
            { x, y },
            buttonList,
            this.camera
        );

        if (clickedButton) {
            console.log(`[DEBUG] Clicked Popup Button ID: ${clickedButton.id}`);
            this.saveCurrentClickedButtonId(clickedButton.id);
            this.saveCurrentClickedButtonType(clickedButton.type);

            this.setDeleteDeckPopupRelatedObjectVisibility(false);
            this.setCardSearchInputDisabled();

            if (clickedButton.type == DeleteDeckPopupButtonType.CANCEL) {
                console.log(`Deck Delete Cancel!`);
                this.setSearchCancelButtonClickEnabled(true);
            }

            if (clickedButton.type == DeleteDeckPopupButtonType.DELETE) {
                console.log(`Deck Delete!`);

                this.clearSearchInputText();
                this.setSearchCancelButtonVisibility(false);

                const deleteDeckId = this.getCurrentDeleteDeckId();
                if (deleteDeckId == null) return null;

                this.reclaimRemainingCardsFromDeck(deleteDeckId);
                this.deleteNumberOfReamingCards(deleteDeckId);
                this.deleteAllDeckRelatedObjects(deleteDeckId);
                this.adjustDeckButtonRelatedObjectsPosition();

                this.saveCurrentClickedDeckId();

                const deckIdList = this.getDeckIdList();
                const firstDeckId = this.getFirstDeckId(deckIdList);

                this.initializeDeckRelatedObjectsVisibility(deckIdList, firstDeckId);

                const isDeckEditMode = this.getDeckEditButtonClickState();
                if (isDeckEditMode == true) {
                    this.hideDeckEditRelatedObjects();
                    this.setInteractionStatesWhenDeckDeletedInEditMode();
                }
            }

            return clickedButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeleteDeckPopupButton | null> {
        const buttonsVisibleState = this.getPopupButtonsVisibleState();
        if (buttonsVisibleState.some((state) => state === true)) {
            this.setButtonClickEnabled(true);
        }

        if (!this.isButtonClickEnabled()) return null;

        this.setInteractionStatesBeforeClick();

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleButtonClick(clickPoint);
            if (result) {
                this.setButtonClickEnabled(false);
                this.setInteractionStatesAfterClick();
                return result;
            }
        }
        return null;
    }

    private setInteractionStatesBeforeClick(): void {
        this.myDeckButtonClickDetectRepository.setAllButtonClickEnabled(false);
        this.buildDeckButtonClickDetectRepository.setButtonClickEnabled(false);
        this.buildDeckButtonHoverDetectRepository.setButtonHoverEnabled(false);
        this.sideScrollAreaDetectRepository.setMyDeckScrollAreaDetectEnabled(false);
    }

    private setInteractionStatesAfterClick(): void {
        this.myDeckButtonClickDetectRepository.setAllButtonClickEnabled(true);
        this.buildDeckButtonClickDetectRepository.setButtonClickEnabled(true);
        this.buildDeckButtonHoverDetectRepository.setButtonHoverEnabled(true);
        this.sideScrollAreaDetectRepository.setMyDeckScrollAreaDetectEnabled(true);
    }

    public getAllButtons(): DeleteDeckPopupButton[] {
        return this.deleteDeckPopupButtonRepository.findAllButton();
    }

    public saveCurrentClickedButtonId(buttonId: number): void {
        this.deleteDeckPopupButtonClickDetectRepository.saveCurrentClickedButtonId(buttonId);
    }

    public getCurrentClickedButtonId(): number | null {
        return this.deleteDeckPopupButtonClickDetectRepository.findCurrentClickedButtonId();
    }

    private setDeleteDeckPopupRelatedObjectVisibility(isVisible: boolean): void {
        this.setTransparentBackgroundVisibility(isVisible);
        this.setPopupWindowVisibility(isVisible);
        this.setPopupButtonsVisibility(isVisible);
    }

    private setTransparentBackgroundVisibility(isVisible: boolean): void {
        const background = this.transparentBackgroundRepository.findTransparentBackground();
        if (background) {
            background.setVisibility(isVisible);
        }
    }

    private setPopupWindowVisibility(isVisible: boolean): void {
        const popupWindow = this.deleteDeckPopupWindowRepository.findPopupWindow();
        if (popupWindow !== null) {
            popupWindow.setVisibility(isVisible);
        }
    }

    private setPopupButtonsVisibility(isVisible: boolean): void {
        const popupButtons = this.deleteDeckPopupButtonRepository.findAllButton();
        popupButtons.forEach((button) => button.setVisibility(isVisible));
    }

    private setSearchCancelButtonVisibility(isVisible: boolean): void {
        this.myDeckCardSearchCancelButtonRepository.findButton()?.setVisibility(isVisible);
    }

    private setSearchCancelButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private setCardSearchInputDisabled(): void {
        const searchContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
        if (searchContainer) {
            searchContainer.setInputDisabled(false);
        }
    }

    private clearSearchInputText(): void {
        const searchInputText = this.myDeckSearchInputContainerRepository.findInputValue();
        if (searchInputText !== null && searchInputText.length > 0) {
            this.myDeckSearchInputContainerRepository.clearUserInput();
            this.myDeckSearchInputContainerRepository.deleteUserInput();
        }
    }

    // 삭제할 덱의 ID
    private getCurrentDeleteDeckId(): number | null {
//         return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId() ?? null;
        const deckId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
        if (deckId == null) {
            console.warn(`삭제할 덱의 ID가 존재하지 않습니다.`);
            return null;
        } else {
            return deckId;
        }
    }

    private getDeckIdList(): number[] {
        return this.myDeckCardMapRepository.findDeckIdList();
    }

    private getFirstDeckId(deckIdList: number[]): number {
        const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
        return sortedDeckIdList[0];
    }

    public getPopupButtonsVisibleState(): boolean[] {
        const buttons = this.getAllButtons();
        return buttons.map((button) => button.getVisibility());
    }

    private deleteAllDeckRelatedObjects(deckId: number): void {
        this.deleteCard(deckId);
        this.deleteBlock(deckId);
        this.deleteDeckCardName(deckId);
        this.deleteDeckDeleteButton(deckId);
        this.deleteDeckNameEditButton(deckId);
        this.deleteDeckButton(deckId);
        this.deleteDeckButtonEffect(deckId);
        this.deleteDeckNameText(deckId);
        this.deleteNumberOfDeckCards(deckId);
        this.deleteNumberOfSelectedCards(deckId);
        this.deleteDeckCardCountMarker(deckId);
        this.deleteTotalNumberOfSelectedCards(deckId);

        this.deleteCardMapData(deckId);
        this.deleteDeckButtonMapData(deckId);
        this.deleteTextMapData(deckId);
    }

    private adjustDeckButtonRelatedObjectsPosition(): void {
        this.adjustDeckButton();
        this.adjustDeckButtonEffect();
        this.adjustDeckNameText();
        this.adjustDeckDeleteButton();
        this.adjustDeckNameEditButton();
    }

    private initializeDeckRelatedObjectsVisibility(deckIdList: number[], firstDeckId: number): void {
        this.initializeDeckCardVisibility(deckIdList, firstDeckId);
        this.initializeDeckButtonVisibility(deckIdList, firstDeckId);
        this.initializeDeckButtonEffectVisibility(deckIdList, firstDeckId);
        this.initializeBlockVisibility(deckIdList, firstDeckId);
        this.initializeCardNameVisibility(deckIdList, firstDeckId);
        this.initializeDeckDeleteButtonVisibility(firstDeckId);
        this.initializeDeckNameEditButtonVisibility(firstDeckId);
        this.initializeNumberOfDeckCardsVisibility(deckIdList, firstDeckId);
        this.initializeNumberOfSelectedCardsVisibility(deckIdList, firstDeckId);
        this.initializeDeckCardCountMarkerVisibility(deckIdList, firstDeckId);
    }

    private getDeckEditButtonClickState(): boolean | null {
        return this.deckEditButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private setInteractionStatesWhenDeckDeletedInEditMode(): void {
        this.myDeckOwnedCardsClickDetectRepository.setAllCardClickEnabled(false);
        this.myDeckBlockHoverDetectRepository.setBlockHoverEnabled(false);
        this.deckEditButtonClickDetectRepository.setButtonClickEnabled(true);
        this.deckEditDoneButtonHoverDetectRepository.setButtonHoverEnabled(false);
    }

    private hideDeckEditRelatedObjects(): void {
        this.myDeckOwnedCardsRepository.findAllCards().forEach(card => card.setVisibility(false));
        this.cardSelectionBlockerRepository.findAllBlockers().forEach(blocker => blocker.setVisibility(false));
        this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashList().forEach(slash => slash.setVisibility(false));
        this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsList().forEach(
            numberObject => numberObject.setVisibility(false)
        );
        this.myDeckRemainingCardsRepository.findAllRemainingCardsList().forEach(
            numberObject => numberObject.setVisibility(false)
        );

        this.deckEditButtonRepository.findButtonById(0)?.setVisibility(true);
        this.deckEditDoneButtonRepository.findButtonById(0)?.setVisibility(false);
        this.myDeckChosenOutOfTotalSlashRepository.findSlash()?.setVisibility(false);
        this.requiredNumberOfCardsRepository.findNumber()?.setVisibility(false);
    }

    private deleteTotalNumberOfSelectedCards(deckId: number): void {
        this.totalNumberOfSelectedCardsRepository.deleteNumberByDeckId(deckId);
    }

    private deleteDeckDeleteButton(deckId: number): void {
        this.deckDeleteButtonRepository.deleteButtonByDeckId(deckId);
        this.deckDeleteButtonPositionRepository.deleteByDeckId(deckId);
    }

    private deleteDeckNameEditButton(deckId: number): void {
        this.deckNameEditButtonRepository.deleteButtonByDeckId(deckId);
        this.deckNameEditButtonPositionRepository.deleteByDeckId(deckId);
    }

    private deleteDeckButton(deckId: number): void {
        this.myDeckButtonRepository.deleteButtonByDeckId(deckId);
        this.myDeckButtonPositionRepository.deleteByDeckId(deckId);
    }

    private deleteDeckButtonEffect(deckId: number): void {
        this.myDeckButtonEffectRepository.deleteEffectByDeckId(deckId);
    }

    private deleteDeckNameText(deckId: number): void {
        this.myDeckNameTextRepository.deleteTextByDeckId(deckId);
        this.myDeckNameTextPositionRepository.deleteByDeckId(deckId);
    }

    private deleteCard(deckId: number): void {
        this.myDeckCardRepository.deleteDeckByDeckId(deckId);
        this.myDeckCardPositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteBlock(deckId: number): void {
        this.myDeckBlockRepository.deleteDeckByDeckId(deckId);
        this.myDeckBlockPositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteDeckCardName(deckId: number): void {
        this.myDeckCardNameRepository.deleteDeckByDeckId(deckId);
        this.myDeckCardNamePositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteDeckButtonMapData(deckId: number): void {
        this.myDeckButtonMapRepository.removeMyDeckByDeckId(deckId);
    }

    private deleteCardMapData(deckId: number): void {
        this.myDeckCardMapRepository.deleteMyDeck(deckId);
    }

    private deleteTextMapData(deckId: number): void {
        this.myDeckNameTextMapRepository.deleteMyDeckNameText(deckId);
    }

    private deleteNumberOfDeckCards(deckId: number): void {
        this.myDeckNumberOfCardsRepository.deleteDeckByDeckId(deckId);
        this.myDeckNumberOfCardsPositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteNumberOfSelectedCards(deckId: number): void {
        this.myDeckNumberOfSelectedCardsRepository.deleteDeckByDeckId(deckId);
        this.myDeckNumberOfSelectedCardsPositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteDeckCardCountMarker(deckId: number): void {
        this.deckCardCountMarkerRepository.deleteDeckByDeckId(deckId);
        this.deckCardCountMarkerPositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteNumberOfReamingCards(deckId: number): void {
        const cardIdList = this.myDeckCardRepository.findCardIdListByDeckId(deckId);
        for (const cardId of cardIdList) {
            console.log(`%c Card ID: ${cardId}`, 'color: #ff0033; font-weight: bold;');
            this.myDeckRemainingCardsRepository.deleteRemainingCardsMesh(cardId);
            this.myDeckRemainingCardsRepository.deleteRemainingCardsByCardId(cardId);
        }
    }

    // 삭제 할 덱의 카드 수량을 남은 카드 수량에 다시 추가해야 함
    private reclaimRemainingCardsFromDeck(deckId: number): void {
        const cardIdList = this.myDeckNumberOfSelectedCardsRepository.findCardIdListByDeckId(deckId);
        for (const cardId of cardIdList) {
            const cardCount = this.myDeckNumberOfSelectedCardsRepository.findCardCountByDeckIdAndCardId(deckId, cardId);
            if (cardCount == null) return;

            this.cardCountManager.addRemainingCardCount(cardId, cardCount);
        }
    }

    private adjustDeckButton(): void {
        const deckIdList = this.myDeckButtonRepository.findButtonDeckIdList();
        for (const deckId of deckIdList) {
            const button = this.myDeckButtonRepository.findButtonByDeckId(deckId);
            if (button == null) return;

            const buttonMesh = button.getMesh();
            const buttonPosition = this.myDeckButtonPositionRepository.findPositionByDeckId(deckId);
            if (buttonPosition == null) return;

            const widthPercent = 0.18;
            const heightPercent = (240/1040);
            const positionX = buttonPosition.getX();
            const positionY = buttonPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(buttonMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustDeckButtonEffect(): void {
        const deckIdList = this.myDeckButtonEffectRepository.findEffectDeckIdList();
        for (const deckId of deckIdList) {
            const effect = this.myDeckButtonEffectRepository.findEffectByDeckId(deckId);
            if (effect == null) return;

            const effectMesh = effect.getMesh();
            const effectPosition = this.myDeckButtonPositionRepository.findPositionByDeckId(deckId);
            if (effectPosition == null) return;

            const widthPercent = 0.18;
            const heightPercent = (240/1040);
            const positionX = effectPosition.getX();
            const positionY = effectPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(effectMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustDeckNameText(): void {
        const deckIdList = this.myDeckNameTextRepository.findTextDeckIdList();
        for (const deckId of deckIdList) {
            const text = this.myDeckNameTextRepository.findNameTextByDeckId(deckId);
            if (text == null) return;

            const textMesh = text.getMesh();
            const textPosition = this.myDeckNameTextPositionRepository.findPositionByDeckId(deckId);
            if (textPosition == null) return;

            const widthPercent = text.width / 1800;
            const heightPercent = text.height / text.width;
            const positionX = textPosition.getX();
            const positionY = textPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(textMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustDeckDeleteButton(): void {
        const deckIdList = this.deckDeleteButtonRepository.findButtonDeckIdList();
        for (const deckId of deckIdList) {
            const button = this.deckDeleteButtonRepository.findButtonByDeckId(deckId);
            if (button == null) return;

            const buttonMesh = button.getMesh();
            const buttonPosition = this.deckDeleteButtonPositionRepository.findPositionByDeckId(deckId);
            if (buttonPosition == null) return;

            const widthPercent = 0.034;
            const heightPercent = 0.9;
            const positionX = buttonPosition.getX();
            const positionY = buttonPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(buttonMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private adjustDeckNameEditButton(): void {
        const deckIdList = this.deckNameEditButtonRepository.findButtonDeckIdList();
        for (const deckId of deckIdList) {
            const button = this.deckNameEditButtonRepository.findButtonByDeckId(deckId);
            if (button == null) return;

            const buttonMesh = button.getMesh();
            const buttonPosition = this.deckNameEditButtonPositionRepository.findPositionByDeckId(deckId);
            if (buttonPosition == null) return;

            const widthPercent = 0.034;
            const heightPercent = 0.9;
            const positionX = buttonPosition.getX();
            const positionY = buttonPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(buttonMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    // 덱 삭제 후 남은 덱 중 맨 처음 덱의 버튼이 클릭된 상태로 보여야 함.
    private saveCurrentClickedDeckId(): void {
        const deckIdList = this.myDeckCardMapRepository.findDeckIdList();
        const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
        const firstDeckId = sortedDeckIdList[0];

        this.myDeckButtonClickDetectRepository.saveCurrentClickDeckId(firstDeckId);
    }

    private initializeDeckCardVisibility(deckIdList: number[], firstDeckId: number): void {
        deckIdList.forEach((deckId, index) => {
            const cardList = this.myDeckCardRepository.findCardListByDeckId(deckId);
            if (cardList == null) return;

            if (deckId === firstDeckId) {
                cardList.forEach((card) => card.setVisibility(true));
            } else {
                cardList.forEach((card) => card.setVisibility(false));
            }
        });
    }

    private initializeDeckButtonVisibility(deckIdList: number[], firstDeckId: number): void {
        deckIdList.forEach((deckId, index) => {
            if (deckId === firstDeckId) {
                this.myDeckButtonRepository.findButtonByDeckId(deckId)?.setVisibility(false);
            } else {
                this.myDeckButtonRepository.findButtonByDeckId(deckId)?.setVisibility(true);
            }
        });
    }

    private initializeDeckButtonEffectVisibility(deckIdList: number[], firstDeckId: number): void {
        deckIdList.forEach((deckId, index) => {
            if (deckId === firstDeckId) {
                this.myDeckButtonEffectRepository.findEffectByDeckId(deckId)?.setVisibility(true);
            } else {
                this.myDeckButtonEffectRepository.findEffectByDeckId(deckId)?.setVisibility(false);
            }
        });
    }

    private initializeBlockVisibility(deckIdList: number[], firstDeckId: number): void {
        deckIdList.forEach((deckId, index) => {
            const blockList = this.myDeckBlockRepository.findBlockListByDeckId(deckId);
            if (blockList == null) return;

            if (deckId === firstDeckId) {
                blockList.forEach((block) => block.setVisibility(true));
            } else {
                blockList.forEach((block) => block.setVisibility(false));
            }
        });
    }

    private initializeCardNameVisibility(deckIdList: number[], firstDeckId: number): void {
        deckIdList.forEach((deckId, index) => {
            const cardNameList = this.myDeckCardNameRepository.findCardNameListByDeckId(deckId);
            if (cardNameList === null) return;

            if (deckId === firstDeckId) {
                cardNameList.forEach((cardName) => cardName.setVisibility(true));
            } else {
                cardNameList.forEach((cardName) => cardName.setVisibility(false));
            }
        });
    }

    private initializeDeckDeleteButtonVisibility(firstDeckId: number): void {
        const button = this.deckDeleteButtonRepository.findButtonByDeckId(firstDeckId);

        if (button !== null) {
            button.setVisibility(true);
        }
    }

    private initializeDeckNameEditButtonVisibility(firstDeckId: number): void {
        const button = this.deckNameEditButtonRepository.findButtonByDeckId(firstDeckId);

        if (button !== null) {
            button.setVisibility(true);
        }
    }

    private initializeNumberOfDeckCardsVisibility(deckIdList: number[], firstDeckId: number): void {
        deckIdList.forEach((deckId, index) => {
            const numberList = this.myDeckNumberOfCardsRepository.findNumberListByDeckId(deckId);
            if (numberList == null) return;

            if (deckId === firstDeckId) {
                numberList.forEach((number) => number.setVisibility(true));
            } else {
                numberList.forEach((number) => number.setVisibility(false));
            }
        });
    }

    private initializeNumberOfSelectedCardsVisibility(deckIdList: number[], firstDeckId: number): void {
        deckIdList.forEach((deckId, index) => {
            const numberList = this.myDeckNumberOfSelectedCardsRepository.findNumberListByDeckId(deckId);
            if (numberList == null) return null;

            if (deckId === firstDeckId) {
                numberList.forEach((number) => number.setVisibility(true));
            } else {
                numberList.forEach((number) => number.setVisibility(false));
            }
        });
    }

    private initializeDeckCardCountMarkerVisibility(deckIdList: number[], firstDeckId: number): void {
        deckIdList.forEach((deckId, index) => {
            const markerList = this.deckCardCountMarkerRepository.findMarkerListByDeckId(deckId);
            if (markerList == null) return;

            if (deckId === firstDeckId) {
                markerList.forEach((marker) => marker.setVisibility(true));
            } else {
                markerList.forEach((marker) => marker.setVisibility(false));
            }
        });
    }

}
