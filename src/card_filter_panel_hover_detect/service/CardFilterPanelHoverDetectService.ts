export interface CardFilterPanelHoverDetectService {
    handlePanelHover(hoverPoint: { x: number; y: number }): any | null;
    onMouseMove(event: MouseEvent): Promise<any | null>;
}
