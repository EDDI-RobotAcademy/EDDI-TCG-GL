export interface MyDeckCardScrollService {
    onWheelScroll(event: WheelEvent): Promise<void>;
    getCurrentClickDeckButtonId(): number | null;
    getCardRowCount(deckId: number): number;
}
