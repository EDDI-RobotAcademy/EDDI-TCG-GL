export interface DeckNameEditPopupButtonsClickDetectService {
    handleLeftClick(clickPoint: { x: number; y: number }): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
}
