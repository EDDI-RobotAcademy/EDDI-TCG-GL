import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import { MyDeckButtonService } from './MyDeckButtonService';
import {MyDeckButtonType} from "../entity/MyDeckButtonType";
import {MyDeckButton} from "../entity/MyDeckButton";

import {MyDeckButtonRepository} from "../repository/MyDeckButtonRepository";
import {MyDeckButtonRepositoryImpl} from "../repository/MyDeckButtonRepositoryImpl";
import {MyDeckButtonPosition} from "../../my_deck_button_position/entity/MyDeckButtonPosition";
import {MyDeckButtonPositionRepositoryImpl} from "../../my_deck_button_position/repository/MyDeckButtonPositionRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

import {ButtonStateManager} from "../../my_deck_button_manager/ButtonStateManager";

export class MyDeckButtonServiceImpl implements MyDeckButtonService {
    private static instance: MyDeckButtonServiceImpl;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonPositionRepository: MyDeckButtonPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private buttonStateManager: ButtonStateManager;

    private constructor(myDeckButtonRepository: MyDeckButtonRepository) {
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance();
        this.myDeckButtonPositionRepository = MyDeckButtonPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.buttonStateManager = ButtonStateManager.getInstance();
    }

    public static getInstance(): MyDeckButtonServiceImpl {
        if (!MyDeckButtonServiceImpl.instance) {
            const repository = MyDeckButtonRepositoryImpl.getInstance();
            MyDeckButtonServiceImpl.instance = new MyDeckButtonServiceImpl(repository);
        }
        return MyDeckButtonServiceImpl.instance;
    }

    public async createMyDeckButtonWithPosition(deckId: number): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const position = this.myDeckButtonPosition(deckId);
            console.log(`[DEBUG] Deck ${deckId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);
            this.saveMyDeckButtonPosition(deckId, position);

            const deckButton = await this.createMyDeckButton(deckId, position.position);
            buttonGroup.add(deckButton.mesh);

        } catch (error) {
            console.error('Error creating my deck button with position:', error);
            return null;
        }
        return buttonGroup;
    }

    private async createMyDeckButton(deckId: number, position: Vector2d): Promise<MyDeckButton> {
        return await this.myDeckButtonRepository.createMyDeckButton(deckId, position);
    }

    private myDeckButtonPosition(deckId: number): MyDeckButtonPosition {
        return this.myDeckButtonPositionRepository.addMyDeckButtonPosition(deckId);
    }

    private saveMyDeckButtonPosition(deckId: number, position: MyDeckButtonPosition): void {
        this.myDeckButtonPositionRepository.save(deckId, position);
    }

    private findMyDeckButtonPosition(deckId: number): MyDeckButtonPosition | null {
        return this.myDeckButtonPositionRepository.findPositionByDeckId(deckId);
    }


    public adjustMyDeckButtonPosition(): void {
        const positionRepository = this.myDeckButtonPositionRepository
        const buttonRepository = this.myDeckButtonRepository

        const buttonList = buttonRepository.findAll();
        const buttonPosition = positionRepository.findAll();

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        console.log('buttonList:', buttonList);
        console.log('buttonPosition:', buttonPosition);

        for (const button of buttonList) {
            console.log(`Button ID: ${button.id}`);
            const buttonMesh = button.getMesh();
            const buttonId = button.id;
            const initialPosition = positionRepository.findById(buttonId);
            console.log(`InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`No position found for button id: ${buttonId}`);
                continue;
            }

            const buttonWidth = 0.257 * window.innerWidth;
            const buttonHeight = buttonWidth * 0.3;

            const newPositionX = initialPosition.position.getX() * window.innerWidth;
            const newPositionY = initialPosition.position.getY() * window.innerHeight;
            console.log(`Button ${buttonId}:`, {
                initialPosition: initialPosition.position,
                newPositionX,
                newPositionY,
            });

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);

            buttonMesh.position.set(newPositionX, newPositionY, 0);
        }

    }

    public initializeDeckButton(): void {
        const buttonIdList = this.getAllDeckButtonId();
        this.initializeButtonState(buttonIdList);

        const buttonMeshList = this.getAllMyDeckButton();
        if (buttonMeshList) {
            buttonMeshList.forEach((button, index) => {
//                 button.getMesh().visible = index < 6;
//                 button.getMesh().visible = index > 0 && index < 6;
                button.getMesh().visible = index > 0;
                const firstButton = buttonIdList[0];
                this.saveCurrentClickDeckButtonId(firstButton);
            });
        }
    }

    public getMyDeckButtonByDeckId(deckId: number): MyDeckButton | null {
        return this.myDeckButtonRepository.findButtonByDeckId(deckId);
    }

    public getAllMyDeckButton(): MyDeckButton[] {
        return this.myDeckButtonRepository.findAll();
    }

    public getDeckButtonIdByDeckId(deckId: number): number {
        return this.myDeckButtonRepository.findButtonIdByDeckId(deckId);
    }

    public getAllDeckButtonId(): number[] {
        return this.myDeckButtonRepository.findAllButtonIds();
    }

    public deleteMyDeckButtonByDeckId(deckId: number): void {
        this.myDeckButtonRepository.deleteButtonByDeckId(deckId);
    }

     public deleteAllMyDeckButton(): void {
         this.myDeckButtonRepository.deleteAll();
     }

    private setButtonVisibility(deckId: number, isVisible: boolean): void {
        const buttonId = this.getDeckButtonIdByDeckId(deckId);
        this.buttonStateManager.setVisibility(buttonId, isVisible);
    }

    private initializeButtonState(buttonIdList: number[]): void {
        this.buttonStateManager.initializeButtonState(buttonIdList);
    }

    private saveCurrentClickDeckButtonId(buttonId: number): void {
        this.myDeckButtonClickDetectRepository.saveCurrentClickDeckButtonId(buttonId);
    }

}
