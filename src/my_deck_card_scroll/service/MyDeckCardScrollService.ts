export interface MyDeckCardScrollService {
    setCardScrollEnabled(scrollEnable: boolean): void;
    isCardScrollEnabled(): boolean;
    onWheelScroll(event: WheelEvent, currentClickDeckId: number): Promise<void>;
    getCurrentClickDeckButtonId(): number | null;
    getCardRowCount(deckId: number): number;
}
