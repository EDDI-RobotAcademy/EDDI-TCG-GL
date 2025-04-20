export interface DeckCardPageMoveButtonClickDetectService {
    setButtonClickState(state: boolean): void
    getButtonClickState(): boolean
    handleLeftClick(
        clickPoint: { x: number; y: number },
    ): any | null;
    onMouseDown(event: MouseEvent): Promise<void>;
}
