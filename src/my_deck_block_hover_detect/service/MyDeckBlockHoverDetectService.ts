export interface MyDeckBlockHoverDetectService {
    setBlockHoverEnabled(isEnabled: boolean): void;
    isBlockHoverEnabled(): boolean;
    handleHover(hoverPoint: { x: number; y: number }): Promise<any | null>;
    onMouseMove(event: MouseEvent): Promise<any | null>;
}
