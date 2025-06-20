export interface MyDeckBlockHoverDetectService {
    handleHover(hoverPoint: { x: number; y: number }): Promise<any | null>;
    onMouseMove(event: MouseEvent): Promise<any | null>;
}
