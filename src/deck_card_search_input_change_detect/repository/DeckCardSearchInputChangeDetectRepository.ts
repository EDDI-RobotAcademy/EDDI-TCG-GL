export interface DeckCardSearchInputChangeDetectRepository {
    setChangeDetectionEnabled(isEnable: boolean): void;
    isChangeDetectionEnabled(): boolean;
}