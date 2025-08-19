import {ActionTypeRepository} from "./ActionTypeRepository";
import {ActionType} from "../entity/ActionType";

export class ActionTypeRepositoryImpl implements ActionTypeRepository {
    private static instance: ActionTypeRepositoryImpl;

    private actionType: ActionType = ActionType.NONE;

    private constructor() {}

    public static getInstance(): ActionTypeRepositoryImpl {
        if (!ActionTypeRepositoryImpl.instance) {
            ActionTypeRepositoryImpl.instance = new ActionTypeRepositoryImpl();
        }
        return ActionTypeRepositoryImpl.instance;
    }

    getActionType(): ActionType {
        return this.actionType;
    }

    setActionType(type: ActionType): void {
        this.actionType = type;
    }

    reset(): void {
        this.actionType = ActionType.NONE;
    }
}
