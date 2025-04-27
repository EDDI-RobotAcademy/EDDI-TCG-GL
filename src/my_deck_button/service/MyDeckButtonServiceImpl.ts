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
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";

import {ButtonStateManager} from "../../my_deck_button_manager/ButtonStateManager";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckButtonServiceImpl implements MyDeckButtonService {
    private static instance: MyDeckButtonServiceImpl;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonPositionRepository: MyDeckButtonPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;

    private buttonStateManager: ButtonStateManager;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(myDeckButtonRepository: MyDeckButtonRepository) {
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance();
        this.myDeckButtonPositionRepository = MyDeckButtonPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();

        this.buttonStateManager = ButtonStateManager.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
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
            const existingPosition = this.getMyDeckButtonPosition(deckId);
            const existingButton = this.getMyDeckButtonByDeckId(deckId);

            if (existingPosition && existingButton) {
                const positionX = existingPosition.getX() * window.innerWidth;
                const positionY = existingPosition.getY() * window.innerHeight;
                const existingButtonMesh = existingButton.getMesh();

                existingButtonMesh.position.set(positionX, positionY, 0);
                buttonGroup.add(existingButtonMesh);

            } else {
                const position = this.myDeckButtonPosition(deckId);
                console.log(`[DEBUG] Deck ${deckId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);
                this.saveMyDeckButtonPosition(deckId, position);

                const deckButton = await this.createMyDeckButton(deckId, position.position);
                buttonGroup.add(deckButton.mesh);
            }

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

    private getMyDeckButtonPosition(deckId: number): MyDeckButtonPosition | null {
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

            const buttonWidth = 0.18 * window.innerWidth;
            const buttonHeight = buttonWidth * (240/1040);

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

            const scrollArea = this.getScrollArea();
            if (scrollArea) {
                scrollArea.width = 0.24 * windowWidth;
                scrollArea.height = 0.61 * windowHeight;
                scrollArea.position.set(-0.36 * window.innerWidth, -0.1167 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
                this.applyClippingPlanesToMesh(buttonMesh, clippingPlanes);
            }
        }

    }

    public initializeDeckButton(): void {
        this.buttonStateManager.initializeButtonState();
    }

    public resetButtonVisibility(): void {
        this.buttonStateManager.resetVisibility();
    }

    public getMyDeckButtonByDeckId(deckId: number): MyDeckButton | null {
        return this.myDeckButtonRepository.findButtonByDeckId(deckId);
    }

    public getAllMyDeckButton(): MyDeckButton[] {
        return this.myDeckButtonRepository.findAll();
    }

    public getDeckButtonIdByDeckId(deckId: number): number | null {
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

    public saveCurrentClickDeckButtonId(buttonId: number): void {
        this.myDeckButtonClickDetectRepository.saveCurrentClickDeckButtonId(buttonId);
    }

    public getMyDeckButtonGroups(): THREE.Group {
        return this.myDeckButtonRepository.findAllButtonGroups();
    }

    public resetMyDeckButtonGroups(): void {
        this.myDeckButtonRepository.resetButtonGroups();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
