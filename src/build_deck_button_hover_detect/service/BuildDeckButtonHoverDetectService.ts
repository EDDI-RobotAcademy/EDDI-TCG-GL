export interface BuildDeckButtonHoverDetectService {
    setButtonDetectState(state: boolean): void;
    getButtonDetectState(): boolean;
    handleHover(hoverPoint: { x: number; y: number }): any | null;
    onMouseMove(event: MouseEvent): Promise<any | null>;
}
