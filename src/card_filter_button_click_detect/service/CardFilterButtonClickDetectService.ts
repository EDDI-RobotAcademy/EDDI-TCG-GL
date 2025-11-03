export interface CardFilterButtonClickDetectService {
    handleButtonClick(hoverPoint: { x: number; y: number }): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    onMouseUp(event: MouseEvent): Promise<void>;
}
