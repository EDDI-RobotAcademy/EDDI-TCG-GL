export interface DeckDeleteButtonClickDetectService {
    handleButtonClick(clickPoint: { x: number; y: number }): Promise<any | null>;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    getDeckDeleteButtonVisibility(deckId: number): boolean | undefined;
}
