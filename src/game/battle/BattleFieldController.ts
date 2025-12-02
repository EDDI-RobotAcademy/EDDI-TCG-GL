import * as THREE from 'three';

import { BackgroundServiceImpl } from "../../background/service/BackgroundServiceImpl";
import { YourFieldAreaServiceImpl } from "../../your_field_area/service/YourFieldAreaServiceImpl";
import { OpponentFieldAreaServiceImpl } from "../../opponent_field_area/service/OpponentFieldAreaServiceImpl";
import { BattleFieldHandServiceImpl } from "../../battle_field_hand/service/BattleFieldHandServiceImpl";
import { OpponentFieldServiceImpl } from "../../opponent_field/service/OpponentFieldServiceImpl";
import { BattleFieldHandMapRepositoryImpl } from "../../battle_field_hand/repository/BattleFieldHandMapRepositoryImpl";
import { BattleFieldHandSceneRepository } from "../../battle_field_hand/deprecated_repository/BattleFieldHandSceneRepository";
import { OpponentFieldMapRepositoryImpl } from "../../opponent_field_map/repository/OpponentFieldMapRepositoryImpl";
import { BattleFieldHandPageServiceImpl } from "../../battle_field_hand_page/service/BattleFieldHandPageServiceImpl";
import { NonBackgroundImage } from "../../shape/image/NonBackgroundImage";
import { UnitCardGenerator } from "../../card/unit/generate";
import { SupportCardGenerator } from "../../card/support/generate";
import { ItemCardGenerator } from "../../card/item/generate";
import { EnergyCardGenerator } from "../../card/energy/generate";

export class BattleFieldController {
    private background: NonBackgroundImage | null = null;
    private battleFieldHandMapRepository = BattleFieldHandMapRepositoryImpl.getInstance();
    private battleFieldHandSceneRepository = BattleFieldHandSceneRepository.getInstance();
    private opponentFieldMapRepository = OpponentFieldMapRepositoryImpl.getInstance();
    private battleFieldHandPageService = BattleFieldHandPageServiceImpl.getInstance();

    constructor(
        private scene: THREE.Scene,
        private backgroundService: BackgroundServiceImpl,
        private yourFieldAreaService: YourFieldAreaServiceImpl,
        private opponentFieldAreaService: OpponentFieldAreaServiceImpl,
        private battleFieldHandService: BattleFieldHandServiceImpl,
        private opponentFieldService: OpponentFieldServiceImpl
    ) {}

    public async initialize(): Promise<void> {
        await this.addBackground();
        this.addYourField();
        this.addOpponentField();
        await this.addYourHandUnitList();
        await this.addOpponentFieldUnitList();
        await this.addYourHandPagePrevButton();
        await this.addYourHandPageNextButton();
    }

    private async addBackground(): Promise<void> {
        try {
            const background = await this.backgroundService.createBackground(
                'battle_field_background',
                1,
                window.innerWidth,
                window.innerHeight
            );

            this.background = background;

            if (this.background instanceof NonBackgroundImage) {
                this.background.draw(this.scene);
            }
        } catch (error) {
            console.error('Failed to add background:', error);
        }
    }

    private addYourField(): void {
        const yourField = this.yourFieldAreaService.createYourField();
        const yourFieldAreaMesh = yourField.getArea();
        this.scene.add(yourFieldAreaMesh);
    }

    private addOpponentField(): void {
        const opponentField = this.opponentFieldAreaService.createOpponentField();
        const opponentFieldAreaMesh = opponentField.getArea();
        this.scene.add(opponentFieldAreaMesh);
    }

    private async addYourHandPagePrevButton(): Promise<void> {
        const createdPrevButton = await this.battleFieldHandPageService.createPrevButton();
        this.scene.add(createdPrevButton);
    }

    private async addYourHandPageNextButton(): Promise<void> {
        const createdNextButton = await this.battleFieldHandPageService.createNextButton();
        this.scene.add(createdNextButton);
    }

    private async addYourHandUnitList(): Promise<void> {
        const battleFieldHandList = this.battleFieldHandMapRepository.getBattleFieldHandList();

        for (const handCardId of battleFieldHandList) {
            const createdHand = await this.battleFieldHandService.createHand(handCardId);

            if (createdHand) {
                this.battleFieldHandSceneRepository.addBattleFieldHandScene(createdHand);
                this.scene.add(createdHand);
            }
        }
    }

    private async addOpponentFieldUnitList(): Promise<void> {
        const opponentFieldUnitList = this.opponentFieldMapRepository.getOpponentFieldList();
        console.log(`opponentFieldUnitList: ${opponentFieldUnitList}`);

        for (const opponentCardId of opponentFieldUnitList) {
            const opponentFieldUnit = await this.opponentFieldService.createFieldUnit(opponentCardId);
            this.scene.add(opponentFieldUnit);
        }
    }

    public handleResize(width: number, height: number): void {
        // Background resize
        if (this.background) {
            const scaleX = width / this.background.getWidth();
            const scaleY = height / this.background.getHeight();
            this.background.setScale(scaleX, scaleY);
        }

        // Card positions adjust
        UnitCardGenerator.adjustHandCardPositions();
        SupportCardGenerator.adjustCardPositions();
        ItemCardGenerator.adjustCardPositions();
        EnergyCardGenerator.adjustCardPositions();
    }
}