import {ActionType} from "../entity/ActionType";

export interface ActionTypeRepository {
    getActionType(): ActionType;
    setActionType(type: ActionType): void;
    reset(): void;
}
