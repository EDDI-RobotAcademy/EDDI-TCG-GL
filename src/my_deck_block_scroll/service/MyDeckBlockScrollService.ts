export interface MyDeckBlockScrollService {
    setBlockScrollState(state: boolean): void;
    getBlockScrollState(): boolean;
    onWheelScroll(event: WheelEvent): Promise<void>;
    getCurrentClickDeckId(): number | null;
    getBlockCountByDeckId(deckId: number): number;
}
