export interface MyDeckButtonClickDetectService {
    setButtonClickState(state: boolean): void
    getButtonClickState(): boolean
    handleLeftClick(
        clickPoint: { x: number; y: number },
    ): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    saveCurrentClickDeckButtonId(buttonDeckId: number): void;
}
