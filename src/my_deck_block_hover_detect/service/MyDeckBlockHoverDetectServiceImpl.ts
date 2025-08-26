import * as THREE from "three";

import {MyDeckBlockHoverDetectService} from "./MyDeckBlockHoverDetectService";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../repository/MyDeckBlockHoverDetectRepositoryImpl";

import {MyDeckBlock} from "../../my_deck_block/entity/MyDeckBlock";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {DeckCardDeleteButtonRepositoryImpl} from "../../deck_card_delete_button/repository/DeckCardDeleteButtonRepositoryImpl";
import {DeckCardAddButtonRepositoryImpl} from "../../deck_card_add_button/repository/DeckCardAddButtonRepositoryImpl";
import {DeckCardDeleteButtonClickDetectRepositoryImpl} from "../../deck_card_delete_button_click_detect/repository/DeckCardDeleteButtonClickDetectRepositoryImpl";
import {DeckCardAddButtonClickDetectRepositoryImpl} from "../../deck_card_add_button_click_detect/repository/DeckCardAddButtonClickDetectRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class MyDeckBlockHoverDetectServiceImpl implements MyDeckBlockHoverDetectService {
    private static instance: MyDeckBlockHoverDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private deckCardDeleteButtonRepository: DeckCardDeleteButtonRepositoryImpl;
    private deckCardAddButtonRepository: DeckCardAddButtonRepositoryImpl;
    private deckCardDeleteButtonClickDetectRepository: DeckCardDeleteButtonClickDetectRepositoryImpl;
    private deckCardAddButtonClickDetectRepository: DeckCardAddButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonRepository = DeckCardDeleteButtonRepositoryImpl.getInstance(scene);
        this.deckCardAddButtonRepository = DeckCardAddButtonRepositoryImpl.getInstance(scene);
        this.deckCardDeleteButtonClickDetectRepository = DeckCardDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardAddButtonClickDetectRepository = DeckCardAddButtonClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyDeckBlockHoverDetectServiceImpl {
        if (!MyDeckBlockHoverDetectServiceImpl.instance) {
            MyDeckBlockHoverDetectServiceImpl.instance = new MyDeckBlockHoverDetectServiceImpl(camera, scene);
        }
        return MyDeckBlockHoverDetectServiceImpl.instance;
    }

    private setBlockHoverEnabled(isEnabled: boolean): void {
        this.myDeckBlockHoverDetectRepository.setBlockHoverEnabled(isEnabled);
    }

    private isBlockHoverEnabled(): boolean {
        return this.myDeckBlockHoverDetectRepository.isBlockHoverEnabled();
    }

    public async handleHover(hoverPoint: { x: number; y: number }): Promise<MyDeckBlock | null> {
        const { x, y } = hoverPoint;
        const currentClickedDeckButtonId = this.getCurrentClickDeckButtonId();
        if (currentClickedDeckButtonId == null) return null;

        const blockList = this.getBlockListByDeckId(currentClickedDeckButtonId);
        if (blockList !== null) {
            const hoveredBlock = this.myDeckBlockHoverDetectRepository.isBlockHover(
                { x, y },
                blockList,
                this.camera);

            if (hoveredBlock) {
                const blockUniqueId = hoveredBlock.id;
                console.log(`[DEBUG] Hovered My Deck Block! (Deck ID: ${currentClickedDeckButtonId}, Block Unique ID: ${blockUniqueId})`);
                this.saveCurrentHoveredButtonId(blockUniqueId);
                this.setAllDeckCardDeleteButtonVisibility(currentClickedDeckButtonId, false);
                this.setAllDeckCardAddButtonVisibility(currentClickedDeckButtonId, false);
                this.setDeckCardDeleteButtonVisibility(currentClickedDeckButtonId, blockUniqueId, true);
                this.setDeckCardAddButtonVisibility(currentClickedDeckButtonId, blockUniqueId, true);

                return hoveredBlock;

            } else {
                const blockUniqueId = this.getCurrentHoveredButtonId();
                if (blockUniqueId !== null) {
                    this.setDeckCardDeleteButtonVisibility(currentClickedDeckButtonId, blockUniqueId, false);
                    this.setDeckCardAddButtonVisibility(currentClickedDeckButtonId, blockUniqueId, false);
                }
            }
        }
        return null;
    }

    public async onMouseMove(event: MouseEvent): Promise<MyDeckBlock | null> {
        if (!this.isBlockHoverEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            const result =  await this.handleHover(hoverPoint);

            if (result) {
                this.deckCardDeleteButtonClickDetectRepository.setButtonClickEnabled(true);
                this.deckCardAddButtonClickDetectRepository.setButtonClickEnabled(true);

                return result;
            }
        }
        return null;
    }

    private getCurrentClickDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private getBlockListByDeckId(deckId: number): MyDeckBlock[] | null {
        return this.myDeckBlockRepository.findBlockListByDeckId(deckId);
    }

    private saveCurrentHoveredButtonId(buttonUniqueId: number): void {
        this.myDeckBlockHoverDetectRepository.saveCurrentHoveredBlockId(buttonUniqueId);
    }

    public getCurrentHoveredButtonId(): number | null {
        return this.myDeckBlockHoverDetectRepository.getCurrentHoveredBlockId();
    }

    private setDeckCardDeleteButtonVisibility(deckId: number, buttonId: number, isVisible: boolean): void {
        const buttonList = this.deckCardDeleteButtonRepository.findButtonListByDeckId(deckId);
        buttonList?.find(button => button.id === buttonId)?.setVisibility(isVisible);
    }

    private setAllDeckCardDeleteButtonVisibility(deckId: number, isVisible: boolean): void {
        const buttonList = this.deckCardDeleteButtonRepository.findButtonListByDeckId(deckId);
        if (buttonList !== null) {
            buttonList.forEach(button => button.setVisibility(isVisible));
        }
    }

    private setDeckCardAddButtonVisibility(deckId: number, buttonId: number, isVisible: boolean): void {
        const buttonList = this.deckCardAddButtonRepository.findButtonListByDeckId(deckId);
        buttonList?.find(button => button.id === buttonId)?.setVisibility(isVisible);
    }

    private setAllDeckCardAddButtonVisibility(deckId: number, isVisible: boolean): void {
        const buttonList = this.deckCardAddButtonRepository.findButtonListByDeckId(deckId);
        if (buttonList !== null) {
            buttonList.forEach(button => button.setVisibility(isVisible));
        }
    }

}
