export interface DeckDeleteButtonClickDetectService {
    setButtonClickState(state: boolean): void;
    getButtonClickState(): boolean;
    handleButtonClick(clickPoint: { x: number; y: number }): Promise<any | null>;
    onMouseDown(event: MouseEvent): Promise<any | null>;
}
