export interface DeckCardAddButtonClickDetectService {
    handleButtonClick(clickPoint: { x: number; y: number }): Promise<any | null>;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    getCurrentClickedButtonId(): number | null;
    getCurrentClickedCardId(): number | null;
}
