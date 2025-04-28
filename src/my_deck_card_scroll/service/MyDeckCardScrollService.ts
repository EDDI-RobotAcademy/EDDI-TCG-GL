export interface MyDeckCardScrollService {
    setCardScrollState(state: boolean): void;
    getCardScrollState(): boolean;
    onWheelScroll(event: WheelEvent, currentClickDeckId: number): Promise<void>;
    getCurrentClickDeckButtonId(): number | null;
    getCardRowCount(deckId: number): number;
}
