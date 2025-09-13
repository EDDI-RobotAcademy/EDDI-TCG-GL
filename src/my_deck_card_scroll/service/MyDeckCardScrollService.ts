export interface MyDeckCardScrollService {
    onWheelScroll(event: WheelEvent): Promise<void>;
    getCurrentClickDeckId(): number | null;
    getCardRowCount(deckId: number): number;
}
