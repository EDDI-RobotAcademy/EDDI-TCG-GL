export interface MyDeckButtonClickDetectService {
    handleLeftClick(
        clickPoint: { x: number; y: number },
    ): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    onMouseUp(event: MouseEvent): Promise<any | null>;
    saveCurrentClickDeckButtonId(buttonDeckId: number): void;
    getCurrentClickDeckButtonId(): number | null;
}
