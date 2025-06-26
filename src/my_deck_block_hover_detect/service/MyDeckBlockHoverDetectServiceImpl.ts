import * as THREE from "three";

import {MyDeckBlockHoverDetectService} from "./MyDeckBlockHoverDetectService";
import {MyDeckBlockHoverDetectRepositoryImpl} from "../repository/MyDeckBlockHoverDetectRepositoryImpl";

import {MyDeckBlock} from "../../my_deck_block/entity/MyDeckBlock";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {DeckCardDeleteButtonRepositoryImpl} from "../../deck_card_delete_button/repository/DeckCardDeleteButtonRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class MyDeckBlockHoverDetectServiceImpl implements MyDeckBlockHoverDetectService {
    private static instance: MyDeckBlockHoverDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private myDeckBlockHoverDetectRepository: MyDeckBlockHoverDetectRepositoryImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private deckCardDeleteButtonRepository: DeckCardDeleteButtonRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckBlockHoverDetectRepository = MyDeckBlockHoverDetectRepositoryImpl.getInstance();
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardDeleteButtonRepository = DeckCardDeleteButtonRepositoryImpl.getInstance(scene);
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
                this.setDeckCardDeleteButtonVisibility(blockUniqueId, true);
            } else {
                const blockUniqueId = this.getCurrentHoveredButtonId();
                if (blockUniqueId !== null) {
                    this.setDeckCardDeleteButtonVisibility(blockUniqueId, false);
                }
            }
        }
        return null;
    }

    public async onMouseMove(event: MouseEvent): Promise<MyDeckBlock | null> {
        if (!this.isBlockHoverEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            return await this.handleHover(hoverPoint);
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

    private setDeckCardDeleteButtonVisibility(buttonId: number, isVisible: boolean): void {
        const button = this.deckCardDeleteButtonRepository.findButtonByButtonUniqueId(buttonId);
        if (button !== null) {
            button.setVisibility(isVisible);
        } else {
            console.log(`Not Found Deck Card Delete Button (Button ID: ${buttonId})`);
        }
    }

    private setAllDeckCardDeleteButtonVisibility(deckId: number, isVisible: boolean): void {
        const buttonList = this.deckCardDeleteButtonRepository.findButtonListByDeckId(deckId);
        if (buttonList !== null) {
            buttonList.forEach(button => button.setVisibility(isVisible));
        }
    }

}
