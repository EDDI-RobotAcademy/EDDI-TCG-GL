// 손패에 든 카드 한 장을 적어 둔 것이다.
export interface HandCardSnapshot {
    readonly battleCardId: number;
    readonly cardId: number;
    readonly attributeMarkIds: readonly number[];
    readonly positionId: number;
}
