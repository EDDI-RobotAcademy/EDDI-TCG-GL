import * as THREE from "three";

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

import {DeckDeleteButtonRepositoryImpl} from "../../deck_delete_button/repository/DeckDeleteButtonRepositoryImpl";
import {DeckNameEditButtonRepositoryImpl} from "../../deck_name_edit_button/repository/DeckNameEditButtonRepositoryImpl";
import {MyDeckButtonRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonRepositoryImpl";
import {MyDeckButtonEffectRepositoryImpl} from "../../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckNameTextRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextRepositoryImpl";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";

import {DeckDeleteButtonPositionRepositoryImpl} from "../../deck_delete_button_position/repository/DeckDeleteButtonPositionRepositoryImpl";
import {DeckNameEditButtonPositionRepositoryImpl} from "../../deck_name_edit_button_position/repository/DeckNameEditButtonPositionRepositoryImpl";
import {MyDeckButtonPositionRepositoryImpl} from "../../my_deck_button_position/repository/MyDeckButtonPositionRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckNameTextPositionRepositoryImpl} from "../../my_deck_name_text_position/repository/MyDeckNameTextPositionRepositoryImpl";
import {MyDeckBlockPositionRepositoryImpl} from "../../my_deck_block_position/repository/MyDeckBlockPositionRepositoryImpl";
import {MyDeckCardNamePositionRepositoryImpl} from "../../my_deck_card_name_position/repository/MyDeckCardNamePositionRepositoryImpl";

import {MyDeckButtonMapRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonMapRepositoryImpl";
import {MyDeckCardMapRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardMapRepositoryImpl";
import {MyDeckNameTextMapRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextMapRepositoryImpl";
import {CardStateManager} from "../../my_deck_card_manager/CardStateManager";

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

    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private deckNameEditButtonRepository: DeckNameEditButtonRepositoryImpl;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckNameTextRepository: MyDeckNameTextRepositoryImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;

    private deckDeleteButtonPositionRepository: DeckDeleteButtonPositionRepositoryImpl;
    private deckNameEditButtonPositionRepository: DeckNameEditButtonPositionRepositoryImpl;
    private myDeckButtonPositionRepository: MyDeckButtonPositionRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckNameTextPositionRepository: MyDeckNameTextPositionRepositoryImpl;
    private myDeckBlockPositionRepository: MyDeckBlockPositionRepositoryImpl;
    private myDeckCardNamePositionRepository: MyDeckCardNamePositionRepositoryImpl;

    private myDeckButtonMapRepository: MyDeckButtonMapRepositoryImpl;
    private myDeckCardMapRepository: MyDeckCardMapRepositoryImpl;
    private myDeckNameTextMapRepository: MyDeckNameTextMapRepositoryImpl;
    private cardStateManager: CardStateManager;

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

        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance();
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance();
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance();
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance();
        this.myDeckNameTextRepository = MyDeckNameTextRepositoryImpl.getInstance();
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);

        this.deckDeleteButtonPositionRepository = DeckDeleteButtonPositionRepositoryImpl.getInstance();
        this.deckNameEditButtonPositionRepository = DeckNameEditButtonPositionRepositoryImpl.getInstance();
        this.myDeckButtonPositionRepository = MyDeckButtonPositionRepositoryImpl.getInstance();
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckNameTextPositionRepository = MyDeckNameTextPositionRepositoryImpl.getInstance();
        this.myDeckBlockPositionRepository = MyDeckBlockPositionRepositoryImpl.getInstance();
        this.myDeckCardNamePositionRepository = MyDeckCardNamePositionRepositoryImpl.getInstance();

        this.myDeckButtonMapRepository = MyDeckButtonMapRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
        this.myDeckNameTextMapRepository = MyDeckNameTextMapRepositoryImpl.getInstance();
        this.cardStateManager = CardStateManager.getInstance();
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
            const currentClickedButtonId = this.getCurrentClickedButtonId();

            this.setTransparentBackgroundVisibility(false);
            this.setPopupWindowVisibility(false);
            this.setPopupButtonsVisibility(false);


            switch (currentClickedButtonId) {
                case 0:
                    console.log(`Deck Delete Cancel!`);
                    break;
                case 1:
                    console.log(`Deck Delete!`);
                    await this.clearAllDeckCardsFromScene();
                    this.deleteCard();
                    this.deleteBlock();
                    this.deleteDeckCardName();
                    this.deleteCardMapData();
                    this.deleteDeckButtonMapData();
                    this.deleteTextMapData();
                    this.deleteDeckDeleteButton();
                    this.deleteDeckNameEditButton();
                    this.deleteDeckButton();
                    this.deleteDeckButtonEffect();
                    this.deleteDeckNameText();

                    break;
                default:
                    console.log(`Unknown button action`);
                    break;
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
        this.myDeckButtonClickDetectRepository.setButtonClickEnabled(false);
        this.buildDeckButtonClickDetectRepository.setButtonClickEnabled(false);
        this.buildDeckButtonHoverDetectRepository.setButtonHoverEnabled(false);
        this.sideScrollAreaDetectRepository.setMyDeckScrollAreaDetectEnabled(false);
    }

    private setInteractionStatesAfterClick(): void {
        this.myDeckButtonClickDetectRepository.setButtonClickEnabled(true);
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

    private setTransparentBackgroundVisibility(isVisible: boolean): void {
        if (isVisible == true) {
            this.transparentBackgroundRepository.showTransparentBackground();
        } else {
            this.transparentBackgroundRepository.hideTransparentBackground();
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

    private getCurrentClickDeckDeleteButtonId(): number | null {
        return this.deckDeleteButtonClickDetectRepository.findCurrentClickedButtonId();
    }

    private getDeckIdByDeleteButtonId(): number | null {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn('버튼의 ID가 존재하지 않습니다.');
            return null;
        }

        return this.myDeckButtonRepository.findDeckIdByButtonId(buttonId);
    }

    public getPopupButtonsVisibleState(): boolean[] {
        const buttons = this.getAllButtons();
        return buttons.map((button) => button.getVisibility());
    }

    private deleteDeckDeleteButton(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.deckDeleteButtonRepository.deleteButtonByButtonUniqueId(buttonId);
        this.deckDeleteButtonPositionRepository.deleteByPositionId(buttonId);
    }

    private deleteDeckNameEditButton(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.deckNameEditButtonRepository.deleteButtonByButtonUniqueId(buttonId);
        this.deckNameEditButtonPositionRepository.deleteByPositionId(buttonId);
    }

    private deleteDeckButton(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.myDeckButtonRepository.deleteById(buttonId);
        this.myDeckButtonPositionRepository.deleteById(buttonId);
    }

    private deleteDeckButtonEffect(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.myDeckButtonEffectRepository.deleteById(buttonId);
    }

    private deleteDeckNameText(): void {
        const buttonId = this.getCurrentClickDeckDeleteButtonId();
        if (buttonId === null) {
            console.warn("삭제할 버튼의 ID가 존재하지 않습니다.");
            return;
        }
        this.myDeckNameTextRepository.deleteById(buttonId);
        this.myDeckNameTextPositionRepository.deleteById(buttonId);
    }

    private deleteCard(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckCardRepository.deleteDeckByDeckId(deckId);
        this.myDeckCardPositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteBlock(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckBlockRepository.deleteDeckByDeckId(deckId);
        this.myDeckBlockPositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteDeckCardName(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckCardNameRepository.deleteDeckByDeckId(deckId);
        this.myDeckCardNamePositionRepository.deletePositionByDeckId(deckId);
    }

    private deleteDeckButtonMapData(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckButtonMapRepository.removeMyDeckByDeckId(deckId);
    }

    private deleteCardMapData(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckCardMapRepository.deleteMyDeck(deckId);
    }

    private deleteTextMapData(): void {
        const deckId = this.getDeckIdByDeleteButtonId();
        if (deckId === null) {
            console.warn("삭제할 덱 ID를 찾을 수 없습니다.");
            return;
        }
        this.myDeckNameTextMapRepository.deleteMyDeckNameText(deckId);
    }

    // To-do: 별도의 기능 분리
    private async clearAllDeckCardsFromScene(): Promise<void> {
        try {
            const allDeckIdList = this.myDeckCardRepository.findDeckIdList();

            allDeckIdList.forEach(deckId => {
                const cardList = this.myDeckCardRepository.findCardListByDeckId(deckId)?? [];

                for (const card of cardList) {
                    if (card) {
                        card.getMesh().visible = false;
                        this.scene.remove(card.getMesh());
                    }
                }

                const cardGroup = this.myDeckCardRepository.findCardGroupByDeckId(deckId);
                if (cardGroup) {
                    this.scene.remove(cardGroup);
                    cardGroup.clear();
                }
            });

            this.myDeckCardRepository.resetCardGroup();
            this.cardStateManager.resetVisibility();

            console.log(`[INFO] All deck cards and groups removed from scene.`);
        } catch (error) {
            console.error('[ERROR] Failed to remove all deck cards:', error);
        }
    }

}
