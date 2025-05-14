export interface MyDeckOwnedCardsScrollService {
    setCardScrollEnabled(state: boolean): void;
    isCardScrollEnabled(): boolean;
    onWheelScroll(event: WheelEvent): Promise<void>;
    getCardRowCount(): number;
}
