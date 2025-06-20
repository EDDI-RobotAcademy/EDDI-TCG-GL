export interface DeckNameEditButtonClickDetectService {
    handleButtonClick(clickPoint: { x: number; y: number }): Promise<any | null>;
    onMouseDown(event: MouseEvent): Promise<any | null>;
}
