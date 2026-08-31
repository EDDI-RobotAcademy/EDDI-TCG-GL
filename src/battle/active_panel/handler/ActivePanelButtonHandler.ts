import {ActivePanelButtonType} from "../entity/ActivePanelButtonType";
import {GeneralAttackHandler} from "./GeneralAttackHandler";

import * as THREE from "three";

import {FirstSkillHandler} from "./FirstSkillHandler";
import {SecondSkillType} from "../../ability/entity/SecondSkillType";
import {SecondSkillHandler} from "./SecondSkillHandler";
import {CardDetailsType} from "../../../card_details/entity/CardDetailsType";
import {CardDetailsHandler} from "../../../card_details/handler/CardDetailsHandler";

export class ActivePanelButtonHandler {
    private static instance: ActivePanelButtonHandler;

    private generalAttackHandler: GeneralAttackHandler;
    private firstSkillHandler: FirstSkillHandler;
    private secondSkillHandler: SecondSkillHandler;

    private cardDetailsHandler: CardDetailsHandler;

    private handlers: Record<
        ActivePanelButtonType,
        (...args: any[]) => Promise<void>
        > = {
        [ActivePanelButtonType.NONE]: async () => {},
        [ActivePanelButtonType.GENERAL]: async (
            generalAttackType,
            x: number,
            y: number
        ) => {
            await this.generalAttackHandler.execute(
                generalAttackType,
                x,
                y
            );
        },
        [ActivePanelButtonType.FIRST_SKILL]: async (
            firstSkillType,
            x: number,
            y: number
        ) => {
            await this.firstSkillHandler.execute(
                firstSkillType,
                x,
                y
            );
        },
        [ActivePanelButtonType.SECOND_SKILL]: async (
            secondSkillType: SecondSkillType,
            x?: number,
            y?: number
        ) => {
            if (x !== undefined && y !== undefined) {
                await this.secondSkillHandler.execute(secondSkillType, x, y);
                return
            }

            await this.secondSkillHandler.execute(secondSkillType, 0, 0);
        },
        [ActivePanelButtonType.THIRD_SKILL]: async () => {},
        [ActivePanelButtonType.DETAILS]: async (
            cardDetailsType: CardDetailsType,
            x: number,
            y: number
        ) => {
            await this.cardDetailsHandler.execute(cardDetailsType);
            return
        },
    };

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.generalAttackHandler = GeneralAttackHandler.getInstance(camera, scene);
        this.firstSkillHandler = FirstSkillHandler.getInstance(camera, scene);
        this.secondSkillHandler = SecondSkillHandler.getInstance(camera, scene);

        this.cardDetailsHandler = CardDetailsHandler.getInstance(camera, scene);
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): ActivePanelButtonHandler {
        if (!ActivePanelButtonHandler.instance) {
            ActivePanelButtonHandler.instance = new ActivePanelButtonHandler(camera, scene);
        }
        return ActivePanelButtonHandler.instance;
    }

    public async execute(
        type: ActivePanelButtonType,
        ...args: any[]
    ): Promise<void> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`Handler not found for ActivePanelButtonType: ${type}`);
            return;
        }
        await handler(...args);
    }
}
