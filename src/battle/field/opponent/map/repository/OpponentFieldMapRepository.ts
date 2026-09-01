export interface OpponentFieldMapRepository {
    addOpponentField(cardId: number): void
    getOpponentFieldList(): number[]
    getCardIdByIndex(index: number): number | undefined
    removeOpponentField(index: number): void
}