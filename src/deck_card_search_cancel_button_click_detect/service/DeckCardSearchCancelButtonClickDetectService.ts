export interface DeckCardSearchCancelButtonClickDetectService {
    handleClick(hoverPoint: { x: number; y: number }): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
}
