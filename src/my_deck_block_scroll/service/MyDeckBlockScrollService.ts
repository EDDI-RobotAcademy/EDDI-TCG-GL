export interface MyDeckBlockScrollService {
    setBlockScrollState(state: boolean): void;
    getBlockScrollState(): boolean;
    onWheelScroll(event: WheelEvent, currentClickDeckId: number): Promise<void>;
    getCurrentClickDeckButtonId(): number | null;
    getBlockCountByDeckId(deckId: number): number;
}
