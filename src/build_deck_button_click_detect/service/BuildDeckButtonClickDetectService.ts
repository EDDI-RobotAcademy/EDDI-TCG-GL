export interface BuildDeckButtonClickDetectService {
    setButtonClickState(state: boolean): void;
    getButtonClickState(): boolean;
    handleClick(hoverPoint: { x: number; y: number }): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
}
