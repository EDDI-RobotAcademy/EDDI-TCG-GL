export interface DeckCardSearchInputEnterDetectRepository {
    setEnterDetectionEnabled(isEnable: boolean): void;
    isEnterDetectionEnabled(): boolean;
    isEnterPressed(inputElement: HTMLInputElement, event: KeyboardEvent): boolean;
}
