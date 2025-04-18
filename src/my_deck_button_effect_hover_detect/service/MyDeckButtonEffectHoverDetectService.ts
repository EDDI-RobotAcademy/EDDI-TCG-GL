export interface MyDeckButtonEffectHoverDetectService {
    setEffectDetectState(state: boolean): void
    getEffectDetectState(): boolean
    handleHover(hoverPoint: { x: number; y: number }): any | null;
    onMouseMove(event: MouseEvent): Promise<any | null>;
    getCurrentHoveredEffectId(): number | null;
}
