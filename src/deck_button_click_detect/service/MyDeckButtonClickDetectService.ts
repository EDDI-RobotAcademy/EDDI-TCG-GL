export interface MyDeckButtonClickDetectService {
    handleLeftClick(
        clickPoint: { x: number; y: number },
    ): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    onMouseUp(event: MouseEvent): Promise<any | null>;
    saveCurrentClickDeckId(buttonDeckId: number): void;
    getCurrentClickDeckId(): number | null;
}
