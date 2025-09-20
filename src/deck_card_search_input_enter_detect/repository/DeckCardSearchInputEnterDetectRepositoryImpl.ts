import {DeckCardSearchInputEnterDetectRepository} from "./DeckCardSearchInputEnterDetectRepository";
import {DeckCardSearchStateInDeckEditMode} from "../entity/DeckCardSearchStateInDeckEditMode";

export class DeckCardSearchInputEnterDetectRepositoryImpl implements DeckCardSearchInputEnterDetectRepository {
    private static instance: DeckCardSearchInputEnterDetectRepositoryImpl;
    private enterDetectionEnabled: boolean = true;
    private enterPressedState: boolean = false;
    private deckEditSearchState: DeckCardSearchStateInDeckEditMode = DeckCardSearchStateInDeckEditMode.DEFAULT;

    private constructor() {}

    public static getInstance(): DeckCardSearchInputEnterDetectRepositoryImpl {
        if (!DeckCardSearchInputEnterDetectRepositoryImpl.instance) {
            DeckCardSearchInputEnterDetectRepositoryImpl.instance = new DeckCardSearchInputEnterDetectRepositoryImpl();
        }
        return DeckCardSearchInputEnterDetectRepositoryImpl.instance;
    }

    public setEnterDetectionEnabled(isEnable: boolean): void {
        this.enterDetectionEnabled = isEnable;
    }

    public isEnterDetectionEnabled(): boolean {
        return this.enterDetectionEnabled;
    }

    public isEnterPressed(inputElement: HTMLInputElement, event: KeyboardEvent): boolean {
        if (!this.enterDetectionEnabled) return false;
        return document.activeElement === inputElement && event.key === "Enter";
    }

    public findEnterPressedState(): boolean {
        return this.enterPressedState;
    }

    public setEnterPressedState(isPressed: boolean): void {
        this.enterPressedState = isPressed;
    }

    // 덱 편집 모드에서의 카드 검색 상태 Getter/Setter
    public setDeckEditSearchState(state: DeckCardSearchStateInDeckEditMode): void {
        this.deckEditSearchState = state;
    }

    public findDeckEditSearchState(): DeckCardSearchStateInDeckEditMode {
        return this.deckEditSearchState;
    }

}
