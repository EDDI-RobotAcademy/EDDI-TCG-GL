import {ActivePanelButtonType} from "../entity/ActivePanelButtonType";
import {SelectedActivePanelButtonStore} from "./SelectedActivePanelButtonStore";

export class SelectedActivePanelButtonStoreImpl implements SelectedActivePanelButtonStore {
    private static instance: SelectedActivePanelButtonStoreImpl | null = null;

    private selected: ActivePanelButtonType = ActivePanelButtonType.NONE;

    private constructor() {}

    static getInstance(): SelectedActivePanelButtonStoreImpl {
        if (!SelectedActivePanelButtonStoreImpl.instance) {
            SelectedActivePanelButtonStoreImpl.instance = new SelectedActivePanelButtonStoreImpl();
        }
        return SelectedActivePanelButtonStoreImpl.instance;
    }

    get(): ActivePanelButtonType {
        return this.selected;
    }

    set(type: ActivePanelButtonType): void {
        this.selected = type;
    }

    clear(): void {
        this.selected = ActivePanelButtonType.NONE;
    }
}
