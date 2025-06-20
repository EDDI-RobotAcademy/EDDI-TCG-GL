export interface DeckEditButtonClickDetectService {
    handleClick(clickPoint: { x: number; y: number }): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    getCurrentButtonClickState(): boolean | null;
}
