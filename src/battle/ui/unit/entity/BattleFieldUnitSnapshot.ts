// 필드에 나온 유닛 하나를 적어 둔 것이다.
//
// 붙은 효과와 에너지는 아직 담는 것이 없어서 여기에 안 들어간다.
// 그것들이 값을 갖기 시작하면 함께 붙인다.
export interface BattleFieldUnitSnapshot {
    readonly id: number;
    readonly cardId: number;
    readonly weaponId: number;
    readonly hpId: number;
    readonly energyId: number;
    readonly raceId: number;
    readonly x: number;
    readonly y: number;
}
