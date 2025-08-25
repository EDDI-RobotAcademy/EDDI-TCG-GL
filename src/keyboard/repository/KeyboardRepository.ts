import {KeyboardAction} from "../entity/KeyboardAction";

export interface KeyboardRepository {
    getHandler(key: string): (() => KeyboardAction | undefined) | undefined;
}
