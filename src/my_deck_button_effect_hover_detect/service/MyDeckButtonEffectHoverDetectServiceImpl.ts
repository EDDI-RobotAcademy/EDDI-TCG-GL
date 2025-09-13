import * as THREE from "three";
import {getCardById} from "../../card/utility";

import {MyDeckButtonEffectHoverDetectService} from "./MyDeckButtonEffectHoverDetectService";
import {MyDeckButtonEffectHoverDetectRepositoryImpl} from "../repository/MyDeckButtonEffectHoverDetectRepositoryImpl";
import {MyDeckButtonEffect} from "../../my_deck_button_effect/entity/MyDeckButtonEffect";
import {MyDeckButtonEffectRepositoryImpl} from "../../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";
import {DeckDeleteButtonRepositoryImpl} from "../../deck_delete_button/repository/DeckDeleteButtonRepositoryImpl";
import {DeckNameEditButtonRepositoryImpl} from "../../deck_name_edit_button/repository/DeckNameEditButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class MyDeckButtonEffectHoverDetectServiceImpl implements MyDeckButtonEffectHoverDetectService {
    private static instance: MyDeckButtonEffectHoverDetectServiceImpl | null = null;
    private myDeckButtonEffectHoverDetectRepository: MyDeckButtonEffectHoverDetectRepositoryImpl;
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;
    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private deckNameEditButtonRepository: DeckNameEditButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private cameraRepository: CameraRepository;

    private effectDetectState: boolean = true;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.myDeckButtonEffectHoverDetectRepository = MyDeckButtonEffectHoverDetectRepositoryImpl.getInstance();
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance(scene);
        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance(scene);
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyDeckButtonEffectHoverDetectServiceImpl {
        if (!MyDeckButtonEffectHoverDetectServiceImpl.instance) {
            MyDeckButtonEffectHoverDetectServiceImpl.instance = new MyDeckButtonEffectHoverDetectServiceImpl(camera, scene);
        }
        return MyDeckButtonEffectHoverDetectServiceImpl.instance;
    }

    public setEffectDetectState(state: boolean): void {
        this.effectDetectState = state;
    }

    public getEffectDetectState(): boolean {
        return this.effectDetectState;
    }

    async handleHover(hoverPoint: { x: number; y: number }): Promise<MyDeckButtonEffect | null> {
        const { x, y } = hoverPoint;
        const allEffectIdList = this.getAllEffectIdList();
        const allEffect = this.getAllEffect();

        const hoveredEffect = this.myDeckButtonEffectHoverDetectRepository.isMyDeckButtonEffectHover(
            { x, y },
            allEffect,
            this.camera
        );

        if (hoveredEffect) {
            console.log(`[DEBUG] Hovered Effect Unique Id: ${hoveredEffect.id}`);
            this.saveCurrentHoveredEffectId(hoveredEffect.id);

            const currentHoveredEffectId = this.getCurrentHoveredEffectId();

            const shownButtonId = allEffectIdList.find(
                (buttonId) => this.getDeckNameEditButtonVisibility(buttonId) == true
            );

            if (shownButtonId !== undefined && shownButtonId !== null && shownButtonId !== currentHoveredEffectId) {
                this.setDeckNameEditButtonVisibility(shownButtonId, false);
                this.setDeckDeleteButtonVisibility(shownButtonId, false);
            }

            if (currentHoveredEffectId !== null && currentHoveredEffectId == this.getClickedDeckId()) {
                this.setDeckNameEditButtonVisibility(currentHoveredEffectId, true);
                this.setDeckDeleteButtonVisibility(currentHoveredEffectId, true);
            }

            return hoveredEffect;

        } else {
            allEffectIdList.forEach((buttonId) => {
                this.setDeckNameEditButtonVisibility(buttonId, false);
                this.setDeckDeleteButtonVisibility(buttonId, false);
            });
        }
        return null;
    }

    public async onMouseMove(event: MouseEvent): Promise<MyDeckButtonEffect | null> {
        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            return await this.handleHover(hoverPoint);
        }
        return null;
    }

    private getAllEffectIdList(): number[] {
        return this.myDeckButtonEffectRepository.findAllEffectIds();
    }

    private getAllEffect(): MyDeckButtonEffect[] {
        return this.myDeckButtonEffectRepository.findAll();
    }

    private saveCurrentHoveredEffectId(effectId: number): void {
        this.myDeckButtonEffectHoverDetectRepository.saveCurrentHoveredEffectId(effectId);
    }

    public getCurrentHoveredEffectId(): number | null {
        return this.myDeckButtonEffectHoverDetectRepository.findCurrentHoveredEffectId();
    }

    private setDeckNameEditButtonVisibility(buttonId: number, isVisible: boolean): void {
        const button = this.deckNameEditButtonRepository.findButtonByButtonUniqueId(buttonId);
        if (button !== null) {
            button.setVisibility(isVisible);
        }
    }

    private setDeckDeleteButtonVisibility(buttonId: number, isVisible: boolean): void {
        const button = this.deckDeleteButtonRepository.findButtonByButtonUniqueId(buttonId);
        if (button !== null) {
            button.setVisibility(isVisible);
        }
    }

    private getClickedDeckId(): number | undefined {
        const currentClickedDeckId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
        if (currentClickedDeckId !== null) {
            const buttonId = this.myDeckButtonEffectRepository.findEffectIdByDeckId(currentClickedDeckId);
            if (buttonId !== null) {
                return buttonId;
            }
        }
        return undefined;
    }

    public getDeckNameEditButtonVisibility(buttonId: number): boolean | undefined {
        const button = this.deckNameEditButtonRepository.findButtonByButtonUniqueId(buttonId);
        if (button !== null) {
            return button.getVisibility();
        }
        return undefined;
    }

    public getDeckDeleteButtonVisibility(buttonId: number): boolean | undefined {
        const button = this.deckDeleteButtonRepository.findButtonByButtonUniqueId(buttonId);
        if (button !== null) {
            return button.getVisibility();
        }
        return undefined;
    }

}
