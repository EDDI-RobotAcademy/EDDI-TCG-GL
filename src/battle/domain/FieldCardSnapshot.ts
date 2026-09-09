import {CardRace} from "../../card/race";

// 필드에 놓인 카드 한 장을 적어 둔 것이다.
export interface FieldCardSnapshot {
    readonly battleCardId: number;
    readonly cardId: number;
    readonly attributeMarkIds: readonly number[];
    readonly positionId: number;
    // 필드에 서 있는 동안의 상태
    readonly hp: number;
    // 붙은 에너지. 종족마다 따로 센다
    readonly energyByRace: readonly {readonly race: CardRace; readonly count: number}[];
}
