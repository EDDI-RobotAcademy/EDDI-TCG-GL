export interface DeckEditButtonClickDetectService {
    setButtonClickEnabled(isEnabled: boolean): void;
    isButtonClickEnabled(): boolean;
    handleClick(clickPoint: { x: number; y: number }): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    getCurrentButtonClickState(): boolean | null;
}
