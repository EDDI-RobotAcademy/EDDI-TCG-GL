import * as THREE from "three";

import {MyCardRaceButtonClickDetectService} from "./MyCardRaceButtonClickDetectService";
import {MyCardRaceButton} from "../../my_card_race_button/entity/MyCardRaceButton";
import {MyCardRaceButtonRepositoryImpl} from "../../my_card_race_button/repository/MyCardRaceButtonRepositoryImpl"
import {MyCardRaceButtonClickDetectRepositoryImpl} from "../repository/MyCardRaceButtonClickDetectRepositoryImpl";
import {MyCardScreenCardRepositoryImpl} from "../../my_card_screen_card/repository/MyCardScreenCardRepositoryImpl";
import {MyCardScreenCardEffectRepositoryImpl} from "../../my_card_screen_card_effect/repository/MyCardScreenCardEffectRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {MyCardScrollBarRepositoryImpl} from "../../my_card_scroll_bar/repository/MyCardScrollBarRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {MyCardRaceButtonStateManager} from "../../my_card_race_button_manager/MyCardRaceButtonStateManager";
import {MyCardRaceButtonEffectStateManager} from "../../my_card_race_button_manager/MyCardRaceButtonEffectStateManager";
import {CardStateManager} from "../../my_card_screen_card_manager/CardStateManager";
import {DetailCardStateManager} from "../../my_card_screen_detail_card_manager/DetailCardStateManager";

export class MyCardRaceButtonClickDetectServiceImpl implements MyCardRaceButtonClickDetectService {
    private static instance: MyCardRaceButtonClickDetectServiceImpl | null = null;
    private raceButtonRepository: MyCardRaceButtonRepositoryImpl;
    private raceButtonClickDetectRepository: MyCardRaceButtonClickDetectRepositoryImpl;
    private cardRepository: MyCardScreenCardRepositoryImpl;
    private cardEffectRepository: MyCardScreenCardEffectRepositoryImpl;
    private transparentBackgroundRepository : TransparentBackgroundRepositoryImpl;
    private myCardScrollBarRepository: MyCardScrollBarRepositoryImpl;
    private cameraRepository: CameraRepository;

    private raceButtonStateManager: MyCardRaceButtonStateManager;
    private raceButtonEffectStateManager: MyCardRaceButtonEffectStateManager;
    private cardStateManager: CardStateManager;
    private detailCardStateManager: DetailCardStateManager;

    private raceButtonClickState: boolean = true;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.raceButtonRepository = MyCardRaceButtonRepositoryImpl.getInstance();
        this.raceButtonClickDetectRepository = MyCardRaceButtonClickDetectRepositoryImpl.getInstance();
        this.cardRepository = MyCardScreenCardRepositoryImpl.getInstance();
        this.cardEffectRepository = MyCardScreenCardEffectRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.myCardScrollBarRepository = MyCardScrollBarRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();

        this.raceButtonStateManager = MyCardRaceButtonStateManager.getInstance();
        this.raceButtonEffectStateManager = MyCardRaceButtonEffectStateManager.getInstance();
        this.cardStateManager = CardStateManager.getInstance();
        this.detailCardStateManager = DetailCardStateManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyCardRaceButtonClickDetectServiceImpl {
        if (!MyCardRaceButtonClickDetectServiceImpl.instance) {
            MyCardRaceButtonClickDetectServiceImpl.instance = new MyCardRaceButtonClickDetectServiceImpl(camera, scene);
        }
        return MyCardRaceButtonClickDetectServiceImpl.instance;
    }

    setButtonClickState(state: boolean): void {
        this.raceButtonClickState = state;
    }

    getButtonClickState(): boolean {
        return this.raceButtonClickState;
    }

    async handleRaceButtonClick(clickPoint: { x: number; y: number }): Promise<MyCardRaceButton | null> {
        const { x, y } = clickPoint;
        const raceButtonList = this.getAllRaceButtons();
        const clickedRaceButton = this.raceButtonClickDetectRepository.isRaceButtonClicked(
            { x, y },
            raceButtonList,
            this.camera
        );

        if (clickedRaceButton) {
            console.log(`[DEBUG] Clicked Race Button ID: ${clickedRaceButton.id}`); // raceButtonList 기준으로 0, 1, 2임.
            this.saveCurrentClickedRaceButtonId(clickedRaceButton.id);
            const currentClickedButtonId = this.getCurrentClickedRaceButtonId();

            const hiddenRaceButton = raceButtonList.find(
                (button) => this.getRaceButtonVisibility(button.id) == false
            );

            if (hiddenRaceButton && hiddenRaceButton.id !== currentClickedButtonId) {
                const cardIdList = this.getCardIdListByRaceId(hiddenRaceButton.id);
                this.setCardsVisibility(cardIdList, false);
                this.setRaceButtonVisibility(hiddenRaceButton.id, true);
                this.setRaceButtonEffectVisibility(hiddenRaceButton.id, false);
                this.initializeDetailCardVisibility(cardIdList);
                this.setTransparentBackgroundVisibility(false);
            }

            if (currentClickedButtonId !== null) {
                const cardIdList = this.getCardIdListByRaceId(currentClickedButtonId);
                this.setCardsVisibility(cardIdList, true);
                this.setRaceButtonVisibility(currentClickedButtonId, false);
                this.setRaceButtonEffectVisibility(currentClickedButtonId, true);
                this.setCardGroupPosition(currentClickedButtonId);
                this.setCardEffectGroupPosition(currentClickedButtonId);
                this.setScrollHandleGroupPosition();
            }

            return clickedRaceButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyCardRaceButton | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleRaceButtonClick(clickPoint);
        }
        return null;
    }

    public getAllRaceButtons(): MyCardRaceButton[] {
        return this.raceButtonRepository.findAllButton();
    }

    public saveCurrentClickedRaceButtonId(buttonId: number): void {
        this.raceButtonClickDetectRepository.saveCurrentClickedRaceButtonId(buttonId);
    }

    public getCurrentClickedRaceButtonId(): number | null {
        return this.raceButtonClickDetectRepository.findCurrentClickedRaceButtonId();
    }

    public getRaceButtonVisibility(buttonId: number): boolean {
        return this.raceButtonStateManager.findVisibility(buttonId);
    }

    public setRaceButtonVisibility(buttonId: number, visible: boolean): void {
        this.raceButtonStateManager.setVisibility(buttonId, visible);
    }

    public setRaceButtonEffectVisibility(effectId: number, visible: boolean): void {
        this.raceButtonEffectStateManager.setVisibility(effectId, visible);
    }

    private getCardIdListByRaceId(buttonId: number): number[] {
        const raceId = (buttonId + 1).toString();
        return this.cardRepository.findCardIdsByRaceId(raceId);
    }

    private setCardsVisibility(cardIdList: number[], isVisible: boolean): void {
        cardIdList.forEach((cardId) => {
            this.cardStateManager.setCardVisibility(cardId, isVisible)
        });
    }

    private setCardGroupPosition(clickedRaceButtonId: number): void {
        const raceId = clickedRaceButtonId + 1;
        const humanCardGroup = this.cardRepository.findHumanCardGroup();
        const undeadCardGroup = this.cardRepository.findUndeadCardGroup();
        const trentCardGroup = this.cardRepository.findTrentCardGroup();
        switch (raceId) {
            case 1:
                humanCardGroup.position.y = 0;
                break;
            case 2:
                undeadCardGroup.position.y = 0;
                break;
            case 3:
                trentCardGroup.position.y = 0;
                break;
            default:
                console.warn(`[WARN] Invalid raceButtonId: ${clickedRaceButtonId}, returning empty group`);
        }
    }
    
    private setCardEffectGroupPosition(clickedRaceButtonId: number): void {
        const raceId = clickedRaceButtonId + 1;
        const humanCardEffectGroup = this.cardEffectRepository.findHumanEffectGroup();
        const undeadCardEffectGroup = this.cardEffectRepository.findUndeadEffectGroup();
        const trentCardEffectGroup = this.cardEffectRepository.findTrentEffectGroup();
        switch (raceId) {
            case 1:
                humanCardEffectGroup.position.y = 0;
                break;
            case 2:
                undeadCardEffectGroup.position.y = 0;
                break;
            case 3:
                trentCardEffectGroup.position.y = 0;
                break;
            default:
                console.warn(`[WARN] Invalid raceButtonId: ${clickedRaceButtonId}, returning empty group`);
        }
    }

    private setScrollHandleGroupPosition(): void {
        const handleGroup = this.myCardScrollBarRepository.findScrollHandleGroup();
        handleGroup.position.y = 0;
    }

    private setDetailCardVisibility(cardId: number, isVisible: boolean): void {
        this.detailCardStateManager.setCardVisibility(cardId, isVisible);
    }

    private initializeDetailCardVisibility(cardIdList: number[]): void {
        this.detailCardStateManager.initializeCardVisibility(cardIdList);
    }

    private setTransparentBackgroundVisibility(isVisible: boolean): void {
        const background = this.transparentBackgroundRepository.findTransparentBackground();
        if (background) {
            background.setVisibility(isVisible);
        }
    }

}
