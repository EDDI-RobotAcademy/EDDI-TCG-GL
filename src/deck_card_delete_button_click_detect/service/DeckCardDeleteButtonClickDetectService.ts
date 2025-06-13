export interface DeckCardDeleteButtonClickDetectService {
    setButtonClickEnabled(isEnabled: boolean): void;
    isButtonClickEnabled(): boolean;
    handleButtonClick(clickPoint: { x: number; y: number }): Promise<any | null>;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    getCurrentClickedButtonId(): number | null;
}
