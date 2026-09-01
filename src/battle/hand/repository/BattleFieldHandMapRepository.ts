export interface BattleFieldHandMapRepository {
    addBattleFieldHand(cardId: number): void
    getBattleFieldHandList(): number[]
    getCardIdByIndex(index: number): number | undefined
    removeBattleFieldHand(index: number): void
}