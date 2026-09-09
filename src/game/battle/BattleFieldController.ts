import * as THREE from 'three';

// 손패의 시작 카드다. 실제 대전에서는 서버가 준다.
// 전에는 저장소가 이 넉 장을 스스로 들고 있어서, 값을 담는 곳이 시나리오를 정하고 있었다.
const HAND_START_CARD_IDS = [2, 19, 93, 26];


// 상대 필드의 시작 배치다. 실제 대전에서는 서버가 준다.
// 전에는 저장소가 이 다섯 줄을 스스로 들고 있어서, 값을 담는 곳이 시나리오를 정하고 있었다.
const OPPONENT_FIELD_START_CARD_IDS = [31, 32, 32, 26, 27];

import { BattleRepository } from "../../battle/repository/BattleRepository";
import { BattleRepositoryImpl } from "../../battle/repository/BattleRepositoryImpl";
import { createDefaultHandPageButtonsFrame } from "../../battle/hand/page/frame/HandPageButtonsFrame";
import { HandPageButtonsRendererV2 } from "../../battle/hand/page/renderer/HandPageButtonsRendererV2";

import { BackgroundServiceImpl } from "../../background/service/BackgroundServiceImpl";
import { YourFieldAreaServiceImpl } from "../../battle/field/your/area/service/YourFieldAreaServiceImpl";
import { OpponentFieldAreaServiceImpl } from "../../battle/field/opponent/area/service/OpponentFieldAreaServiceImpl";
import { BattleFieldHandServiceImpl } from "../../battle/hand/service/BattleFieldHandServiceImpl";
import { OpponentFieldServiceImpl } from "../../battle/field/opponent/service/OpponentFieldServiceImpl";
import { NonBackgroundImage } from "../../shape/image/NonBackgroundImage";
import { UnitCardGenerator } from "../../card/unit/generate";
import { SupportCardGenerator } from "../../card/support/generate";
import { ItemCardGenerator } from "../../card/item/generate";
import { EnergyCardGenerator } from "../../card/energy/generate";

export class BattleFieldController {
    private background: NonBackgroundImage | null = null;
    private readonly handPageButtonsRenderer = new HandPageButtonsRendererV2();
    private readonly battleRepository: BattleRepository = BattleRepositoryImpl.getInstance();

    constructor(
        private scene: THREE.Scene,
        private backgroundService: BackgroundServiceImpl,
        private yourFieldAreaService: YourFieldAreaServiceImpl,
        private opponentFieldAreaService: OpponentFieldAreaServiceImpl,
        private battleFieldHandService: BattleFieldHandServiceImpl,
        private opponentFieldService: OpponentFieldServiceImpl
    ) {}

    public async initialize(): Promise<void> {
        // 전투 한 판이 여기서 시작된다. 앞으로 턴, 덱, 무덤, 손패, 필드가 이 안으로 들어온다.
        this.battleRepository.start();

        await this.addBackground();
        this.addYourField();
        this.addOpponentField();
        await this.addYourHandUnitList();
        await this.addOpponentFieldUnitList();
        await this.addYourHandPageButtons();
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

    // 페이지 넘김 버튼은 렌더러가 만든다. 이전과 다음을 한 덩어리로 준다.
    private async addYourHandPageButtons(): Promise<void> {
        const frame = createDefaultHandPageButtonsFrame();
        const group = await this.handPageButtonsRenderer.build(frame);
        this.scene.add(group);
    }

    private async addYourHandUnitList(): Promise<void> {
        const battleFieldHandList = HAND_START_CARD_IDS;

        for (const handCardId of battleFieldHandList) {
            const createdHand = await this.battleFieldHandService.createHand(handCardId);

            if (createdHand) {
                this.scene.add(createdHand);
            }
        }
    }

    private async addOpponentFieldUnitList(): Promise<void> {
        const opponentFieldUnitList = OPPONENT_FIELD_START_CARD_IDS;
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