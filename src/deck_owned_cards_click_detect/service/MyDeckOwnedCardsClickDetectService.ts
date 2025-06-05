export interface MyDeckOwnedCardsClickDetectService {
    setCardClickEnabled(isEnabled: boolean): void;
    isCardClickEnabled(): boolean;
    handleCardClick(clickPoint: { x: number; y: number }): Promise<any | null>;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    getCurrentClickedCardId(): number | null;
}
