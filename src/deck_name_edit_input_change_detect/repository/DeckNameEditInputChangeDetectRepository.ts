export interface DeckNameEditInputChangeDetectRepository {
    setChangeDetectionEnabled(isEnable: boolean): void;
    isChangeDetectionEnabled(): boolean;
}