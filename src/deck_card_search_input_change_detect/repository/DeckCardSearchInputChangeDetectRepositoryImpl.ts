import {DeckCardSearchInputChangeDetectRepository} from "./DeckCardSearchInputChangeDetectRepository";

export class DeckCardSearchInputChangeDetectRepositoryImpl implements DeckCardSearchInputChangeDetectRepository {
    private static instance: DeckCardSearchInputChangeDetectRepositoryImpl;
    private changeDetectionEnabled: boolean = true;

    private constructor() {}

    public static getInstance(): DeckCardSearchInputChangeDetectRepositoryImpl {
        if (!DeckCardSearchInputChangeDetectRepositoryImpl.instance) {
            DeckCardSearchInputChangeDetectRepositoryImpl.instance = new DeckCardSearchInputChangeDetectRepositoryImpl();
        }
        return DeckCardSearchInputChangeDetectRepositoryImpl.instance;
    }

    public setChangeDetectionEnabled(isEnable: boolean): void {
        this.changeDetectionEnabled = isEnable;
    }

    public isChangeDetectionEnabled(): boolean {
        return this.changeDetectionEnabled;
    }

}