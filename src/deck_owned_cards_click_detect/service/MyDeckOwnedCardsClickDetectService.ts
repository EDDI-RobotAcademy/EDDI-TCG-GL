export interface MyDeckOwnedCardsClickDetectService {
    handleCardClick(clickPoint: { x: number; y: number }): Promise<any | null>;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    getCurrentClickedCardId(): number | null;
}
