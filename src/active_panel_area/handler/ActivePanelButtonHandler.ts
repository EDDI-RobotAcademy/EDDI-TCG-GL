import {ActivePanelButtonType} from "../entity/ActivePanelButtonType";
import {GeneralAttackHandler} from "../../general_attack/handler/GeneralAttackHandler";
import * as THREE from "three";
import {FirstSkillHandler} from "../../first_skill/handler/FirstSkillHandler";

export class ActivePanelButtonHandler {
    private static instance: ActivePanelButtonHandler;

    private generalAttackHandler: GeneralAttackHandler;
    private firstSkillHandler: FirstSkillHandler;

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
        [ActivePanelButtonType.SECOND_SKILL]: async () => {},
        [ActivePanelButtonType.THIRD_SKILL]: async () => {},
        [ActivePanelButtonType.DETAILS]: async () => {},
    };

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.generalAttackHandler = GeneralAttackHandler.getInstance(camera, scene);
        this.firstSkillHandler = FirstSkillHandler.getInstance(camera, scene);
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
