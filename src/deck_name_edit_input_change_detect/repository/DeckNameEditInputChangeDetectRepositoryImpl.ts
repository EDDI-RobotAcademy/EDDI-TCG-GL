import {DeckNameEditInputChangeDetectRepository} from "./DeckNameEditInputChangeDetectRepository";

export class DeckNameEditInputChangeDetectRepositoryImpl implements DeckNameEditInputChangeDetectRepository {
    private static instance: DeckNameEditInputChangeDetectRepositoryImpl;
    private changeDetectionEnabled: boolean = false;

    private constructor() {}

    public static getInstance(): DeckNameEditInputChangeDetectRepositoryImpl {
        if (!DeckNameEditInputChangeDetectRepositoryImpl.instance) {
            DeckNameEditInputChangeDetectRepositoryImpl.instance = new DeckNameEditInputChangeDetectRepositoryImpl();
        }
        return DeckNameEditInputChangeDetectRepositoryImpl.instance;
    }

    public setChangeDetectionEnabled(isEnable: boolean): void {
        this.changeDetectionEnabled = isEnable;
    }

    public isChangeDetectionEnabled(): boolean {
        return this.changeDetectionEnabled;
    }

}