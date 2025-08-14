import * as THREE from "three";

import {DeckEditButton} from "../../deck_edit_button/entity/DeckEditButton";
import {MyDeckOwnedCards} from "../../my_deck_owned_cards/entity/MyDeckOwnedCards";
import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";
import {MyDeckTotalOwnedCards} from "../../my_deck_total_owned_cards/entity/MyDeckTotalOwnedCards";
import {MyDeckRemainingCards} from "../../my_deck_remaining_cards/entity/MyDeckRemainingCards";
import {MyDeckRemainingOutOfTotalSlash} from "../../my_deck_remaining_out_of_total_slash/entity/MyDeckRemainingOutOfTotalSlash";
import {TotalNumberOfSelectedCards} from "../../my_deck_total_number_of_selected_cards/entity/TotalNumberOfSelectedCards";
import {MyDeckChosenOutOfTotalSlash} from "../../my_deck_chosen_out_of_total_slash/entity/MyDeckChosenOutOfTotalSlash";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {DeckEditButtonClickDetectService} from "./DeckEditButtonClickDetectService";
import {DeckEditButtonClickDetectRepositoryImpl} from "../repository/DeckEditButtonClickDetectRepositoryImpl";
import {DeckEditButtonRepositoryImpl} from "../../deck_edit_button/repository/DeckEditButtonRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {DeckEditDoneButtonRepositoryImpl} from "../../deck_edit_done_button/repository/DeckEditDoneButtonRepositoryImpl";
import {MyDeckCardMapRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardMapRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash/repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {TotalNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_total_number_of_selected_cards/repository/TotalNumberOfSelectedCardsRepositoryImpl";
import {MyDeckChosenOutOfTotalSlashRepositoryImpl} from "../../my_deck_chosen_out_of_total_slash/repository/MyDeckChosenOutOfTotalSlashRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {MyDeckOwnedCardsClickDetectRepositoryImpl} from "../../deck_owned_cards_click_detect/repository/MyDeckOwnedCardsClickDetectRepositoryImpl";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../../my_deck_block_hover_detect/repository/MyDeckBlockHoverDetectRepositoryImpl";
import {DeckCardDeleteButtonClickDetectRepositoryImpl} from "../../deck_card_delete_button_click_detect/repository/DeckCardDeleteButtonClickDetectRepositoryImpl";
import {DeckCardAddButtonClickDetectRepositoryImpl} from "../../deck_card_add_button_click_detect/repository/DeckCardAddButtonClickDetectRepositoryImpl";
import {RequiredNumberOfCardsRepositoryImpl} from "../../required_number_of_cards_in_the_deck/repository/RequiredNumberOfCardsRepositoryImpl";
import {MyDeckNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_number_of_selected_cards/repository/MyDeckNumberOfSelectedCardsRepositoryImpl";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {MyDeckNumberOfSelectedCardsPositionRepositoryImpl} from "../../my_deck_number_of_selected_cards_position/repository/MyDeckNumberOfSelectedCardsPositionRepositoryImpl";
import {MyDeckBlockPositionRepositoryImpl} from "../../my_deck_block_position/repository/MyDeckBlockPositionRepositoryImpl";
import {MyDeckCardNamePositionRepositoryImpl} from "../../my_deck_card_name_position/repository/MyDeckCardNamePositionRepositoryImpl";

import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

export class DeckEditButtonClickDetectServiceImpl implements DeckEditButtonClickDetectService {
    private static instance: DeckEditButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private deckEditButtonRepository: DeckEditButtonRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;
    private myDeckCardMapRepository: MyDeckCardMapRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private totalNumberOfSelectedCardsRepository: TotalNumberOfSelectedCardsRepositoryImpl;
    private myDeckChosenOutOfTotalSlashRepository: MyDeckChosenOutOfTotalSlashRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private myDeckOwnedCardsClickDetectRepository: MyDeckOwnedCardsClickDetectRepositoryImpl;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;
    private deckCardDeleteButtonClickDetectRepository: DeckCardDeleteButtonClickDetectRepositoryImpl;
    private deckCardAddButtonClickDetectRepository: DeckCardAddButtonClickDetectRepositoryImpl;
    private requiredNumberOfCardsRepository: RequiredNumberOfCardsRepositoryImpl;
    private myDeckNumberOfSelectedCardsRepository: MyDeckNumberOfSelectedCardsRepositoryImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private myDeckNumberOfSelectedCardsPositionRepository: MyDeckNumberOfSelectedCardsPositionRepositoryImpl;
    private myDeckBlockPositionRepository: MyDeckBlockPositionRepositoryImpl;
    private myDeckCardNamePositionRepository: MyDeckCardNamePositionRepositoryImpl;
    private cardCountManager: CardCountManager;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.totalNumberOfSelectedCardsRepository = TotalNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckChosenOutOfTotalSlashRepository = MyDeckChosenOutOfTotalSlashRepositoryImpl.getInstance();
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.myDeckOwnedCardsClickDetectRepository = MyDeckOwnedCardsClickDetectRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonClickDetectRepository = DeckCardDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardAddButtonClickDetectRepository = DeckCardAddButtonClickDetectRepositoryImpl.getInstance();
        this.requiredNumberOfCardsRepository = RequiredNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsPositionRepository = MyDeckNumberOfSelectedCardsPositionRepositoryImpl.getInstance();
        this.myDeckBlockPositionRepository = MyDeckBlockPositionRepositoryImpl.getInstance();
        this.myDeckCardNamePositionRepository = MyDeckCardNamePositionRepositoryImpl.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckEditButtonClickDetectServiceImpl {
        if (!DeckEditButtonClickDetectServiceImpl.instance) {
            DeckEditButtonClickDetectServiceImpl.instance = new DeckEditButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckEditButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckEditButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckEditButtonClickDetectRepository.isButtonClickEnabled();
    }

    public async handleClick(clickPoint: { x: number; y: number }): Promise<DeckEditButton | null> {
        const { x, y } = clickPoint;
        const button = this.getDeckEditButton();
        if (button !== null) {
            const clickedButton = this.deckEditButtonClickDetectRepository.isDeckEditButtonClicked(
                { x, y },
                button,
                this.camera);

            if (clickedButton) {
                this.saveCurrentButtonClickState(true);
                console.log(`[DEBUG] Clicked Deck Edit Button`);

//                 this.hideAllCardBlocker();
                const currentClickedDeckButtonId = this.getCurrentClickedDeckButtonId();
                if (currentClickedDeckButtonId !== null) {
                    console.log(`Deck Button Id?: ${currentClickedDeckButtonId}`);
                    this.setMyDeckCardVisibilityByDeckId(currentClickedDeckButtonId, false);
                    this.setMyDeckNumberOfCards(currentClickedDeckButtonId, false);
                    this.setTotalNumberOfSelectedCardsVisibility(currentClickedDeckButtonId, true);
                    this.setDeckCardCountMarkerVisibilityByDeckId(currentClickedDeckButtonId, false);
                    this.saveClonedOriginalDeckState(currentClickedDeckButtonId);
                }

                this.setDeckEditButtonVisibility(false);
                this.setDeckEditDoneButtonVisibility(true);
                this.setChosenOutOfTotalSlashVisibility(true);
                this.setRequiredNumberOfCardsVisibility(true);
                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckEditButton | null> {
        if (!this.isButtonClickEnabled()) return null;
        if (this.getDeckEditButtonVisibility() == false) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleClick(clickPoint);
            if (result) {
                this.setInteractionStatesAfterClick();
                return result;
            }
        }
        return null;
    }

    private setInteractionStatesAfterClick(): void {
        this.myDeckOwnedCardsClickDetectRepository.setCardClickEnabled(true);
        this.myDeckBlockHoverDetectRepository.setBlockHoverEnabled(true);
        this.deckCardDeleteButtonClickDetectRepository.setButtonClickEnabled(true);
        this.deckCardAddButtonClickDetectRepository.setButtonClickEnabled(true);
    }

    private getDeckEditButton(): DeckEditButton | null {
        return this.deckEditButtonRepository.findButtonById(0);
    }

    private getDeckEditDoneButton(): DeckEditDoneButton | null {
        return this.deckEditDoneButtonRepository.findButtonById(0);
    }

    private saveCurrentButtonClickState(state: boolean): void {
        this.deckEditButtonClickDetectRepository.saveCurrentButtonClickState(state);
    }

    public getCurrentButtonClickState(): boolean | null {
        return this.deckEditButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private getTotalNumberOfSelectedCardsByDeckId(deckId: number): TotalNumberOfSelectedCards | null {
        return this.totalNumberOfSelectedCardsRepository.findNumberByDeckId(deckId);
    }

    private getCurrentClickedDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private getCardIdByCardUniqueId(cardUniqueId: number): number | null {
        return this.myDeckOwnedCardsRepository.findCardIdByCardUniqueId(cardUniqueId);
    }

    private getDeckEditButtonVisibility(): boolean | undefined {
        const button = this.getDeckEditButton();
        if (button !== null) {
            return button.getVisibility();
        }
    }

    private setDeckEditButtonVisibility(isVisible: boolean): void {
        this.getDeckEditButton()?.setVisibility(isVisible);
    }

    private setDeckEditDoneButtonVisibility(isVisible: boolean): void {
        this.getDeckEditDoneButton()?.setVisibility(isVisible);
    }

    private setChosenOutOfTotalSlashVisibility(isVisible: boolean): void {
        const slash = this.myDeckChosenOutOfTotalSlashRepository.findSlash();
        if (slash !== null) {
            slash.setVisibility(isVisible);
        } else {
            console.log(`Not Found Chosen Out Of Total Slash`);
        }
    }

    private setMyDeckNumberOfCards(deckId: number, isVisible: boolean): void {
        const numberList = this.myDeckNumberOfCardsRepository.findNumberListByDeckId(deckId);
        numberList?.forEach((number) => number.setVisibility(isVisible));
    }

    private setTotalNumberOfSelectedCardsVisibility(deckId: number, isVisible: boolean): void {
        const totalNumber = this.getTotalNumberOfSelectedCardsByDeckId(deckId);
        if (totalNumber !== null) {
            totalNumber.setVisibility(isVisible);
        } else {
            console.log(`Not Found Total Number Of Selected Cards (Deck ID: ${deckId})`);
        }
    }

    private setRequiredNumberOfCardsVisibility(isVisible: boolean): void {
        const requiredNumber = this.requiredNumberOfCardsRepository.findNumber();
        if (requiredNumber !== null) {
            requiredNumber.setVisibility(isVisible);
        } else {
            console.log(`Not Found Required Number Of Cards`);
        }
    }

    private setMyDeckCardVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckCardRepository.findCardListByDeckId(deckId)?.forEach(card =>
            card.setVisibility(isVisible)
        );
    }

    private setDeckCardCountMarkerVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.deckCardCountMarkerRepository.findMarkerListByDeckId(deckId)?.forEach(marker =>
            marker.setVisibility(isVisible)
        );
    }

    private setCardBlockerVisibility(cardId: number, isVisible: boolean): void {
        const blocker = this.cardSelectionBlockerRepository.findBlockerByCardId(cardId);
        if (blocker !== null) {
            blocker.setVisibility(isVisible);
        }
    }

    private hideAllCardBlocker(): void {
        const allBlockers = this.cardSelectionBlockerRepository.findAllBlockers();
        allBlockers.forEach((blocker) => blocker.setVisibility(false));
    }

    private saveClonedOriginalDeckState(currentClickedDeckId: number): void {
        this.myDeckNumberOfSelectedCardsRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.myDeckNumberOfSelectedCardsPositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.myDeckBlockRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.myDeckBlockPositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
        this.myDeckCardNameRepository.saveClonedOriginalDeckState(currentClickedDeckId);
        this.myDeckCardNamePositionRepository.saveClonedOriginalPositionState(currentClickedDeckId);
    }

}
