// ActionTypeHandler.ts
import { ActionType } from "../entity/ActionType";
import { GeneralAttackUnitHandler } from "./general_attack_unit/GeneralAttackUnitHandler";
import {GeneralAttackUnitParams} from "./general_attack_unit/parameter/GeneralAttackUnitParams";

export class ActionTypeHandler {
    private static instance: ActionTypeHandler;

    private handlers: Record<ActionType, (params?: any) => Promise<void>> = {
        [ActionType.NONE]: async () => {},
        [ActionType.GENERAL_ATTACK_UNIT]: async (params?: GeneralAttackUnitParams) => {
            if (!params) {
                console.warn("GENERAL_ATTACK_UNIT handler requires params");
                return;
            }
            await GeneralAttackUnitHandler.getInstance().handle(params);
        },
        [ActionType.GENERAL_ATTACK_MASTER]: async () => {}, // 추후 구현
        [ActionType.TARGETING_SKILL_UNIT]: async () => {}, // 추후 구현
        [ActionType.TARGETING_SKILL_MASTER]: async () => {}, // 추후 구현
    };

    private constructor() {}

    public static getInstance(): ActionTypeHandler {
        if (!ActionTypeHandler.instance) {
            ActionTypeHandler.instance = new ActionTypeHandler();
        }
        return ActionTypeHandler.instance;
    }

    public async execute(type: ActionType, params?: any): Promise<void> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`Handler not found for ActionType: ${type}`);
            return;
        }
        await handler(params);
    }
}
