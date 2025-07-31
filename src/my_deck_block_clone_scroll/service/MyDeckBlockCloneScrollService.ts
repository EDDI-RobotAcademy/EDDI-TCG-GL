export interface MyDeckBlockCloneScrollService {
    setScrollEnabled(isEnabled: boolean): void;
    isScrollEnabled(): boolean;
    onWheelScroll(event: WheelEvent): Promise<void>;
}
