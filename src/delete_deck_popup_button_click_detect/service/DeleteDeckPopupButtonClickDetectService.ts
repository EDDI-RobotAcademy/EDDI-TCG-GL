export interface DeleteDeckPopupButtonClickDetectService {
    setButtonClickState(state: boolean): void;
    getButtonClickState(): boolean;
    handleButtonClick(clickPoint: { x: number; y: number }): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
}
