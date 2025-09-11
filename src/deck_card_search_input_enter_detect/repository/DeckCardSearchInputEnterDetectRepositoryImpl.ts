import {DeckCardSearchInputEnterDetectRepository} from "./DeckCardSearchInputEnterDetectRepository";

export class DeckCardSearchInputEnterDetectRepositoryImpl implements DeckCardSearchInputEnterDetectRepository {
    private static instance: DeckCardSearchInputEnterDetectRepositoryImpl;
    private enterDetectionEnabled: boolean = true;

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

}
